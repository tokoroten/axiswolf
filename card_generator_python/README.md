# ヨンショーゲン カード生成システム（Python版）

バッチ処理で単語リストから自動的にカード画像を生成し、PDFにまとめるシステムです。

## セットアップ

1. 依存パッケージのインストール
```bash
pip install -r requirements.txt
```

2. OpenAI APIキーの設定
`.env`ファイルを作成し、APIキーを設定します：
```bash
cp .env.example .env
# .envファイルを編集してAPIキーを設定
```

## 使用方法

### 基本的な使用方法
```bash
python generate_cards.py word_lists/sample_words.txt
```

### オプション指定
```bash
# 出力ファイル名を指定
python generate_cards.py word_lists/sample_words.txt --output my_cards

# APIキーを直接指定（.envファイルより優先）
python generate_cards.py word_lists/sample_words.txt --api-key sk-xxxxx
```

## 単語リストの形式

`word_lists/`ディレクトリ内にテキストファイルを作成し、1行に1単語を記載します：

```
りんご
バナナ
富士山
東京タワー
```

## 出力

- `output/batch_YYYYMMDD_HHMMSS/`: 生成されたバッチごとのディレクトリ
  - 個別の画像ファイル（PNG形式）
  - `results.json`: 生成結果の記録
  - `cards_YYYYMMDD_HHMMSS.pdf`: カードをまとめたPDF

## 機能

- DALL-E 3を使用した高品質な画像生成
- バッチ処理による効率的な大量生成
- 自動リトライ機能
- PDF自動生成（A4サイズ、3x3グリッド）
- 日本語対応

## トラブルシューティング

### APIキーエラー
`.env`ファイルにOpenAI APIキーが正しく設定されているか確認してください。

### 画像生成の失敗
- ネットワーク接続を確認
- APIの利用制限に達していないか確認
- 単語が不適切な内容を含んでいないか確認

### PDFが生成されない
最低1枚以上の画像が正常に生成されている必要があります。