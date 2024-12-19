const { contextBridge, ipcRenderer } = require('electron');

// Type definitions
type IpcRendererEvent = Electron.IpcRendererEvent;
type TranscriptionErrorHandler = (error: { message: string }) => void;
type TranscriptionDataHandler = (data: any) => void;

// Create API implementation
const api = {
  startRecording: () => {
    console.log('Calling startRecording from preload');
    return ipcRenderer.invoke('start-recording')
      .catch(error => {
        console.error('IPC startRecording error:', error);
        throw error;
      });
  },

  stopRecording: () => {
    console.log('Calling stopRecording from preload');
    return ipcRenderer.invoke('stop-recording')
      .catch(error => {
        console.error('IPC stopRecording error:', error);
        throw error;
      });
  },

  selectAudioFile: () => {
    console.log('Calling selectAudioFile from preload');
    return ipcRenderer.invoke('select-audio-file')
      .catch(error => {
        console.error('IPC selectAudioFile error:', error);
        throw error;
      });
  },

  processAudioFile: (path: string) => {
    console.log('Calling processAudioFile from preload with path:', path);
    return ipcRenderer.invoke('process-audio-file', path)
      .catch(error => {
        console.error('IPC processAudioFile error:', error);
        throw error;
      });
  },

  saveTranscription: (text: string) => {
    console.log('Calling saveTranscription from preload');
    return ipcRenderer.invoke('save-transcription', text)
      .catch(error => {
        console.error('IPC saveTranscription error:', error);
        throw error;
      });
  },

  onTranscriptionProgress: (callback: TranscriptionDataHandler) => {
    const handler = (_event: IpcRendererEvent, data: any) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in transcription progress handler:', error);
      }
    };
    ipcRenderer.on('transcription-progress', handler);
    return () => {
      ipcRenderer.removeListener('transcription-progress', handler);
    };
  },

  onTranscriptionComplete: (callback: TranscriptionDataHandler) => {
    const handler = (_event: IpcRendererEvent, data: any) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in transcription complete handler:', error);
      }
    };
    ipcRenderer.on('transcription-complete', handler);
    return () => {
      ipcRenderer.removeListener('transcription-complete', handler);
    };
  },

  onError: (callback: TranscriptionErrorHandler) => {
    const handler = (_event: IpcRendererEvent, error: { message: string }) => {
      try {
        callback({ message: error.message || 'Unknown error' });
      } catch (err) {
        console.error('Error in error handler:', err);
      }
    };
    ipcRenderer.on('error', handler);
    return () => {
      ipcRenderer.removeListener('error', handler);
    };
  }
};

// Initialize logging
console.log('Initializing preload script');

try {
  // Expose API to window object
  contextBridge.exposeInMainWorld('electron', api);
  console.log('API exposed successfully');
} catch (error) {
  console.error('Failed to expose API:', error);
}

// Export for TypeScript type checking
module.exports = api;