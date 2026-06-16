import React, { useRef } from 'react';
import { uploadProductImage } from '../../api/storage';

// ImageUploadSection: GCSへの画像アップロード・プレビュー・削除（出品フォーム用）

export function ImageUploadSection({ images, onChange, isUploading, setIsUploading }) {
  const fileInputRef = useRef(null);

  // 1枚ずつ順番にアップロード（並列にしないのは GCS 負荷考慮）
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        urls.push(await uploadProductImage(file));
      }
      onChange([...images, ...urls]);
    } catch (err) {
      alert(`画像のアップロードに失敗しました: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // 同じファイルを再選択可能にするためリセット
    }
  };

  const handleDelete = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="image-upload-wrapper-row">
      {/* アップロード済み画像のプレビューグリッド */}
      <div className="image-preview-grid">
        {images.map((img, i) => (
          <div key={i} className="preview-item">
            <img src={img} alt="プレビュー" />
            {/* 1枚目は「メイン画像」として強調 */}
            {i === 0 && <span className="main-badge">メイン</span>}
            {/* ×ボタンで個別削除 */}
            <button
              type="button"
              className="delete-img-btn"
              onClick={() => handleDelete(i)}
            >×</button>
          </div>
        ))}
      </div>

      {/* 追加ボタン（アップロード中は押せない）*/}
      <div
        className="upload-box-placeholder"
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? '…' : '＋'}
      </div>

      {/* 非表示の file input（複数選択可）*/}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </div>
  );
}
