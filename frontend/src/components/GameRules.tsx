interface GameRulesProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameRules({ isOpen, onClose }: GameRulesProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">🎮 アクシスウルフ：ゲームルール</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 目的 */}
          <section>
            <h3 className="text-xl font-bold text-purple-700 mb-3 flex items-center gap-2">
              🎯 ゲームの目的
            </h3>
            <p className="text-gray-700 leading-relaxed">
              全員に共有された二軸に沿ってカードを配置します。ただし<span className="font-bold text-red-600">1人だけは異なる軸</span>が提示されており、その人（人狼）を見破りましょう。
            </p>
          </section>

          {/* 基本情報 */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-purple-700 mb-3 flex items-center gap-2">
              📊 基本情報
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="font-bold text-purple-600">人数:</span> 4人（3–8人でも可）
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-purple-600">時間:</span> 1ラウンド 5–8分
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-purple-600">役割:</span> 村人 vs 人狼（1人）
              </li>
            </ul>
          </section>

          {/* ゲームの流れ */}
          <section>
            <h3 className="text-xl font-bold text-purple-700 mb-3 flex items-center gap-2">
              🔄 ゲームの流れ
            </h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                <div>
                  <p className="font-bold text-purple-700">軸の確認</p>
                  <p className="text-sm">全員に二軸が表示されます。<span className="font-bold text-red-600">人狼だけ異なる軸</span>が表示されます。</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                <div>
                  <p className="font-bold text-purple-700">カード配置</p>
                  <p className="text-sm">手札のカードを軸上に配置しながら、他のプレイヤーと議論します。全員が規定枚数配置したら次へ。</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                <div>
                  <p className="font-bold text-purple-700">投票</p>
                  <p className="text-sm">誰が人狼かを推理して投票します。</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
                <div>
                  <p className="font-bold text-purple-700">結果発表</p>
                  <p className="text-sm">人狼が明らかになり、スコアが計算されます。</p>
                </div>
              </li>
            </ol>
          </section>

          {/* スコアリング */}
          <section className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-xl font-bold text-purple-700 mb-3 flex items-center gap-2">
              🏆 スコアリング
            </h3>
            <div className="space-y-3 text-gray-700">
              <div className="bg-white p-3 rounded-lg border-2 border-green-300">
                <p className="font-bold text-green-700 mb-2">✅ 村人が勝利した場合（人狼を単独で指摘）</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• 村人全員: <span className="font-bold text-green-600">+1点</span></li>
                  <li>• 人狼を指したプレイヤー: <span className="font-bold text-green-600">さらに+1点</span>（合計+2点）</li>
                  <li>• 人狼: <span className="font-bold text-gray-600">0点</span></li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-lg border-2 border-red-300">
                <p className="font-bold text-red-700 mb-2">❌ 人狼が勝利した場合（同票または逃げ切り）</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• 人狼: <span className="font-bold text-red-600">+3点</span></li>
                  <li>• 人狼を指したプレイヤー: <span className="font-bold text-blue-600">+1点</span></li>
                  <li>• 他の村人: <span className="font-bold text-gray-600">0点</span></li>
                </ul>
              </div>
              <div className="bg-white p-2 rounded border border-blue-300 mt-2">
                <p className="text-xs text-blue-700">
                  <span className="font-bold">💡 ポイント:</span> 人狼を指したプレイヤーは勝敗に関係なく+1点獲得できます！
                </p>
              </div>
            </div>
          </section>

          {/* 禁止事項 */}
          <section className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
            <h3 className="text-xl font-bold text-red-700 mb-3 flex items-center gap-2">
              🚫 禁止事項
            </h3>
            <div className="text-gray-700">
              <p className="font-bold mb-2">軸の名前を直接言ってはいけません！</p>
              <p className="text-sm mb-2">
                <span className="text-red-600 font-bold">NG例:</span> 「この軸は『甘い-辛い』だよね」
              </p>
              <p className="text-sm">
                <span className="text-green-600 font-bold">OK例:</span> 「このカードはこっち側に置きたい」「これは中央寄りかな」
              </p>
            </div>
          </section>

          {/* コツとヒント */}
          <section>
            <h3 className="text-xl font-bold text-purple-700 mb-3 flex items-center gap-2">
              💡 コツとヒント
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span><span className="font-bold">村人:</span> 他のプレイヤーのカード配置を観察し、不自然な位置に置いている人を見つけましょう。</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600">•</span>
                <span><span className="font-bold">人狼:</span> 他のプレイヤーの配置を真似しつつ、自然に見えるよう議論に参加しましょう。</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>カードの配置理由を説明することで、互いの軸を推理できます。</span>
              </li>
            </ul>
          </section>

          {/* 閉じるボタン */}
          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
