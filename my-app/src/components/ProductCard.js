import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LikeButton } from './LikeButton';
import './ProductCard.css';

export const ProductCard = ({ 
  id, 
  image, 
  price, 
  category, 
  title, 
  isLikedInitial = false, 
  likeCountInitial = 0, 
  onLikeToggle 
}) => {
  const navigate = useNavigate();

  // 💡 判定は不要になったので、押されたら一撃で「商品詳細」へ飛ばします
  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  const handleLikeToggleInsideCard = (nextLikedState) => {
    if (onLikeToggle) {
      onLikeToggle(id, nextLikedState);
    }
  };

  return (
    <div className="product-card">
      {/* 画像部分をクリックしたら詳細画面へ */}
      <div className="product-image-wrapper" onClick={handleCardClick}>
        <img src={image} alt={title || "商品画像"} className="product-image" />
      </div>
      
      <div className="product-info-row">
        {/* テキスト部分をクリックしても詳細画面へ */}
        <div className="product-text-meta" onClick={handleCardClick}>
          <span className="product-price">¥{Number(price).toLocaleString()}</span>
          <span className="product-category">{category}</span>
        </div>
        
        <div className="like-container">
          <LikeButton 
            isLikedInitial={isLikedInitial} 
            likeCountInitial={likeCountInitial} 
            onToggle={handleLikeToggleInsideCard} 
          />
        </div>
      </div>
    </div>
  );
};