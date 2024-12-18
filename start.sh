#!/bin/bash

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 清理舊的進程
echo -e "${YELLOW}Cleaning up old processes...${NC}"
pkill -f "python.*main.py" || true
pkill -f "node.*vite" || true
pkill -f "electron" || true

# 等待端口釋放
wait_for_port() {
    local port=$1
    while lsof -i :$port >/dev/null 2>&1; do
        echo -e "${YELLOW}Waiting for port $port to be available...${NC}"
        sleep 1
    done
}

# 檢查服務是否就緒
check_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1

    echo -e "${YELLOW}Waiting for $name...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}$name is ready${NC}"
            return 0
        fi
        echo -e "${YELLOW}Attempt $attempt/$max_attempts: Waiting for $name...${NC}"
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo -e "${RED}$name failed to start after $max_attempts attempts${NC}"
    return 1
}

# 檢查 Vite 開發伺服器
check_vite() {
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}Waiting for Vite server...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:3000 | grep -q "vite" 2>/dev/null; then
            echo -e "${GREEN}Vite server is ready${NC}"
            return 0
        fi
        echo -e "${YELLOW}Attempt $attempt/$max_attempts: Waiting for Vite server...${NC}"
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo -e "${RED}Vite server failed to start after $max_attempts attempts${NC}"
    return 1
}

# 確保端口可用
wait_for_port 8000
wait_for_port 3000

# 啟動 Python 後端
echo -e "${YELLOW}Starting Python backend...${NC}"
npm run start-api &
PYTHON_PID=$!

# 等待 Python 後端就緒
check_service "http://localhost:8000/health" "Python backend" || exit 1

# 建置 Electron
echo -e "${YELLOW}Building Electron...${NC}"
npm run build:electron

# 啟動 Vite 開發伺服器
echo -e "${YELLOW}Starting Vite dev server...${NC}"
npm run dev &
VITE_PID=$!

# 等待 Vite 伺服器就緒
check_vite || exit 1

# 確保所有服務都已就緒
sleep 2

# 啟動 Electron
echo -e "${GREEN}Starting Electron...${NC}"
# cross-env NODE_ENV=development electron .
npm run electron:dev

# 清理進程
cleanup() {
    echo -e "${YELLOW}Cleaning up...${NC}"
    kill $PYTHON_PID 2>/dev/null
    kill $VITE_PID 2>/dev/null
    pkill -f "python.*main.py" || true
    pkill -f "node.*vite" || true
    pkill -f "electron" || true
}

trap cleanup EXIT INT TERM