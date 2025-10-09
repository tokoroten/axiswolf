#!/bin/bash
# PeerJSサーバーを起動するスクリプト

# Node.jsがインストールされているか確認
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# peer パッケージがグローバルにインストールされているか確認
if ! command -v peerjs &> /dev/null; then
    echo "Installing peer globally..."
    npm install -g peer
fi

# PeerJSサーバーを起動（ポート9000）
echo "Starting PeerJS server on port 9000..."
peerjs --port 9000 --key peerjs --path /peerjs
