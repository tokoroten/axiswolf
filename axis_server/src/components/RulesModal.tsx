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
          <h2 className="text-2xl font-bold text-gray-800">アクシスウルフ：軸がズレた人狼を見つけ出せ！</h2>
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
              プレイヤーの中に一人だけ存在する「人狼」を見け出す正体隠匿ゲームです。
              プレイヤーは、スマホに表示されている軸に沿って手持ちのカードを配置していきます。
              人狼はほかの人とは異なる軸を見ていますが、自分が人狼であることは知りません。
              ゲームが進む中で、誰が人狼なのかを推理し、最終的に投票で当てることが目的です。
              人狼は自分が人狼だと投票されないことが目的です。
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
                <li>手番の人はカードをこの4象限の適切な場所に配置していきます</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-purple-600 mb-3">🕵️ 人狼の仕組み</h3>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>人狼だけが見ている軸の違い：</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>縦軸か横軸の片方、または両方が別の概念に変更</li>
                <li>軸が上下または左右に反転</li>
                <li>縦軸と横軸が入れ替わっている</li>
              </ul>
              <p className="text-gray-700 mt-2">
                ※ 人狼自身も自分が人狼だとは知りません
                うまく立ち回って他のプレイヤーに気づかれないようにしましょう
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-purple-600 mb-3">🎯 ゲームのプレイ</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li><strong>軸の確認：</strong>全員が自分の画面で軸を確認（人狼だけ違う）</li>
              <li><strong>スタートプレイヤー：</strong>システムが指定したプレイヤーから開始</li>
              <li><strong>手番：</strong>手札から1枚選び、軸に沿って置く</li>
              <li><strong>配置：</strong>他のカードの位置を調整しても構わない</li>
              <li><strong>補充：</strong>山札から1枚引いて手札を5枚に保つ</li>
              <li><strong>次の人へ：</strong>時計回りに進行</li>
              <li><strong>ラウンド終了：</strong>各プレイヤーが3枚数配置したら投票へ</li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-bold text-purple-600 mb-3">🗳️ 投票と得点</h3>
            <div className="bg-yellow-50 p-3 rounded-lg mb-3">
              <h4 className="font-bold text-yellow-800 mb-2">投票（各ラウンド終了時）</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>誰が人狼だと思うか一斉に指さす</li>
                <li>最多票を集めた人が人狼候補</li>
                <li>同票の場合は人狼の勝利</li>
              </ul>
            </div>
            <div className="bg-green-50 p-3 rounded-lg mb-3">
              <h4 className="font-bold text-green-800 mb-2">得点</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>村人チーム：</strong>人狼が最多票になったら<span className="font-bold text-green-600">全員に+1点</span></li>
                <li><strong>村人チーム：</strong>人狼を正しく指したら<span className="font-bold text-green-600">指した人に+1点</span></li>
                <li><strong>人狼：</strong>最多票を避けられたら<span className="font-bold text-purple-600">+3点</span></li>
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
                <li><strong>複数ラウンド終了後</strong>に最終得点を計算</li>
                <li>最も得点が高いプレイヤーが勝利</li>
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
              <li>人狼も自然に振る舞おうとするので注意深く観察</li>
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