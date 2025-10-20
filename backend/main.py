from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import random
import asyncio
import json
import secrets
import os
import sys
from pathlib import Path
from axis_data import generate_axis_pair, generate_wolf_axis_pair

# ライフサイクルイベント管理
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 起動時の処理
    print("[STARTUP] アプリケーション起動中...")
    # 定期クリーンアップタスクを開始
    cleanup_task = asyncio.create_task(periodic_cleanup())
    print("[STARTUP] 定期クリーンアップタスク開始")

    yield  # アプリケーション実行中

    # シャットダウン時の処理
    print("[SHUTDOWN] アプリケーション終了中...")
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        print("[SHUTDOWN] クリーンアップタスク停止")

app = FastAPI(lifespan=lifespan)

# トークン認証を有効化するかどうか（環境変数で制御）
REQUIRE_TOKEN_AUTH = os.getenv("REQUIRE_TOKEN_AUTH", "false").lower() == "true"

# CORS設定
# 環境変数から許可するオリジンを取得（本番環境対応）
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5174"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# テーマ別カードプール（フロントエンドのonlineCards.tsと同期）
# テーママッピング: 'food'/'daily'/'entertainment'/'animal'/'place'/'vehicle'
CARD_POOL_BY_THEME = {
    'food': [
        '寿司', 'ラーメン', 'カレー', 'ピザ', 'ハンバーガー', '天ぷら', 'うどん', 'そば', 'おにぎり', 'たこ焼き',
        '焼き鳥', '餃子', 'チャーハン', 'パスタ', 'サラダ', 'ステーキ', '焼肉', 'しゃぶしゃぶ', 'お好み焼き', '牛丼',
        '親子丼', 'カツ丼', 'オムライス', 'カレーパン', 'メロンパン', 'クロワッサン', 'ドーナツ', 'ケーキ', 'プリン', 'アイスクリーム',
        'チョコレート', 'ポテトチップス', 'せんべい', '団子', '大福', 'たい焼き', 'わたあめ', 'かき氷', 'コーヒー', '紅茶',
        '緑茶', 'りんご', 'みかん', 'バナナ', 'ぶどう', 'いちご', 'もも', 'なし', 'メロン', 'スイカ',
        'パイナップル', 'マンゴー', 'キウイ', 'グレープフルーツ', 'レモン', 'オレンジ', 'さくらんぼ', 'ブルーベリー', 'ラズベリー', '柿',
        '栗', 'アボカド', 'ライチ', 'ドラゴンフルーツ', 'ココナッツ', 'びわ', 'ゆず', 'すだち', 'かぼす', 'いちじく', 'ざくろ',
        'キャベツ', 'レタス', '白菜', 'ほうれん草', '小松菜', 'ネギ', '玉ねぎ', 'にんじん', '大根', 'じゃがいも',
        'さつまいも', 'トマト', 'きゅうり', 'なす', 'ピーマン', 'パプリカ', 'ブロッコリー', 'カリフラワー', 'アスパラガス', 'セロリ',
        'ごぼう', 'れんこん', 'かぼちゃ', 'とうもろこし', '枝豆', 'オクラ', 'にんにく', 'しょうが', 'みょうが', '大葉（しそ）',
        'パセリ', 'バジル', 'もやし', 'かいわれ大根', '豆苗', 'ズッキーニ', 'ゴーヤ', 'チンゲン菜', 'ニラ', '春菊',
        'しいたけ', 'えのき', 'しめじ', 'まいたけ', 'エリンギ'
    ],
    'daily': [
        'スマートフォン', 'パソコン', 'テレビ', '冷蔵庫', '洗濯機', 'エアコン', '掃除機', '電子レンジ', '炊飯器', 'ドライヤー',
        '歯ブラシ', 'シャンプー', 'タオル', 'ティッシュ', 'トイレットペーパー', 'マスク', 'メガネ', '腕時計', '財布', 'カバン',
        '傘', '靴', '服', '帽子', '手袋', 'マフラー', 'ペン', 'ノート', 'はさみ', 'のり',
        '定規', '消しゴム', '鉛筆', '本', '雑誌', '新聞', 'カメラ',
        'ダイヤモンド', '羽毛', '氷', '炎', '鉄', '綿', '岩', '水', 'ガラス', 'ゴム',
        '木材', 'プラスチック', 'スポンジ', '針', '刀', '盾', '槍', '弓', 'ハンマー', '釘',
        '筋肉', '骨', '心臓', '脳', '目', '耳', '手', '足',
        '砂時計', 'コンパス', '地図', '羅針盤', '望遠鏡', '顕微鏡', '時計', 'カレンダー', '電話', 'ラジオ', 'スピーカー',
        '枕', '布団', 'ベッド', 'ソファ', '椅子', 'テーブル', '机', 'タンス', '本棚', '食器棚',
        'クローゼット', 'カーテン', 'じゅうたん', 'マット', 'クッション', '毛布', 'シーツ', '掛け布団', '敷布団', '座布団',
        '箸', 'スプーン', 'フォーク', 'ナイフ', '皿', '茶碗', 'コップ', 'マグカップ', '湯呑み', 'グラス',
        '鍋', 'フライパン', 'やかん', '包丁', 'まな板', 'おたま', 'フライ返し', '泡立て器', 'ボウル', 'ざる',
        '計量カップ', '計量スプーン', 'ラップ', 'アルミホイル', 'キッチンペーパー', 'スポンジ', '洗剤', '石鹸', 'ハンドソープ', 'ボディソープ',
        'リンス', 'トリートメント', '歯磨き粉', 'うがい薬', 'バスタオル', 'フェイスタオル', 'ハンドタオル', 'バスマット', 'トイレマット', 'トイレブラシ',
        'モップ', 'ほうき', 'ちりとり', 'バケツ', '雑巾', 'ゴミ箱', 'ゴミ袋', 'ビニール袋', '紙袋', 'エコバッグ',
        '保冷バッグ', 'クーラーボックス', '水筒', 'タンブラー', '弁当箱', 'おはし箱', 'ランチョンマット', 'エプロン', '鏡', '手鏡',
        'くし', 'ブラシ', 'かみそり', 'シェーバー', '爪切り', '爪やすり', '耳かき', '綿棒', 'ピンセット', '体温計',
        '血圧計', '体重計', '薬', '絆創膏', '包帯', 'ガーゼ', '消毒液', '目薬', 'コンタクトレンズ', 'サングラス',
        '老眼鏡', 'イヤホン', 'ヘッドホン', '充電器', 'バッテリー', '電池', '延長コード', 'コンセント', 'スイッチ', 'リモコン',
        'エアコンフィルター', '加湿器', '除湿機', '空気清浄機', '扇風機', 'ヒーター', 'こたつ', '電気毛布', 'ホットカーペット', '湯たんぽ',
        'カイロ', 'うちわ', '扇子', '蚊取り線香', '虫除けスプレー', '殺虫剤', '防虫剤', '芳香剤', '消臭剤', 'アロマオイル',
        'お香', 'ろうそく', 'ライター', 'マッチ', '灰皿', '栓抜き', '缶切り', 'ワインオープナー', 'アイスピック', 'トング',
        'ピーラー', 'おろし金', 'すり鉢', 'すりこぎ', 'ミキサー', 'ジューサー', 'コーヒーメーカー', 'ポット', '魔法瓶', 'トースター',
        'ホットプレート', 'たこ焼き器', 'ワッフルメーカー', 'ホームベーカリー', 'アイロン', 'アイロン台', 'ミシン', '針', '糸', 'ボタン',
        'ファスナー', '安全ピン', 'クリップ', 'ホッチキス', 'ホッチキスの芯', 'セロハンテープ', 'ガムテープ', '両面テープ', 'マスキングテープ', '輪ゴム',
        'ひも', 'ロープ', 'チェーン', '南京錠', '鍵', 'ドライバー', 'レンチ', 'ペンチ', 'ニッパー', 'のこぎり',
        'カッター', 'メジャー', '水準器', 'ドリル', 'ネジ', 'ボルト', 'ナット', 'ワッシャー', '接着剤', 'ペンキ',
        'はけ', 'ローラー', 'サンドペーパー', 'パテ', 'シーリング材', 'ブルーシート', 'ダンボール', '新聞紙', 'コピー用紙', 'メモ帳',
        '付箋', 'ファイル', 'バインダー', 'クリアファイル', '封筒', '便箋', 'はがき', '切手', '印鑑', '朱肉',
        'スタンプ', 'インク', '稲妻', '雲', '太陽', '月', '星', '雪', '風', '虹',
        '晴れ', '曇り', '雨', '台風', '雷', '霧', 'あられ', 'みぞれ', '吹雪', '快晴'
    ],
    'entertainment': [
        '映画', 'アニメ', 'ドラマ', '音楽', 'ゲーム', '漫画', '小説', 'YouTube', 'TikTok', 'Instagram',
        'Twitter', 'ポッドキャスト', 'ラジオ', 'テレビ番組', 'お笑い', 'ミュージカル', '演劇', 'コンサート', 'フェス', 'カラオケ',
        'Netflix', 'Disney+', 'Amazon Prime', 'Hulu', 'Spotify', 'Apple Music', 'PlayStation', 'Nintendo Switch', 'Xbox', 'Steam',
        'VR', 'AR', 'eスポーツ', 'ボードゲーム', 'カードゲーム', 'パズル', 'クイズ', 'なぞなぞ', 'ダンス', 'DJ',
        'ライブ配信', 'Vtuber', 'アイドル', '声優', 'コスプレ', '同人誌', 'コミケ', 'サーカス', '手品',
        '落語', '漫才', 'コント', '歌舞伎', '能', '狂言', '宝塚', 'オペラ', 'バレエ', 'ジャズ',
        'ロック', 'ポップス', 'クラシック（音楽）', 'ヒップホップ', 'EDM', 'K-POP', 'J-POP', '演歌', 'フォークダンス', 'レゲエ',
        'ブルース', 'カントリー（音楽）', 'ソウル（音楽）', 'R&B', 'メタル（音楽）', 'パンク', 'テクノ（音楽）', 'アンビエント（音楽）', 'ワールドミュージック', 'サウンドトラック',
        'ピアノ', 'ギター', 'ドラム', 'ベース', 'バイオリン', 'サックス', 'トランペット', 'フルート', 'ハーモニカ', 'ウクレレ',
        '三味線', '琴', '尺八', '太鼓', 'レコード', 'CD', 'カセットテープ', 'MD', 'ラジカセ', 'ウォークマン',
    ],
    'animal': [
        'ライオン', 'うさぎ', '象', '蟻', '鷹', '亀', 'チーター', 'ナマケモノ', '犬', '猫',
        '馬', '牛', '豚', '羊', '山羊', '鶏', 'アヒル', '七面鳥', 'ハムスター', 'モルモット',
        'リス', 'ネズミ', 'コウモリ', 'キツネ', 'タヌキ', 'イタチ', 'アライグマ', 'カワウソ', 'ビーバー', 'ハリネズミ',
        'モグラ', '熊', 'パンダ', 'コアラ', 'カンガルー', 'ワラビー', 'オポッサム', '虎', 'ヒョウ', 'ジャガー',
        'ピューマ', '猿', 'ゴリラ', 'チンパンジー', 'オランウータン', 'テナガザル', 'キツネザル', 'メガネザル', 'マンドリル', 'ニホンザル',
        'キリン', 'シマウマ', 'カバ', 'サイ', 'ラクダ', 'アルパカ', 'リャマ', '鹿', 'トナカイ', 'ヘラジカ',
        'カモシカ', 'バイソン', 'ヤク', 'イノシシ', 'イボイノシシ', 'アルマジロ', 'アリクイ', 'センザンコウ', 'カピバラ', 'ヤマアラシ',
        'スカンク', 'アナグマ', 'ラッコ', 'オットセイ', 'アシカ', 'アザラシ', 'セイウチ', 'イルカ', 'クジラ', 'シャチ',
        'ジュゴン', 'マナティー', 'ペンギン', '白鳥', '鶴', 'フラミンゴ', 'ペリカン', 'カモメ', 'アホウドリ', 'ワシ',
        'トビ', 'フクロウ', 'ミミズク', 'オウム', 'インコ', 'カナリア', '文鳥', 'スズメ', 'ツバメ', 'カラス',
        'ハト', 'キジ', 'クジャク', 'ダチョウ', 'エミュー', 'キーウィ', 'カッコウ', 'キツツキ', 'カワセミ', 'ウグイス',
        'メジロ', 'ヒバリ', 'トンボ', 'バッタ', 'コオロギ', 'カマキリ', 'セミ', 'チョウ', '蛾', 'ハチ',
        'アブ', 'ハエ', '蚊', 'カブトムシ', 'クワガタ', 'テントウムシ', 'ホタル', 'クモ', 'サソリ', 'ムカデ',
        'ヤスデ', 'ミミズ', 'カタツムリ', 'ナメクジ', 'タコ', 'イカ', 'エビ', 'カニ', 'ヤドカリ', 'ザリガニ',
        'クラゲ', 'ヒトデ', 'ウニ', 'ナマコ', 'サンゴ', 'イソギンチャク', 'サメ', 'エイ', 'マグロ', 'カツオ',
        'サバ', 'アジ', 'イワシ', 'サンマ', 'タイ', 'ヒラメ', 'カレイ', 'フグ', 'アンコウ', 'ウナギ',
        'アナゴ', 'ハモ', 'ドジョウ', 'ナマズ', 'コイ', 'フナ', '金魚', 'メダカ', 'グッピー', 'ピラニア',
        'カエル', 'ヒキガエル', 'アマガエル', 'オタマジャクシ', 'サンショウウオ', 'イモリ', 'ヤモリ', 'トカゲ', 'イグアナ', 'カメレオン',
        'ヘビ', 'コブラ', 'マムシ', 'ニシキヘビ', 'アナコンダ', 'ワニ', 'アリゲーター',
    ],
    'place': [
        '城', '小屋', '高層ビル', 'テント', '橋', 'トンネル', '山', '谷', '海', '川',
        '湖', '砂漠', '森', '草原', '洞窟', '火山', '氷山', '地球', '宇宙',
        '東京', '大阪', '名古屋', '横浜', '京都', '神戸', '札幌', '福岡', '仙台', '広島',
        '川崎', 'さいたま', '千葉', '北九州', '堺', '新潟', '浜松', '熊本', '相模原', '岡山',
        '静岡', '船橋', '鹿児島', '八王子', '宇都宮', '松山', '金沢', '長崎', '那覇', '富山',
        'アメリカ', '中国', '韓国', 'インド', 'ロシア', 'イギリス', 'フランス', 'ドイツ', 'イタリア', 'スペイン',
        'カナダ', 'オーストラリア', 'ブラジル', 'メキシコ', 'アルゼンチン', 'インドネシア', 'タイ', 'ベトナム', 'フィリピン', 'シンガポール',
        'マレーシア', 'トルコ', 'エジプト', '南アフリカ', 'ナイジェリア', 'ケニア', 'エチオピア', 'モロッコ', 'サウジアラビア', 'イラン',
        'イスラエル', 'UAE', 'オランダ', 'ベルギー', 'スイス', 'オーストリア', 'スウェーデン', 'ノルウェー', 'デンマーク', 'フィンランド',
        'ポーランド', 'チェコ', 'ハンガリー', 'ギリシャ', 'ポルトガル', 'アイルランド', 'ニュージーランド', 'チリ', 'ペルー', 'コロンビア',
        'ベネズエラ', 'キューバ', 'ジャマイカ', 'パキスタン', 'バングラデシュ', 'スリランカ', 'ネパール', 'ミャンマー', 'カンボジア', 'ラオス',
        'モンゴル', '台湾', '香港', 'マカオ', 'ウクライナ', 'ルーマニア', 'ブルガリア', 'クロアチア', 'セルビア', 'スロバキア', 'スロベニア',
        '東京タワー', '東京スカイツリー', '富士山', '清水寺', '金閣寺', '伏見稲荷大社', '厳島神社', '姫路城', '大阪城', '名古屋城',
        '浅草寺', '東大寺', '日光東照宮', '出雲大社', '伊勢神宮', '平等院', '法隆寺', '原爆ドーム', '首里城', '札幌時計台',
        'エッフェル塔', '凱旋門', 'ルーブル美術館', 'ノートルダム大聖堂', 'ベルサイユ宮殿', 'ビッグベン', 'タワーブリッジ', 'バッキンガム宮殿', 'ウェストミンスター寺院', 'ストーンヘンジ',
        '自由の女神', 'エンパイアステートビル', 'ゴールデンゲートブリッジ', 'ホワイトハウス', 'グランドキャニオン', 'ナイアガラの滝', 'ラシュモア山', 'ハリウッドサイン', 'タイムズスクエア', 'セントラルパーク',
        '万里の長城', '紫禁城', '天安門', '兵馬俑', 'タージマハル', 'アンコールワット', 'ボロブドゥール', 'ペトロナスツインタワー', 'マリーナベイサンズ', 'ブルジュハリファ',
        'ピラミッド', 'スフィンクス', 'コロッセオ', 'ピサの斜塔', 'サグラダファミリア', 'アルハンブラ宮殿', 'パルテノン神殿', 'アクロポリス', 'モンサンミッシェル', 'ノイシュバンシュタイン城',
        'オペラハウス', 'ハーバーブリッジ', 'エアーズロック', 'マチュピチュ', 'イースター島のモアイ', 'クライストチャーチ大聖堂', 'チチェンイッツァ', 'テオティワカン', 'リオのキリスト像'
    ],
    'vehicle': [
        '軽自動車', '普通自動車', '高級車', 'スポーツカー', 'ワゴン車', 'ミニバン', 'SUV', 'トラック', 'バス', 'タクシー',
        'パトカー', '救急車', '消防車', 'ショベルカー', 'ブルドーザー', 'クレーン車', '新幹線', '特急電車', '普通電車', '地下鉄',
        '路面電車', 'モノレール', '蒸気機関車', '旅客機', '戦闘機', 'ヘリコプター', '気球', 'ロケット', '宇宙船', '客船',
        'タンカー', '漁船', 'ヨット', 'カヌー', '水上バイク', '潜水艦', 'フェリー', '原付バイク', 'オートバイ', '電動自転車',
        '三輪車', '一輪車', 'スケートボード', 'キックボード', 'セグウェイ', '車椅子', 'ベビーカー', 'リヤカー', '馬車',
        'ダンプカー', 'ミキサー車', 'ゴミ収集車', 'タンクローリー', 'レッカー車', 'フォークリフト', 'トレーラー', 'コンテナ車', 'キャンピングカー', 'リムジン',
        'オープンカー', 'クーペ', 'セダン', 'ハッチバック', 'ピックアップトラック', 'バギー', 'ゴーカート', 'F1カー', 'ラリーカー', 'ドリフトカー',
        'スクーター', 'ビッグバイク', 'オフロードバイク', 'トライク', 'サイドカー', 'ローラースケート', 'インラインスケート', 'スクートバイク', 'ホバーボード', 'トロリーバス',
        '2階建てバス', '連節バス', 'スクールバス', '観光バス', 'リニアモーターカー', 'ケーブルカー', 'トロッコ', '貨物列車', '寝台列車', '観光列車',
        'ディーゼル車', '輸送機', 'グライダー', '飛行船', 'ドローン', '水上飛行機', 'ジェット機', 'プロペラ機', 'オスプレイ', 'ジャイロコプター',
        '宇宙ステーション', '自動車', '自転車', 'バイク', '電車', '飛行機', '船', 'ロープウェイ', '人力車'
    ],
    'sport': [
        'サッカー', '野球', 'バスケットボール', 'テニス', 'ゴルフ', '水泳', '陸上', '体操', '柔道', '剣道',
        '空手', 'ボクシング', 'バドミントン', '卓球', 'バレーボール', 'ラグビー', 'スキー', 'スノーボード', 'スケート', 'サーフィン',
        'アメフト', 'ホッケー', 'アイスホッケー', 'ハンドボール', 'ソフトボール', 'クリケット', 'ボウリング', 'ビリヤード', 'ダーツ', 'アーチェリー',
        '射撃', 'フェンシング', 'レスリング', '相撲', '合気道', 'テコンドー', 'キックボクシング', '総合格闘技', 'プロレス', 'ウエイトリフティング',
        'パワーリフティング', 'ボディビル', 'クロスフィット', 'ヨガ', 'ピラティス', 'エアロビクス', 'ズンバ', 'マラソン', '駅伝', 'トライアスロン',
        '競歩', 'ハードル', '走り幅跳び', '走り高跳び', '棒高跳び', '砲丸投げ', 'やり投げ', '円盤投げ', 'ハンマー投げ', '十種競技',
        '七種競技', '新体操', 'トランポリン', '鉄棒', 'あん馬', '平行棒', 'つり輪', '跳馬', '平均台', 'シンクロナイズドスイミング',
        '飛込み', '水球', 'フィンスイミング', 'カヌー', 'カヤック', 'ボート', 'ヨット', 'ウィンドサーフィン', 'カイトサーフィン', 'ウェイクボード',
        '水上スキー', 'スキューバダイビング', 'シュノーケリング', 'フリーダイビング', 'クロスカントリースキー', 'スキージャンプ', 'バイアスロン', 'フィギュアスケート', 'スピードスケート', 'ショートトラック',
        'カーリング', 'ボブスレー', 'リュージュ', 'スケルトン', 'ロッククライミング', 'ボルダリング', '登山', 'トレッキング', 'サイクリング', 'BMX'
    ],
}

