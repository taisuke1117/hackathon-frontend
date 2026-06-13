import React, { useRef } from 'react';
import { uploadProductImage } from '../../api/storage';

// ─────────────────────────────────────────────────────────
// ImageUploadSection: 商品画像の選択・アップロード・プレビューコンポーネント
//
// 使用箇所: ListingInput（出品フォーム）
//
// 動作フロー:
//   1. 「＋」エリアをクリック → 非表示の input[type=file] を開く（複数選択可）
//   2. ファイルを選択 → 1枚ずつ順番に GCS へアップロード（sequential）
//   3. アップロード完了した URL を配列に追加して親に onChange で通知
//   4. 1枚目の画像に「メイン」バッジを表示（商品詳細のメイン画像になる）
//   5. ×ボタンで個別に削除可能
//
// Props:
//   images       : アップロード済み画像URLの配列（親が管理）
//   onChange     : 画像配列が変わったとき親に通知するコールバック
//   isUploading  : アップロード中フラグ（親が管理。中は＋を押せなくする）
//   setIsUploading: フラグを変更するための setter
// ─────────────────────────────────────────────────────────

export function ImageUploadSection({ images, onChange, isUploading, setIsUploading }) {
  // 非表示の file input を参照するための ref（ラベルクリックで開く）
  const fileInputRef = useRef(null);

  // ファイル選択後: 1枚ずつ順番にアップロード（並列にしないのは GCS 負荷考慮）
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        // uploadProductImage は GCS に直接アップロードしてパブリック URL を返す
        urls.push(await uploadProductImage(file));
      }
      onChange([...images, ...urls]); // 既存 + 新規 URL をまとめて親に渡す
    } catch (err) {
      alert(`画像のアップロードに失敗しました: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // 同じファイルを再選択可能にするためリセット
    }
  };

  // 個別削除: 対象インデックス以外の画像だけ残す
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
