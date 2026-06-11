import React, { useState } from 'react';
import { useNavigate , useParams} from 'react-router-dom';
import { LikeButton } from '../components/LikeButton'; 
import './ProductDetail.css';

function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const product = {
    id: id,
    title: "オリンパス OMD デジタルカメラ",
    price: 42000,
    description: "状態：美品。動作確認済み。\n付属品：バッテリー、充電器、ストラップ。\nお散歩カメラに最適です。スワイプで詳細画像をご覧ください。",
    categories: ["家電・スマホ", "カメラ", "デジタルカメラ"],
    likeCount: 128,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600",
      "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=600"
    ],
    seller: {
      id: 99,
      name: "YUKI",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      rating: "4.9"
    }
  };

  const handleScroll = (e) => {
    const width = e.target.clientWidth;
    const scrollLeft = e.target.scrollLeft;
    const newIndex = Math.round(scrollLeft / width);
    setCurrentImgIndex(newIndex);
  };

  const handleLikeToggle = (isLiked) => {
    console.log(`商品詳細 - いいね状態変更: ${isLiked}`);
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
          {product.images.map((url, i) => (
            <img key={i} src={url} alt={`${product.title} - ${i+1}`} className="carousel-img" />
          ))}
        </div>
        <div className="carousel-dots">
          {product.images.map((_, i) => (
            <span key={i} className={`dot ${currentImgIndex === i ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      {/* ⚡ アクションバー */}
      <div className="action-row-bar">
        
        <div className="action-item-wrapper border-right">
          <LikeButton 
            isLikedInitial={false} 
            likeCountInitial={product.likeCount} 
            onToggle={handleLikeToggle} 
          />
        </div>

        {/* 2. チャットボタン */}
        <button 
          className="action-item-wrapper chat-action-btn border-right"
          /* 💡 修正箇所：購入者用チャットの新規作成用のパス `/chat/:productId/new` へ移動するように変更 */
          onClick={() => navigate(`/chat/${product.id}/new`)} 
        >
          <svg className="chat-icon-svg" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="action-label">チャット</span>
        </button>

        <div 
          className="seller-action-block"
          onClick={() => navigate(`/user/profile/${product.seller.id}`)} 
        >
          <img src={product.seller.avatar} alt="アバター" className="seller-mini-avatar" />
          <div className="seller-mini-meta">
            <span className="seller-mini-name">{product.seller.name}</span>
            <span className="seller-mini-rating">★ {product.seller.rating}</span>
          </div>
          <span className="arrow-right-hint">＞</span>
        </div>

      </div>

      <div className="detail-info-content">
        <h1 className="detail-product-title">{product.title}</h1>
        <div className="detail-price-tag">¥{product.price.toLocaleString()}</div>
        
        <div className="detail-section-block">
          <h3 className="detail-sub-title">商品の説明</h3>
          <p className="detail-description-text">{product.description}</p>
        </div>

        <div className="detail-section-block">
          <h3 className="detail-sub-title">カテゴリー</h3>
          <div className="detail-category-path">
            {product.categories.map((cat, i) => (
              <span key={i} className="path-node">
                {cat}{i < product.categories.length - 1 ? ' ＞ ' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="detail-fixed-purchase-footer">
        <div className="purchase-footer-inner">
          <div className="purchase-price-display">
            <span className="purchase-price-label">総額</span>
            <span className="purchase-price-amount">¥{product.price.toLocaleString()}</span>
          </div>
          <button 
            type="button" 
            className="detail-primary-buy-btn"
            onClick={() => {
              navigate(`/checkout/${product.id}`);
            }}
          >
            購入手続きへ進む
          </button>
        </div>
      </div>

    </div>
  );
}

export default ProductDetail;