import React from 'react';
import { useStore } from '../store';

export const ErrorDisplay: React.FC = () => {
  const { error, setError } = useStore();

  if (!error) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-red-100 border-l-4 border-red-500 p-4 rounded-r">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <button 
          onClick={() => setError(null)}
          className="ml-auto pl-3"
        >
          <span className="text-red-500 hover:text-red-600">✕</span>
        </button>
      </div>
    </div>
  );
};