import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Environment check:');
    console.log('AZURE_SPEECH_KEY exists:', !!process.env.AZURE_SPEECH_KEY);
    console.log('AZURE_SPEECH_REGION:', process.env.AZURE_SPEECH_REGION);

    const { text, voice, style, rate, pitch, volume } = await request.json();

    // Validate input
    if (!text || text.length > 5000) {
      return NextResponse.json({ error: 'Invalid text input' }, { status: 400 });
    }

    if (!voice) {
      return NextResponse.json({ error: 'Voice parameter is required' }, { status: 400 });
    }

    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      return NextResponse.json({ error: 'Azure Speech credentials not configured' }, { status: 500 });
    }

    // Use the voice parameter directly (it's now the Azure ShortName from the API)
    const azureVoiceName = voice;

    // Convert our parameters to Azure format
    const volumeNum = ((volume - 1) * 100);
    const pitchNum = ((pitch - 1) * 100);
    const rateNum = ((rate - 1) * 100);

    const volumePercent = volumeNum.toFixed(2);
    const pitchPercent = pitchNum.toFixed(2);
    const ratePercent = rateNum.toFixed(2);

    // Build SSML exactly like Azure Speech Studio format
    const ssml = `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">
  <voice name="${azureVoiceName}">
    <s />
    <mstts:express-as style="${style}" styledegree="1.0">
      <prosody volume="${volumeNum >= 0 ? '+' : ''}${volumePercent}%" pitch="${pitchNum >= 0 ? '+' : ''}${pitchPercent}%" rate="${rateNum >= 0 ? '+' : ''}${ratePercent}%">
        ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </prosody>
    </mstts:express-as>
    <s />
  </voice>
</speak>`;

    console.log('Generated SSML:', ssml);
    console.log('Using voice:', azureVoiceName);
    console.log('Using style:', style);

    // Call Azure Speech Service
    const response = await fetch(`https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
        'User-Agent': 'ProsodifyStudio'
      },
      body: ssml
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure Speech API Error:', response.status, errorText);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to generate speech';
      if (response.status === 400) {
        errorMessage = 'Invalid voice or style combination. Please try a different voice or style.';
      } else if (response.status === 401) {
        errorMessage = 'Azure Speech API authentication failed. Please check your credentials.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      }
      
      return NextResponse.json({ 
        error: errorMessage, 
        details: errorText,
        status: response.status 
      }, { status: response.status });
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    console.log('Audio generated successfully, size:', audioBuffer.byteLength, 'bytes');

    return NextResponse.json({
      success: true,
      audio: audioBase64,
      format: 'mp3',
      voiceUsed: azureVoiceName,
      styleUsed: style
    });

  } catch (error) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}