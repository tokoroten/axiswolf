interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800">アクシスウルフ：軸がズレたウルフを見つけ出せ！</h2>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-lg font-bold text-purple-600 mb-3">🎯 ゲームの目的</h3>
            <p className="text-gray-700">
              プレイヤーの中に一人だけ存在する「ウルフ」を見つけ出す正体隠匿ゲームです。
              ウルフは微妙に異なる軸を見ていますが、自分がウルフであることは知りません。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-purple-600 mb-3">🎮 ゲームの準備</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li><strong>必要なもの：</strong>カード40枚以上（商品、キャラクター、食べ物など）</li>
              <li><strong>ルーム作成：</strong>ホストがパスコードと難易度を設定</li>
              <li><strong>参加：</strong>各プレイヤーはQRコードを読み取るか、パスコードを入力して参加</li>
              <li><strong>カード配布：</strong>シャッフルして各プレイヤーに5枚ずつ配る</li>
              <li><strong>山札：</strong>残りのカードを中央に置く</li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-bold text-purple-600 mb-3">📊 4象限の軸について</h3>
            <div className="bg-gray-50 p-3 rounded-lg mb-2">
              <p className="text-gray-700 mb-2">
                画面には縦横の軸で区切られた4つのエリアが表示されます：
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>縦軸（上下）：</strong>対立する概念（例：「子どもウケ」↔「大人ウケ」）</li>
                <li><strong>横軸（左右）：</strong>対立する概念（例：「安い」↔「高い」）</li>
                <li>物理カードをこの4象限のどこに配置するか議論します</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-purple-600 mb-3">🕵️ ウルフの仕組み</h3>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>ウルフだけが見ている軸の違い：</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>縦軸か横軸の片方、または両方が別の概念に変更</li>
                <li>軸が上下または左右に反転</li>
                <li>縦軸と横軸が入れ替わっている</li>
              </ul>
              <p className="text-gray-700 mt-2">
                ※ ウルフ自身も自分がウルフだとは知りません
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-purple-600 mb-3">🎯 ゲームのプレイ（3ラウンド）</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li><strong>軸の確認：</strong>全員が自分の画面で軸を確認（ウルフだけ違う）</li>
              <li><strong>スタートプレイヤー：</strong>システムが指定したプレイヤーから開始</li>
              <li><strong>手番：</strong>手札から1枚選び、軸に沿って置く</li>
              <li><strong>配置：</strong>全員で合意したら物理的にカードを配置</li>
              <li><strong>補充：</strong>山札から1枚引いて手札を5枚に保つ</li>
              <li><strong>次の人へ：</strong>時計回りに進行</li>
              <li><strong>ラウンド終了：</strong>一定枚数配置したら投票へ</li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-bold text-purple-600 mb-3">🗳️ 投票と得点</h3>
            <div className="bg-yellow-50 p-3 rounded-lg mb-3">
              <h4 className="font-bold text-yellow-800 mb-2">投票（各ラウンド終了時）</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>誰がウルフだと思うか一斉に指さす</li>
                <li>最多票を集めた人がウルフ候補</li>
                <li>同票の場合はウルフの勝利</li>
              </ul>
            </div>
            <div className="bg-green-50 p-3 rounded-lg mb-3">
              <h4 className="font-bold text-green-800 mb-2">得点</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>村人チーム：</strong>ウルフを正しく当てたら<span className="font-bold text-green-600">+1点</span></li>
                <li><strong>ウルフ：</strong>最多票を避けられたら<span className="font-bold text-purple-600">+3点</span></li>
              </ul>
            </div>
            <div className="bg-red-50 p-3 rounded-lg mb-3">
              <h4 className="font-bold text-red-800 mb-2">ペナルティ</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>軸の名前を口に出したら：</strong><span className="font-bold text-red-600">-1点</span></li>
                <li className="text-sm">例：「安い」「高い」などの軸ラベルを直接言ってしまった場合</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">勝利条件</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>3ラウンド終了後</strong>に最終得点を計算</li>
                <li>最も得点が高いプレイヤーが勝利</li>
                <li>同点の場合はウルフだった回数が少ない方が勝利</li>
              </ul>
            </div>
          </section>

          <section className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-red-700 mb-2">⚠️ 重要な注意事項</h3>
            <ul className="list-disc list-inside space-y-1 text-red-700">
              <li>自分の画面を他の人に見せないでください</li>
              <li><strong>軸の名前を口に出したら-1点のペナルティ</strong></li>
              <li>カードの配置理由は抽象的に表現しましょう</li>
              <li className="text-sm">良い例：「価格面で...」「コスト的に...」「年齢層として...」</li>
              <li className="text-sm">悪い例：「安い」「高い」「子どもウケ」（軸ラベルそのまま）</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-purple-600 mb-3">🎚️ 難易度モード</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-bold text-blue-700">一般向け</h4>
                <p className="text-sm text-gray-700">
                  わかりやすい軸のみ（「かわいい/かっこいい」「新しい/古い」など）
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <h4 className="font-bold text-purple-700">インテリ向け</h4>
                <p className="text-sm text-gray-700">
                  専門知識が必要な軸も含む（「株価が高い/低い」「輸出が多い/少ない」など）
                </p>
              </div>
            </div>
          </section>

          <section className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-green-700 mb-2">💡 プレイのコツ</h3>
            <ul className="list-disc list-inside space-y-1 text-green-700">
              <li>カードをどこに置くか、その理由を説明しながら議論する</li>
              <li>一人だけ配置の理由が不自然な人を探す</li>
              <li>複数のカードで一貫してズレている人を見つける</li>
              <li>ウルフも自然に振る舞おうとするので注意深く観察</li>
              <li>手札の選択も重要な戦略要素</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-purple-600 mb-3">📝 その他の情報</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>プレイ人数：</strong>3〜8人（推奨：4〜6人）</li>
              <li><strong>プレイ時間：</strong>約30〜45分</li>
              <li><strong>対象年齢：</strong>10歳以上</li>
              <li><strong>スタートプレイヤー：</strong>システムが各ラウンドでランダムに決定</li>
              <li><strong>得点管理：</strong>ホストがいる場合はホスト、いない場合はルビー（プレイヤー1）が担当</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}