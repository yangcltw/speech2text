import uvicorn
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import socket
from transcription import WhisperTranscriber, AudioRecorder
import os
import signal
import atexit
from typing import Optional
from functools import partial

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Ensure IPv4
socket.setdefaulttimeout(30)
socket.AF_INET = socket.AF_INET

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize transcriber
transcriber = WhisperTranscriber(model_size="base")

# Store active connections and their resources
active_connections = {}

def cleanup_resources():
    """Clean up all resources before shutdown."""
    logger.info("Cleaning up resources...")
    for client_id in list(active_connections.keys()):
        try:
            resources = active_connections[client_id]
            if 'recorder' in resources:
                resources['recorder'].stop_recording()
            if 'websocket' in resources:
                asyncio.run(resources['websocket'].close())
        except Exception as e:
            logger.error(f"Error cleaning up resources for client {client_id}: {e}")
    active_connections.clear()
    logger.info("Resource cleanup completed")

def signal_handler(signum, frame):
    """Handle termination signals."""
    logger.info(f"Received signal {signum}")
    cleanup_resources()
    exit(0)

# Register cleanup handlers
atexit.register(cleanup_resources)
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup."""
    logger.info("Starting server...")
    os.makedirs("temp", exist_ok=True)
    os.makedirs("uploads", exist_ok=True)

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on shutdown."""
    logger.info("Shutting down server...")
    cleanup_resources()

async def cleanup_client(client_id: int):
    """Clean up resources for a client."""
    if client_id in active_connections:
        resources = active_connections[client_id]
        
        # Stop recording if active
        if 'recorder' in resources:
            resources['recorder'].stop_recording()
        
        # Remove temporary files
        output_path = f"temp/{client_id}.wav"
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
            except Exception as e:
                logger.error(f"Error removing temp file: {e}")
        
        # Clean up from active connections
        del active_connections[client_id]
        logger.info(f"Cleaned up resources for client {client_id}")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    logger.info("Health check called")
    return {"status": "ok"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication."""
    client_id = id(websocket)
    client = None
    
    try:
        client = websocket.client.host
        logger.info(f"New WebSocket connection attempt from {client}")
        await websocket.accept()
        logger.info(f"WebSocket connection accepted from {client}")
        
        # Initialize client resources
        active_connections[client_id] = {
            'websocket': websocket,
            'loop': asyncio.get_event_loop()
        }
        
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                logger.info(f"Received message from {client}: {message}")
                
                if message["type"] == "start_recording":
                    # Stop any existing recording
                    if 'recorder' in active_connections[client_id]:
                        active_connections[client_id]['recorder'].stop_recording()
                    
                    # Start recording
                    output_path = f"temp/{client_id}.wav"
                    
                    async def on_audio_data(data: bytes):
                        try:
                            if client_id not in active_connections:
                                return
                            
                            result = transcriber.transcribe_realtime(data)
                            if result:  # Only send if there's actual transcription
                                logger.info(f"Transcription result: {result}")
                                await websocket.send_json({
                                    "type": "transcription_progress",
                                    "data": result
                                })
                        except Exception as e:
                            logger.error(f"Error processing audio data: {e}")
                    
                    def sync_callback(data: bytes):
                        if client_id not in active_connections:
                            return
                            
                        loop = active_connections[client_id]['loop']
                        future = asyncio.run_coroutine_threadsafe(
                            on_audio_data(data),
                            loop
                        )
                        try:
                            future.result(timeout=1.0)  # Add timeout to prevent blocking
                        except Exception as e:
                            logger.error(f"Error in audio callback: {e}")
                    
                    recorder = AudioRecorder(
                        channels=1,
                        rate=16000,
                        on_data=sync_callback
                    )
                    active_connections[client_id]['recorder'] = recorder
                    recorder.start_recording(output_path)
                    
                    await websocket.send_json({
                        "type": "recording_started",
                        "data": {"status": "ok"}
                    })
                    logger.info(f"Started recording for client {client}")
                
                elif message["type"] == "stop_recording":
                    # Stop recording
                    if 'recorder' in active_connections[client_id]:
                        recorder = active_connections[client_id]['recorder']
                        recorder.stop_recording()
                        del active_connections[client_id]['recorder']
                        
                        # Transcribe the complete file
                        output_path = f"temp/{client_id}.wav"
                        if os.path.exists(output_path):
                            logger.info(f"Transcribing complete recording from {output_path}")
                            result = transcriber.transcribe(output_path)
                            logger.info(f"Complete transcription: {result}")
                            await websocket.send_json({
                                "type": "transcription_complete",
                                "data": result
                            })
                            os.remove(output_path)
                    
                    await websocket.send_json({
                        "type": "recording_stopped",
                        "data": {"status": "ok"}
                    })
                    logger.info(f"Stopped recording for client {client}")
                
                elif message["type"] == "process_audio_file":
                    # Process uploaded file
                    file_path = message["data"]["filePath"]
                    if os.path.exists(file_path):
                        logger.info(f"Processing audio file: {file_path}")
                        try:
                            result = transcriber.transcribe(file_path)
                            logger.info(f"File transcription result: {result}")
                            await websocket.send_json({
                                "type": "transcription_complete",
                                "data": result
                            })
                        except Exception as e:
                            logger.error(f"Error transcribing file: {e}")
                            await websocket.send_json({
                                "type": "error",
                                "data": {"message": str(e)}
                            })
                    else:
                        error_msg = f"Audio file not found: {file_path}"
                        logger.error(error_msg)
                        await websocket.send_json({
                            "type": "error",
                            "data": {"message": error_msg}
                        })
                
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for client {client}")
                break
            except Exception as e:
                logger.error(f"Error processing message from {client}: {e}")
                try:
                    await websocket.send_json({
                        "type": "error",
                        "data": {"message": str(e)}
                    })
                except:
                    break
                
    except Exception as e:
        logger.error(f"WebSocket error for {client}: {e}")
    finally:
        # Cleanup
        await cleanup_client(client_id)
        try:
            await websocket.close()
        except:
            pass
        logger.info(f"WebSocket connection closed for {client}")

if __name__ == "__main__":
    logger.info("Starting server on http://127.0.0.1:8000")
    try:
        uvicorn.run(
            app, 
            host="127.0.0.1",
            port=8000, 
            log_level="info",
            loop="asyncio"
        )
    finally:
        cleanup_resources()