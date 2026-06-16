import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './AvatarCropModal.css';

// AvatarCropModal: react-easy-crop で円形トリミング → canvas で JPEG Blob 生成

export function AvatarCropModal({ imageSrc, onClose, onCropped }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  // croppedAreaPixels: react-easy-crop が渡すピクセル座標（第2引数のみ使う）
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // _ は相対座標（%）で不要なので無視
  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  // canvas でピクセル切り出し → JPEG Blob に変換
  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageSrc;
      });

      const size = 400;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0, 0, size, size,
      );

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      onCropped(blob);
    } catch (err) {
      alert(`切り抜きに失敗しました: ${err.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-card">
        <h3 className="crop-modal-title">写真の位置を調整</h3>

        <div className="crop-area-wrapper">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
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
