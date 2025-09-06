# ヨンショーゲン プロジェクト

## プロジェクト概要
「ヨンショーゲン：ズレ者は誰だ？」は、物理カードとWebシステムを組み合わせたパーティーゲームです。

## プロジェクト構造
```
yonshogen/
├── axis_server/     # 軸表示・ゲーム進行用Webシステム
└── card_generator/  # カード生成システム（テスト版）
```

## axis_server
プレイヤーに軸とズレ指示を表示するWebシステム

### 主要機能
- **ホスト機能**: キーワードでゲームルーム作成
- **QRコード生成**: 各プレイヤー用のQRコードを自動生成
- **自動ログイン**: QRコード読み取りでキーワード・プレイヤーID自動設定
- **役割配布**: シード値とプレイヤーIDから決定的にズレ者を選出
- **軸表示**: 二軸とズレ指示の秘密表示

### 技術スタック
- React + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- QRCode.js

### 開発コマンド
```bash
cd axis_server
npm install
npm run dev     # 開発サーバー起動
npm run build   # ビルド
```

### アクセスURL
- http://localhost:5178/ - プレイヤー用ログイン画面
- http://localhost:5178/host - ホスト用管理画面

## card_generator
物理カードのプロトタイプを生成するシステム（開発予定）

### 計画機能
- 二軸カードの生成
- 名詞カードの生成
- PDF出力（印刷用）

## ゲームルール概要

### 目的
全員に共有された二軸に沿ってカードを四象限に配置する。ただし1人だけは"ズレ指示"をひそかに与えられており、その人（ズレ者）を見破る。

### 人数・時間
- 人数：4人（5–8人でも可）
- 時間：1ラウンド 5–8分

### 遊び方
1. ホストがキーワードを設定してルーム作成
2. 各プレイヤーがQRコードを読み取って参加
3. 全員に共通の二軸が表示される
4. ズレ者だけに秘密のズレ指示が表示される
5. 物理カードを使って実際にゲームをプレイ

## 開発上の注意事項

### 必須チェック項目 ⚠️
**コードを変更した後は必ず以下を実行：**

1. **TypeScriptビルドチェック**
   ```bash
   npm run build
   ```
   - 型エラーがないことを確認
   - `import type` を使用して型インポート

2. **Lintチェック**（設定されている場合）
   ```bash
   npm run lint
   ```

3. **開発サーバーでの動作確認**
   ```bash
   npm run dev
   ```

### 技術的注意事項
- Tailwind CSS v4を使用（@tailwindcss/vite プラグイン）
- Windows環境でのビルドエラーに注意
  - `@tailwindcss/oxide-win32-x64-msvc` のインストールが必要
  - `@rollup/rollup-win32-x64-msvc` のインストールが必要
  - `lightningcss-win32-x64-msvc` のインストールが必要
- QRコード生成はクライアントサイドで実行

### TypeScriptの設定
- `verbatimModuleSyntax` が有効の場合、型は `import type` を使用
- Reactのインポートは不要（React 17+）

## 進捗管理

### docs/TODO.md
開発の進捗状況と次のタスクを管理する長期メモリファイルです。
- 完了したタスクの記録
- 進行中のタスクの管理
- 次にやるべきタスクのリスト
- 技術的な注意事項のメモ

定期的に`docs/TODO.md`を確認して、プロジェクトの現在の状態と次のステップを把握してください。

## トラブルシューティング

### Tailwind CSSエラー
```bash
# Tailwind CSS v4の正しいインストール
npm install -D tailwindcss@next @tailwindcss/vite@next
```

### Viteエラー
```bash
# node_modulesの再インストール
rm -rf node_modules package-lock.json
npm install
```