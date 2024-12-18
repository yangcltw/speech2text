#!/bin/bash

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 清理舊的建置文件
echo -e "${YELLOW}Cleaning old build files...${NC}"
npm run rimraf dist

# 建置 preload 腳本
echo -e "${YELLOW}Building preload script...${NC}"
npm run build:preload

# 檢查 preload 建置結果
if [ ! -f "dist/preload/preload.js" ]; then
    echo -e "${RED}Failed to build preload script${NC}"
    exit 1
fi
echo -e "${GREEN}Preload script built successfully${NC}"

# 建置主進程
echo -e "${YELLOW}Building main process...${NC}"
npm run build:main

# 檢查主進程建置結果
if [ ! -f "dist/main/index.js" ]; then
    echo -e "${RED}Failed to build main process${NC}"
    exit 1
fi
echo -e "${GREEN}Main process built successfully${NC}"

echo -e "${GREEN}Build completed successfully${NC}"