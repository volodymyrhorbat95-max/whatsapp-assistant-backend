// Audio Service - Handle audio download and transcription orchestration
// Downloads audio from Twilio and sends to transcription service

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import * as whisperService from './whisperService';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

// Ensure temp directory exists
const TEMP_AUDIO_DIR = path.join(__dirname, '../../temp/audio');

/**
 * Initialize temp directory for audio files
 */
const initTempDir = async (): Promise<void> => {
  try {
    await mkdir(TEMP_AUDIO_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating temp audio directory:', error);
  }
};

/**
 * Download audio file from Twilio
 * @param mediaUrl - Twilio media URL
 * @returns Path to downloaded file or null if failed
 */
const downloadAudioFromTwilio = async (mediaUrl: string): Promise<string | null> => {
  try {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

    if (!twilioAccountSid || !twilioAuthToken) {
      console.error('Twilio credentials not configured');
      return null;
    }

    // Ensure temp directory exists
    await initTempDir();

    // Download audio file
    const response = await axios.get(mediaUrl, {
      auth: {
        username: twilioAccountSid,
        password: twilioAuthToken
      },
      responseType: 'arraybuffer',
      timeout: 30000
    });

    // Save to temp file
    const timestamp = Date.now();
    const fileName = `audio_${timestamp}.ogg`;
    const filePath = path.join(TEMP_AUDIO_DIR, fileName);

    await writeFile(filePath, response.data);

    console.log('Audio downloaded successfully:', filePath);
    return filePath;

  } catch (error: any) {
    console.error('Error downloading audio from Twilio:', error.message);
    return null;
  }
};

/**
 * Clean up temporary audio file
 * @param filePath - Path to file to delete
 */
const cleanupAudioFile = async (filePath: string): Promise<void> => {
  try {
    await unlink(filePath);
    console.log('Temporary audio file deleted:', filePath);
  } catch (error) {
    console.error('Error deleting temporary audio file:', error);
  }
};

/**
 * Download and transcribe audio message
 * @param mediaUrl - Twilio media URL
 * @returns Transcribed text or null if failed
 */
export const processAudioMessage = async (mediaUrl: string): Promise<string | null> => {
  let audioFilePath: string | null = null;

  try {
    // Download audio
    audioFilePath = await downloadAudioFromTwilio(mediaUrl);

    if (!audioFilePath) {
      return null;
    }

    // Transcribe using Whisper
    const transcriptionService = process.env.TRANSCRIPTION_SERVICE || 'whisper';

    if (transcriptionService === 'whisper') {
      const transcription = await whisperService.transcribeAudio(audioFilePath);
      return transcription;
    } else {
      console.error('Unsupported transcription service:', transcriptionService);
      return null;
    }

  } catch (error: any) {
    console.error('Error processing audio message:', error.message);
    return null;
  } finally {
    // Clean up temp file
    if (audioFilePath) {
      await cleanupAudioFile(audioFilePath);
    }
  }
};
