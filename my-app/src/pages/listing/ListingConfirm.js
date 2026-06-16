import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './Listing.css';

// ListingConfirm: 出品フロー Step 2（確認・カテゴリ名→ID変換・POST）

function ListingConfirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { categories } = useAuth(); // カテゴリ名→IDの変換に使う
  const [isSubmitting, setIsSubmitting] = useState(false);

  // location.state がない（直接URLアクセス等）場合のフォールバック
  const { images, title, description, condition, price, selectedCategories, tags } = location.state || {
    images: [], title: '', description: '', condition: '', price: '', selectedCategories: [], tags: []
  };

  // 出品確定: カテゴリ名をIDに変換してバックエンドに送信
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // カテゴリは名前で管理しているが、APIにはIDで送る
      const categoryIds = selectedCategories
        .map(name => categories.find(c => c.name === name)?.category_id)
        .filter(Boolean); // IDが見つからない場合（異常系）は除外

      await apiFetch('/api/products', {
        method: 'POST',
        body: {
          name: title,
          price: Number(price),
          detail: description,
          condition: condition || '',
          category_ids: categoryIds,
          tags: tags || [],
          image_urls: images,
        },
      });
      alert('出品が完了しました！');
      navigate('/'); // ホームへ
    } catch (err) {
      alert(`出品に失敗しました: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="listing-container">
      <h2 className="listing-title">出品内容の確認</h2>

      <div className="confirm-box">

        {/* 画像プレビュー（1枚目に「メイン」バッジ）*/}
        <div className="form-group">
          <span className="confirm-label">商品画像</span>
          <div className="image-preview-grid" style={{ marginTop: '6px' }}>
            {images.map((img, i) => (
              <div key={i} className="preview-item">
                <img src={img} alt={`確認用-${i}`} />
                {i === 0 && <span className="main-badge">メイン</span>}
              </div>
            ))}
            {images.length === 0 && <span className="no-cat">画像がありません</span>}
          </div>
        </div>

        {/* 商品名 */}
        <div className="confirm-item">
          <span className="confirm-label">商品名</span>
          <p className="confirm-value">{title || <span className="no-cat">未入力</span>}</p>
        </div>

        {/* 詳細説明 */}
        <div className="confirm-item">
          <span className="confirm-label">詳細説明</span>
          {/* whitespace-pre クラスで改行を保持 */}
          <p className="confirm-value whitespace-pre">{description || <span className="no-cat">未入力</span>}</p>
        </div>

        {/* 状態 */}
        <div className="confirm-item">
          <span className="confirm-label">商品の状態</span>
          <p className="confirm-value">{condition || <span className="no-cat">未選択</span>}</p>
        </div>

        {/* 価格 */}
        <div className="confirm-item">
          <span className="confirm-label">価格</span>
          <p className="confirm-value price-text">
            {price ? `¥${Number(price).toLocaleString()}` : <span className="no-cat">未入力</span>}
          </p>
        </div>

        {/* 選択カテゴリ（チップ形式）*/}
        <div className="confirm-item">
          <span className="confirm-label">選択したカテゴリ</span>
          <div className="category-tags" style={{ marginTop: '4px' }}>
            {selectedCategories.map((cat, i) => (
              <span key={i} className="cat-tag-badge">{cat}</span>
            ))}
            {selectedCategories.length === 0 && <span className="no-cat">未選択</span>}
          </div>
        </div>

        {/* 検索用タグ（AI生成の場合のみ表示）*/}
        {tags && tags.length > 0 && (
          <div className="confirm-item">
            <span className="confirm-label">検索用タグ</span>
            <div className="category-tags" style={{ marginTop: '4px' }}>
              {tags.map((tag, i) => (
                <span key={i} className="cat-tag-badge">#{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="action-buttons-row">
        {/* 修正する: 入力値を state に乗せて ListingInput に戻る */}
        <button
          type="button"
          className="back-button"
          onClick={() => navigate('/listing', {
            state: { images, title, description, condition, price, selectedCategories, tags }
          })}
        >
          修正する
        </button>

        <button type="button" className="submit-button" disabled={isSubmitting} onClick={handleFinalSubmit}>
          {isSubmitting ? '出品中…' : 'この内容で出品する'}
        </button>
      </div>
    </div>
  );
}

export default ListingConfirm;