# 全カードプール（後方互換性のため）
CARD_POOL = []
for theme_cards in CARD_POOL_BY_THEME.values():
    CARD_POOL.extend(theme_cards)

def select_theme_from_list(themes: List[str], seed: int) -> str:
    """
    テーマリストとシードから1つのテーマを決定

    - 'chaos' が含まれる場合: 'chaos'を返す
    - 単一テーマの場合: そのテーマを返す
    - 複数テーマの場合: seedで1つランダムに選択
    """
    if not themes:
        return 'chaos'

    if 'chaos' in themes:
        return 'chaos'

    if len(themes) == 1:
        return themes[0]

    # 複数テーマの場合: seedで1つ選択
    rng = random.Random(seed)
    return rng.choice(themes)

def get_filtered_card_pool(themes: Optional[List[str]] = None, seed: Optional[int] = None) -> List[str]:
    """
    テーマに基づいてフィルタリングされたカードプールを取得

    - themes が None または空の場合: 全カード
    - 'chaos' が含まれる場合: 全テーマのカードを混合（カオスモード）
    - 単一テーマの場合: そのテーマのカードのみ
    - 複数テーマの場合: seedを使って1つのテーマをランダムに選択
    """
    if not themes:
        return CARD_POOL.copy()

    # カオスモードチェック
    if 'chaos' in themes:
        return CARD_POOL.copy()

    # 単一テーマの場合
    if len(themes) == 1:
        theme = themes[0]
        if theme in CARD_POOL_BY_THEME:
            return CARD_POOL_BY_THEME[theme].copy()
        return CARD_POOL.copy()

    # 複数テーマの場合: seedを使って1つランダムに選択
    if seed is not None:
        rng = random.Random(seed)
        selected_theme = rng.choice(themes)
        if selected_theme in CARD_POOL_BY_THEME:
            return CARD_POOL_BY_THEME[selected_theme].copy()

    # フォールバック: 全カード
    return CARD_POOL.copy()

