import React, { useRef } from 'react';
import { uploadProductImage } from '../../api/storage';

/**
 * 画像選択・アップロード・プレビュー。ListingInputで使用。
 * props: images(string[]), onChange(string[]), isUploading, setIsUploading
 */
export function ImageUploadSection({ images, onChange, isUploading, setIsUploading }) {
  const fileInputRef = useRef(null);

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
      e.target.value = '';
    }
  };

  const handleDelete = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="image-upload-wrapper-row">
      <div className="image-preview-grid">
        {images.map((img, i) => (
          <div key={i} className="preview-item">
            <img src={img} alt="プレビュー" />
            {i === 0 && <span className="main-badge">メイン</span>}
            <button
              type="button"
              className="delete-img-btn"
              onClick={() => handleDelete(i)}
            >×</button>
          </div>
        ))}
      </div>
      <div
        className="upload-box-placeholder"
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? '…' : '＋'}
      </div>
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
