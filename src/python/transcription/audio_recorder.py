import pyaudio
import wave
import numpy as np
import logging
from typing import Optional, Callable, Any, Awaitable
from threading import Thread, Event
import time

logger = logging.getLogger(__name__)

class AudioRecorder:
    def __init__(self, 
                 channels: int = 1,
                 rate: int = 16000,  # Whisper expects 16kHz
                 chunk: int = 4096,  # Increased chunk size
                 format: int = pyaudio.paInt16,  # Changed back to Int16
                 on_data: Optional[Callable[[bytes], Any]] = None):
        """
        Initialize the audio recorder.
        
        Args:
            channels: Number of audio channels (1 for mono, 2 for stereo)
            rate: Sample rate (16000 Hz for Whisper)
            chunk: Buffer size
            format: Audio format (16-bit PCM for better compatibility)
            on_data: Callback function for real-time audio data
        """
        self.channels = channels
        self.rate = rate
        self.chunk = chunk
        self.format = format
        self.on_data = on_data
        
        self.audio = pyaudio.PyAudio()
        self.stream = None
        self.recording = False
        self.stop_event = Event()
        self.recording_thread = None
        
        # 音頻處理參數
        self.silence_threshold = 0.01  # 靜音閾值
        self.min_audio_length = 0.5  # 最小音頻長度（秒）
        
        logger.info(f"Initialized AudioRecorder: channels={channels}, rate={rate}Hz, format={format}")

    def _is_silent(self, data):
        """Check if the audio chunk is silent."""
        if self.format == pyaudio.paInt16:
            audio_data = np.frombuffer(data, dtype=np.int16)
            return np.abs(audio_data).mean() < self.silence_threshold * 32768
        else:
            audio_data = np.frombuffer(data, dtype=np.float32)
            return np.abs(audio_data).mean() < self.silence_threshold

    def start_recording(self, output_path: Optional[str] = None):
        """
        Start recording audio.
        
        Args:
            output_path: Optional path to save the recording
        """
        if self.recording:
            logger.warning("Already recording")
            return

        try:
            # List available input devices
            info = self.audio.get_host_api_info_by_index(0)
            numdevices = info.get('deviceCount')
            default_input_device = self.audio.get_default_input_device_info()
            logger.info(f"Default input device: {default_input_device['name']}")
            
            # Open audio stream
            self.stream = self.audio.open(
                format=self.format,
                channels=self.channels,
                rate=self.rate,
                input=True,
                input_device_index=default_input_device['index'],
                frames_per_buffer=self.chunk,
                stream_callback=None
            )
            
            self.recording = True
            self.stop_event.clear()
            
            def record_thread():
                frames = []
                total_frames = 0
                silent_chunks = 0
                last_process_time = time.time()
                
                logger.info("Started recording thread")
                while not self.stop_event.is_set():
                    try:
                        data = self.stream.read(self.chunk, exception_on_overflow=False)
                        
                        # 檢查是否為靜音
                        if self._is_silent(data):
                            silent_chunks += 1
                            if silent_chunks > 10:  # 如果連續10個chunk都是靜音
                                frames = []
                                total_frames = 0
                                continue
                        else:
                            silent_chunks = 0
                        
                        frames.append(data)
                        total_frames += len(data)
                        
                        current_time = time.time()
                        # 每1秒處理一次，或者當緩衝區達到2秒時
                        if (current_time - last_process_time >= 1.0 or 
                            total_frames >= self.rate * 2) and self.on_data:
                            try:
                                # Convert frames to WAV format
                                wav_data = self._frames_to_wav(frames)
                                logger.debug(f"Processing {len(wav_data)} bytes of audio data")
                                self.on_data(wav_data)
                            except Exception as e:
                                logger.error(f"Error in on_data callback: {e}")
                                logger.error(f"Data length: {len(wav_data)} bytes")
                                logger.error(f"Frames count: {len(frames)}")
                                logger.error(f"Total frames: {total_frames}")
                            
                            # 保留最後1秒的數據用於下次處理
                            keep_frames = int(self.rate / self.chunk)
                            frames = frames[-keep_frames:]
                            total_frames = len(frames[0]) * len(frames)
                            last_process_time = current_time
                            
                    except Exception as e:
                        logger.error(f"Error recording audio: {e}")
                        break
                
                # Save complete recording if path provided
                if output_path and frames:
                    self._save_recording(frames, output_path)
            
            self.recording_thread = Thread(target=record_thread)
            self.recording_thread.start()
            logger.info("Started recording")
            
        except Exception as e:
            logger.error(f"Failed to start recording: {e}")
            self.stop_recording()
            raise

    def stop_recording(self):
        """Stop recording audio."""
        if not self.recording:
            return

        try:
            logger.info("Stopping recording...")
            self.stop_event.set()
            self.recording = False
            
            if self.stream:
                self.stream.stop_stream()
                self.stream.close()
                self.stream = None
                logger.info("Audio stream closed")
            
            if self.recording_thread:
                self.recording_thread.join()
                self.recording_thread = None
                logger.info("Recording thread terminated")
            
            logger.info("Stopped recording")
            
        except Exception as e:
            logger.error(f"Error stopping recording: {e}")
            raise

    def _frames_to_wav(self, frames: list) -> bytes:
        """Convert audio frames to WAV format."""
        try:
            import io
            wav_buffer = io.BytesIO()
            with wave.open(wav_buffer, 'wb') as wf:
                wf.setnchannels(self.channels)
                wf.setsampwidth(self.audio.get_sample_size(self.format))
                wf.setframerate(self.rate)
                wf.writeframes(b''.join(frames))
            return wav_buffer.getvalue()
        except Exception as e:
            logger.error(f"Error converting frames to WAV: {e}")
            raise

    def _save_recording(self, frames: list, output_path: str):
        """
        Save recorded audio to file.
        
        Args:
            frames: List of audio frames
            output_path: Path to save the audio file
        """
        try:
            with wave.open(output_path, 'wb') as wf:
                wf.setnchannels(self.channels)
                wf.setsampwidth(self.audio.get_sample_size(self.format))
                wf.setframerate(self.rate)
                wf.writeframes(b''.join(frames))
            logger.info(f"Saved recording to {output_path}")
            
        except Exception as e:
            logger.error(f"Failed to save recording: {e}")
            raise

    def __del__(self):
        """Cleanup resources."""
        self.stop_recording()
        if self.audio:
            self.audio.terminate()
  