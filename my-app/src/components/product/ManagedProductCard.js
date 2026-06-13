import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LikeButton } from '../ui/LikeButton';
import './ManagedProductCard.css';

// ─────────────────────────────────────────────────────────
// ManagedProductCard: 出品者視点の商品カード（取引管理ページ用）
//
// 通常の ProductCard との違い:
//   - クリックで /deals/manage/:id（取引管理画面）に遷移する
//   - ステータスバッジ（出品中 / 取引中 / 配達中 / 売却済み）を表示する
//   - 未読チャット数バッジを画像右上に表示する
//   - LikeButton は表示専用（onToggle が空なのでAPIは叩かない）
//
// Props:
//   id             : 商品ID
//   image          : サムネイル画像URL
//   price          : 価格
//   title          : 商品名（alt テキスト）
//   status         : 商品ステータス文字列
//   likeCount      : いいね数
//   unreadChatCount: この商品の未読チャット数
// ─────────────────────────────────────────────────────────

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

        {/* LikeButton は表示専用（onToggle が空なのでAPIは叩かない）*/}
        {/* likeCount > 0 のときはアクティブ色で表示して実感を出す */}
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
