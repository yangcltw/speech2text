@echo off

REM 檢查必要的依賴
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 需要 Node.js 但未安裝
    exit /b 1
)

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 需要 Python 但未安裝
    exit /b 1
)

REM 建立虛擬環境
echo 建立 Python 虛擬環境...
python -m venv venv
call venv\Scripts\activate

REM 安裝 Python 依賴
echo 安裝 Python 依賴...
pip install -r requirements.txt

REM 安裝 Node.js 依賴
echo 安裝 Node.js 依賴...
call npm install

REM 建置前端
echo 建置前端...
call npm run build

echo 建置完成！