def generate_all_hands(round_seed: str, player_slots: List[int], hand_size: int = 5, themes: Optional[List[str]] = None) -> Dict[int, List[str]]:
    """
    全プレイヤーの手札を一度に生成（重複なし、テーマフィルタ対応）
    player_slots: 実際のプレイヤースロット番号のリスト（例: [0, 2, 3]）
    """
    rng = random.Random(int(round_seed))

    # テーマに応じたカードプールを取得（seedを渡してテーマ選択）
    card_pool = get_filtered_card_pool(themes, int(round_seed))

    # カードプールをシャッフル
    shuffled_cards = card_pool.copy()
    rng.shuffle(shuffled_cards)

    # 各プレイヤーに配布（実際のスロット番号を使用）
    hands = {}
    for idx, player_slot in enumerate(sorted(player_slots)):  # スロット番号でソートして決定的に配布
        start_idx = idx * hand_size
        end_idx = start_idx + hand_size

        # カードが足りない場合は循環して使用
        if end_idx <= len(shuffled_cards):
            hands[player_slot] = shuffled_cards[start_idx:end_idx]
        else:
            # カードプールが足りない場合は、再度シャッフルして追加
            remaining = hand_size - (len(shuffled_cards) - start_idx)
            hands[player_slot] = shuffled_cards[start_idx:] + shuffled_cards[:remaining]

    return hands

