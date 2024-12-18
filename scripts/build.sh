#!/bin/bash

# 檢查並安裝系統依賴
install_system_dependencies() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "檢查 macOS 系統依賴..."
        if ! command -v brew &> /dev/null; then
            echo "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        
        if ! command -v gfortran &> /dev/null; then
            echo "Installing gcc (includes gfortran)..."
            brew install gcc
        fi
        
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "檢查 Linux 系統依賴..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y build-essential gfortran
        elif command -v yum &> /dev/null; then
            sudo yum groupinstall -y "Development Tools"
            sudo yum install -y gcc-gfortran
        fi
    fi
}

# 檢查必要的依賴
command -v node >/dev/null 2>&1 || { echo "需要 Node.js 但未安裝"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "需要 Python 但未安裝"; exit 1; }
command -v pip3 >/dev/null 2>&1 || { echo "需要 pip 但未安裝"; exit 1; }

# 安裝系統依賴
install_system_dependencies

# 建立虛擬環境
echo "建立 Python 虛擬環境..."
python3 -m venv venv
source venv/bin/activate

# 升級 pip
echo "升級 pip..."
pip install --upgrade pip

# 安裝 Python 依賴
echo "安裝 Python 依賴..."
pip install wheel
pip install -r requirements.txt

# 安裝 Node.js 依賴
echo "安裝 Node.js 依賴..."
npm install

# 建置前端
echo "建置前端..."
npm run build

echo "建置完成！"
