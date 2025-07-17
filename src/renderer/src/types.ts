export type RecordingState = 'idle' | 'recording' | 'processing' | 'error' | 'copied';

export interface TranscriptionMessage {
  text: string;
  timestamp?: string;
}
