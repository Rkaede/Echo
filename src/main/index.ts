import { join } from 'node:path';
import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, clipboard, ipcMain, Menu, nativeImage, screen, shell, Tray } from 'electron';
import icon from '../../resources/menubar@2x.png?asset';
import { initializeDatabase } from './services/db/db';
import { transcribeAudioHandler } from './services/groq-audio';
import { clearShortcuts, registerShortcuts } from './services/shortcuts';
import { paste } from './util/paste';

let tray: Tray | null = null;
let settingsWindow: BrowserWindow | null = null;

function createSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    title: 'Groq Whisper Settings',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  settingsWindow.on('ready-to-show', () => {
    settingsWindow?.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  // For now, load a simple HTML page with placeholder content
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    settingsWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}#/settings`);
  } else {
    settingsWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'settings' });
  }
}

function createTray(): void {
  const icon = nativeImage.createFromPath('./resources/menubar@2x.png');
  icon.setTemplateImage(true);

  // tray = new Tray(menubar);
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      click: () => {
        createSettingsWindow();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Groq Whisper Transcription');
  tray.setContextMenu(contextMenu);
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 140,
    height: 40,
    show: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    frame: false,
    transparent: true,
    hasShadow: false,
    type: 'panel',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  // Set workspace visibility before showing
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  mainWindow.on('ready-to-show', () => {
    // mainWindow.show();
    mainWindow.showInactive();
    mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    // Re-apply workspace visibility after showing
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    // Position window at bottom
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    mainWindow.setPosition(width / 2 - 70, height - 10);
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Initialize database
  await initializeDatabase();

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on('ping', () => console.log('pong'));

  // Audio transcription handler
  ipcMain.handle('transcribe-audio', transcribeAudioHandler);

  // Handle copy transcription
  ipcMain.handle('copy-transcription', (_, message: { text: string; timestamp?: string }) => {
    clipboard.writeText(message.text);
    paste();
    console.log('Transcription copied to clipboard:', message.text);
  });

  registerShortcuts();
  createWindow();
  createTray();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up global shortcuts when app is quitting
app.on('will-quit', () => {
  clearShortcuts();
});
