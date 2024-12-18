# 開發指南

## 環境設置

### 前端開發環境

1. 安裝 Node.js 依賴：
bash
npm install

2. 啟動開發伺服器：
bash
npm run dev

### 後端開發環境

1. 建立虛擬環境：
bash
python -m venv venv
source venv/bin/activate # Windows: .\venv\Scripts\activate

2. 安裝依賴：
bash
pip install -r requirements.txt

3. 啟動後端服務：
bash
python src/python/main.py

## 開發工作流程

1. 功能開發
   - 建立功能分支
   - 開發新功能
   - 提交變更
   - 建立合併請求

2. 測試
   - 單元測試
   - 整合測試
   - 手動測試

3. 程式碼風格
   - 使用 ESLint
   - 使用 Prettier
   - 遵循 PEP 8

## 除錯指南

1. 前端除錯
   - 使用 Chrome DevTools
   - 檢查 React DevTools
   - 檢查 Console 日誌

2. 後端除錯
   - 檢查日誌檔案
   - 使用 pdb 除錯器
   - 監控 API 請求
