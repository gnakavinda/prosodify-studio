import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching voices from Azure...');
    console.log('AZURE_SPEECH_KEY exists:', !!process.env.AZURE_SPEECH_KEY);
    console.log('AZURE_SPEECH_REGION:', process.env.AZURE_SPEECH_REGION);

    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      return NextResponse.json({ error: 'Azure Speech credentials not configured' }, { status: 500 });
    }

    // Fetch all available voices from Azure
    const response = await fetch(`https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure Voices API Error:', response.status, errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch voices from Azure', 
        details: errorText,
        status: response.status 
      }, { status: response.status });
    }

    const voices = await response.json();
    console.log(`Retrieved ${voices.length} voices from Azure`);

    // Filter and organize the voices
    const organizedVoices = voices
      .filter((voice: any) => {
        // Filter for English voices and Neural voices only
        return voice.Locale.startsWith('en-') && voice.VoiceType === 'Neural';
      })
      .map((voice: any) => ({
        id: voice.ShortName,
        name: voice.DisplayName,
        shortName: voice.ShortName,
        locale: voice.Locale,
        localeName: voice.LocaleName,
        gender: voice.Gender,
        voiceType: voice.VoiceType,
        styles: voice.StyleList || [],
        roles: voice.RolePlayList || [],
        sampleRateHertz: voice.SampleRateHertz,
        status: voice.Status,
        wordsPerMinute: voice.WordsPerMinute || 0
      }))
      .sort((a: any, b: any) => {
        // Sort by locale first, then by name
        if (a.locale !== b.locale) {
          return a.locale.localeCompare(b.locale);
        }
        return a.name.localeCompare(b.name);
      });

    console.log(`Filtered to ${organizedVoices.length} English Neural voices`);

    // Group by language/locale for easier frontend handling
    const groupedByLocale = organizedVoices.reduce((acc: any, voice: any) => {
      if (!acc[voice.locale]) {
        acc[voice.locale] = {
          locale: voice.locale,
          localeName: voice.localeName,
          voices: []
        };
      }
      acc[voice.locale].voices.push(voice);
      return acc;
    }, {});

    // Log some statistics
    const localeStats = Object.entries(groupedByLocale).map(([locale, data]: [string, any]) => 
      `${locale}: ${data.voices.length} voices`
    );
    console.log('Voices by locale:', localeStats);

    // Count total styles available
    const totalStyles = new Set(
      organizedVoices.flatMap((voice: any) => voice.styles)
    ).size;

    return NextResponse.json({
      success: true,
      voices: organizedVoices,
      groupedByLocale: groupedByLocale,
      totalCount: organizedVoices.length,
      totalStyles: totalStyles,
      lastUpdated: new Date().toISOString(),
      localeCount: Object.keys(groupedByLocale).length
    });

  } catch (error) {
    console.error('Voices API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Optional: Add caching headers
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Content-Type': 'application/json',
    },
  });
}