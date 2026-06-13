import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LikeButton } from '../ui/LikeButton';
import './ProductCard.css';

// ─────────────────────────────────────────────────────────
// ProductCard: 商品一覧に表示する汎用カードコンポーネント
//
// 使用箇所: ホーム一覧・マイページ（購入履歴・いいね一覧）・
//           ユーザープロフィールページなど
//
// Props:
//   id              : 商品ID（クリック時の遷移に使う）
//   image           : サムネイル画像URL
//   price           : 価格（数値）
//   category        : カテゴリ名（テキスト表示）
//   title           : 商品名（alt テキスト）
//   isLikedInitial  : 初期いいね状態（default: false）
//   likeCountInitial: 初期いいね数（default: 0）
//   onLikeToggle    : 親コンポーネントへのコールバック（id, 次の状態 を渡す）
//                     ホームのように API 連携が不要な場面は渡さなくてよい
// ─────────────────────────────────────────────────────────

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

  // 商品詳細ページへ遷移
  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  // LikeButton からトグル後の状態が上がってくる
  // 親が onLikeToggle を渡した場合はそちらに転送（いいね一覧での楽観的UI削除など）
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
