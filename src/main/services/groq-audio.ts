import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import Groq from 'groq-sdk';
import { getEnv } from '../env';

const groq = new Groq({
  apiKey: getEnv().GROQ_API_KEY
});

export async function transcribeAudioHandler(
  _event: Electron.IpcMainInvokeEvent,
  audioBuffer: ArrayBuffer
): Promise<{ text: string; timestamp: string }> {
  let tempFilePath: string | null = null;

  try {
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
