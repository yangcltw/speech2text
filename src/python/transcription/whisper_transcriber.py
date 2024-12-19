import whisper
import torch
import numpy as np
from typing import Optional, Union, Dict, Any
import logging
import soundfile as sf
import io

logger = logging.getLogger(__name__)

class WhisperTranscriber:
    def __init__(self, model_size: str = "base", device: Optional[str] = None):
        """Initialize the transcriber with the specified model size."""
        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        
        logger.info(f"Loading Whisper model '{model_size}' on {device}")
        self.model = whisper.load_model(model_size, device=device)
        self.device = device
        logger.info("Model loaded successfully")
        
        # 保存前一個轉錄結果用於連續性檢查
        self.previous_text = ""
        self.confidence_threshold = 0.5

    def format_timestamp(self, seconds: float) -> str:
        """Convert seconds to MM:SS format."""
        minutes = int(seconds // 60)
        seconds = int(seconds % 60)
        return f"{minutes:02d}:{seconds:02d}"

    def format_segment(self, segment: Dict[str, Any]) -> str:
        """Format a single segment with timestamp."""
        start_time = self.format_timestamp(segment["start"])
        end_time = self.format_timestamp(segment["end"])
        return f"[{start_time} -> {end_time}] {segment['text'].strip()}"

    def transcribe(self, audio_path: str) -> str:
        """Transcribe an audio file and return the text with timestamps."""
        try:
            logger.info(f"Transcribing file: {audio_path}")
            result = self.model.transcribe(
                audio_path,
                task="transcribe",
                best_of=7,  # 增加候選數量以提高準確性
                beam_size=7,  # 使用更大的束搜索
                temperature=0.0,
                condition_on_previous_text=True,
                language="zh"  # 手動設置語言為中文
            )
            
            # 過濾和合併相似的片段
            filtered_segments = []
            prev_text = None
            
            for segment in result["segments"]:
                current_text = segment["text"].strip()
                
                # 如果當前文字與前一個相同，跳過
                if current_text == prev_text:
                    continue
                    
                # 如果文字太短或是重複的一部分，跳過
                if len(current_text) < 2 or (prev_text and prev_text.endswith(current_text)):
                    continue
                    
                filtered_segments.append(segment)
                prev_text = current_text
            
            # Format each segment with timestamps
            formatted_segments = [self.format_segment(segment) for segment in filtered_segments]
            transcription = "\n".join(formatted_segments)
            
            logger.info("Transcription completed successfully")
            return transcription
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            raise

    def transcribe_realtime(self, audio_data: Union[bytes, np.ndarray]) -> str:
        """Transcribe audio data in real-time and return the text with timestamp."""
        try:
            if isinstance(audio_data, bytes):
                # Convert bytes to numpy array using soundfile
                with io.BytesIO(audio_data) as audio_io:
                    audio_array, sample_rate = sf.read(audio_io)
                    if sample_rate != 16000:
                        # Resample if needed
                        from scipy import signal
                        audio_array = signal.resample(audio_array, int(len(audio_array) * 16000 / sample_rate))
                        logger.info(f"Resampled audio from {sample_rate}Hz to 16000Hz")
            else:
                audio_array = audio_data

            # Convert to float32 if needed
            if audio_array.dtype != np.float32:
                audio_array = audio_array.astype(np.float32)

            # Normalize audio
            if audio_array.max() > 1.0 or audio_array.min() < -1.0:
                audio_array = audio_array / np.max(np.abs(audio_array))

            # Ensure audio length is sufficient
            if len(audio_array) < 8000:  # Less than 0.5 seconds of audio
                return ""

            try:
                result = self.model.transcribe(
                    audio_array,
                    task="transcribe",
                    best_of=5,  # 增加候選數量以提高準確性
                    beam_size=5,  # 使用更大的束搜索
                    temperature=0.0,
                    condition_on_previous_text=True,
                    language="zh"  # 手動設置語言為中文
                )
            except RuntimeError as e:
                logger.error(f"Transcription runtime error: {e}")
                if "size mismatch" in str(e):
                    return ""
                raise

            # For real-time transcription, we'll just use the last segment
            if result["segments"]:
                last_segment = result["segments"][-1]
                current_text = last_segment["text"].strip()
                
                # 檢查文字品質
                if len(current_text) < 2:
                    return ""
                
                # 檢查是否有太多重複字符
                if len(set(current_text)) < len(current_text) * 0.3:  # 如果不同字符數量太少
                    return ""
                
                # 更新前一個文字
                self.previous_text = current_text
                    
                return self.format_segment(last_segment)
            return ""

        except Exception as e:
            logger.error(f"Real-time transcription error: {e}")
            logger.error(f"Audio data type: {type(audio_data)}")
            if isinstance(audio_data, bytes):
                logger.error(f"Audio data length: {len(audio_data)} bytes")
            elif isinstance(audio_data, np.ndarray):
                logger.error(f"Audio array shape: {audio_array.shape}")
                logger.error(f"Audio array dtype: {audio_array.dtype}")
                logger.error(f"Audio array range: [{audio_array.min()}, {audio_array.max()}]")
            return ""