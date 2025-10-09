#!/bin/bash
set -e

echo "===== Render Build Script ====="

# 現在のディレクトリを確認
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Node.jsバージョン確認
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# プロジェクトルートに移動
cd "$(dirname "$0")/.."
echo "Moved to project root: $(pwd)"

# フロントエンドの依存関係インストール
echo "[1/4] Installing frontend dependencies..."
cd frontend
npm ci

# フロントエンドのビルド
echo "[2/4] Building frontend..."
VITE_API_BASE='' VITE_WS_BASE='' npm run build

# 静的ファイルをバックエンドディレクトリにコピー
echo "[3/4] Copying built files to backend/static..."
cd ../backend
mkdir -p static
cp -r ../frontend/dist/* static/

# Python依存関係のインストール
echo "[4/4] Installing Python dependencies..."
pip install -r requirements.txt

echo "===== Build Complete ====="
