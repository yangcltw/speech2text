from typing import Dict, Type
from .base import BaseTranscriber, BaseDiarizer
from ..models.whisper_faster import FasterWhisperTranscriber
from ..models.whisper_openai import OpenAIWhisperTranscriber
from ..models.speechbrain_diarizer import SpeechBrainDiarizer

class ModelFactory:
    _transcribers: Dict[str, Type[BaseTranscriber]] = {
        "faster_whisper": FasterWhisperTranscriber,
        "openai_whisper": OpenAIWhisperTranscriber
    }
    
    _diarizers: Dict[str, Type[BaseDiarizer]] = {
        "speechbrain": SpeechBrainDiarizer
    }
    
    @classmethod
    def get_transcriber(cls, name: str, **kwargs) -> BaseTranscriber:
        if name not in cls._transcribers:
            raise ValueError(f"Unknown transcriber: {name}")
        return cls._transcribers[name](**kwargs)
    
    @classmethod
    def get_diarizer(cls, name: str, **kwargs) -> BaseDiarizer:
        if name not in cls._diarizers:
            raise ValueError(f"Unknown diarizer: {name}")
        return cls._diarizers[name](**kwargs)
    
    @classmethod
    def register_transcriber(cls, name: str, transcriber: Type[BaseTranscriber]):
        cls._transcribers[name] = transcriber
        
    @classmethod
    def register_diarizer(cls, name: str, diarizer: Type[BaseDiarizer]):
        cls._diarizers[name] = diarizer