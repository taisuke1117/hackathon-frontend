import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LikeButton } from '../../components/ui/LikeButton';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './ProductDetail.css';

function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { loginUser } = useAuth();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/api/products/${id}`)
      .then(setProduct)
      .catch(err => setError(err.message));
  }, [id]);

  if (error) return <div className="app-center-text">{error}</div>;
  if (!product) return <div className="app-center-text">読み込み中…</div>;

  const images = product.images.length > 0 ? product.images : [product.image_url].filter(Boolean);
  const isOwnProduct = loginUser && product.seller_id === loginUser.uid;
  const isAvailable = product.status === 'available';

  const handleScroll = (e) => {
    const width = e.target.clientWidth;
    const scrollLeft = e.target.scrollLeft;
    const newIndex = Math.round(scrollLeft / width);
    setCurrentImgIndex(newIndex);
  };

  const handleLikeToggle = async (isLiked) => {
    try {
      await apiFetch(`/api/products/${product.product_id}/like`, { method: isLiked ? 'POST' : 'DELETE' });
    } catch (err) {
      console.error('いいねの更新に失敗:', err);
    }
  };

  // チャット開始: ルームを取得or作成してから遷移
  const handleStartChat = async () => {
    if (isOwnProduct) {
      navigate(`/deals/manage/${product.product_id}`);
      return;
    }
    try {
      const res = await apiFetch('/api/chatrooms', { method: 'POST', body: { product_id: product.product_id } });
      navigate(`/chat/${product.product_id}/${res.chatroom_id}`);
    } catch (err) {
      alert(`チャットを開始できませんでした: ${err.message}`);
    }
  };

  return (
    <div className="detail-container">

      <div className="carousel-wrapper">
        <button
            type="button"
            className="detail-back-close-btn"
            onClick={() => navigate(-1)}
            aria-label="戻る"
        >
            ✕
        </button>
        <div className="image-swipe-track" onScroll={handleScroll}>
          {images.map((url, i) => (
            <img key={i} src={url} alt={`${product.name} - ${i+1}`} className="carousel-img" />
          ))}
        </div>
        <div className="carousel-dots">
          {images.map((_, i) => (
            <span key={i} className={`dot ${currentImgIndex === i ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      {/* ⚡ アクションバー */}
      <div className="action-row-bar">

        <div className="action-item-wrapper border-right">
          <LikeButton
            isLikedInitial={product.liked_by_me}
            likeCountInitial={product.likes_count}
            onToggle={handleLikeToggle}
          />
        </div>

        {/* 2. チャットボタン */}
        <button
          className="action-item-wrapper chat-action-btn border-right"
          onClick={handleStartChat}
        >
          <svg className="chat-icon-svg" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="action-label">チャット</span>
        </button>

        <div
          className="seller-action-block"
          onClick={() => navigate(`/user/profile/${product.seller_id}`)}
        >
          {product.seller?.icon_url
            ? <img src={product.seller.icon_url} alt="アバター" className="seller-mini-avatar" />
            : <div className="seller-mini-avatar" style={{ background: '#444' }} />}
          <div className="seller-mini-meta">
            <span className="seller-mini-name">{product.seller?.name || '出品者'}</span>
            <span className="seller-mini-rating">
              ★ {product.seller?.review_count > 0 ? product.seller.rating.toFixed(1) : '評価なし'}
            </span>
          </div>
          <span className="arrow-right-hint">＞</span>
        </div>

      </div>

      <div className="detail-info-content">
        <h1 className="detail-product-title">{product.name}</h1>
        <div className="detail-price-tag">¥{product.price.toLocaleString()}</div>

        {product.condition && (
          <div className="detail-section-block">
            <h3 className="detail-sub-title">商品の状態</h3>
            <p className="detail-condition-badge">{product.condition}</p>
          </div>
        )}

        <div className="detail-section-block">
          <h3 className="detail-sub-title">商品の説明</h3>
          <p className="detail-description-text" style={{ whiteSpace: 'pre-wrap' }}>{product.detail}</p>
        </div>

        <div className="detail-section-block">
          <h3 className="detail-sub-title">カテゴリー</h3>
          <div className="detail-category-path">
            {product.categories.map((cat, i) => (
              <span key={cat.category_id} className="path-node">
                {cat.name}{i < product.categories.length - 1 ? ' ＞ ' : ''}
              </span>
            ))}
            {product.categories.length === 0 && <span className="path-node">未分類</span>}
          </div>
        </div>
      </div>

      <div className="detail-fixed-purchase-footer">
        <div className="purchase-footer-inner">
          <div className="purchase-price-display">
            <span className="purchase-price-label">総額</span>
            <span className="purchase-price-amount">¥{product.price.toLocaleString()}</span>
          </div>
          {isOwnProduct ? (
            <button
              type="button"
              className="detail-primary-buy-btn"
              onClick={() => navigate(`/deals/manage/${product.product_id}`)}
            >
              出品を管理する
            </button>
          ) : (
            <button
              type="button"
              className="detail-primary-buy-btn"
              disabled={!isAvailable}
              onClick={() => navigate(`/checkout/${product.product_id}`)}
            >
              {isAvailable ? '購入手続きへ進む' : '売り切れました'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

export default ProductDetail;
