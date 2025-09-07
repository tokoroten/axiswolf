import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OnlinePlay() {
  const [showMiroInstructions, setShowMiroInstructions] = useState(false);
  const [showJamboardInstructions, setShowJamboardInstructions] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← トップに戻る
        </button>
        
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          オンラインプレイモード
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-600">
            🌐 オンラインボードを使った遊び方
          </h2>
          
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
            <p className="text-gray-700 mb-3">
              オンラインプレイモードでは、Miro、Google Jamboard、FigJamなどのオンラインホワイトボードサービスを使って、
              離れた場所にいる友達とアクシスウルフを楽しむことができます。
            </p>
            <p className="text-sm text-gray-600">
              ※事前にカード画像の準備が必要です
            </p>
          </div>

          <div className="space-y-6">
            {/* 準備するもの */}
            <section>
              <h3 className="text-lg font-bold text-purple-600 mb-3">📋 準備するもの</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>オンラインホワイトボードサービスのアカウント（Miro、Google Jamboard、FigJamなど）</li>
                <li>カード画像（40枚以上）- 商品、キャラクター、食べ物などの画像</li>
                <li>ビデオ通話ツール（Zoom、Discord、Google Meetなど）</li>
                <li>各プレイヤーのスマホ（軸を表示するため）</li>
              </ul>
            </section>

            {/* 遊び方の手順 */}
            <section>
              <h3 className="text-lg font-bold text-purple-600 mb-3">🎮 遊び方の手順</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                <li>
                  <strong>ボードの準備：</strong>
                  オンラインホワイトボードに4象限の軸を描きます
                </li>
                <li>
                  <strong>カードの配置：</strong>
                  カード画像をボードにアップロードし、山札エリアに配置します
                </li>
                <li>
                  <strong>ゲーム開始：</strong>
                  ホストがアクシスウルフでルームを作成し、各プレイヤーが参加します
                </li>
                <li>
                  <strong>軸の確認：</strong>
                  各プレイヤーは自分のスマホで軸を確認します（人狼は異なる軸を見ています）
                </li>
                <li>
                  <strong>カードの配布：</strong>
                  山札から各プレイヤーに5枚ずつカードを配ります（ドラッグ&ドロップ）
                </li>
                <li>
                  <strong>プレイ：</strong>
                  スタートプレイヤーから順番に、カードを4象限のいずれかに配置していきます
                </li>
              </ol>
            </section>

            {/* Miroテンプレート */}
            <section className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-purple-600 mb-3">🎨 Miroでの設定方法</h3>
              <button
                onClick={() => setShowMiroInstructions(!showMiroInstructions)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                {showMiroInstructions ? '詳細を隠す' : '詳細を表示'}
              </button>
              
              {showMiroInstructions && (
                <div className="mt-4 space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-bold mb-2">1. ボードの作成</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                      <li>新しいボードを作成</li>
                      <li>縦横の線を引いて4象限を作成</li>
                      <li>各象限にA、B、C、Dのラベルを追加</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-bold mb-2">2. エリアの設定</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                      <li>山札エリア：ボードの右側に設定</li>
                      <li>各プレイヤーの手札エリア：ボードの下部に設定</li>
                      <li>捨て札エリア：ボードの左側に設定</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-bold mb-2">3. カード画像のアップロード</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                      <li>画像をドラッグ&ドロップでアップロード</li>
                      <li>サイズを統一（推奨：100x100px程度）</li>
                      <li>山札エリアにまとめて配置</li>
                    </ul>
                  </div>
                </div>
              )}
            </section>

            {/* Google Jamboardテンプレート */}
            <section className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-green-600 mb-3">📊 Google Jamboardでの設定方法</h3>
              <button
                onClick={() => setShowJamboardInstructions(!showJamboardInstructions)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                {showJamboardInstructions ? '詳細を隠す' : '詳細を表示'}
              </button>
              
              {showJamboardInstructions && (
                <div className="mt-4 space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-bold mb-2">1. Jamの作成</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                      <li>新しいJamを作成</li>
                      <li>ペンツールで縦横の線を描画</li>
                      <li>テキストツールで象限ラベルを追加</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-bold mb-2">2. 画像の追加</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 ml-4">
                      <li>画像アイコンから画像を追加</li>
                      <li>Google画像検索やアップロードを使用</li>
                      <li>付箋機能でカード名を追加も可能</li>
                    </ul>
                  </div>
                </div>
              )}
            </section>

            {/* ヒントとコツ */}
            <section className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-yellow-700 mb-3">💡 ヒントとコツ</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>事前にカード画像を準備しておくとスムーズです</li>
                <li>各プレイヤーの色を決めておくと、誰がどのカードを置いたかわかりやすくなります</li>
                <li>タイマー機能を使って、1手番の制限時間を設けるのもおすすめです</li>
                <li>画面共有機能を使って、全員でボードを見ながらプレイしましょう</li>
                <li>チャット機能で議論の内容を記録すると、推理に役立ちます</li>
              </ul>
            </section>

            {/* カード画像の準備 */}
            <section className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-red-600 mb-3">🖼️ カード画像の準備方法</h3>
              <div className="space-y-2 text-gray-700">
                <p className="font-medium">以下の方法でカード画像を準備できます：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>商品画像：Amazon、楽天などから収集</li>
                  <li>キャラクター：公式サイトやWikipediaから</li>
                  <li>食べ物：フリー素材サイトから</li>
                  <li>AI生成：DALL-E、Midjourney、Stable Diffusionなど</li>
                </ul>
                <p className="text-sm text-red-600 mt-2">
                  ※著作権に注意し、個人利用の範囲でお楽しみください
                </p>
              </div>
            </section>

            {/* ゲーム開始ボタン */}
            <div className="flex flex-col gap-4 mt-8">
              <button
                onClick={() => navigate('/host')}
                className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-purple-600 transition-colors"
              >
                ホストとしてゲームを開始
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-blue-600 transition-colors"
              >
                プレイヤーとして参加
              </button>
            </div>
          </div>
        </div>

        {/* おすすめツール */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-600">
            🛠️ おすすめツール
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-purple-200 rounded-lg p-4">
              <h3 className="font-bold text-purple-600 mb-2">オンラインホワイトボード</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• <a href="https://miro.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Miro</a> - 高機能、テンプレート豊富</li>
                <li>• <a href="https://jamboard.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Jamboard</a> - 無料、シンプル</li>
                <li>• <a href="https://www.figma.com/figjam/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">FigJam</a> - 直感的、コラボ機能充実</li>
                <li>• <a href="https://excalidraw.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Excalidraw</a> - 無料、手描き風</li>
              </ul>
            </div>
            
            <div className="border-2 border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-600 mb-2">ビデオ通話</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• <a href="https://zoom.us" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Zoom</a> - 安定、画面共有</li>
                <li>• <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Discord</a> - ゲーマー向け、低遅延</li>
                <li>• <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Meet</a> - 無料、ブラウザ対応</li>
                <li>• <a href="https://teams.microsoft.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Microsoft Teams</a> - ビジネス向け</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}