def generate_hand(player_slot: int, round_seed: str, player_slots: List[int], hand_size: int = 5, themes: Optional[List[str]] = None) -> List[str]:
    """
    特定プレイヤーの手札を生成（重複なしで配布、テーマフィルタ対応）
    player_slots: 実際のプレイヤースロット番号のリスト（例: [0, 2, 3]）
    """
    all_hands = generate_all_hands(round_seed, player_slots, hand_size, themes)
    return all_hands.get(player_slot, [])

def generate_token() -> str:
    """
    安全なトークンを生成
    """
    return secrets.token_urlsafe(32)

async def verify_player_token(
    player_id: str = Query(...),
    authorization: Optional[str] = Header(None),
    token: Optional[str] = Query(None)
) -> str:
    """
    プレイヤーのトークンを検証する依存関数

    トークンは以下のいずれかの方法で提供される:
    1. Authorizationヘッダー（"Bearer {token}" 形式）
    2. クエリパラメータ token={token}（WebSocket用）

    REQUIRE_TOKEN_AUTH=false の場合は検証をスキップ
    """
    # トークン認証が無効の場合はスキップ
    if not REQUIRE_TOKEN_AUTH:
        return player_id

    # トークンを取得
    extracted_token = None

    # Authorizationヘッダーから取得
    if authorization and authorization.startswith("Bearer "):
        extracted_token = authorization[7:]  # "Bearer " を除去
    # クエリパラメータから取得（WebSocket用）
    elif token:
        extracted_token = token

    # トークンが提供されていない場合
    if not extracted_token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please provide a valid token."
        )

    # player_idに対応するトークンを確認
    stored_token = player_tokens.get(player_id)
    if not stored_token:
        raise HTTPException(
            status_code=401,
            detail="Invalid player_id. Please rejoin the room."
        )

    # トークンを照合
    if stored_token != extracted_token:
        raise HTTPException(
            status_code=401,
            detail="Invalid token. Please rejoin the room."
        )

    return player_id

class VerifyHostToken:
    """
    ホストのトークンを検証する依存クラス

    verify_player_token に加えて、そのプレイヤーがホストかどうかも確認
    """
    def __init__(self, room_code: str):
        self.room_code = room_code

    async def __call__(
        self,
        player_id: str = Query(...),
        authorization: Optional[str] = Header(None),
        token: Optional[str] = Query(None)
    ) -> str:
        # まずプレイヤートークンを検証
        verified_player_id = await verify_player_token(player_id, authorization, token)

        # トークン認証が無効の場合は、ここでもホストチェックをスキップ
        if not REQUIRE_TOKEN_AUTH:
            return verified_player_id

        # ルームが存在するか確認
        if self.room_code not in rooms:
            raise HTTPException(status_code=404, detail="Room not found")

        # プレイヤーがホストか確認
        room_players = players.get(self.room_code, [])
        player = next((p for p in room_players if p["player_id"] == verified_player_id), None)

        if not player:
            raise HTTPException(status_code=404, detail="Player not found in room")

        if not player.get("is_host"):
            raise HTTPException(
                status_code=403,
                detail="Only the host can perform this action"
            )

        return verified_player_id

# オンメモリストレージ
rooms: Dict[str, dict] = {}
players: Dict[str, List[dict]] = {}
cards: Dict[str, List[dict]] = {}
votes: Dict[str, List[dict]] = {}
chat_messages: Dict[str, List[dict]] = {}  # room_code -> チャットメッセージリスト
player_tokens: Dict[str, str] = {}  # player_id -> token の対応
cached_results: Dict[str, dict] = {}  # room_code + round -> 計算結果のキャッシュ

# ルームごとのロック（レースコンディション防止用）
room_locks: Dict[str, asyncio.Lock] = {}

# WebSocket接続管理
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # player_id -> WebSocket の対応を保持
        self.player_connections: Dict[str, WebSocket] = {}
        # WebSocket -> player_id の逆引き
        self.websocket_to_player: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, room_code: str, player_id: str = None):
        await websocket.accept()

        # 同じplayer_idの古い接続があれば削除
        if player_id and player_id in self.player_connections:
            old_ws = self.player_connections[player_id]
            print(f"[ConnectionManager] 同じplayer_idの古い接続を削除: {player_id}")
            # active_connectionsから削除
            if room_code in self.active_connections and old_ws in self.active_connections[room_code]:
                self.active_connections[room_code].remove(old_ws)
            # 逆引きマップから削除
            if old_ws in self.websocket_to_player:
                del self.websocket_to_player[old_ws]
            # 古い接続をクローズ
            try:
                await old_ws.close(1000, "New connection from same player")
            except:
                pass

        if room_code not in self.active_connections:
            self.active_connections[room_code] = []
        self.active_connections[room_code].append(websocket)

        if player_id:
            self.player_connections[player_id] = websocket
            self.websocket_to_player[websocket] = player_id

    def disconnect(self, websocket: WebSocket, room_code: str):
        if room_code in self.active_connections:
            if websocket in self.active_connections[room_code]:
                self.active_connections[room_code].remove(websocket)

        # player_id の紐付けも削除
        if websocket in self.websocket_to_player:
            player_id = self.websocket_to_player[websocket]
            if player_id in self.player_connections:
                del self.player_connections[player_id]
            del self.websocket_to_player[websocket]

    def get_online_players(self, room_code: str) -> List[str]:
        """ルーム内のオンラインプレイヤーIDのリストを返す"""
        online_player_ids = []
        if room_code in self.active_connections:
            for ws in self.active_connections[room_code]:
                if ws in self.websocket_to_player:
                    online_player_ids.append(self.websocket_to_player[ws])
        return online_player_ids

    async def broadcast(self, room_code: str, message: dict):
        if room_code in self.active_connections:
            for connection in self.active_connections[room_code]:
                try:
                    await connection.send_json(message)
                except:
                    pass

