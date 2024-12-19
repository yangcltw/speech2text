interface ElectronAPI {
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;
    selectAudioFile: () => Promise<string | null>;
    processAudioFile: (path: string) => Promise<void>;
    saveTranscription: (text: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    switchModel: (type: string) => Promise<void>;
    onTranscriptionProgress: (callback: (data: any) => void) => () => void;
    onTranscriptionComplete: (callback: (data: any) => void) => () => void;
    onError: (callback: (error: { message: string }) => void) => () => void;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}

export {};