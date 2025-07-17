import type { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      transcribeAudio: (audioBuffer: ArrayBuffer) => Promise<{ text: string; timestamp: string }>;
    };
  }
}