manager = ConnectionManager()

# 古いルームを削除する関数
def cleanup_old_rooms():
    """14日間アクティビティのないルームを削除"""
    now = datetime.now()
    cutoff_time = now - timedelta(days=14)

    rooms_to_delete = []
    for room_code, room_data in rooms.items():
        last_activity = datetime.fromisoformat(room_data.get("last_activity_at", room_data["created_at"]))
        if last_activity < cutoff_time:
            rooms_to_delete.append(room_code)

    for room_code in rooms_to_delete:
        if room_code in rooms:
            del rooms[room_code]
        if room_code in players:
            del players[room_code]
        if room_code in cards:
            del cards[room_code]
        if room_code in votes:
            del votes[room_code]
        print(f"[CLEANUP] Deleted inactive room: {room_code}")

# Pydanticモデル
class CreateRoomRequest(BaseModel):
    room_code: str
    player_id: str
    player_name: str

class JoinRoomRequest(BaseModel):
    room_code: str
    player_id: str
    player_name: str

class UpdatePhaseRequest(BaseModel):
    phase: str
    axis_payload: Optional[dict] = None
    wolf_axis_payload: Optional[dict] = None
    round_seed: Optional[str] = None
    themes: Optional[List[str]] = None  # 軸生成用のテーマ

class PlaceCardRequest(BaseModel):
    card_id: str
    quadrant: int
    offsets: dict

class SubmitVoteRequest(BaseModel):
    target_slot: int

class UpdateThemesRequest(BaseModel):
    themes: List[str]

# ヘルスチェック
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "rooms": len(rooms), "players": sum(len(p) for p in players.values())}

# ルーム作成
@app.post("/api/rooms/create")
async def create_room(req: CreateRoomRequest):
    if req.room_code in rooms:
        raise HTTPException(status_code=400, detail="Room already exists")

    now = datetime.now()
    rooms[req.room_code] = {
        "room_code": req.room_code,
        "phase": "lobby",
        "active_round": 0,
        "axis_payload": None,
        "wolf_axis_payload": None,
        "round_seed": None,
        "selected_theme": None,  # ラウンドごとに決定されたテーマ
        "scores": "{}",
        "themes": json.dumps(['food', 'daily', 'entertainment']),  # デフォルトテーマ
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "last_activity_at": now.isoformat(),
    }

    players[req.room_code] = [{
        "room_code": req.room_code,
        "player_id": req.player_id,
        "player_slot": 0,
        "player_name": req.player_name,
        "status": "connected",
        "is_host": 1,
        "connected_at": datetime.now().isoformat(),
        "last_seen_at": datetime.now().isoformat(),
    }]

    cards[req.room_code] = []
    votes[req.room_code] = []

    # トークンを生成
    token = generate_token()
    player_tokens[req.player_id] = token

    return {"success": True, "room_code": req.room_code, "token": token}

# ルーム参加
@app.post("/api/rooms/join")
async def join_room(req: JoinRoomRequest):
    if req.room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room = rooms[req.room_code]

    # 既存プレイヤー確認
    room_players = players.get(req.room_code, [])
    existing = next((p for p in room_players if p["player_id"] == req.player_id), None)

    if existing:
        # 既存プレイヤーの場合、トークンが既に存在すればそれを返す
        token = player_tokens.get(req.player_id)
        if not token:
            # トークンが存在しない場合は新規生成（後方互換性のため）
            token = generate_token()
            player_tokens[req.player_id] = token
        return {"success": True, "player_slot": existing["player_slot"], "token": token}

    # ゲーム開始後の新規参加を防ぐ
    if room["phase"] != "lobby":
        raise HTTPException(
            status_code=403,
            detail="Cannot join room after game has started. Please create a new room or wait for this game to finish."
        )

    # 次のスロット番号取得
    max_slot = max((p["player_slot"] for p in room_players), default=-1)
    next_slot = max_slot + 1

    # プレイヤー追加
    new_player = {
        "room_code": req.room_code,
        "player_id": req.player_id,
        "player_slot": next_slot,
        "player_name": req.player_name,
        "status": "connected",
        "is_host": 0,
        "connected_at": datetime.now().isoformat(),
        "last_seen_at": datetime.now().isoformat(),
    }
    players[req.room_code].append(new_player)

    # 他のプレイヤーに通知
    await manager.broadcast(req.room_code, {
        "type": "player_joined",
        "player_slot": next_slot,
        "player_name": req.player_name
    })

    # トークンを生成
    token = generate_token()
    player_tokens[req.player_id] = token

    return {"success": True, "player_slot": next_slot, "token": token}

# トークン検証
@app.post("/api/auth/verify")
async def verify_token(player_id: str, token: str):
    """
    player_idとtokenの組み合わせが正しいかを検証
    """
    stored_token = player_tokens.get(player_id)
    if not stored_token:
        raise HTTPException(status_code=401, detail="Invalid player_id")

    if stored_token != token:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {"success": True, "player_id": player_id}

# プレイヤー退出
@app.post("/api/rooms/{room_code}/leave")
async def leave_room(
    room_code: str,
    player_id: str = Depends(verify_player_token)
):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room_players = players.get(room_code, [])
    player = next((p for p in room_players if p["player_id"] == player_id), None)

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    player_slot = player["player_slot"]
    player_name = player["player_name"]

    # プレイヤーをリストから削除
    players[room_code] = [p for p in room_players if p["player_id"] != player_id]

    # そのプレイヤーのカードと投票を削除
    if room_code in cards:
        cards[room_code] = [c for c in cards[room_code] if c["player_slot"] != player_slot]
    if room_code in votes:
        votes[room_code] = [v for v in votes[room_code] if v["voter_slot"] != player_slot]

    # 他のプレイヤーに通知
    await manager.broadcast(room_code, {
        "type": "player_left",
        "player_slot": player_slot,
        "player_name": player_name
    })

    # ルームが空になったら削除
    if len(players[room_code]) == 0:
        del rooms[room_code]
        del players[room_code]
        if room_code in cards:
            del cards[room_code]
        if room_code in votes:
            del votes[room_code]

    return {"success": True}

# ルーム情報取得
@app.get("/api/rooms/{room_code}")
async def get_room(room_code: str):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    # オンラインプレイヤーIDのリストを取得
    online_player_ids = manager.get_online_players(room_code)

    # プレイヤー情報にオンライン状態を追加
    room_players = players.get(room_code, [])
    for player in room_players:
        player["is_online"] = player["player_id"] in online_player_ids

    return {
        "room": rooms[room_code],
        "players": room_players
    }

# テーマ更新
@app.post("/api/rooms/{room_code}/themes")
async def update_themes(
    room_code: str,
    req: UpdateThemesRequest,
    player_id: str = Depends(verify_player_token)
):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room = rooms[room_code]

    # ホストチェック（トークン認証が有効な場合のみ）
    if REQUIRE_TOKEN_AUTH:
        room_players = players.get(room_code, [])
        player = next((p for p in room_players if p["player_id"] == player_id), None)
        if not player or not player.get("is_host"):
            raise HTTPException(status_code=403, detail="Only the host can update themes")

    # ロビー中のみテーマ変更可能
    if room["phase"] != "lobby":
        raise HTTPException(status_code=400, detail="Cannot change themes after game has started")

    # テーマを更新
    now = datetime.now()
    rooms[room_code]["themes"] = json.dumps(req.themes)
    rooms[room_code]["updated_at"] = now.isoformat()
    rooms[room_code]["last_activity_at"] = now.isoformat()

    # 他のプレイヤーに通知
    await manager.broadcast(room_code, {
        "type": "themes_updated",
        "themes": req.themes
    })

    return {"success": True, "themes": req.themes}

