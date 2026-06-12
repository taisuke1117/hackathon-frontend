import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ImageUploadSection } from '../../components/listing/ImageUploadSection';
import { CategoryChipSelector } from '../../components/listing/CategoryChipSelector';
import './Listing.css';

const CONDITIONS = [
  '新品、未使用',
  '未使用に近い',
  '目立った傷や汚れなし',
  'やや傷や汚れあり',
  '傷や汚れあり',
  '全体的に状態が悪い',
];

function ListingInput() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categories } = useAuth();

  const savedData = location.state || {};

  const [images, setImages] = useState(savedData.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState(savedData.title || '');
  const [description, setDescription] = useState(savedData.description || '');
  const [condition, setCondition] = useState(savedData.condition || '');
  const [price, setPrice] = useState(savedData.price || '');
  const [selectedCategories, setSelectedCategories] = useState(savedData.selectedCategories || []);
  const [tags, setTags] = useState(savedData.tags || []);
  const [isAiLoading, setIsAiLoading] = useState(false);

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
      if (result.condition) setCondition(result.condition);
      if (result.price_suggestion > 0) setPrice(String(result.price_suggestion));
      const validNames = categories.map(c => c.name);
      setSelectedCategories((result.categories || []).filter(name => validNames.includes(name)));
      setTags(result.tags || []);
    } catch (err) {
      alert(`AI解析に失敗しました: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGoToConfirm = () => {
    navigate('/listing/confirm', {
      state: { images, title, description, condition, price, selectedCategories, tags },
    });
  };

  const hasImages = images.length > 0;

  return (
    <div className="listing-container">
      <h2 className="listing-title">商品の出品</h2>
      <div className="listing-form">

        <div className="form-group">
          <label className="form-label">商品画像（1枚目がメイン）</label>
          <ImageUploadSection
            images={images}
            onChange={setImages}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        </div>

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
            {isAiLoading ? <span className="ai-loading-spinner">AIが画像を解析中...</span> : '✨ Geminiに商品説明を任せる'}
          </button>
        </div>

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

        <div className="form-group">
          <label className="form-label">商品の状態</label>
          <select className="form-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="">選択してください</option>
            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">おすすめカテゴリ（複数選択可）</label>
          <CategoryChipSelector selected={selectedCategories} onChange={setSelectedCategories} />
        </div>

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
