import { create } from 'zustand';

interface TranscriptionState {
  isRecording: boolean;
  transcription: string;
  speakers: string[];
  modelType: 'online' | 'offline';
  isProcessing: boolean;
  error: string | null;
}

interface TranscriptionActions {
  setRecording: (isRecording: boolean) => void;
  setTranscription: (text: string) => void;
  setSpeakers: (speakers: string[]) => void;
  setModelType: (type: 'online' | 'offline') => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
}

type TranscriptionStore = TranscriptionState & TranscriptionActions;

export const useStore = create<TranscriptionStore>((set) => ({
  // State
  isRecording: false,
  transcription: '',
  speakers: [],
  modelType: 'offline',
  isProcessing: false,
  error: null,

  // Actions
  setRecording: (isRecording: boolean) => set({ isRecording }),
  setTranscription: (text: string) => set({ transcription: text }),
  setSpeakers: (speakers: string[]) => set({ speakers }),
  setModelType: (type: 'online' | 'offline') => set({ modelType: type }),
  setProcessing: (isProcessing: boolean) => set({ isProcessing }),
  setError: (error: string | null) => set({ error })
}));