# フェーズ更新
@app.post("/api/rooms/{room_code}/phase")
async def update_phase(
    room_code: str,
    req: UpdatePhaseRequest,
    player_id: str = Depends(verify_player_token)
):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    # ホストチェック（トークン認証が有効な場合のみ）
    if REQUIRE_TOKEN_AUTH:
        room_players = players.get(room_code, [])
        player = next((p for p in room_players if p["player_id"] == player_id), None)
        if not player or not player.get("is_host"):
            raise HTTPException(status_code=403, detail="Only the host can update the phase")

    now = datetime.now()
    rooms[room_code]["phase"] = req.phase
    rooms[room_code]["updated_at"] = now.isoformat()
    rooms[room_code]["last_activity_at"] = now.isoformat()

    # ロビーに戻る場合はカードと投票をクリア
    if req.phase == 'lobby':
        if room_code in cards:
            cards[room_code] = []
        if room_code in votes:
            votes[room_code] = []

    # placementフェーズに移行する場合（新規ゲーム開始時）もカードと投票をクリア
    if req.phase == 'placement':
        if room_code in cards:
            cards[room_code] = []
        if room_code in votes:
            votes[room_code] = []

    # 結果フェーズに移行する際にスコア計算を実行
    if req.phase == 'results':
        room = rooms[room_code]
        room_players = players.get(room_code, [])
        room_votes = votes.get(room_code, [])

        # 人狼を特定（ラウンド開始時に決定済みのものを使用）
        if room.get("wolf_slot") is not None:
            wolf_slot = room["wolf_slot"]
            print(f"[update_phase:results] Using saved wolf_slot: {wolf_slot}", file=sys.stderr)

            # 投票集計
            vote_counts: Dict[int, int] = {}
            for vote in room_votes:
                target = vote["target_slot"]
                vote_counts[target] = vote_counts.get(target, 0) + 1

            # 最多得票数
            max_votes = max(vote_counts.values()) if vote_counts else 0
            # 最多得票者（複数の可能性）
            top_voted = [slot for slot, count in vote_counts.items() if count == max_votes]

            # 勝利判定：人狼が単独で最多票を獲得した場合のみ村人勝利
            wolf_caught = wolf_slot in top_voted and len(top_voted) == 1

            # スコア計算
            import json
            scores_before_round = json.loads(room["scores"]) if room["scores"] else {}
            current_scores = scores_before_round.copy()
            round_scores = {}

            print(f"[update_phase:results] Calculating scores. scores_before_round: {scores_before_round}", file=sys.stderr)

            for player in room_players:
                slot = player["player_slot"]
                slot_str = str(slot)

                if slot_str not in current_scores:
                    current_scores[slot_str] = 0

                round_score = 0

                # 人狼を指していたプレイヤーは+1点
                voted_for_wolf = any(
                    vote["voter_slot"] == slot and vote["target_slot"] == wolf_slot
                    for vote in room_votes
                )
                if voted_for_wolf:
                    round_score += 1

                # 村人が勝利した場合
                if wolf_caught:
                    if slot != wolf_slot:
                        round_score += 1
                else:
                    # 人狼が勝利した場合
                    if slot == wolf_slot:
                        round_score += 3

                round_scores[slot_str] = round_score
                current_scores[slot_str] += round_score

            # スコアと結果を保存
            room["scores"] = json.dumps(current_scores)

            # 全プレイヤーの手札を生成（テーマ対応）
            room_themes_str = room.get("themes")
            themes = json.loads(room_themes_str) if room_themes_str else None
            # ラウンド開始時に保存されたプレイヤースロットリストを使用
            player_slots_str = room.get("round_player_slots")
            if player_slots_str:
                player_slots = json.loads(player_slots_str)
            else:
                # 後方互換性：round_player_slotsが存在しない場合は現在のプレイヤーから生成
                player_slots = sorted([p["player_slot"] for p in room_players])
            all_hands_dict = generate_all_hands(room["round_seed"], player_slots, 5, themes)
            all_hands = {str(slot): hand for slot, hand in all_hands_dict.items()}
            print(f"[update_phase:results] Generated hands with player_slots={player_slots}", file=sys.stderr)

            # 結果をroomに保存
            room["round_results_calculated"] = True
            room["last_wolf_slot"] = wolf_slot
            room["last_top_voted"] = json.dumps(top_voted)
            room["last_wolf_caught"] = wolf_caught
            room["last_round_scores"] = json.dumps(round_scores)
            room["last_vote_counts"] = json.dumps(vote_counts)
            room["last_all_hands"] = json.dumps(all_hands)

            print(f"[update_phase:results] Scores calculated. round_scores: {round_scores}, total_scores: {current_scores}", file=sys.stderr)

    # 軸データが提供されていない場合は自動生成
    if req.phase == 'placement' and not req.axis_payload:
        # ルームのテーマを使用（存在しない場合はデフォルト）
        import json
        room_themes_str = rooms[room_code].get("themes")
        if room_themes_str:
            themes = json.loads(room_themes_str)
        else:
            themes = req.themes if req.themes else ['food', 'daily', 'entertainment']

        seed = int(req.round_seed) if req.round_seed else random.randint(0, 10000)

        # テーマを決定して保存
        selected_theme = select_theme_from_list(themes, seed)
        rooms[room_code]["selected_theme"] = selected_theme

        # 通常の軸と人狼用の軸を生成
        normal_axis = generate_axis_pair(themes, seed)
        wolf_axis = generate_wolf_axis_pair(normal_axis, themes, seed)

        rooms[room_code]["axis_payload"] = normal_axis
        rooms[room_code]["wolf_axis_payload"] = wolf_axis
        rooms[room_code]["round_seed"] = str(seed)

        # 人狼を決定してルームに保存
        room_players = players.get(room_code, [])
        player_slots = sorted([p["player_slot"] for p in room_players])  # 実際のスロット番号リスト
        num_players = len(player_slots)
        if num_players > 0:
            rng = random.Random(seed)
            wolf_index = rng.randint(0, num_players - 1)  # 0からnum_players-1のインデックス
            wolf_slot = player_slots[wolf_index]  # 実際のスロット番号
            rooms[room_code]["wolf_slot"] = wolf_slot
            rooms[room_code]["round_player_slots"] = json.dumps(player_slots)  # プレイヤースロットリストを保存
            print(f"[update_phase:placement] Wolf determined: slot={wolf_slot}, player_slots={player_slots}, seed={seed}", file=sys.stderr)
    else:
        # 手動で提供された軸データを使用
        if req.axis_payload:
            rooms[room_code]["axis_payload"] = req.axis_payload

        if req.wolf_axis_payload:
            rooms[room_code]["wolf_axis_payload"] = req.wolf_axis_payload

        if req.round_seed:
            rooms[room_code]["round_seed"] = req.round_seed

    await manager.broadcast(room_code, {
        "type": "phase_changed",
        "phase": req.phase
    })

    return {"success": True}

# カード配置
@app.post("/api/rooms/{room_code}/cards")
async def place_card(
    room_code: str,
    req: PlaceCardRequest,
    player_id: str = Depends(verify_player_token)
):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    # プレイヤー情報取得
    room_players = players.get(room_code, [])
    player = next((p for p in room_players if p["player_id"] == player_id), None)

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # カード配置
    room_cards = cards.get(room_code, [])
    # 同じカードがあれば削除
    room_cards = [c for c in room_cards if not (
        c["player_slot"] == player["player_slot"] and c["card_id"] == req.card_id
    )]

    now = datetime.now()
    room_cards.append({
        "room_code": room_code,
        "round": rooms[room_code]["active_round"],
        "player_slot": player["player_slot"],
        "card_id": req.card_id,
        "quadrant": req.quadrant,
        "offsets": req.offsets,
        "locked": 0,
        "placed_at": now.isoformat(),
    })
    cards[room_code] = room_cards

    # 最終アクティビティ時刻を更新
    rooms[room_code]["last_activity_at"] = now.isoformat()

    await manager.broadcast(room_code, {
        "type": "card_placed",
        "player_slot": player["player_slot"],
        "card_id": req.card_id,
        "quadrant": req.quadrant,
        "offsets": req.offsets
    })

    return {"success": True}

