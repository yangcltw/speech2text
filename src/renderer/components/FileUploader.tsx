import React from 'react';
import { useStore } from '../store';

export const FileUploader: React.FC = () => {
  const { setProcessing, setError } = useStore();

  const handleFileSelect = async () => {
    try {
      const filePath = await window.electron.selectAudioFile();
      if (filePath) {
        setProcessing(true);
        await window.electron.processAudioFile(filePath);
      }
    } catch (error) {
      setError('Failed to process audio file');
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">File Upload</h2>
      
      <button
        onClick={handleFileSelect}
        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
      >
        Select Audio File
      </button>
      
      <p className="text-sm text-gray-500 mt-2">
        Supported formats: .mp3, .wav, .m4a, .ogg
      </p>
    </div>
  );
};