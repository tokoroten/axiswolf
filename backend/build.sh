#!/bin/bash
set -e

echo "===== Render Build Script ====="

# Node.jsのインストール（Renderのビルド環境用）
echo "[1/5] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# フロントエンドの依存関係インストール
echo "[2/5] Installing frontend dependencies..."
cd ../axis_server
npm ci

# フロントエンドのビルド
echo "[3/5] Building frontend..."
VITE_API_BASE='' VITE_WS_BASE='' npm run build

# 静的ファイルをバックエンドディレクトリにコピー
echo "[4/5] Copying built files to backend/static..."
cd ../backend
mkdir -p static
cp -r ../axis_server/dist/* static/

# Python依存関係のインストール
echo "[5/5] Installing Python dependencies..."
pip install -r requirements.txt

echo "===== Build Complete ====="