# 配置済みカード取得
@app.get("/api/rooms/{room_code}/cards")
async def get_cards(room_code: str):
    """
    ルーム内の配置済みカードを全て取得
    再接続時に既存の配置情報を復元するために使用
    """
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room_cards = cards.get(room_code, [])
    return {"cards": room_cards}

# 手札取得
@app.get("/api/rooms/{room_code}/hand")
async def get_hand(
    room_code: str,
    player_id: str = Depends(verify_player_token)
):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    # プレイヤー情報取得
    room_players = players.get(room_code, [])
    player = next((p for p in room_players if p["player_id"] == player_id), None)

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    room = rooms[room_code]
    if not room["round_seed"]:
        raise HTTPException(status_code=400, detail="Game not started")

    # ルームのテーマを取得
    import json
    room_themes_str = room.get("themes")
    themes = json.loads(room_themes_str) if room_themes_str else None

    # 手札を生成（ラウンド開始時に保存されたプレイヤースロットリストを使用）
    player_slots_str = room.get("round_player_slots")
    if player_slots_str:
        player_slots = json.loads(player_slots_str)
    else:
        # 後方互換性：round_player_slotsが存在しない場合は現在のプレイヤーから生成
        player_slots = sorted([p["player_slot"] for p in room_players])
    hand = generate_hand(player["player_slot"], room["round_seed"], player_slots, 5, themes)
    print(f"[get_hand] Generated hand for player_slot={player['player_slot']} with player_slots={player_slots}", file=sys.stderr)

    return {
        "hand": hand,
        "player_slot": player["player_slot"]
    }

# 投票
@app.post("/api/rooms/{room_code}/vote")
async def submit_vote(
    room_code: str,
    req: SubmitVoteRequest,
    player_id: str = Depends(verify_player_token)
):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room_players = players.get(room_code, [])
    player = next((p for p in room_players if p["player_id"] == player_id), None)

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # 投票追加/更新
    room_votes = votes.get(room_code, [])
    room_votes = [v for v in room_votes if v["voter_slot"] != player["player_slot"]]
    now = datetime.now()
    room_votes.append({
        "room_code": room_code,
        "round": rooms[room_code]["active_round"],
        "voter_slot": player["player_slot"],
        "target_slot": req.target_slot,
        "submitted_at": now.isoformat(),
    })
    votes[room_code] = room_votes

    # 最終アクティビティ時刻を更新
    rooms[room_code]["last_activity_at"] = now.isoformat()

    await manager.broadcast(room_code, {
        "type": "vote_submitted",
        "voter_slot": player["player_slot"],
        "target_slot": req.target_slot
    })

    return {"success": True}

# 投票結果取得
@app.get("/api/rooms/{room_code}/votes")
async def get_votes(room_code: str):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room_votes = votes.get(room_code, [])
    return {"votes": room_votes}

# 結果取得（計算済みの結果を返すだけ）
@app.post("/api/rooms/{room_code}/calculate_results")
async def calculate_results(room_code: str):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room = rooms[room_code]

    # 結果が計算されていない場合はエラー
    if not room.get("round_results_calculated"):
        raise HTTPException(status_code=400, detail="Results not calculated yet. Move to results phase first.")

    # 保存済みの結果を返す
    import json
    print(f"[calculate_results] Returning cached results", file=sys.stderr)

    return {
        "wolf_slot": room.get("last_wolf_slot"),
        "top_voted": json.loads(room.get("last_top_voted", "[]")),
        "wolf_caught": room.get("last_wolf_caught"),
        "scores": json.loads(room.get("last_round_scores", "{}")),
        "total_scores": json.loads(room["scores"]) if room["scores"] else {},
        "vote_counts": json.loads(room.get("last_vote_counts", "{}")),
        "all_hands": json.loads(room.get("last_all_hands", "{}")),
        "wolf_axis": room["wolf_axis_payload"],
        "normal_axis": room["axis_payload"]
    }

# 次ラウンドへ移行
@app.post("/api/rooms/{room_code}/next_round")
async def start_next_round(
    room_code: str,
    player_id: str = Depends(verify_player_token)
):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    # ホストチェック（トークン認証が有効な場合のみ）
    if REQUIRE_TOKEN_AUTH:
        room_players = players.get(room_code, [])
        player = next((p for p in room_players if p["player_id"] == player_id), None)
        if not player or not player.get("is_host"):
            raise HTTPException(status_code=403, detail="Only the host can start the next round")

    room = rooms[room_code]
    room_players = players.get(room_code, [])

    # 新しいラウンド番号
    new_round = room["active_round"] + 1

    # 新しいシード値を生成
    new_seed = random.randint(0, 10000)

    # 新しい軸を生成（ルームのテーマを使用）
    import json
    room_themes_str = room.get("themes")
    if room_themes_str:
        themes = json.loads(room_themes_str)
    else:
        themes = ['food', 'daily', 'entertainment']

    # テーマを決定して保存
    selected_theme = select_theme_from_list(themes, new_seed)

    normal_axis = generate_axis_pair(themes, new_seed)
    wolf_axis = generate_wolf_axis_pair(normal_axis, themes, new_seed)

    # 人狼を決定（実際のプレイヤースロットを使用）
    player_slots = sorted([p["player_slot"] for p in room_players])
    num_players = len(player_slots)
    if num_players > 0:
        rng = random.Random(new_seed)
        wolf_index = rng.randint(0, num_players - 1)
        wolf_slot = player_slots[wolf_index]
        print(f"[start_next_round] Wolf determined: slot={wolf_slot}, player_slots={player_slots}, seed={new_seed}", file=sys.stderr)
    else:
        wolf_slot = None

    # ルームの状態を更新
    now = datetime.now()
    room["active_round"] = new_round
    room["phase"] = "placement"
    room["round_seed"] = str(new_seed)
    room["selected_theme"] = selected_theme  # テーマを保存
    room["axis_payload"] = normal_axis
    room["wolf_axis_payload"] = wolf_axis
    room["wolf_slot"] = wolf_slot  # 人狼スロットを保存
    room["round_player_slots"] = json.dumps(player_slots)  # プレイヤースロットリストを保存
    room["updated_at"] = now.isoformat()
    room["last_activity_at"] = now.isoformat()

    # 結果計算フラグをリセット
    room["round_results_calculated"] = False

    # 前ラウンドの結果キャッシュをクリア
    room.pop("last_wolf_slot", None)
    room.pop("last_top_voted", None)
    room.pop("last_wolf_caught", None)
    room.pop("last_round_scores", None)
    room.pop("last_vote_counts", None)
    room.pop("last_all_hands", None)

    # 前ラウンドのカードと投票をクリア
    if room_code in cards:
        cards[room_code] = []
    if room_code in votes:
        votes[room_code] = []

    # WebSocketで通知
    await manager.broadcast(room_code, {
        "type": "round_started",
        "round": new_round
    })

    return {
        "success": True,
        "round": new_round,
        "round_seed": str(new_seed)
    }

