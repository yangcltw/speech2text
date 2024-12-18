import React from 'react';
import { useStore } from '../store';

export const TranscriptionView: React.FC = () => {
  const { transcription, isProcessing } = useStore();

  const formatTranscription = (text: string) => {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim());
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-[600px] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Transcription</h2>
        {isProcessing && (
          <div className="flex items-center text-blue-500">
            <div className="animate-spin mr-2">⚪</div>
            <span>Processing...</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {formatTranscription(transcription).map((line, index) => {
          const [speaker, text] = line.includes(':') 
            ? line.split(':', 2) 
            : ['Unknown', line];
          
          return (
            <div key={index} className="p-3 rounded-lg bg-gray-50">
              <span className="font-semibold text-blue-600">{speaker}:</span>
              <span className="ml-2">{text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};