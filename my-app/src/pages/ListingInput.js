import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { uploadProductImage } from '../api/storage';
import { useAuth } from '../context/AuthContext';
import './Listing.css';

function ListingInput() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categories } = useAuth();
  const fileInputRef = useRef(null);

  // 確認画面から戻ってきたデータ（location.state）があればそれを初期値にする
  const savedData = location.state || {};

  const [images, setImages] = useState(savedData.images || []);
  const [title, setTitle] = useState(savedData.title || '');
  const [description, setDescription] = useState(savedData.description || '');
  const [price, setPrice] = useState(savedData.price || '');
  const [selectedCategories, setSelectedCategories] = useState(savedData.selectedCategories || []);
  const [tags, setTags] = useState(savedData.tags || []);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 📷 実ファイルをFirebase Storage(GCS)へアップロード
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        urls.push(await uploadProductImage(file));
      }
      setImages([...images, ...urls]);
    } catch (err) {
      alert(`画像のアップロードに失敗しました: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // 🤖 Geminiに商品名・説明文・カテゴリ・タグ・参考価格を自動生成してもらう
  const handleAiAutoFill = async () => {
    if (images.length === 0) return;
    setIsAiLoading(true);
    try {
      const result = await apiFetch('/api/gemini/listing', {
        method: 'POST',
        body: { image_url: images[0] },
      });
      setTitle(result.title || '');
      setDescription(result.description || '');
      if (result.price_suggestion > 0) setPrice(String(result.price_suggestion));
      // 返ってきたカテゴリ名のうちマスターに存在するものだけ選択状態にする
      const validNames = categories.map(c => c.name);
      setSelectedCategories((result.categories || []).filter(name => validNames.includes(name)));
      setTags(result.tags || []);
    } catch (err) {
      alert(`AI解析に失敗しました: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // カテゴリチップの選択トグル
  const handleCategoryToggle = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // 確認画面への遷移
  const handleGoToConfirm = () => {
    navigate('/listing/confirm', {
      state: { images, title, description, price, selectedCategories, tags }
    });
  };

  const hasImages = images.length > 0;
  const categoryNames = categories.map(c => c.name);

  return (
    <div className="listing-container">
      <h2 className="listing-title">商品の出品</h2>

      <div className="listing-form">

        {/* 📷 画像アップロードエリア */}
        <div className="form-group">
          <label className="form-label">商品画像（1枚目がメイン）</label>
          <div className="image-upload-wrapper-row">
            <div className="image-preview-grid">
              {images.map((img, i) => (
                <div key={i} className="preview-item">
                  <img src={img} alt="プレビュー" />
                  {i === 0 && <span className="main-badge">メイン</span>}
                  <button type="button" className="delete-img-btn" onClick={() => handleDeleteImage(i)}>×</button>
                </div>
              ))}
            </div>
            <div className="upload-box-placeholder" onClick={() => !isUploading && fileInputRef.current?.click()}>
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
        </div>

        {/* 🤖 Gemini AI 自動入力トリガーセクション */}
        <div className="ai-assistant-box">
          <div className="ai-assistant-info">
            <span className="ai-sparkle-icon">✨</span>
            <p className="ai-assistant-text">
              画像をアップロードすると、Geminiが商品名・説明文・カテゴリを自動生成します。
            </p>
          </div>
          <button
            type="button"
            className={`ai-autofill-btn ${hasImages ? 'activated' : ''}`}
            disabled={!hasImages || isAiLoading}
            onClick={handleAiAutoFill}
          >
            {isAiLoading ? (
              <span className="ai-loading-spinner">AIが画像を解析中...</span>
            ) : (
              "✨ Geminiに商品説明を任せる"
            )}
          </button>
        </div>

        {/* ✍️ 商品名入力 */}
        <div className="form-group">
          <label className="form-label">商品名</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="商品名を入力（AI自動入力も可能）"
          />
        </div>

        {/* 📝 説明文入力 */}
        <div className="form-group">
          <label className="form-label">商品の説明</label>
          <textarea
            className="form-textarea"
            rows="6"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="商品の状態、サイズ、購入時期など（AI自動入力も可能）"
          />
        </div>

        {/* 🏷️ カテゴリ選択チップ */}
        <div className="form-group">
          <label className="form-label">おすすめカテゴリ（複数選択可）</label>
          <div className="category-chip-grid">
            {categoryNames.map((cat) => {
              const isActive = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  className={`category-chip ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategoryToggle(cat)}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 🔖 検索用タグ（AIが自動生成。手動でも追加可能） */}
        {tags.length > 0 && (
          <div className="form-group">
            <label className="form-label">検索用タグ（AI生成）</label>
            <div className="category-tags">
              {tags.map((tag, i) => (
                <span key={i} className="cat-tag-badge">
                  #{tag}
                  <button
                    type="button"
                    style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                    onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                  >×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 💰 価格入力 */}
        <div className="form-group">
          <label className="form-label">販売価格</label>
          <input
            type="number"
            className="form-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="¥ 金額を入力"
          />
        </div>

        {/* 次へ進むボタン */}
        <button
          type="button"
          className="next-confirm-button"
          disabled={!title || !description || !price || !hasImages}
          onClick={handleGoToConfirm}
        >
          入力内容を確認する
        </button>

      </div>
    </div>
  );
}

export default ListingInput;
