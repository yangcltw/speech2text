from pydantic_settings import BaseSettings
from typing import Literal
from pathlib import Path

class Settings(BaseSettings):
    # API 設定
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # 音頻設定
    SAMPLE_RATE: int = 16000
    CHANNELS: int = 1
    
    # 模型設定
    TRANSCRIBER_MODEL: Literal["faster_whisper", "openai_whisper"] = "faster_whisper"
    DIARIZER_MODEL: Literal["speechbrain"] = "speechbrain"
    MODEL_SIZE: Literal["tiny", "base", "small", "medium", "large"] = "base"
    USE_GPU: bool = True
    
    # 路徑設定
    TEMP_DIR: Path = Path("temp")
    UPLOAD_DIR: Path = Path("uploads")
    MODELS_DIR: Path = Path("models")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.TEMP_DIR.mkdir(exist_ok=True)
        self.UPLOAD_DIR.mkdir(exist_ok=True)
        self.MODELS_DIR.mkdir(exist_ok=True)

    class Config:
        env_file = ".env"
        
# from pydantic_settings import BaseSettings
# from typing import Literal
# from pathlib import Path

# class Settings(BaseSettings):
#     # API 設定
#     HOST: str = "0.0.0.0"
#     PORT: int = 8000
    
#     # 音頻設定
#     SAMPLE_RATE: int = 16000
#     CHANNELS: int = 1
    
#     # 模型設定
#     TRANSCRIBER_MODEL: Literal["faster_whisper", "openai_whisper"] = "faster_whisper"
#     DIARIZER_MODEL: Literal["speechbrain"] = "speechbrain"
#     MODEL_SIZE: Literal["tiny", "base", "small", "medium", "large"] = "base"
#     USE_GPU: bool = True
    
#     # RAG 設定
#     KNOWLEDGE_BASE_PATH: str = "knowledge_base"
#     EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
#     # 路徑設定
#     TEMP_DIR: Path = Path("temp")
#     UPLOAD_DIR: Path = Path("uploads")
#     MODELS_DIR: Path = Path("models")
    
#     def __init__(self, **kwargs):
#         super().__init__(**kwargs)
#         self.TEMP_DIR.mkdir(exist_ok=True)
#         self.UPLOAD_DIR.mkdir(exist_ok=True)
#         self.MODELS_DIR.mkdir(exist_ok=True)

#     class Config:
#         env_file = ".env"