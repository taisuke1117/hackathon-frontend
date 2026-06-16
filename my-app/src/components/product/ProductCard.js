import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LikeButton } from '../ui/LikeButton';
import './ProductCard.css';

// ProductCard: 商品一覧に表示する汎用カード（ホーム・購入履歴・いいね一覧など）

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
      {/* 画像: クリックで詳細へ */}
      <div className="product-image-wrapper" onClick={handleCardClick}>
        <img src={image} alt={title || "商品画像"} className="product-image" />
      </div>

      <div className="product-info-row">
        {/* 価格・カテゴリ: クリックで詳細へ */}
        <div className="product-text-meta" onClick={handleCardClick}>
          <span className="product-price">¥{Number(price).toLocaleString()}</span>
          <span className="product-category">{category}</span>
        </div>

        {/* いいねボタン: カードクリックと重ならないよう LikeButton 内で stopPropagation している */}
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
