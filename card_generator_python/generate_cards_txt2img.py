#!/usr/bin/env python3
"""
Stable Diffusion txt2img を使用したカード生成システム
テキストプロンプトから直接画像を生成
"""

import os
import sys
import json
import time
import argparse
import requests
from pathlib import Path
from typing import List, Dict, Optional
import json
from datetime import datetime
import base64
from PIL import Image
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


class Txt2ImgCardGenerator:
    """txt2imgを使用したカード生成クラス"""
    
    def __init__(self, sd_url: str = "http://localhost:7860"):
        """
        初期化
        
        Args:
            sd_url: Stable Diffusion WebUI APIのURL
        """
        self.sd_url = sd_url
        self.output_dir = Path("output")
        self.output_dir.mkdir(exist_ok=True)
        
        # txt2img用のデフォルトプロンプトテンプレート（リアリスティック写真スタイル）
        self.default_positive_template = """
        {keyword}, photorealistic, high quality photography, professional product photo,
        studio lighting, sharp focus, high resolution, detailed texture,
        clean white background, centered object, commercial photography,
        8k uhd, dslr, soft lighting, high quality, film grain,
        ((photorealistic:1.5)), ((realistic:1.4)), ((detailed:1.3)), ((professional photo:1.3))
        """
        
        self.default_negative_template = """
        cartoon, illustration, drawing, anime, manga, comic, sketch, painting,
        text, letters, words, writing, labels, watermark, signature,
        dark background, complex background, gradient background, 
        multiple objects, crowded, cluttered,
        human, person, people, face, body, hands, fingers, portrait, character,
        anthropomorphic, humanoid, man, woman, child, baby,
        low quality, blurry, distorted, ugly, scary, violent,
        3D render, CGI, digital art, artistic
        """
        
        # txt2img API設定
        self.txt2img_params = {
            "steps": 25,
            "sampler_name": "DPM++ 2M Karras", 
            "cfg_scale": 7.5,
            "width": 512,
            "height": 512,
            "batch_size": 1,
            "n_iter": 1,
            "restore_faces": False,
            "tiling": False,
            "negative_prompt": "",
            "seed": -1,
        }
    
    def test_api_connection(self) -> bool:
        """
        Stable Diffusion APIの接続をテスト
        
        Returns:
            接続成功の場合True
        """
        try:
            response = requests.get(f"{self.sd_url}/sdapi/v1/options", timeout=5)
            if response.status_code == 200:
                print(f"OK Stable Diffusion APIに接続成功: {self.sd_url}")
                return True
            else:
                print(f"NG API接続エラー: ステータスコード {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            print(f"NG 接続エラー: {self.sd_url} に接続できません")
            print("  Automatic1111 WebUIが起動していることを確認してください")
            return False
        except Exception as e:
            print(f"NG 予期しないエラー: {e}")
            return False
    
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
                line = line.strip()
                if line and not line.startswith('#'):
                    # 番号付きリストの場合、番号を除去
                    if '→' in line:
                        word = line.split('→')[1].strip()
                    else:
                        word = line
                    words.append(word)
        return words
    
    def generate_prompts(self, word: str, 
                        positive_template: Optional[str] = None,
                        negative_template: Optional[str] = None) -> tuple[str, str]:
        """
        単語からプロンプトを生成
        
        Args:
            word: キーワード
            positive_template: ポジティブプロンプトのテンプレート
            negative_template: ネガティブプロンプトのテンプレート
            
        Returns:
            (positive_prompt, negative_prompt)
        """
        if positive_template is None:
            positive_template = self.default_positive_template
        if negative_template is None:
            negative_template = self.default_negative_template
            
        positive_prompt = positive_template.format(keyword=word).strip()
        negative_prompt = negative_template.strip()
        
        return positive_prompt, negative_prompt
    
    def generate_txt2img(self, positive_prompt: str, negative_prompt: str,
                        max_retries: int = 3) -> tuple[Optional[Image.Image], int]:
        """
        txt2imgで画像を生成
        
        Args:
            positive_prompt: ポジティブプロンプト
            negative_prompt: ネガティブプロンプト
            max_retries: 最大リトライ回数
            
        Returns:
            (生成された画像（PIL Image）、seed値)、失敗時は(None, -1)
        """
        params = self.txt2img_params.copy()
        params["prompt"] = positive_prompt
        params["negative_prompt"] = negative_prompt
        
        for attempt in range(max_retries):
            try:
                print(f"  txt2img画像生成中... (試行 {attempt + 1}/{max_retries})")
                
                # txt2img APIを呼び出し
                response = requests.post(
                    f"{self.sd_url}/sdapi/v1/txt2img",
                    json=params,
                    timeout=120
                )
                
                if response.status_code == 200:
                    result = response.json()
                    # Base64エンコードされた画像をデコード
                    image_data = base64.b64decode(result['images'][0])
                    image = Image.open(BytesIO(image_data))
                    # info からseed値を取得
                    info = json.loads(result.get('info', '{}'))
                    seed = info.get('seed', -1)
                    return image, seed
                else:
                    print(f"  NG API エラー: {response.status_code}")
                    
            except requests.exceptions.Timeout:
                print(f"  NG タイムアウト（試行 {attempt + 1}/{max_retries}）")
            except Exception as e:
                print(f"  NG エラー: {e}")
            
            if attempt < max_retries - 1:
                time.sleep(2)
        
        return None, -1
    
    def save_image(self, image: Image.Image, output_path: Path) -> bool:
        """
        画像を保存
        
        Args:
            image: 保存する画像
            output_path: 保存先パス
            
        Returns:
            保存成功の場合True
        """
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            image.save(output_path, "PNG")
            return True
        except Exception as e:
            print(f"  画像保存エラー: {e}")
            return False
    
    def create_pdf(self, image_paths: List[Path], pdf_path: Path,
                  cards_per_row: int = 3, cards_per_page: int = 9):
        """
        画像からPDFを作成
        
        Args:
            image_paths: 画像パスのリスト
            pdf_path: PDF出力パス
            cards_per_row: 1行あたりのカード数
            cards_per_page: 1ページあたりのカード数
        """
        try:
            pdf_path.parent.mkdir(parents=True, exist_ok=True)
            
            c = canvas.Canvas(str(pdf_path), pagesize=A4)
            page_width, page_height = A4
            
            # カードサイズの計算
            margin = 20
            card_width = (page_width - margin * 2) / cards_per_row
            card_height = card_width  # 正方形と仮定
            
            rows_per_page = cards_per_page // cards_per_row
            
            for i, img_path in enumerate(image_paths):
                if i > 0 and i % cards_per_page == 0:
                    c.showPage()
                
                page_index = i % cards_per_page
                row = page_index // cards_per_row
                col = page_index % cards_per_row
                
                x = margin + col * card_width
                y = page_height - margin - (row + 1) * card_height
                
                if img_path.exists():
                    c.drawImage(str(img_path), x, y, card_width, card_height)
                    
                    # カード名を追加
                    c.setFont("Helvetica", 8)
                    text_y = y - 10
                    c.drawString(x, text_y, img_path.stem)
            
            c.save()
            print(f"PDF作成完了: {pdf_path}")
            
        except Exception as e:
            print(f"PDF作成エラー: {e}")
    
    def generate_cards_batch_with_ids(self, words_file: str,
                                     word_id_map: Dict[str, int],
                                     positive_template: Optional[str] = None,
                                     negative_template: Optional[str] = None):
        """
        IDマップを使用してバッチでカードを生成
        
        Args:
            words_file: 単語リストファイルのパス
            word_id_map: 英語名→IDのマップ
            positive_template: ポジティブプロンプトテンプレート
            negative_template: ネガティブプロンプトテンプレート
            
        Returns:
            生成結果の辞書
        """
        # API接続確認
        if not self.test_api_connection():
            return {"error": "API接続失敗"}
        
        # 単語リストを読み込み
        words = self.load_words(words_file)
        print(f"\n{len(words)}個の単語を読み込みました")
        
        # outputディレクトリ確認
        output_dir = self.output_dir
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # 結果を格納
        results = {
            "total": len(words),
            "success": 0,
            "failed": 0,
            "output_dir": str(output_dir),
            "images": []
        }
        
        # 各単語について画像を生成
        for i, word in enumerate(words, 1):
            # IDを取得
            word_id = word_id_map.get(word, 0)
            print(f"\n[{i}/{len(words)}] ID:{word_id:03d} - {word}")
            
            # プロンプト生成
            positive_prompt, negative_prompt = self.generate_prompts(
                word, positive_template, negative_template
            )
            
            # txt2img生成
            image, seed = self.generate_txt2img(positive_prompt, negative_prompt)
            
            if image:
                # ID_name_seed形式のファイル名
                safe_filename = word.replace(' ', '_').replace('/', '_')
                filename = f"{word_id:03d}_{safe_filename}_{seed}.png"
                image_path = output_dir / filename
                
                if self.save_image(image, image_path):
                    print(f"  OK 保存完了: {filename}")
                    results["success"] += 1
                    results["images"].append({
                        "id": word_id,
                        "name": word,
                        "seed": seed,
                        "path": str(image_path)
                    })
                else:
                    results["failed"] += 1
            else:
                print(f"  NG 生成失敗")
                results["failed"] += 1
        
        # 結果サマリーを表示
        print(f"\n=== txt2img生成完了 ===")
        print(f"成功: {results['success']}/{results['total']}")
        print(f"失敗: {results['failed']}/{results['total']}")
        print(f"出力先: {output_dir}")
        
        return results
    
    def generate_cards_batch(self, words_file: str,
                           positive_template: Optional[str] = None,
                           negative_template: Optional[str] = None,
                           output_name: Optional[str] = None):
        """
        バッチでカードを生成
        
        Args:
            words_file: 単語リストファイルのパス
            positive_template: ポジティブプロンプトテンプレート
            negative_template: ネガティブプロンプトテンプレート
            output_name: 出力名
            
        Returns:
            生成結果の辞書
        """
        # API接続確認
        if not self.test_api_connection():
            return {"error": "API接続失敗"}
        
        # 単語リストを読み込み
        words = self.load_words(words_file)
        print(f"\n{len(words)}個の単語を読み込みました")
        
        # 出力ディレクトリを作成
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        batch_dir = self.output_dir / f"txt2img_cards_{timestamp}"
        batch_dir.mkdir(parents=True, exist_ok=True)
        
        # 結果を格納
        results = {
            "total": len(words),
            "success": 0,
            "failed": 0,
            "output_dir": str(batch_dir),
            "images": []
        }
        
        successful_images = []
        
        # 各単語について画像を生成
        for i, word in enumerate(words, 1):
            print(f"\n[{i}/{len(words)}] {word}")
            
            # プロンプト生成
            positive_prompt, negative_prompt = self.generate_prompts(
                word, positive_template, negative_template
            )
            
            # txt2img生成
            image, seed = self.generate_txt2img(positive_prompt, negative_prompt)
            
            if image:
                # ファイル名を作成（スペースをアンダースコアに置換）
                safe_filename = word.replace(' ', '_').replace('/', '_')
                image_path = batch_dir / f"{safe_filename}.png"
                
                if self.save_image(image, image_path):
                    print(f"  OK 保存完了: {image_path.name}")
                    results["success"] += 1
                    results["images"].append(str(image_path))
                    successful_images.append(image_path)
                else:
                    results["failed"] += 1
            else:
                print(f"  NG 生成失敗")
                results["failed"] += 1
        
        # PDF作成
        if successful_images and output_name:
            pdf_path = batch_dir / f"{output_name}.pdf"
            self.create_pdf(successful_images, pdf_path)
        
        # 結果をJSONで保存
        result_file = batch_dir / "results.json"
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        # 結果サマリーを表示
        print(f"\n=== txt2img生成完了 ===")
        print(f"成功: {results['success']}/{results['total']}")
        print(f"失敗: {results['failed']}/{results['total']}")
        print(f"出力先: {batch_dir}")
        if output_name:
            print(f"PDF作成完了: {batch_dir / f'{output_name}.pdf'}")
        
        return results


def main():
    """メイン関数"""
    parser = argparse.ArgumentParser(description="txt2imgでカードを生成")
    parser.add_argument(
        "words_file",
        help="単語リストファイルのパス"
    )
    parser.add_argument(
        "--positive-template",
        "-p",
        help="ポジティブプロンプトテンプレートファイル"
    )
    parser.add_argument(
        "--negative-template", 
        "-n",
        help="ネガティブプロンプトテンプレートファイル"
    )
    parser.add_argument(
        "--output",
        "-o",
        help="出力PDF名"
    )
    parser.add_argument(
        "--api-url",
        default="http://localhost:7860",
        help="Stable Diffusion API URL"
    )
    
    args = parser.parse_args()
    
    # テンプレートファイルの読み込み
    positive_template = None
    negative_template = None
    
    if args.positive_template:
        with open(args.positive_template, 'r', encoding='utf-8') as f:
            positive_template = f.read()
    
    if args.negative_template:
        with open(args.negative_template, 'r', encoding='utf-8') as f:
            negative_template = f.read()
    
    # ジェネレーターを初期化して実行
    generator = Txt2ImgCardGenerator(args.api_url)
    results = generator.generate_cards_batch(
        args.words_file,
        positive_template,
        negative_template,
        args.output
    )
    
    if "error" in results:
        print(f"エラー: {results['error']}")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())