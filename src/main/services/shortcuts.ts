import { BrowserWindow, globalShortcut } from 'electron';
import { GlobalKeyboardListener } from 'node-global-key-listener';

let isRecordingWithFn = false;
let globalKeyListener: GlobalKeyboardListener | null = null;

export function registerShortcuts() {
  // Global shortcut for recording toggle (original behavior)
  const toggleRet = globalShortcut.register('CommandOrControl+Shift+R', () => {
    const allWindows = BrowserWindow.getAllWindows();
    const mainWindow = allWindows[0]; // Get the main window

    if (mainWindow && !mainWindow.isDestroyed()) {
      console.log('Sending toggle-recording message to renderer');
      mainWindow.webContents.send('toggle-recording');
    } else {
      console.log('No main window found or window destroyed');
    }
  });

  // Setup global key listener for fn key push-to-talk
  globalKeyListener = new GlobalKeyboardListener();

  globalKeyListener.addListener((e) => {
    if (e.name === 'FN') {
      const allWindows = BrowserWindow.getAllWindows();
      const mainWindow = allWindows[0];

      if (mainWindow && !mainWindow.isDestroyed()) {
        if (e.state === 'DOWN' && !isRecordingWithFn) {
          // F1 key pressed down
          isRecordingWithFn = true;
          console.log('FN key pressed - starting recording');
          mainWindow.webContents.send('start-recording');
        } else if (e.state === 'UP' && isRecordingWithFn) {
          // F1 key released
          isRecordingWithFn = false;
          console.log('FN key released - stopping recording');
          mainWindow.webContents.send('stop-recording');
        }
      }
    }
  });

  if (!toggleRet) {
    console.log('Failed to register toggle shortcut');
  } else {
    console.log('Toggle shortcut registered successfully');
  }

  console.log('Global key listener setup for fn key push-to-talk');
}

export function clearShortcuts() {
  globalShortcut.unregisterAll();

  if (globalKeyListener) {
    globalKeyListener.kill();
    globalKeyListener = null;
  }
}
