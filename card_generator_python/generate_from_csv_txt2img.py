#!/usr/bin/env python3
"""
CSVファイルからtxt2imgで画像を生成するスクリプト
all_words.csvを読み込んで、指定したジャンルや範囲の画像を生成
"""

import os
import sys
import csv
import argparse
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime

# txt2img生成スクリプトをインポート
from generate_cards_txt2img import Txt2ImgCardGenerator


class CSVTxt2ImgGenerator:
    """CSVベースのtxt2imgカード生成クラス"""
    
    def __init__(self, csv_path: str = "word_lists/all_words.csv"):
        """
        初期化
        
        Args:
            csv_path: CSVファイルのパス
        """
        self.csv_path = Path(csv_path)
        self.words_data = []
        self.load_csv()
        
    def load_csv(self):
        """CSVファイルを読み込む"""
        if not self.csv_path.exists():
            raise FileNotFoundError(f"CSVファイルが見つかりません: {self.csv_path}")
        
        with open(self.csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # 空行やIDが空の行をスキップ
                if not row.get('ID') or not row['ID'].strip():
                    continue
                # 必須フィールドが空の行をスキップ  
                if not row.get('英語名') or not row['英語名'].strip():
                    continue
                    
                try:
                    self.words_data.append({
                        'id': int(row['ID']),
                        'genre': row['ジャンル'],
                        'japanese': row['日本語'],
                        'english': row['英語名']
                    })
                except (ValueError, KeyError) as e:
                    print(f"警告: 行をスキップしました - {e}")
                    continue
        
        print(f"CSVから{len(self.words_data)}個の単語を読み込みました")
        
    def get_genres(self) -> List[str]:
        """利用可能なジャンルを取得"""
        genres = list(set(word['genre'] for word in self.words_data))
        return sorted(genres)
    
    def filter_words(self, genre: Optional[str] = None, 
                    start_id: Optional[int] = None, 
                    end_id: Optional[int] = None,
                    count: Optional[int] = None,
                    random_select: bool = False) -> List[Dict]:
        """
        条件に基づいて単語をフィルタリング
        
        Args:
            genre: ジャンル名
            start_id: 開始ID
            end_id: 終了ID
            count: 生成する数（最大）
            random_select: ランダムに選択するか
            
        Returns:
            フィルタリングされた単語リスト
        """
        filtered = self.words_data.copy()
        
        # ジャンルでフィルタ
        if genre:
            filtered = [w for w in filtered if w['genre'] == genre]
        
        # ID範囲でフィルタ
        if start_id:
            filtered = [w for w in filtered if w['id'] >= start_id]
        if end_id:
            filtered = [w for w in filtered if w['id'] <= end_id]
        
        # ランダム選択または個数制限
        if random_select and count and count > 0:
            import random
            if len(filtered) > count:
                filtered = random.sample(filtered, count)
            else:
                random.shuffle(filtered)
        elif count and count > 0:
            filtered = filtered[:count]
        
        return filtered
    
    def create_temp_wordlist(self, words: List[Dict]) -> tuple[Path, Dict[str, int]]:
        """
        一時的な単語リストファイルを作成
        
        Args:
            words: 単語データのリスト
            
        Returns:
            (作成した単語リストファイルのパス, 英語名→IDのマップ)
        """
        temp_file = Path("output") / "temp_wordlist.txt"
        temp_file.parent.mkdir(exist_ok=True)
        
        # 英語名からIDへのマップを作成
        word_id_map = {}
        
        with open(temp_file, 'w', encoding='utf-8') as f:
            for word in words:
                f.write(f"{word['id']}→{word['english']}\n")
                word_id_map[word['english']] = word['id']
        
        return temp_file, word_id_map
    
    def generate_cards(self, genre: Optional[str] = None,
                      start_id: Optional[int] = None,
                      end_id: Optional[int] = None,
                      count: Optional[int] = None,
                      random_select: bool = False,
                      positive_template: Optional[str] = None,
                      negative_template: Optional[str] = None,
                      output_name: Optional[str] = None) -> Dict:
        """
        カードを生成
        
        Args:
            genre: ジャンル名
            start_id: 開始ID
            end_id: 終了ID  
            count: 生成する数
            random_select: ランダムに選択するか
            positive_template: ポジティブプロンプトテンプレート
            negative_template: ネガティブプロンプトテンプレート
            output_name: 出力名
            
        Returns:
            生成結果
        """
        # 単語をフィルタリング
        filtered_words = self.filter_words(genre, start_id, end_id, count, random_select)
        
        if not filtered_words:
            print("条件に合う単語がありません")
            return {"error": "No words found"}
        
        print(f"\n生成対象: {len(filtered_words)}個の単語")
        for word in filtered_words[:5]:  # 最初の5個を表示
            print(f"  ID:{word['id']:3d} [{word['genre']}] {word['japanese']} ({word['english']})")
        if len(filtered_words) > 5:
            print(f"  ... 他 {len(filtered_words) - 5}個")
        
        # outputディレクトリを確認
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)
        
        # 一時的な単語リストファイルとIDマップを作成
        temp_wordlist, word_id_map = self.create_temp_wordlist(filtered_words)
        
        # テンプレートファイルの読み込み
        if positive_template and Path(positive_template).exists():
            with open(positive_template, 'r', encoding='utf-8') as f:
                positive_template_text = f.read()
        else:
            positive_template_text = None
        
        if negative_template and Path(negative_template).exists():
            with open(negative_template, 'r', encoding='utf-8') as f:
                negative_template_text = f.read()
        else:
            negative_template_text = None
        
        # txt2imgカード生成器を初期化（IDマップを渡す）
        generator = Txt2ImgCardGenerator()
        
        # カード生成を実行（IDマップを渡す）
        results = generator.generate_cards_batch_with_ids(
            str(temp_wordlist),
            word_id_map,
            positive_template_text,
            negative_template_text
        )
        
        # 生成情報を保存
        info_file = output_dir / "generation_info.json"
        import json
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # プロンプトテンプレートを取得
        if positive_template_text:
            used_positive_template = positive_template_text
        else:
            used_positive_template = generator.default_positive_template
        
        if negative_template_text:
            used_negative_template = negative_template_text
        else:
            used_negative_template = generator.default_negative_template
        
        with open(info_file, 'w', encoding='utf-8') as f:
            json.dump({
                "timestamp": timestamp,
                "genre": genre,
                "start_id": start_id,
                "end_id": end_id,
                "count": count,
                "total_words": len(filtered_words),
                "words": filtered_words,
                "prompts": {
                    "positive_template": used_positive_template,
                    "negative_template": used_negative_template
                },
                "results": results
            }, f, ensure_ascii=False, indent=2)
        
        # 一時ファイルを削除
        if temp_wordlist.exists():
            temp_wordlist.unlink()
        
        return results


