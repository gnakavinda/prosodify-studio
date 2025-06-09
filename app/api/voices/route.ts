import { NextResponse } from 'next/server';

interface AzureVoice {
  ShortName: string;
  DisplayName: string;
  Locale: string;
  LocaleName: string;
  Gender: string;
  VoiceType: string;
  StyleList?: string[];
  RolePlayList?: string[];
  SampleRateHertz: number;
  Status: string;
  WordsPerMinute?: number;
}

interface OrganizedVoice {
  id: string;
  name: string;
  shortName: string;
  locale: string;
  localeName: string;
  gender: string;
  voiceType: string;
  styles: string[];
  roles: string[];
  sampleRateHertz: number;
  status: string;
  wordsPerMinute: number;
}

interface GroupedVoices {
  locale: string;
  localeName: string;
  voices: OrganizedVoice[];
}

export async function GET() {
  try {
    console.log('🚀 Fetching voices from Azure...');
    console.log('🔐 AZURE_SPEECH_KEY exists:', !!process.env.AZURE_SPEECH_KEY);
    console.log('🌍 AZURE_SPEECH_REGION:', process.env.AZURE_SPEECH_REGION);

    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      console.error('❌ Missing Azure credentials');
      return NextResponse.json({ 
        error: 'Azure Speech credentials not configured',
        debug: {
          hasKey: !!speechKey,
          hasRegion: !!speechRegion
        }
      }, { status: 500 });
    }

    const azureUrl = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
    console.log('📡 Calling Azure URL:', azureUrl);

    // Fetch all available voices from Azure
    const response = await fetch(azureUrl, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
      },
    });

    console.log('📊 Azure Response Status:', response.status);
    console.log('📋 Azure Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Azure Voices API Error:', response.status, errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch voices from Azure', 
        details: errorText,
        status: response.status,
        debug: {
          url: azureUrl,
          hasKey: !!speechKey,
          region: speechRegion
        }
      }, { status: response.status });
    }

    const rawText = await response.text();
    console.log('📄 Raw Azure response length:', rawText.length);
    console.log('📄 Raw Azure response preview:', rawText.substring(0, 200));

    let voices: AzureVoice[];
    try {
      voices = JSON.parse(rawText);
      console.log('✅ Successfully parsed Azure response');
      console.log('📊 Raw voices count from Azure:', voices.length);
      
      if (voices.length > 0) {
        console.log('🎤 Sample voice from Azure:', voices[0]);
        console.log('🔍 Voice types in response:', [...new Set(voices.map(v => v.VoiceType))]);
        console.log('🌍 Locales in response:', [...new Set(voices.map(v => v.Locale))].slice(0, 10));
      }
    } catch (parseError) {
      console.error('❌ Failed to parse Azure response:', parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON response from Azure', 
        details: parseError instanceof Error ? parseError.message : 'Parse error',
        rawResponse: rawText.substring(0, 500)
      }, { status: 500 });
    }

    // Filter and organize the voices - FIXED STATUS CHECK
    console.log('🔍 Starting voice filtering...');
    
    const organizedVoices: OrganizedVoice[] = voices
      .filter((voice: AzureVoice) => {
        const isNeural = voice.VoiceType === 'Neural';
        const isAvailable = voice.Status === 'GA' || voice.Status === 'Preview'; // FIXED: Use GA instead of Succeeded
        
        // Only filter for Neural voices with GA or Preview status
        return isNeural && isAvailable;
      })
      .map((voice: AzureVoice) => ({
        id: voice.ShortName,
        name: voice.DisplayName,
        shortName: voice.ShortName,
        locale: voice.Locale,
        localeName: voice.LocaleName,
        gender: voice.Gender,
        voiceType: voice.VoiceType,
        styles: voice.StyleList || ['default'], // Ensure at least 'default' style
        roles: voice.RolePlayList || [],
        sampleRateHertz: voice.SampleRateHertz,
        status: voice.Status,
        wordsPerMinute: voice.WordsPerMinute || 0
      }))
      .sort((a: OrganizedVoice, b: OrganizedVoice) => {
        // Sort by locale first, then by name
        if (a.locale !== b.locale) {
          return a.locale.localeCompare(b.locale);
        }
        return a.name.localeCompare(b.name);
      });

    console.log(`✅ Filtered to ${organizedVoices.length} Neural voices across all languages`);
    
    if (organizedVoices.length === 0) {
      console.warn('⚠️ No voices passed filtering! Checking filter criteria...');
      const neuralCount = voices.filter(v => v.VoiceType === 'Neural').length;
      const gaCount = voices.filter(v => v.Status === 'GA').length;
      const previewCount = voices.filter(v => v.Status === 'Preview').length;
      const neuralAndAvailableCount = voices.filter(v => v.VoiceType === 'Neural' && (v.Status === 'GA' || v.Status === 'Preview')).length;
      
      console.log(`📊 Filter breakdown:`);
      console.log(`   Total voices: ${voices.length}`);
      console.log(`   Neural voices: ${neuralCount}`);
      console.log(`   GA voices: ${gaCount}`);
      console.log(`   Preview voices: ${previewCount}`);
      console.log(`   Neural + Available: ${neuralAndAvailableCount}`);
      console.log(`   Voice types available:`, [...new Set(voices.map(v => v.VoiceType))]);
      console.log(`   Voice statuses available:`, [...new Set(voices.map(v => v.Status))]);
    }

    // Group by language/locale for easier frontend handling
    const groupedByLocale: Record<string, GroupedVoices> = organizedVoices.reduce((acc: Record<string, GroupedVoices>, voice: OrganizedVoice) => {
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
    const localeStats = Object.entries(groupedByLocale).map(([locale, data]: [string, GroupedVoices]) => 
      `${locale}: ${data.voices.length} voices`
    );
    console.log('Voices by locale:', localeStats);

    // Count total styles available across all voices
    const allStyles = new Set(
      organizedVoices.flatMap((voice: OrganizedVoice) => voice.styles)
    );
    const totalStyles = allStyles.size;

    // Get language statistics
    const languageCount = Object.keys(groupedByLocale).length;
    const topLanguages = Object.entries(groupedByLocale)
      .sort(([,a], [,b]) => b.voices.length - a.voices.length)
      .slice(0, 10)
      .map(([locale, data]) => ({ locale, count: data.voices.length }));

    console.log(`Total languages: ${languageCount}`);
    console.log(`Total unique styles: ${totalStyles}`);
    console.log('Top languages by voice count:', topLanguages);

    return NextResponse.json({
      success: true,
      voices: organizedVoices,
      groupedByLocale: groupedByLocale,
      totalCount: organizedVoices.length,
      totalStyles: totalStyles,
      languageCount: languageCount,
      topLanguages: topLanguages,
      availableStyles: Array.from(allStyles).sort(),
      lastUpdated: new Date().toISOString()
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
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Content-Type': 'application/json',
    },
  });
}