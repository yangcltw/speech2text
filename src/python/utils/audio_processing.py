import soundfile as sf
import numpy as np
import asyncio
import logging
from pathlib import Path
import tempfile
from typing import Optional
import wave
import pyaudio

logger = logging.getLogger(__name__)

class AudioProcessor:
    def __init__(self):
        self.recording = False
        self.audio_buffer = []
        self.sample_rate = 16000
        self.channels = 1
        self.chunk_size = 1024
        self.pyaudio = pyaudio.PyAudio()
        self.stream = None
        
    async def start_recording(self, websocket):
        if self.recording:
            raise RuntimeError("Already recording")
            
        try:
            self.stream = self.pyaudio.open(
                format=pyaudio.paFloat32,
                channels=self.channels,
                rate=self.sample_rate,
                input=True,
                frames_per_buffer=self.chunk_size
            )
            
            self.recording = True
            self.audio_buffer = []
            
            logger.info("Recording started")
            
            while self.recording:
                try:
                    data = self.stream.read(self.chunk_size)
                    self.audio_buffer.append(np.frombuffer(data, dtype=np.float32))
                    await asyncio.sleep(0.01)  # 避免阻塞
                except Exception as e:
                    logger.error(f"Error reading audio data: {str(e)}")
                    raise
                    
        except Exception as e:
            logger.error(f"Failed to start recording: {str(e)}")
            self.recording = False
            if self.stream:
                self.stream.stop_stream()
                self.stream.close()
            raise

    async def stop_recording(self) -> str:
        if not self.recording:
            raise RuntimeError("Not recording")
            
        try:
            self.recording = False
            
            if self.stream:
                self.stream.stop_stream()
                self.stream.close()
            
            if not self.audio_buffer:
                raise ValueError("No audio data recorded")
                
            # 合併音頻數據
            audio_data = np.concatenate(self.audio_buffer)
            
            # 保存為臨時文件
            temp_file = tempfile.mktemp(suffix='.wav')
            sf.write(temp_file, audio_data, self.sample_rate)
            
            logger.info(f"Recording saved to {temp_file}")
            return temp_file
            
        except Exception as e:
            logger.error(f"Failed to stop recording: {str(e)}")
            raise
        finally:
            self.audio_buffer = []

    async def save_upload(self, file) -> str:
        try:
            temp_file = tempfile.mktemp(suffix=Path(file.filename).suffix)
            with open(temp_file, 'wb') as f:
                content = await file.read()
                f.write(content)
            logger.info(f"Upload saved to {temp_file}")
            return temp_file
        except Exception as e:
            logger.error(f"Failed to save upload: {str(e)}")
            raise