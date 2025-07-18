import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer } from 'electron';

// Custom APIs for renderer
const api = {
  transcribeAudio: (audioBuffer: ArrayBuffer): Promise<{ text: string; timestamp: string }> =>
    ipcRenderer.invoke('transcribe-audio', audioBuffer),
  getGroqApiKey: (): Promise<string> => ipcRenderer.invoke('get-groq-api-key'),
  setGroqApiKey: (apiKey: string): Promise<void> => ipcRenderer.invoke('set-groq-api-key', apiKey),
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke('open-external', url),
  closeSettings: (): Promise<void> => ipcRenderer.invoke('close-settings'),
  validateGroqApiKey: (apiKey: string): Promise<{ valid: boolean; error?: string }> =>
    ipcRenderer.invoke('validate-groq-api-key', apiKey)
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
