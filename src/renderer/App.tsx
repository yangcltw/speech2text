import React, { useState } from 'react';
import { AudioRecorder } from './components/AudioRecorder';
import { FileUploader } from './components/FileUploader';
import { TranscriptionView } from './components/TranscriptionView';
import { Settings } from './components/Settings';
import { ErrorDisplay } from './components/ErrorDisplay';

export const App: React.FC = () => {  // 使用命名導出
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Speech to Text App
          </h1>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Settings
          </button>
        </div>

        <ErrorDisplay />
        <AudioRecorder />
        <FileUploader />
        <TranscriptionView />
        <Settings 
          isOpen={isSettingsOpen} 
          setIsOpen={setIsSettingsOpen}
        />
      </div>
    </div>
  );
};