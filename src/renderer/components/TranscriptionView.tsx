import React, { useEffect } from 'react';
import { useStore } from '../store';

export const TranscriptionView: React.FC = () => {
  const { transcription, isProcessing } = useStore();

  useEffect(() => {
    console.log('Transcription updated:', transcription);
  }, [transcription]);

  const formatTranscription = (text: string) => {
    if (!text) return [];
    const lines = text.includes('\n') ? text.split('\n') : [text];
    return lines.filter(line => line.trim());
  };

  const parseTimestamp = (line: string) => {
    const match = line.match(/\[(.*?)\](.*)/);
    if (match) {
      return {
        timestamp: match[1],
        text: match[2].trim()
      };
    }
    return {
      timestamp: '',
      text: line.trim()
    };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-[600px] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-black">Transcription</h2>
        {isProcessing && (
          <div className="flex items-center text-blue-500">
            <div className="animate-spin mr-2">⚪</div>
            <span className="text-black">Processing...</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {formatTranscription(transcription).map((line, index) => {
          const { timestamp, text } = parseTimestamp(line);
          return (
            <div key={index} className="p-4 rounded-lg bg-gray-100 border border-gray-200">
              {timestamp && (
                <div className="text-sm text-gray-600 mb-1 font-medium">
                  {timestamp}
                </div>
              )}
              <div className="text-black text-lg leading-relaxed font-medium">
                {text}
              </div>
            </div>
          );
        })}
      </div>

      {!isProcessing && transcription && (
        <div className="mt-4 text-right text-sm text-gray-600">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};