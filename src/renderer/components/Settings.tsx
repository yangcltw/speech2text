import React, { useState } from 'react';
import { useStore } from '../store';

interface SettingsProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, setIsOpen }) => {
  const { modelType, setModelType, setError } = useStore();
  const [isChanging, setIsChanging] = useState(false);

  const handleModelChange = async (type: 'online' | 'offline') => {
    try {
      setIsChanging(true);
      await window.electron.switchModel(type);
      setModelType(type);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to switch model: ${errorMessage}`);
    } finally {
      setIsChanging(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Transcription Model
            </label>
            <select
              value={modelType}
              onChange={(e) => handleModelChange(e.target.value as 'online' | 'offline')}
              disabled={isChanging}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="offline">Offline - Faster Whisper</option>
              <option value="online">Online - Whisper API</option>
            </select>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};