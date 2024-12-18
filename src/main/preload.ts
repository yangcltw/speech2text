const { contextBridge, ipcRenderer } = require('electron');

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

  processAudioFile: (path) => {
    console.log('Calling processAudioFile from preload with path:', path);
    return ipcRenderer.invoke('process-audio-file', path)
      .catch(error => {
        console.error('IPC processAudioFile error:', error);
        throw error;
      });
  },

  onTranscriptionProgress: (callback) => {
    const handler = (_event, data) => {
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

  onTranscriptionComplete: (callback) => {
    const handler = (_event, data) => {
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

  onError: (callback) => {
    const handler = (_event, error) => {
      try {
        callback(error);
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