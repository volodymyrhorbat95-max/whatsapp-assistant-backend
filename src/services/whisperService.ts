// Whisper Service - OpenAI Whisper API integration for audio transcription
// Transcribes Portuguese voice messages to text

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

// Retry configuration for 24/7 reliability
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second initial delay
const RETRY_BACKOFF_MULTIPLIER = 2; // Exponential backoff

/**
 * Delay utility for retry backoff
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if error is retryable (network issues, rate limits, server errors)
 */
const isRetryableError = (error: any): boolean => {
  // Network errors are retryable
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return true;
  }

  // HTTP status codes
  const status = error.response?.status;
  if (status) {
    // 429 (rate limit), 500, 502, 503, 504 are retryable
    return status === 429 || status >= 500;
  }

  return false;
};

/**
 * Transcribe audio file to text using OpenAI Whisper API
 * Includes automatic retry with exponential backoff for reliability
 * @param audioFilePath - Path to audio file on disk
 * @returns Transcribed text or null if failed
 */
export const transcribeAudio = async (audioFilePath: string): Promise<string | null> => {
  const whisperApiKey = process.env.WHISPER_API_KEY;

  if (!whisperApiKey) {
    console.error('WHISPER_API_KEY not configured in environment variables');
    return null;
  }

  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Create form data with audio file (must be recreated for each attempt)
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

      console.log(`Audio transcribed successfully (attempt ${attempt}):`, transcription);
      return transcription.trim();

    } catch (error: any) {
      lastError = error;
      console.error(`Whisper transcription error (attempt ${attempt}/${MAX_RETRIES}):`, error.response?.data || error.message);

      // Only retry on retryable errors
      if (!isRetryableError(error)) {
        console.error('Non-retryable Whisper error, aborting retries');
        return null;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < MAX_RETRIES) {
        const waitTime = RETRY_DELAY_MS * Math.pow(RETRY_BACKOFF_MULTIPLIER, attempt - 1);
        console.log(`Retrying Whisper transcription in ${waitTime}ms...`);
        await delay(waitTime);
      }
    }
  }

  // All retries exhausted
  console.error(`Failed to transcribe audio after ${MAX_RETRIES} attempts:`, lastError?.message);
  return null;
};
