import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './ProductEdit.css';

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories } = useAuth();

  const [product, setProduct] = useState(null); // APIから取得した元データ
  const [formData, setFormData] = useState({ title: '', price: '', description: '' });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiFetch(`/api/products/${id}`)
      .then(detail => {
        setProduct(detail);
        setFormData({
          title: detail.name,
          price: detail.price,
          description: detail.detail,
        });
        setSelectedCategoryIds(detail.categories.map(c => c.category_id));
      })
      .catch(err => {
        alert(`読み込みに失敗しました: ${err.message}`);
        navigate(-1);
      });
  }, [id, navigate]);

  if (!product) return <div className="app-center-text">読み込み中…</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  };

  // 保存（更新処理）
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: {
          name: formData.title,
          price: Number(formData.price),
          detail: formData.description,
          category_ids: selectedCategoryIds,
          tags: product.tags || [],
          image_urls: product.images,
        },
      });
      alert("商品情報を更新しました！");
      navigate(`/deals/manage/${id}`);
    } catch (err) {
      alert(`更新に失敗しました: ${err.message}`);
      setIsSaving(false);
    }
  };

  // 削除
  const handleDelete = async () => {
    if (!window.confirm("この出品を完全に削除してもよろしいですか？")) return;
    try {
      await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      alert("商品を削除しました。");
      navigate('/deals');
    } catch (err) {
      alert(`削除に失敗しました: ${err.message}`);
    }
  };

  return (
    <div className="edit-page-container">
      <div className="edit-header">
        <button type="button" className="edit-cancel-btn" onClick={() => navigate(-1)}>
          キャンセル
        </button>
        <h2 className="edit-page-title">商品の編集</h2>
        <div style={{ width: '60px' }}></div>
      </div>

      <form className="edit-form" onSubmit={handleSave}>

        {/* 📷 画像プレビュー */}
        <div className="edit-section">
          <label className="edit-label">出品画像</label>
          <div className="edit-image-preview">
            {product.images[0] && <img src={product.images[0]} alt="プレビュー" />}
          </div>
        </div>

        {/* 📝 商品名入力 */}
        <div className="edit-section">
          <label className="edit-label">商品名</label>
          <input
            type="text"
            name="title"
            className="edit-input"
            value={formData.title}
            onChange={handleChange}
            placeholder="商品名を入力してください"
            required
          />
        </div>

        {/* 📂 カテゴリ選択 */}
        <div className="edit-section">
          <label className="edit-label">カテゴリー（複数選択可）</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {categories.map(cat => {
              const isActive = selectedCategoryIds.includes(cat.category_id);
              return (
                <button
                  key={cat.category_id}
                  type="button"
                  className={`category-chip ${isActive ? 'active' : ''}`}
                  style={{
                    padding: '6px 14px', borderRadius: '16px', cursor: 'pointer',
                    border: isActive ? '1.5px solid var(--primary, #4fc3f7)' : '1px solid #555',
                    background: isActive ? 'rgba(79,195,247,0.15)' : 'transparent',
                    color: 'inherit',
                  }}
                  onClick={() => handleCategoryToggle(cat.category_id)}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 💬 商品の説明 */}
        <div className="edit-section">
          <label className="edit-label">商品の説明</label>
          <textarea
            name="description"
            className="edit-textarea"
            rows="8"
            value={formData.description}
            onChange={handleChange}
            placeholder="商品の状態、サイズ、色、素材などについて詳しく書きましょう"
          ></textarea>
        </div>

        {/* 💰 販売価格 */}
        <div className="edit-section no-border">
          <label className="edit-label">販売価格 (¥300〜9,999,999)</label>
          <div className="price-input-wrapper">
            <span className="price-currency">¥</span>
            <input
              type="number"
              name="price"
              className="edit-price-input"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              required
            />
          </div>
        </div>

        {/* 🚀 アクションボタン固定フッター */}
        <div className="edit-actions-footer">
          <button type="submit" className="edit-save-btn" disabled={isSaving}>
            {isSaving ? '保存中…' : '変更を保存する'}
          </button>
          <button type="button" className="edit-delete-btn" onClick={handleDelete}>
            この出品を削除する
          </button>
        </div>

      </form>
    </div>
  );
}

export default ProductEdit;
