interface ElectronAPI {
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;
    selectAudioFile: () => Promise<string>;
    processAudioFile: (path: string) => Promise<void>;
    switchModel: (type: string) => Promise<void>;
    onTranscriptionProgress: (callback: (data: any) => void) => void;
    onTranscriptionComplete: (callback: (data: any) => void) => void;
    onError: (callback: (error: string) => void) => void;
}

declare global {
    interface Window {
    electron: ElectronAPI;
    }
}

export {};