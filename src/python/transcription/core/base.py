from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class TranscriptionSegment:
    text: str
    start: float
    end: float
    confidence: float
    speaker: Optional[str] = None

@dataclass
class TranscriptionResult:
    text: str
    segments: List[TranscriptionSegment]
    language: Optional[str] = None

class BaseTranscriber(ABC):
    """語音轉寫基礎類別"""
    @abstractmethod
    async def transcribe(self, audio_path: str) -> TranscriptionResult:
        pass
    
    @abstractmethod
    def load_model(self):
        pass

class BaseDiarizer(ABC):
    """說話者分離基礎類別"""
    @abstractmethod
    async def diarize(self, audio_path: str) -> List[Dict]:
        pass
    
    @abstractmethod
    def load_model(self):
        pass