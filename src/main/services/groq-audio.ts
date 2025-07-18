import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import Groq from 'groq-sdk';
import { getGroqApiKey } from './store';

export async function transcribeAudioHandler(
  _event: Electron.IpcMainInvokeEvent,
  audioBuffer: ArrayBuffer
): Promise<{ text: string; timestamp: string }> {
  let tempFilePath: string | null = null;

  try {
    const apiKey = getGroqApiKey();
    if (!apiKey) {
      throw new Error('Groq API key not configured. Please set it in settings.');
    }

    const groq = new Groq({
      apiKey: apiKey
    });

    tempFilePath = path.join(tmpdir(), `audio-${Date.now()}.webm`);

    const buffer = Buffer.from(audioBuffer);
    fs.writeFileSync(tempFilePath, buffer);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-large-v3-turbo',
      prompt: 'Specify context or spelling',
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment'],
      language: 'en',
      temperature: 0.0
    });

    return {
      text: transcription.text || 'No transcription available',
      timestamp: new Date().toLocaleTimeString()
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }
    }
  }
}

export async function validateGroqApiKey(
  _event: Electron.IpcMainInvokeEvent,
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    if (!apiKey || apiKey.trim() === '') {
      return { valid: false, error: 'API key is required' };
    }

    const groq = new Groq({
      apiKey: apiKey.trim()
    });

    // Test the API key by listing available models
    await groq.models.list();

    return { valid: true };
  } catch (error) {
    console.error('API key validation error:', error);

    if (error instanceof Error) {
      // Check for specific Groq API errors
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        return { valid: false, error: 'Invalid API key' };
      }
      if (error.message.includes('403') || error.message.includes('forbidden')) {
        return { valid: false, error: 'API key access denied' };
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return { valid: false, error: 'Network error - please check your connection' };
      }
      return { valid: false, error: error.message };
    }

    return { valid: false, error: 'Unknown validation error' };
  }
}
