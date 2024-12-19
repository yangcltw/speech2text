import React, { useEffect, useCallback } from 'react';
import { useStore } from '../store';

export const TranscriptionView: React.FC = () => {
  const { transcription, isProcessing, setError } = useStore();

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

  const handleSave = useCallback(async () => {
    if (!transcription) {
      setError('No transcription to save');
      return;
    }

    try {
      const result = await window.electron.saveTranscription(transcription);
      if (!result.success) {
        setError(result.error || 'Failed to save transcription');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save transcription');
    }
  }, [transcription, setError]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-[600px] overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-black">Transcription</h2>
          {transcription && (
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Save as TXT
            </button>
          )}
        </div>
        {isProcessing && (
          <div className="flex items-center text-blue-500">
            <div className="animate-spin mr-2">⚪</div>
            <span className="text-black text-sm">Processing...</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {transcription ? (
          formatTranscription(transcription).map((line, index) => {
            const { timestamp, text } = parseTimestamp(line);
            return (
              <div key={index} className="p-2 rounded bg-gray-50 border border-gray-100">
                {timestamp && (
                  <div className="text-xs text-gray-500 mb-0.5 font-medium">
                    {timestamp}
                  </div>
                )}
                <div className="text-black text-sm leading-relaxed">
                  {text}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-black text-sm">
            {isProcessing ? "Recording in progress..." : "No transcription available"}
          </div>
        )}
      </div>

      {!isProcessing && transcription && (
        <div className="mt-2 text-right text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};