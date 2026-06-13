import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './AvatarCropModal.css';

// ─────────────────────────────────────────────────────────
// AvatarCropModal: プロフィール画像の切り抜きモーダル
//
// Account.js から呼ばれ、選択した画像を円形にトリミングして Blob を返す。
//
// 技術:
//   react-easy-crop ライブラリでインタラクティブなクロップUIを提供。
//   確定ボタン押下後は canvas を使って選択エリアをピクセル単位で切り出し、
//   JPEG Blob に変換して onCropped コールバックに渡す。
//
// Props:
//   imageSrc    : 元画像の DataURL（FileReader で生成）
//   onClose()   : キャンセル時のコールバック
//   onCropped(blob): 切り抜き完了後のコールバック（Blob を渡す）
//
// canvas での切り出しフロー:
//   1. imageSrc を Image オブジェクトとして読み込む
//   2. croppedAreaPixels（ピクセル座標）で drawImage
//   3. 400×400 の正方形に統一（アイコンには十分な解像度）
//   4. canvas.toBlob で JPEG Blob を生成
// ─────────────────────────────────────────────────────────

export function AvatarCropModal({ imageSrc, onClose, onCropped }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  // croppedAreaPixels: react-easy-crop が onCropComplete で渡す切り取り範囲（ピクセル座標）
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // onCropComplete: ドラッグ/ズームが完了するたびに呼ばれる
  // _ は相対座標（パーセンテージ）で不要なので無視し、ピクセル座標だけ保存する
  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  // 切り抜き確定: canvas で切り出して JPEG Blob に変換
  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      // DataURL から Image オブジェクトを生成（非同期）
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageSrc;
      });

      const size = 400; // 出力サイズ: 400×400px
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // 選択範囲（croppedAreaPixels）を canvas 全体に描画
      ctx.drawImage(
        image,
        croppedAreaPixels.x,     // 元画像の切り取り開始 X
        croppedAreaPixels.y,     // 元画像の切り取り開始 Y
        croppedAreaPixels.width, // 切り取り幅
        croppedAreaPixels.height,// 切り取り高さ
        0, 0, size, size,        // canvas の描画先（全体）
      );

      // JPEG, 品質 0.9 で Blob 化
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      onCropped(blob); // 親（Account.js）に渡す
    } catch (err) {
      alert(`切り抜きに失敗しました: ${err.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-card">
        <h3 className="crop-modal-title">写真の位置を調整</h3>

        {/* react-easy-crop: ドラッグ移動・ピンチ/スライダーズーム対応 */}
        <div className="crop-area-wrapper">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}           // 1:1 正方形クロップ
            cropShape="round"    // 円形にクロップ
            showGrid={false}     // グリッド線は非表示
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* ズームスライダー */}
        <div className="crop-zoom-row">
          <span className="crop-zoom-label">縮小</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="crop-zoom-slider"
          />
          <span className="crop-zoom-label">拡大</span>
        </div>

        <div className="crop-modal-actions">
          <button type="button" className="crop-cancel-btn" onClick={onClose}>キャンセル</button>
          <button type="button" className="crop-confirm-btn" disabled={isProcessing} onClick={handleConfirm}>
            {isProcessing ? '処理中…' : 'この範囲で決定'}
          </button>
        </div>
      </div>
    </div>
  );
}