def main():
    """メイン関数"""
    parser = argparse.ArgumentParser(description="CSVからtxt2imgで画像を生成")
    parser.add_argument(
        "--csv",
        default="word_lists/all_words.csv",
        help="CSVファイルのパス"
    )
    parser.add_argument(
        "--genre",
        "-g",
        help="生成するジャンル（食べ物、乗り物、日用品、軸評価用、プレイヤー用）"
    )
    parser.add_argument(
        "--start-id",
        type=int,
        help="開始ID"
    )
    parser.add_argument(
        "--end-id",
        type=int,
        help="終了ID"
    )
    parser.add_argument(
        "--count",
        "-c",
        type=int,
        help="生成する数（最大）"
    )
    parser.add_argument(
        "--positive-template",
        "-p",
        help="ポジティブプロンプトテンプレート",
        default="templates/default_positive.txt"
    )
    parser.add_argument(
        "--negative-template",
        "-n",
        help="ネガティブプロンプトテンプレート",
        default="templates/default_negative.txt"
    )
    parser.add_argument(
        "--output",
        "-o",
        help="出力名"
    )
    parser.add_argument(
        "--random",
        "-r",
        action="store_true",
        help="ランダムに選択"
    )
    parser.add_argument(
        "--list-genres",
        action="store_true",
        help="利用可能なジャンルを表示"
    )
    
    args = parser.parse_args()
    
    try:
        # CSVジェネレーターを初期化
        generator = CSVTxt2ImgGenerator(args.csv)
        
        # ジャンル一覧を表示
        if args.list_genres:
            print("\n利用可能なジャンル:")
            for genre in generator.get_genres():
                genre_words = generator.filter_words(genre=genre)
                print(f"  - {genre} ({len(genre_words)}個)")
            return 0
        
        # カード生成を実行
        results = generator.generate_cards(
            genre=args.genre,
            start_id=args.start_id,
            end_id=args.end_id,
            count=args.count,
            random_select=args.random,
            positive_template=args.positive_template,
            negative_template=args.negative_template,
            output_name=args.output
        )
        
        if "error" in results:
            print(f"エラー: {results['error']}")
            return 1
        
        return 0
        
    except Exception as e:
        print(f"エラー: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())