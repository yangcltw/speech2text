import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { setupIPC } from './ipc.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let retryCount = 0;
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 1000;

const isDev = process.env.NODE_ENV === 'development';

async function waitForDevServer(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tryConnection = async () => {
      try {
        const response = await fetch(url);
        if (response.status === 200) {
          resolve();
        } else {
          throw new Error(`Server responded with status: ${response.status}`);
        }
      } catch (err) {
        if (retryCount >= MAX_RETRIES) {
          reject(new Error('Max retries reached'));
          return;
        }
        retryCount++;
        console.log(`Retrying connection to dev server... (${retryCount}/${MAX_RETRIES})`);
        setTimeout(tryConnection, RETRY_INTERVAL);
      }
    };
    tryConnection();
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: join(__dirname, '..', 'preload', 'preload.cjs'),
      webSecurity: true
    }
  });

  // Add DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Add load event listener
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window loaded');
  });
  if (mainWindow) {
    setupIPC(mainWindow);
  }

  try {
    if (isDev) {
      console.log('Waiting for dev server...');
      await waitForDevServer('http://localhost:3000');
      console.log('Dev server is ready');
      await mainWindow.loadURL('http://localhost:3000');
      mainWindow.webContents.openDevTools();
    } else {
      await mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }
  } catch (err) {
    console.error('Failed to load app:', err);
    app.quit();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle uncaught promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

app.whenReady().then(createWindow).catch(console.error);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch(console.error);
  }
});