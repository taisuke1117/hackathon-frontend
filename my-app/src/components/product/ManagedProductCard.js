import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LikeButton } from '../ui/LikeButton';
import './ManagedProductCard.css';

// ManagedProductCard: 出品者視点の商品カード（ステータスバッジ・未読チャット数付き）

export const ManagedProductCard = ({
  id,
  image,
  price,
  title,
  status,
  likeCount,
  unreadChatCount
}) => {
  const navigate = useNavigate();

  // ステータスに応じた表示テキストとCSSクラスを返す
  const getStatusMeta = (status) => {
    switch (status) {
      case 'available':   return { text: '出品中',           className: 'status-available' };
      case 'processing':  return { text: '取引中(未配達)',   className: 'status-processing' };
      case 'shipped':     return { text: '配達中',           className: 'status-shipped' };
      case 'completed':   return { text: '売却済み(配達済)', className: 'status-completed' };
      default:            return { text: '出品中',           className: 'status-available' };
    }
  };

  const statusMeta = getStatusMeta(status);

  return (
    // カード全体クリックで取引管理画面へ
    <div className="managed-card" onClick={() => navigate(`/deals/manage/${id}`)}>

      {/* 画像エリア */}
      <div className="managed-image-wrapper">
        <img src={image} alt={title || "管理商品"} className="managed-image" />

        {/* 未読チャット数バッジ（0なら非表示）*/}
        {unreadChatCount > 0 && (
          <span className="managed-unread-badge">{unreadChatCount}</span>
        )}
      </div>

      {/* ステータスバッジ（画像の下に表示）*/}
      <div className={`managed-status-badge ${statusMeta.className}`}>
        {statusMeta.text}
      </div>

      {/* 価格 + いいね数エリア */}
      <div className="managed-info-row">
        <div className="managed-price-area">
          <span className="managed-price">¥{Number(price).toLocaleString()}</span>
        </div>

        {/* LikeButton は表示専用: likeCount > 0 のときアクティブ色 */}
        <div className="managed-like-view-only">
          <LikeButton
            isLikedInitial={likeCount > 0}
            likeCountInitial={likeCount}
            onToggle={() => {}}
          />
        </div>
      </div>

    </div>
  );
};
