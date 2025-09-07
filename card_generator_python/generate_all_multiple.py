#!/usr/bin/env python3
"""
CSVの全アイテムを複数回生成するスクリプト
"""

import sys
import time
from pathlib import Path
from datetime import datetime
from generate_from_csv_txt2img import CSVTxt2ImgGenerator
from generate_cards_txt2img import Txt2ImgCardGenerator

def generate_all_items_multiple_times(iterations: int = 10):
    """
    全アイテムを指定回数生成
    
    Args:
        iterations: 各アイテムの生成回数
    """
    print(f"=== 全アイテムを{iterations}回ずつ生成開始 ===")
    print(f"開始時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # CSVジェネレーターを初期化
    csv_gen = CSVTxt2ImgGenerator()
    txt2img_gen = Txt2ImgCardGenerator()
    
    # API接続確認
    if not txt2img_gen.test_api_connection():
        print("エラー: Stable Diffusion APIに接続できません")
        return 1
    
    # 全単語を取得
    all_words = csv_gen.words_data
    total_words = len(all_words)
    total_images = total_words * iterations
    
    print(f"総単語数: {total_words}")
    print(f"生成予定画像数: {total_images} ({total_words} × {iterations})")
    print("")
    
    # 統計情報
    success_count = 0
    failed_count = 0
    start_time = time.time()
    
    # 各イテレーションで全単語を生成（ループ方向を変更）
    for iter_num in range(1, iterations + 1):
        print(f"\n========== ラウンド {iter_num}/{iterations} 開始 ==========")
        print(f"全{total_words}種類を生成します")
        
        for word_idx, word_data in enumerate(all_words, 1):
            word_id = word_data['id']
            word_name = word_data['english']
            word_genre = word_data['genre']
            word_japanese = word_data['japanese']
            
            current_total = (iter_num - 1) * total_words + word_idx
            print(f"\n[{current_total}/{total_images}] ラウンド{iter_num} - ID:{word_id:03d} {word_japanese} ({word_name})", end=" ")
            
            # プロンプト生成
            positive_prompt, negative_prompt = txt2img_gen.generate_prompts(word_name)
            
            # 画像生成
            image, seed = txt2img_gen.generate_txt2img(positive_prompt, negative_prompt, max_retries=2)
            
            if image and seed != -1:
                # ファイル名作成（ID_name_seed.png）
                safe_filename = word_name.replace(' ', '_').replace('/', '_')
                filename = f"{word_id:03d}_{safe_filename}_{seed}.png"
                output_path = Path("output") / filename
                
                # 保存
                if txt2img_gen.save_image(image, output_path):
                    print(f"OK → {filename}")
                    success_count += 1
                else:
                    print("NG (保存失敗)")
                    failed_count += 1
            else:
                print("NG (生成失敗)")
                failed_count += 1
            
            # 進捗表示
            if current_total % 50 == 0:
                elapsed = time.time() - start_time
                rate = current_total / elapsed if elapsed > 0 else 0
                eta = (total_images - current_total) / rate if rate > 0 else 0
                print(f"\n  === 進捗: {current_total}/{total_images} ({current_total*100/total_images:.1f}%) ===")
                print(f"  経過時間: {elapsed/60:.1f}分、推定残り時間: {eta/60:.1f}分")
                print(f"  成功: {success_count}, 失敗: {failed_count}")
                print("")
        
        # ラウンド終了時のサマリー
        print(f"\n========== ラウンド {iter_num}/{iterations} 完了 ==========")
        print(f"このラウンドで{total_words}種類を生成しました")
        elapsed_round = time.time() - start_time
        print(f"経過時間: {elapsed_round/60:.1f}分")
        print(f"累計成功: {success_count}, 累計失敗: {failed_count}")
    
    # 最終結果
    elapsed_total = time.time() - start_time
    print(f"\n=== 生成完了 ===")
    print(f"終了時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"総処理時間: {elapsed_total/60:.1f}分")
    print(f"成功: {success_count}/{total_images}")
    print(f"失敗: {failed_count}/{total_images}")
    print(f"成功率: {success_count*100/total_images:.1f}%")
    
    return 0


def main():
    """メイン関数"""
    import argparse
    parser = argparse.ArgumentParser(description="全アイテムを複数回生成")
    parser.add_argument(
        "--iterations",
        "-i",
        type=int,
        default=10,
        help="各アイテムの生成回数（デフォルト: 10）"
    )
    
    args = parser.parse_args()
    
    try:
        return generate_all_items_multiple_times(args.iterations)
    except KeyboardInterrupt:
        print("\n\n処理を中断しました")
        return 1
    except Exception as e:
        print(f"\nエラー: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())