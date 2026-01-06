// Whisper Service - OpenAI Whisper API integration for audio transcription
// Transcribes Portuguese voice messages to text

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

/**
 * Transcribe audio file to text using OpenAI Whisper API
 * @param audioFilePath - Path to audio file on disk
 * @returns Transcribed text or null if failed
 */
export const transcribeAudio = async (audioFilePath: string): Promise<string | null> => {
  try {
    const whisperApiKey = process.env.WHISPER_API_KEY;

    if (!whisperApiKey) {
      console.error('WHISPER_API_KEY not configured in environment variables');
      return null;
    }

    // Create form data with audio file
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFilePath));
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt'); // Brazilian Portuguese

    // Send to Whisper API
    const response = await axios.post(WHISPER_API_URL, formData, {
      headers: {
        'Authorization': `Bearer ${whisperApiKey}`,
        ...formData.getHeaders()
      },
      timeout: 30000 // 30 second timeout
    });

    const transcription = response.data.text;

    if (!transcription || transcription.trim().length === 0) {
      console.error('Whisper returned empty transcription');
      return null;
    }

    console.log('Audio transcribed successfully:', transcription);
    return transcription.trim();

  } catch (error: any) {
    console.error('Whisper transcription error:', error.response?.data || error.message);
    return null;
  }
};
