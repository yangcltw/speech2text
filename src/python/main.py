import uvicorn
import logging
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import socket

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 確保使用 IPv4
socket.setdefaulttimeout(30)
socket.AF_INET = socket.AF_INET

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting server...")

@app.get("/health")
async def health_check():
    logger.info("Health check called")
    return {"status": "ok"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        client = websocket.client.host
        logger.info(f"New WebSocket connection attempt from {client}")
        await websocket.accept()
        logger.info(f"WebSocket connection accepted from {client}")
        
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                logger.info(f"Received message from {client}: {message}")
                
                if message["type"] == "start_recording":
                    logger.info(f"Starting recording for {client}...")
                    await websocket.send_json({
                        "type": "recording_started",
                        "data": {"status": "ok"}
                    })
                    logger.info(f"Recording started response sent to {client}")
                
                elif message["type"] == "stop_recording":
                    logger.info(f"Stopping recording for {client}...")
                    await websocket.send_json({
                        "type": "recording_stopped",
                        "data": {"status": "ok"}
                    })
                    logger.info(f"Recording stopped response sent to {client}")
                
            except Exception as e:
                logger.error(f"Error processing message from {client}: {e}")
                await websocket.send_json({
                    "type": "error",
                    "data": {"message": str(e)}
                })
                
    except Exception as e:
        logger.error(f"WebSocket error for {client}: {e}")
    finally:
        logger.info(f"WebSocket connection closed for {client}")

if __name__ == "__main__":
    logger.info("Starting server on http://127.0.0.1:8000")
    uvicorn.run(
        app, 
        host="127.0.0.1",  # 明確使用 IPv4
        port=8000, 
        log_level="info",
        loop="asyncio"
    )