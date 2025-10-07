#!/bin/bash
set -e

echo "===== Render Build Script ====="

# Node.jsバージョン確認
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# フロントエンドの依存関係インストール
echo "[1/4] Installing frontend dependencies..."
cd axis_server
npm ci

# フロントエンドのビルド
echo "[2/4] Building frontend..."
VITE_API_BASE='' VITE_WS_BASE='' npm run build

# 静的ファイルをバックエンドディレクトリにコピー
echo "[3/4] Copying built files to backend/static..."
cd ../backend
mkdir -p static
cp -r ../axis_server/dist/* static/

# Python依存関係のインストール
echo "[4/4] Installing Python dependencies..."
pip install -r requirements.txt

echo "===== Build Complete ====="
