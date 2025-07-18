import type { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      transcribeAudio: (audioBuffer: ArrayBuffer) => Promise<{ text: string; timestamp: string }>;
      getGroqApiKey: () => Promise<string>;
      setGroqApiKey: (apiKey: string) => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      closeSettings: () => Promise<void>;
      validateGroqApiKey: (apiKey: string) => Promise<{ valid: boolean; error?: string }>;
    };
  }
}
