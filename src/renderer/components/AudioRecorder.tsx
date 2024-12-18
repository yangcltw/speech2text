import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';

export const AudioRecorder: React.FC = () => {
  const { setError } = useStore();
  const [isRecording, setRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isApiReady, setApiReady] = useState<boolean>(false);

  useEffect(() => {
    const checkApi = () => {
      if (window.electron) {
        console.log('Electron API is ready');
        setApiReady(true);
      } else {
        console.log('Waiting for Electron API...');
        setTimeout(checkApi, 500);
      }
    };
    checkApi();

    return () => {
      if (isRecording) {
        handleStopRecording();
      }
    };
  }, []);

  const handleStartRecording = useCallback(async () => {
    if (!isApiReady) {
      setError('API not ready');
      return;
    }

    try {
      console.log('Starting recording...');
      await window.electron.startRecording();
      setRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error('Recording error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to start recording: ${errorMessage}`);
      setRecording(false);
    }
  }, [isApiReady, setError]);

  const handleStopRecording = useCallback(async () => {
    if (!isApiReady) {
      setError('API not ready');
      return;
    }

    try {
      console.log('Stopping recording...');
      await window.electron.stopRecording();
    } catch (err) {
      console.error('Stop recording error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to stop recording: ${errorMessage}`);
    } finally {
      setRecording(false);
    }
  }, [isApiReady, setError]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Audio Recorder</h2>
      
      <div className="flex items-center gap-4">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={!isApiReady}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            !isApiReady 
              ? 'bg-gray-400 cursor-not-allowed'
              : isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {!isApiReady 
            ? 'Initializing...' 
            : isRecording 
              ? 'Stop Recording' 
              : 'Start Recording'}
        </button>
        
        {isRecording && (
          <span className="text-gray-600">
            {Math.floor(recordingTime / 60)}:
            {(recordingTime % 60).toString().padStart(2, '0')}
          </span>
        )}
      </div>
    </div>
  );
};