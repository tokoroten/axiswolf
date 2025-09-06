#!/usr/bin/env python3
"""
ヨンショーゲン カード生成バッチシステム
単語リストからDALL-E 3を使用してカード画像を生成し、PDFに出力する
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime

from openai import OpenAI
from PIL import Image
import requests
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from dotenv import load_dotenv

# 環境変数を読み込み
load_dotenv()


class CardGenerator:
    """カード生成クラス"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        初期化
        
        Args:
            api_key: OpenAI APIキー（指定しない場合は環境変数から取得）
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI APIキーが設定されていません。.envファイルまたは引数で指定してください。")
        
        self.client = OpenAI(api_key=self.api_key)
        self.output_dir = Path("output")
        self.output_dir.mkdir(exist_ok=True)
        
        # 画像生成の設定
        self.image_size = "1024x1024"
        self.image_quality = "standard"
        self.dalle_model = "dall-e-3"
        
    def load_words(self, file_path: str) -> List[str]:
        """
        単語リストをファイルから読み込む
        
        Args:
            file_path: 単語リストファイルのパス
            
        Returns:
            単語のリスト
        """
        words = []
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                word = line.strip()
                if word:
                    words.append(word)
        return words
    
    def generate_image_prompt(self, word: str) -> str:
        """
        単語から画像生成用のプロンプトを作成
        
        Args:
            word: 単語
            
        Returns:
            DALL-E用のプロンプト
        """
        return f"""
        Create a simple, clear illustration for the word "{word}" suitable for a card game.
        The image should be:
        - Colorful and visually appealing
        - Easy to understand at a glance
        - Without any text or letters
        - Centered composition with white background
        - In a playful, slightly cartoonish style
        - Suitable for all ages
        """
    
    def generate_image(self, word: str, retry_count: int = 3) -> Optional[str]:
        """
        DALL-E 3を使用して画像を生成
        
        Args:
            word: 生成する単語
            retry_count: リトライ回数
            
        Returns:
            画像のURL（失敗時はNone）
        """
        prompt = self.generate_image_prompt(word)
        
        for attempt in range(retry_count):
            try:
                print(f"  画像生成中... (試行 {attempt + 1}/{retry_count})")
                response = self.client.images.generate(
                    model=self.dalle_model,
                    prompt=prompt,
                    size=self.image_size,
                    quality=self.image_quality,
                    n=1
                )
                
                image_url = response.data[0].url
                return image_url
                
            except Exception as e:
                print(f"  エラー: {e}")
                if attempt < retry_count - 1:
                    time.sleep(2)  # リトライ前に待機
                else:
                    print(f"  画像生成に失敗しました: {word}")
                    return None
    
    def download_image(self, url: str, word: str) -> Optional[Path]:
        """
        画像をダウンロードして保存
        
        Args:
            url: 画像のURL
            word: 単語（ファイル名に使用）
            
        Returns:
            保存したファイルのパス（失敗時はNone）
        """
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            # 画像を保存
            img = Image.open(BytesIO(response.content))
            
            # ファイル名を生成（日本語対応）
            safe_filename = "".join(c if c.isalnum() or c in ('-', '_') else '_' for c in word)
            image_path = self.output_dir / f"{safe_filename}.png"
            
            img.save(image_path, 'PNG')
            return image_path
            
        except Exception as e:
            print(f"  画像のダウンロードに失敗: {e}")
            return None
    
    def generate_cards_batch(self, word_list_path: str, output_name: str = None) -> Dict:
        """
        バッチ処理でカードを生成
        
        Args:
            word_list_path: 単語リストファイルのパス
            output_name: 出力ファイル名のプレフィックス
            
        Returns:
            生成結果の統計情報
        """
        # 単語を読み込み
        words = self.load_words(word_list_path)
        print(f"\n{len(words)}個の単語を読み込みました")
        
        # 出力ディレクトリを作成
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        batch_dir = self.output_dir / f"batch_{timestamp}"
        batch_dir.mkdir(exist_ok=True)
        
        # 生成結果を記録
        results = {
            "total": len(words),
            "success": 0,
            "failed": 0,
            "cards": []
        }
        
        # 各単語に対して画像を生成
        for i, word in enumerate(words, 1):
            print(f"\n[{i}/{len(words)}] {word}")
            
            # 画像を生成
            image_url = self.generate_image(word)
            if not image_url:
                results["failed"] += 1
                results["cards"].append({
                    "word": word,
                    "status": "failed",
                    "image_path": None
                })
                continue
            
            # 画像をダウンロード
            image_path = self.download_image(image_url, word)
            if image_path:
                # バッチディレクトリにコピー
                batch_image_path = batch_dir / image_path.name
                Image.open(image_path).save(batch_image_path)
                
                results["success"] += 1
                results["cards"].append({
                    "word": word,
                    "status": "success",
                    "image_path": str(batch_image_path)
                })
                print(f"  ✓ 保存完了: {batch_image_path.name}")
            else:
                results["failed"] += 1
                results["cards"].append({
                    "word": word,
                    "status": "failed",
                    "image_path": None
                })
            
            # API制限を考慮して待機
            time.sleep(1)
        
        # 結果を保存
        result_file = batch_dir / "results.json"
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"\n=== 生成完了 ===")
        print(f"成功: {results['success']}/{results['total']}")
        print(f"失敗: {results['failed']}/{results['total']}")
        print(f"出力先: {batch_dir}")
        
        # PDFを生成
        if results["success"] > 0:
            pdf_path = self.create_pdf(results["cards"], batch_dir, output_name)
            if pdf_path:
                print(f"PDF作成完了: {pdf_path}")
        
        return results
    
    def create_pdf(self, cards: List[Dict], output_dir: Path, output_name: str = None) -> Optional[Path]:
        """
        カード画像をPDFにまとめる
        
        Args:
            cards: カード情報のリスト
            output_dir: 出力ディレクトリ
            output_name: 出力ファイル名
            
        Returns:
            PDFファイルのパス（失敗時はNone）
        """
        try:
            # PDFファイル名を生成
            if not output_name:
                output_name = f"cards_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            pdf_path = output_dir / f"{output_name}.pdf"
            
            # A4サイズでPDFを作成（3x3のグリッド）
            c = canvas.Canvas(str(pdf_path), pagesize=A4)
            page_width, page_height = A4
            
            # カードサイズとマージンを設定
            cards_per_row = 3
            cards_per_col = 3
            cards_per_page = cards_per_row * cards_per_col
            
            margin = 20
            card_width = (page_width - margin * 2) / cards_per_row
            card_height = (page_height - margin * 2) / cards_per_col
            
            # 成功したカードのみをフィルタ
            success_cards = [card for card in cards if card["status"] == "success"]
            
            for page_num in range(0, len(success_cards), cards_per_page):
                if page_num > 0:
                    c.showPage()
                
                # このページのカードを配置
                page_cards = success_cards[page_num:page_num + cards_per_page]
                
                for i, card in enumerate(page_cards):
                    if not card["image_path"] or not Path(card["image_path"]).exists():
                        continue
                    
                    # グリッド位置を計算
                    row = i // cards_per_row
                    col = i % cards_per_row
                    
                    x = margin + col * card_width
                    y = page_height - margin - (row + 1) * card_height
                    
                    # 画像を配置
                    try:
                        img = Image.open(card["image_path"])
                        
                        # アスペクト比を保持してリサイズ
                        img_width, img_height = img.size
                        aspect = img_width / img_height
                        
                        if aspect > card_width / card_height:
                            # 幅に合わせる
                            draw_width = card_width * 0.9
                            draw_height = draw_width / aspect
                        else:
                            # 高さに合わせる
                            draw_height = card_height * 0.8
                            draw_width = draw_height * aspect
                        
                        # 中央に配置
                        x_offset = (card_width - draw_width) / 2
                        y_offset = (card_height - draw_height) / 2
                        
                        c.drawImage(
                            card["image_path"],
                            x + x_offset,
                            y + y_offset,
                            width=draw_width,
                            height=draw_height
                        )
                        
                        # 単語を下に表示
                        c.setFont("Helvetica", 10)
                        text_y = y + 10
                        c.drawCentredString(x + card_width / 2, text_y, card["word"])
                        
                    except Exception as e:
                        print(f"  PDF追加エラー ({card['word']}): {e}")
            
            c.save()
            return pdf_path
            
        except Exception as e:
            print(f"PDF作成エラー: {e}")
            return None


def main():
    """メイン関数"""
    parser = argparse.ArgumentParser(description="ヨンショーゲン カード生成バッチシステム")
    parser.add_argument(
        "word_list",
        help="単語リストファイルのパス"
    )
    parser.add_argument(
        "--output",
        "-o",
        help="出力ファイル名のプレフィックス",
        default=None
    )
    parser.add_argument(
        "--api-key",
        help="OpenAI APIキー（環境変数より優先）",
        default=None
    )
    
    args = parser.parse_args()
    
    # ファイルの存在確認
    if not Path(args.word_list).exists():
        print(f"エラー: ファイルが見つかりません: {args.word_list}")
        sys.exit(1)
    
    try:
        # カード生成器を初期化
        generator = CardGenerator(api_key=args.api_key)
        
        # バッチ処理を実行
        results = generator.generate_cards_batch(args.word_list, args.output)
        
        # 結果に応じて終了コードを設定
        if results["failed"] == 0:
            sys.exit(0)
        elif results["success"] > 0:
            sys.exit(1)  # 部分的成功
        else:
            sys.exit(2)  # 完全失敗
            
    except Exception as e:
        print(f"エラー: {e}")
        sys.exit(3)


if __name__ == "__main__":
    main()