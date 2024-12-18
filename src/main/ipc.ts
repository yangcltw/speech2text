import { ipcMain, dialog, BrowserWindow } from 'electron';
import WebSocket from 'ws';

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
            mainWindow?.webContents.send('transcription-progress', message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        });

        ws.on('error', (error: Error) => {
          console.error('WebSocket error:', error);
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
        ws!.send(JSON.stringify({ type: 'start_recording' }), (error) => {
          if (error) {
            console.error('Failed to send start recording message:', error);
            reject(error);
          } else {
            console.log('Start recording message sent');
            resolve();
          }
        });
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
        ws!.send(JSON.stringify({ type: 'stop_recording' }), (error) => {
          if (error) {
            console.error('Failed to send stop recording message:', error);
            reject(error);
          } else {
            console.log('Stop recording message sent');
            resolve();
          }
        });
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
        ws!.send(JSON.stringify({ 
          type: 'process_audio_file',
          data: { filePath }
        }), (error) => {
          if (error) {
            console.error('Failed to send process file message:', error);
            reject(error);
          } else {
            console.log('Process file message sent');
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Process audio file error:', error);
      throw error;
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