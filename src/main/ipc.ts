import { ipcMain, dialog, BrowserWindow } from 'electron';
import WebSocket from 'ws';
import * as fs from 'node:fs';

interface WSMessage {
  type: string;
  data?: any;
}

let ws: WebSocket | null = null;

export function setupIPC(mainWindow: BrowserWindow): void {
  // WebSocket connection management
  const connectWebSocket = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        if (ws?.readyState === WebSocket.OPEN) {
          resolve();
          return;
        }

        ws = new WebSocket('ws://127.0.0.1:8000/ws');

        ws.on('open', () => {
          console.log('WebSocket connected');
          resolve();
        });

        ws.on('message', (data: WebSocket.RawData) => {
          try {
            const message = JSON.parse(data.toString()) as WSMessage;
            console.log('Received message:', message);

            // Forward all message types to renderer
            switch (message.type) {
              case 'transcription_progress':
                mainWindow?.webContents.send('transcription-progress', message.data);
                break;
              case 'transcription_complete':
                mainWindow?.webContents.send('transcription-complete', message.data);
                break;
              case 'recording_started':
                mainWindow?.webContents.send('recording-started', message.data);
                break;
              case 'recording_stopped':
                mainWindow?.webContents.send('recording-stopped', message.data);
                break;
              case 'error':
                mainWindow?.webContents.send('error', message.data);
                break;
              default:
                console.log('Unknown message type:', message.type);
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        });

        ws.on('error', (error: Error) => {
          console.error('WebSocket error:', error);
          mainWindow?.webContents.send('error', { message: error.message });
          reject(error);
        });

        ws.on('close', () => {
          console.log('WebSocket closed');
          ws = null;
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  // Recording handlers
  ipcMain.handle('start-recording', async () => {
    try {
      await connectWebSocket();
      
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket not connected');
      }

      return new Promise<void>((resolve, reject) => {
        try {
          const message = JSON.stringify({ type: 'start_recording' });
          ws?.send(message);
          console.log('Start recording message sent');
          resolve();
        } catch (err) {
          console.error('Failed to send start recording message:', err);
          reject(err);
        }
      });
    } catch (error) {
      console.error('Start recording error:', error);
      throw error;
    }
  });

  ipcMain.handle('stop-recording', async () => {
    try {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket not connected');
      }

      return new Promise<void>((resolve, reject) => {
        try {
          const message = JSON.stringify({ type: 'stop_recording' });
          ws?.send(message);
          console.log('Stop recording message sent');
          resolve();
        } catch (err) {
          console.error('Failed to send stop recording message:', err);
          reject(err);
        }
      });
    } catch (error) {
      console.error('Stop recording error:', error);
      throw error;
    }
  });

  // File handlers
  ipcMain.handle('select-audio-file', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Audio Files', extensions: ['mp3', 'wav', 'm4a', 'ogg'] }
        ]
      });
      
      return result.canceled ? null : result.filePaths[0];
    } catch (error) {
      console.error('File selection error:', error);
      throw error;
    }
  });

  ipcMain.handle('process-audio-file', async (_event, filePath: string) => {
    try {
      await connectWebSocket();
      
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket not connected');
      }

      return new Promise<void>((resolve, reject) => {
        try {
          const message = JSON.stringify({ 
            type: 'process_audio_file',
            data: { filePath }
          });
          ws?.send(message);
          console.log('Process file message sent');
          resolve();
        } catch (err) {
          console.error('Failed to send process file message:', err);
          reject(err);
        }
      });
    } catch (error) {
      console.error('Process audio file error:', error);
      throw error;
    }
  });

  // Add save file handler
  ipcMain.handle('save-transcription', async (_event, text: string) => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Save Transcription',
        defaultPath: `transcription-${new Date().toISOString().split('T')[0]}.txt`,
        filters: [
          { name: 'Text Files', extensions: ['txt'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        return new Promise<{ success: boolean; filePath?: string; error?: string }>((resolve, reject) => {
          fs.writeFile(result.filePath, text, 'utf8', (err: NodeJS.ErrnoException | null) => {
            if (err) {
              console.error('Save file error:', err);
              resolve({ success: false, error: err.message });
            } else {
              resolve({ success: true, filePath: result.filePath });
            }
          });
        });
      }
      return { success: false, error: 'Operation cancelled' };
    } catch (error) {
      console.error('Save file error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Cleanup
  mainWindow.on('closed', () => {
    if (ws) {
      ws.close();
      ws = null;
    }
  });
}