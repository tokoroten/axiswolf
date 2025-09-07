#!/usr/bin/env python3
"""
DALL-E 3を使用してCSVから画像を生成するスクリプト
OpenAI APIを使用して全アイテムの画像を生成
"""

import os
import sys
import json
import time
import argparse
import requests
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime
import base64
from PIL import Image
from io import BytesIO

# .envファイルから環境変数を読み込み
from dotenv import load_dotenv
load_dotenv()

# OpenAI APIを使用
try:
    from openai import OpenAI
except ImportError:
    print("OpenAIライブラリがインストールされていません")
    print("実行: pip install openai")
    sys.exit(1)

# CSVジェネレーターをインポート
from generate_from_csv_txt2img import CSVTxt2ImgGenerator


class DALLE3Generator:
    """DALL-E 3画像生成クラス"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        初期化
        
        Args:
            api_key: OpenAI APIキー
        """
        # APIキーを環境変数から取得またはパラメータから
        if api_key:
            self.api_key = api_key
        else:
            self.api_key = os.environ.get("OPENAI_API_KEY")
        
        if not self.api_key:
            raise ValueError("OpenAI APIキーが設定されていません。.envファイルまたは環境変数OPENAI_API_KEYを設定してください")
        
        # OpenAIクライアント初期化
        self.client = OpenAI(api_key=self.api_key)
        
        # 出力ディレクトリ
        self.output_dir = Path("output_dalle3")
        self.output_dir.mkdir(exist_ok=True)
        
        # プロンプトテンプレート（リアリスティック写真スタイル・日本語）
        self.prompt_template = """
        「{keyword}」の高品質な写真。
        プロ仕様の商品撮影、スタジオ照明、
        鮮明なフォーカス、高解像度、詳細なテクスチャ、
        清潔な白い背景、中央に配置されたオブジェクト、商業写真スタイル。
        テキストなし、透かしなし、人間の顔や体なし。
        """
        
    def test_api_connection(self) -> bool:
        """
        OpenAI API接続をテスト
        
        Returns:
            接続成功の場合True
        """
        try:
            # 簡単なテストリクエスト
            response = self.client.models.list()
            print("OK: OpenAI APIに接続成功")
            return True
        except Exception as e:
            print(f"NG: OpenAI API接続エラー: {e}")
            return False
    
    def generate_image(self, prompt: str, word_data: Dict) -> Optional[Dict]:
        """
        DALL-E 3で画像を生成
        
        Args:
            prompt: 生成プロンプト
            word_data: 単語データ
            
        Returns:
            成功時は画像データ、失敗時はNone
        """
        try:
            # DALL-E 3で画像生成
            response = self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",  # DALL-E 3は1024x1024, 1024x1792, 1792x1024をサポート
                quality="standard",  # "standard" or "hd"
                n=1,  # DALL-E 3は1枚ずつしか生成できない
                response_format="b64_json"  # Base64形式で受け取る
            )
            
            # 画像データを取得
            image_data = response.data[0].b64_json
            revised_prompt = response.data[0].revised_prompt
            
            # Base64をPIL Imageに変換
            image = Image.open(BytesIO(base64.b64decode(image_data)))
            
            return {
                'image': image,
                'revised_prompt': revised_prompt,
                'original_prompt': prompt
            }
            
        except Exception as e:
            print(f"  NG: 生成エラー: {e}")
            return None
    
    def save_image(self, image: Image.Image, word_data: Dict, 
                   timestamp: str = None) -> Optional[Path]:
        """
        画像を保存
        
        Args:
            image: PIL Image
            word_data: 単語データ
            timestamp: タイムスタンプ（オプション）
            
        Returns:
            保存したファイルパス、失敗時はNone
        """
        try:
            # ファイル名作成（ID_name_timestamp.png）
            word_id = word_data['id']
            word_name = word_data['english'].replace(' ', '_').replace('/', '_')
            
            if timestamp is None:
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            
            filename = f"{word_id:03d}_{word_name}_dalle3_{timestamp}.png"
            filepath = self.output_dir / filename
            
            # 保存
            image.save(filepath, "PNG")
            return filepath
            
        except Exception as e:
            print(f"  NG: 保存エラー: {e}")
            return None
    
    def generate_all_items(self, csv_path: str = "word_lists/all_words.csv",
                          skip_existing: bool = False,
                          delay: float = 1.0):
        """
        CSVの全アイテムを生成
        
        Args:
            csv_path: CSVファイルパス
            skip_existing: 既存ファイルをスキップするか
            delay: リクエスト間の遅延（秒）
        """
        print("=== DALL-E 3画像生成開始 ===")
        print(f"開始時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # API接続確認
        if not self.test_api_connection():
            print("エラー: OpenAI APIに接続できません")
            return 1
        
        # CSVデータ読み込み
        csv_gen = CSVTxt2ImgGenerator(csv_path)
        all_words = csv_gen.words_data
        total_words = len(all_words)
        
        print(f"総単語数: {total_words}")
        print("")
        
        # 統計情報
        success_count = 0
        failed_count = 0
        skipped_count = 0
        start_time = time.time()
        
        # バッチタイムスタンプ
        batch_timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # 結果を格納
        results = []
        
        # 各単語について画像を生成
        for idx, word_data in enumerate(all_words, 1):
            word_id = word_data['id']
            word_name = word_data['english']
            word_japanese = word_data['japanese']
            word_genre = word_data['genre']
            
            print(f"\n[{idx}/{total_words}] ID:{word_id:03d} {word_japanese} ({word_name})")
            print(f"  ジャンル: {word_genre}")
            
            # 既存ファイルチェック
            if skip_existing:
                pattern = f"{word_id:03d}_*_dalle3_*.png"
                existing = list(self.output_dir.glob(pattern))
                if existing:
                    print(f"  SKIP: スキップ (既存: {existing[0].name})")
                    skipped_count += 1
                    continue
            
            # プロンプト生成（日本語名を使用）
            prompt = self.prompt_template.format(keyword=word_japanese).strip()
            print(f"  --> 生成中...")
            
            # 画像生成
            result = self.generate_image(prompt, word_data)
            
            if result:
                # 画像保存
                filepath = self.save_image(result['image'], word_data, batch_timestamp)
                
                if filepath:
                    print(f"  OK: 成功: {filepath.name}")
                    success_count += 1
                    
                    # 結果を記録
                    results.append({
                        'id': word_id,
                        'japanese': word_japanese,
                        'english': word_name,
                        'genre': word_genre,
                        'filename': filepath.name,
                        'original_prompt': result['original_prompt'],
                        'revised_prompt': result['revised_prompt']
                    })
                else:
                    print(f"  NG: 保存失敗")
                    failed_count += 1
            else:
                failed_count += 1
            
            # 進捗表示
            if idx % 10 == 0:
                elapsed = time.time() - start_time
                rate = idx / elapsed if elapsed > 0 else 0
                eta = (total_words - idx) / rate if rate > 0 else 0
                print(f"\n  === 進捗: {idx}/{total_words} ({idx*100/total_words:.1f}%) ===")
                print(f"  経過時間: {elapsed/60:.1f}分、推定残り時間: {eta/60:.1f}分")
                print(f"  成功: {success_count}, 失敗: {failed_count}, スキップ: {skipped_count}")
            
            # API制限対策の遅延
            if idx < total_words:
                time.sleep(delay)
        
        # 生成情報を保存
        info_file = self.output_dir / f"generation_info_dalle3_{batch_timestamp}.json"
        with open(info_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': batch_timestamp,
                'total_words': total_words,
                'success': success_count,
                'failed': failed_count,
                'skipped': skipped_count,
                'elapsed_time': time.time() - start_time,
                'results': results
            }, f, ensure_ascii=False, indent=2)
        
        # 最終結果
        elapsed_total = time.time() - start_time
        print(f"\n=== 生成完了 ===")
        print(f"終了時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"総処理時間: {elapsed_total/60:.1f}分")
        print(f"成功: {success_count}/{total_words}")
        print(f"失敗: {failed_count}/{total_words}")
        print(f"スキップ: {skipped_count}/{total_words}")
        print(f"成功率: {success_count*100/(total_words-skipped_count):.1f}%")
        print(f"出力先: {self.output_dir}")
        
        return 0


def main():
    """メイン関数"""
    parser = argparse.ArgumentParser(description="DALL-E 3で全アイテムを生成")
    parser.add_argument(
        "--api-key",
        help="OpenAI APIキー（未指定の場合は環境変数OPENAI_API_KEYを使用）"
    )
    parser.add_argument(
        "--csv",
        default="word_lists/all_words.csv",
        help="CSVファイルのパス"
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="既に生成済みのIDをスキップ"
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=1.0,
        help="リクエスト間の遅延（秒）"
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="API接続テストのみ実行"
    )
    
    args = parser.parse_args()
    
    try:
        # ジェネレーター初期化
        generator = DALLE3Generator(api_key=args.api_key)
        
        # テストモード
        if args.test:
            if generator.test_api_connection():
                print("API接続テスト成功")
                
                # テスト生成
                print("\nテスト生成中...")
                test_data = {
                    'id': 0,
                    'english': 'test apple',
                    'japanese': 'テストりんご',
                    'genre': 'テスト'
                }
                prompt = generator.prompt_template.format(keyword='apple').strip()
                result = generator.generate_image(prompt, test_data)
                
                if result:
                    test_path = generator.save_image(result['image'], test_data)
                    if test_path:
                        print(f"テスト生成成功: {test_path}")
                    else:
                        print("テスト生成失敗: 保存エラー")
                else:
                    print("テスト生成失敗")
            return 0
        
        # 全アイテム生成
        return generator.generate_all_items(
            csv_path=args.csv,
            skip_existing=args.skip_existing,
            delay=args.delay
        )
        
    except Exception as e:
        print(f"エラー: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())