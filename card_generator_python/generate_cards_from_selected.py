#!/usr/bin/env python3
"""
採用フォルダの画像からカードを生成するスクリプト
採用された画像を使ってゲーム用のカードを生成
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from PIL import Image, ImageDraw, ImageFont
import shutil
from datetime import datetime

class SelectedCardsGenerator:
    """採用画像からカード生成クラス"""
    
    def __init__(self, selected_dir: str = "selected", output_dir: str = "cards"):
        """
        初期化
        
        Args:
            selected_dir: 採用画像フォルダ
            output_dir: カード出力フォルダ
        """
        self.selected_dir = Path(selected_dir)
        self.output_dir = Path(output_dir)
        self.csv_path = Path("word_lists/all_words.csv")
        
        # フォルダ作成
        self.selected_dir.mkdir(exist_ok=True)
        self.output_dir.mkdir(exist_ok=True)
        
        # 単語データを読み込み
        self.word_data_by_id = {}
        self.load_word_data()
        
    def load_word_data(self):
        """CSVから単語データを読み込み"""
        import csv
        
        if not self.csv_path.exists():
            print(f"警告: CSVファイルが見つかりません: {self.csv_path}")
            return
            
        with open(self.csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('ID') and row['ID'].strip():
                    try:
                        word_id = int(row['ID'])
                        self.word_data_by_id[word_id] = {
                            'id': word_id,
                            'genre': row['ジャンル'],
                            'japanese': row['日本語'],
                            'english': row['英語名']
                        }
                    except (ValueError, KeyError):
                        continue
        
        print(f"CSVから{len(self.word_data_by_id)}個の単語データを読み込みました")
    
    def parse_filename(self, filename: str) -> Optional[Dict]:
        """
        ファイル名を解析してID、名前、シードを取得
        形式: ID_name_seed.png (例: 001_sushi_123456789.png)
        
        Args:
            filename: ファイル名
            
        Returns:
            解析結果の辞書、失敗時はNone
        """
        try:
            # 拡張子を除去
            name_without_ext = Path(filename).stem
            
            # アンダースコアで分割
            parts = name_without_ext.split('_')
            
            if len(parts) >= 3:
                # ID部分を取得（最初の部分）
                word_id = int(parts[0])
                
                # シード部分を取得（最後の部分）
                seed = parts[-1]
                
                # 名前部分を取得（中間の部分すべて）
                name = '_'.join(parts[1:-1])
                
                return {
                    'id': word_id,
                    'name': name,
                    'seed': seed,
                    'filename': filename
                }
        except (ValueError, IndexError):
            pass
        
        return None
    
    def get_selected_images(self) -> List[Dict]:
        """
        採用フォルダから画像を取得
        
        Returns:
            画像情報のリスト
        """
        images = []
        
        if not self.selected_dir.exists():
            print(f"採用フォルダが存在しません: {self.selected_dir}")
            return images
        
        # PNG画像を検索
        for img_path in self.selected_dir.glob("*.png"):
            parsed = self.parse_filename(img_path.name)
            if parsed:
                # CSVデータを追加
                if parsed['id'] in self.word_data_by_id:
                    parsed['word_data'] = self.word_data_by_id[parsed['id']]
                else:
                    # CSVデータがない場合は基本情報のみ
                    parsed['word_data'] = {
                        'id': parsed['id'],
                        'genre': '不明',
                        'japanese': parsed['name'],
                        'english': parsed['name']
                    }
                
                parsed['path'] = img_path
                images.append(parsed)
        
        # ID順にソート
        images.sort(key=lambda x: x['id'])
        
        return images
    
    def create_card(self, image_info: Dict, card_size: Tuple[int, int] = (512, 720)) -> Image.Image:
        """
        画像からカードを作成
        
        Args:
            image_info: 画像情報
            card_size: カードサイズ (幅, 高さ)
            
        Returns:
            カード画像
        """
        width, height = card_size
        
        # カード背景を作成（白）
        card = Image.new('RGB', card_size, 'white')
        draw = ImageDraw.Draw(card)
        
        # 元画像を読み込み
        original_img = Image.open(image_info['path'])
        
        # 画像をカードサイズに合わせる（上部に配置）
        img_width = width - 20  # 左右10pxずつマージン
        img_height = int(width * 0.75)  # アスペクト比を保つ
        
        # 画像をリサイズ
        original_img = original_img.resize((img_width, img_height), Image.Resampling.LANCZOS)
        
        # 画像を配置
        card.paste(original_img, (10, 10))
        
        # 枠線を描画
        draw.rectangle([5, 5, width-5, height-5], outline='black', width=3)
        draw.rectangle([10, 10, width-10, img_height+10], outline='gray', width=1)
        
        # テキストエリアの背景
        text_area_top = img_height + 20
        draw.rectangle([10, text_area_top, width-10, height-10], fill='#f0f0f0', outline='gray')
        
        # フォント設定（システムフォントを使用）
        try:
            # Windowsの場合
            title_font = ImageFont.truetype("C:/Windows/Fonts/msgothic.ttc", 24)
            subtitle_font = ImageFont.truetype("C:/Windows/Fonts/msgothic.ttc", 18)
            info_font = ImageFont.truetype("C:/Windows/Fonts/msgothic.ttc", 14)
        except:
            # フォントが見つからない場合はデフォルト
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
            info_font = ImageFont.load_default()
        
        # カード情報を取得
        word_data = image_info.get('word_data', {})
        
        # タイトル（日本語名）
        title = word_data.get('japanese', image_info['name'])
        draw.text((width//2, text_area_top + 20), title, 
                 fill='black', font=title_font, anchor='mt')
        
        # サブタイトル（英語名）
        subtitle = word_data.get('english', image_info['name'])
        draw.text((width//2, text_area_top + 50), subtitle,
                 fill='#333333', font=subtitle_font, anchor='mt')
        
        # ジャンル
        genre = word_data.get('genre', '不明')
        draw.text((width//2, text_area_top + 80), f"【{genre}】",
                 fill='#666666', font=info_font, anchor='mt')
        
        # ID情報（左下）
        id_text = f"No.{image_info['id']:03d}"
        draw.text((20, height - 25), id_text,
                 fill='#999999', font=info_font)
        
        # シード情報（右下）
        seed_text = f"seed:{image_info['seed'][:8]}"
        draw.text((width - 100, height - 25), seed_text,
                 fill='#999999', font=info_font)
        
        return card
    
    def generate_cards(self, create_pdf: bool = True, create_print_layout: bool = True):
        """
        採用画像からカードを生成
        
        Args:
            create_pdf: PDFを作成するか
            create_print_layout: 印刷用レイアウトを作成するか
        """
        # 採用画像を取得
        images = self.get_selected_images()
        
        if not images:
            print("採用フォルダに画像がありません")
            print(f"画像を {self.selected_dir} フォルダに配置してください")
            return
        
        print(f"\n採用画像: {len(images)}枚")
        
        # タイムスタンプ付きの出力フォルダを作成
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        batch_dir = self.output_dir / f"cards_{timestamp}"
        batch_dir.mkdir(parents=True, exist_ok=True)
        
        # 個別カード画像を生成
        card_images = []
        print("\nカード生成中...")
        
        for i, img_info in enumerate(images, 1):
            print(f"[{i}/{len(images)}] ID:{img_info['id']:03d} - {img_info['name']}")
            
            # カード作成
            card = self.create_card(img_info)
            
            # カード保存
            card_filename = f"card_{img_info['id']:03d}_{img_info['name']}.png"
            card_path = batch_dir / card_filename
            card.save(card_path)
            
            card_images.append({
                'path': card_path,
                'image': card,
                'info': img_info
            })
        
        print(f"\n個別カード保存完了: {batch_dir}")
        
        # 印刷用レイアウト作成
        if create_print_layout:
            self.create_print_sheets(card_images, batch_dir)
        
        # PDF作成
        if create_pdf:
            self.create_pdf_document(card_images, batch_dir)
        
        # 生成情報を保存
        info_file = batch_dir / "generation_info.json"
        with open(info_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': timestamp,
                'total_cards': len(images),
                'selected_images': [
                    {
                        'id': img['id'],
                        'name': img['name'],
                        'seed': img['seed'],
                        'original_file': img['filename'],
                        'word_data': img.get('word_data', {})
                    }
                    for img in images
                ]
            }, f, ensure_ascii=False, indent=2)
        
        print(f"\n=== カード生成完了 ===")
        print(f"生成枚数: {len(images)}枚")
        print(f"出力先: {batch_dir}")
        
        return batch_dir
    
    def create_print_sheets(self, card_images: List[Dict], output_dir: Path,
                           cards_per_row: int = 3, cards_per_col: int = 3):
        """
        印刷用シートを作成（A4サイズ、9枚/ページ）
        
        Args:
            card_images: カード画像リスト
            output_dir: 出力ディレクトリ
            cards_per_row: 1行あたりのカード数
            cards_per_col: 1列あたりのカード数
        """
        # A4サイズ（300dpi）
        a4_width = 2480  # 210mm
        a4_height = 3508  # 297mm
        
        cards_per_page = cards_per_row * cards_per_col
        
        # カードサイズを計算
        margin = 50
        card_width = (a4_width - margin * (cards_per_row + 1)) // cards_per_row
        card_height = (a4_height - margin * (cards_per_col + 1)) // cards_per_col
        
        print(f"\n印刷用シート作成中...")
        print(f"カードサイズ: {card_width}x{card_height}px")
        
        sheet_num = 0
        for page_start in range(0, len(card_images), cards_per_page):
            sheet_num += 1
            
            # 新しいシートを作成
            sheet = Image.new('RGB', (a4_width, a4_height), 'white')
            
            # このページのカードを配置
            page_cards = card_images[page_start:page_start + cards_per_page]
            
            for i, card_data in enumerate(page_cards):
                row = i // cards_per_row
                col = i % cards_per_row
                
                # カード位置を計算
                x = margin + col * (card_width + margin)
                y = margin + row * (card_height + margin)
                
                # カードをリサイズして配置
                card_resized = card_data['image'].resize(
                    (card_width, card_height), 
                    Image.Resampling.LANCZOS
                )
                sheet.paste(card_resized, (x, y))
            
            # シート保存
            sheet_path = output_dir / f"print_sheet_{sheet_num:02d}.png"
            sheet.save(sheet_path)
            print(f"  シート{sheet_num}: {len(page_cards)}枚")
        
        print(f"印刷用シート作成完了: {sheet_num}枚")
    
    def create_pdf_document(self, card_images: List[Dict], output_dir: Path):
        """
        PDF文書を作成
        
        Args:
            card_images: カード画像リスト
            output_dir: 出力ディレクトリ
        """
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.pdfgen import canvas
            from reportlab.lib.utils import ImageReader
            
            pdf_path = output_dir / "cards.pdf"
            c = canvas.Canvas(str(pdf_path), pagesize=A4)
            
            page_width, page_height = A4
            cards_per_row = 3
            cards_per_col = 3
            cards_per_page = cards_per_row * cards_per_col
            
            margin = 20
            card_width = (page_width - margin * (cards_per_row + 1)) / cards_per_row
            card_height = (page_height - margin * (cards_per_col + 1)) / cards_per_col
            
            print(f"\nPDF作成中...")
            
            for page_start in range(0, len(card_images), cards_per_page):
                if page_start > 0:
                    c.showPage()
                
                page_cards = card_images[page_start:page_start + cards_per_page]
                
                for i, card_data in enumerate(page_cards):
                    row = i // cards_per_row
                    col = i % cards_per_row
                    
                    x = margin + col * (card_width + margin)
                    y = page_height - margin - (row + 1) * (card_height + margin)
                    
                    # 画像を追加
                    img_reader = ImageReader(card_data['image'])
                    c.drawImage(img_reader, x, y, card_width, card_height)
            
            c.save()
            print(f"PDF作成完了: {pdf_path}")
            
        except ImportError:
            print("警告: reportlabがインストールされていないためPDF作成をスキップ")
        except Exception as e:
            print(f"PDF作成エラー: {e}")


def main():
    """メイン関数"""
    parser = argparse.ArgumentParser(description="採用画像からカードを生成")
    parser.add_argument(
        "--selected-dir",
        default="selected",
        help="採用画像フォルダ（デフォルト: selected）"
    )
    parser.add_argument(
        "--output-dir",
        default="cards",
        help="カード出力フォルダ（デフォルト: cards）"
    )
    parser.add_argument(
        "--no-pdf",
        action="store_true",
        help="PDF作成をスキップ"
    )
    parser.add_argument(
        "--no-print",
        action="store_true",
        help="印刷用レイアウト作成をスキップ"
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="採用画像の一覧を表示"
    )
    
    args = parser.parse_args()
    
    try:
        # ジェネレーター初期化
        generator = SelectedCardsGenerator(
            selected_dir=args.selected_dir,
            output_dir=args.output_dir
        )
        
        # 一覧表示モード
        if args.list:
            images = generator.get_selected_images()
            if images:
                print(f"\n採用画像一覧 ({len(images)}枚):")
                for img in images:
                    word_data = img.get('word_data', {})
                    print(f"  ID:{img['id']:03d} - {word_data.get('japanese', img['name'])} ({word_data.get('english', img['name'])})")
                    print(f"        ジャンル: {word_data.get('genre', '不明')}")
                    print(f"        ファイル: {img['filename']}")
            else:
                print(f"採用フォルダ '{args.selected_dir}' に画像がありません")
            return 0
        
        # カード生成
        generator.generate_cards(
            create_pdf=not args.no_pdf,
            create_print_layout=not args.no_print
        )
        
        return 0
        
    except Exception as e:
        print(f"エラー: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())