# デバッグ: ルーム一覧取得
@app.get("/api/debug/rooms")
async def get_all_rooms():
    # 本番環境では無効化（セキュリティ対策）
    if os.getenv("ENV") == "production":
        raise HTTPException(status_code=404, detail="Not found")

    rooms_with_players = []
    for room_code, room_data in rooms.items():
        room_players = players.get(room_code, [])
        room_cards = cards.get(room_code, [])
        room_votes = votes.get(room_code, [])
        rooms_with_players.append({
            **room_data,
            "players_count": len(room_players),
            "players": room_players,
            "cards_count": len(room_cards),
            "votes_count": len(room_votes)
        })
    return {
        "rooms": rooms_with_players,
        "total": len(rooms)
    }

# WebSocket接続
@app.websocket("/ws/{room_code}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_code: str,
    player_id: Optional[str] = Query(None),
    token: Optional[str] = Query(None),
    load_history: bool = Query(True)
):
    print(f"[WebSocket] 接続要求: room={room_code}, player_id={player_id}, load_history={load_history}")

    # トークン認証が有効な場合はトークンを検証
    if REQUIRE_TOKEN_AUTH and player_id:
        # トークンが提供されていない場合
        if not token:
            await websocket.close(code=1008, reason="Authentication required")
            return

        # player_idに対応するトークンを確認
        stored_token = player_tokens.get(player_id)
        if not stored_token or stored_token != token:
            await websocket.close(code=1008, reason="Invalid token")
            return

    await manager.connect(websocket, room_code, player_id)
    print(f"[WebSocket] 接続完了: room={room_code}, player_id={player_id}")

    # 初回接続時のみ過去のチャットメッセージを送信
    if load_history and room_code in chat_messages:
        for msg in chat_messages[room_code]:
            await websocket.send_json(msg)
        print(f"[WebSocket] {len(chat_messages[room_code])}件の過去メッセージを送信")

    # 接続時に他のプレイヤーに通知
    if player_id:
        message = {
            "type": "player_online",
            "player_id": player_id
        }
        await manager.broadcast(room_code, message)
        print(f"[WebSocket] player_online ブロードキャスト: player={player_id}")

    print(f"[WebSocket] メッセージ受信ループ開始: room={room_code}, player_id={player_id}")
    try:
        while True:
            print(f"[WebSocket] receive_text()呼び出し待機中...")
            data = await websocket.receive_text()
            print(f"[WebSocket] メッセージ受信成功: {data}")

            # メッセージをパースしてブロードキャスト
            try:
                message = json.loads(data)
                message_type = message.get("type")
                print(f"[WebSocket] メッセージタイプ: {message_type}")

                # チャットメッセージの場合は保存してブロードキャスト
                if message_type == "chat":
                    print(f"[WebSocket] チャットメッセージをブロードキャスト: {message}")

                    # メッセージをストレージに保存
                    if room_code not in chat_messages:
                        chat_messages[room_code] = []
                    chat_messages[room_code].append(message)
                    print(f"[WebSocket] チャットメッセージを保存: {len(chat_messages[room_code])}件")

                    # ブロードキャスト
                    await manager.broadcast(room_code, message)
                    print(f"[WebSocket] ブロードキャスト完了")
                if message_type == "chat":
                    # チャットメッセージは既に上で処理済み
                    pass
                elif message_type == "ping":
                    # pingメッセージを受信したらpongを返す
                    print(f"[WebSocket] Ping受信: room={room_code}, player_id={player_id}")
                    await websocket.send_text(json.dumps({"type": "pong"}))
                else:
                    print(f"[WebSocket] その他のメッセージタイプ: {message_type}")
            except json.JSONDecodeError as e:
                print(f"[WebSocket] JSON解析エラー: {data}, error: {e}")
            except Exception as e:
                print(f"[WebSocket] メッセージ処理エラー: {e}")
    except WebSocketDisconnect:
        print(f"[WebSocket] 切断: room={room_code}, player_id={player_id}")

        # ロビーフェーズでオフラインになった場合、プレイヤーを自動削除
        if player_id and room_code in rooms:
            # ルームのロックを取得（ない場合は作成）
            if room_code not in room_locks:
                room_locks[room_code] = asyncio.Lock()

            # ロックを取得してからプレイヤー削除処理を実行
            async with room_locks[room_code]:
                # ロック取得後に再度ルームの存在確認（削除済みの可能性があるため）
                if room_code not in rooms:
                    manager.disconnect(websocket, room_code)
                    return

                room = rooms[room_code]

                # ロビーフェーズの場合のみ自動削除
                if room["phase"] == "lobby":
                    room_players = players.get(room_code, [])
                    player = next((p for p in room_players if p["player_id"] == player_id), None)

                    if player:
                        player_slot = player["player_slot"]
                        player_name = player["player_name"]
                        was_host = player.get("is_host") == 1

                        print(f"[WebSocket] ロビー中にオフライン。プレイヤーを削除: {player_name} (slot={player_slot})")

                        # プレイヤーを削除
                        players[room_code] = [p for p in room_players if p["player_id"] != player_id]

                        # トークンも削除
                        if player_id in player_tokens:
                            del player_tokens[player_id]

                        # ホストが離脱した場合、次のプレイヤーをホストに昇格
                        if was_host and len(players[room_code]) > 0:
                            players[room_code][0]["is_host"] = 1
                            new_host_name = players[room_code][0]["player_name"]
                            print(f"[WebSocket] 新しいホスト: {new_host_name}")

                            # ホスト変更を通知
                            await manager.broadcast(room_code, {
                                "type": "host_changed",
                                "new_host_slot": players[room_code][0]["player_slot"],
                                "new_host_name": new_host_name
                            })

                        # プレイヤー削除を通知
                        await manager.broadcast(room_code, {
                            "type": "player_removed",
                            "player_id": player_id,
                            "player_slot": player_slot,
                            "player_name": player_name,
                            "reason": "offline_in_lobby"
                        })

                        # ルームが空になったら削除
                        if len(players[room_code]) == 0:
                            print(f"[WebSocket] ルームが空になったため削除: {room_code}")
                            if room_code in rooms:
                                del rooms[room_code]
                            if room_code in players:
                                del players[room_code]
                            if room_code in cards:
                                del cards[room_code]
                            if room_code in votes:
                                del votes[room_code]
                            if room_code in chat_messages:
                                del chat_messages[room_code]
                            if room_code in room_locks:
                                del room_locks[room_code]
                else:
                    # ゲーム中の場合はオフライン通知のみ
                    await manager.broadcast(room_code, {
                        "type": "player_offline",
                        "player_id": player_id
                    })

        manager.disconnect(websocket, room_code)
    except Exception as e:
        print(f"[WebSocket] エラー: {e}")
        manager.disconnect(websocket, room_code)

async def periodic_cleanup():
    """24時間ごとに古いルームをクリーンアップ"""
    while True:
        await asyncio.sleep(86400)  # 24時間 = 86400秒
        cleanup_old_rooms()
        print("[CLEANUP] Periodic cleanup completed")

# 静的ファイル配信（本番環境用）
# 開発環境では存在しないので、存在する場合のみマウント
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    from fastapi.responses import FileResponse

    # 静的ファイルを配信
    app.mount("/assets", StaticFiles(directory=str(static_dir / "assets")), name="assets")

    # SPAのindex.htmlを直接配信
    @app.get("/", response_class=FileResponse)
    async def serve_root():
        return FileResponse(static_dir / "index.html")

    # 404エラーハンドラー: API以外の全てのパスでindex.htmlを返す（SPAルーティング用）
    @app.exception_handler(404)
    async def custom_404_handler(request, exc):
        # API/WSリクエストの場合は通常の404を返す
        if request.url.path.startswith("/api/") or request.url.path.startswith("/ws/"):
            raise exc

        # それ以外（SPAルート）の場合はindex.htmlを返す
        index_path = static_dir / "index.html"
        if index_path.is_file():
            return FileResponse(index_path)

        raise exc

    print(f"[STATIC] Serving static files from {static_dir}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
