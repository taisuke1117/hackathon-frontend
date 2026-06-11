import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LikeButton } from './LikeButton'; // 💡 共通いいねを使用
import './ManagedProductCard.css';

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

  // ステータスに応じた日本語テキストと色バッジの判定
  const getStatusMeta = (status) => {
    switch (status) {
      case 'available':
        return { text: '出品中', className: 'status-available' };
      case 'processing':
        return { text: '取引中(未配達)', className: 'status-processing' };
      case 'shipped':
        return { text: '配達中', className: 'status-shipped' };
      case 'completed':
        return { text: '売却済み(配達済)', className: 'status-completed' };
      default:
        return { text: '出品中', className: 'status-available' };
    }
  };

  const statusMeta = getStatusMeta(status);

  return (
    <div className="managed-card" onClick={() => navigate(`/deals/manage/${id}`)}>
      
      {/* 📷 画像エリア */}
      <div className="managed-image-wrapper">
        <img src={image} alt={title || "管理商品"} className="managed-image" />

        {/* 💬 未読チャットバッジ（これは写真の右上のままでOKなのでここに残します） */}
        {unreadChatCount > 0 && (
          <span className="managed-unread-badge">
            {unreadChatCount}
          </span>
        )}
      </div> {/* 💡 写真の箱はここで終わり！ */}

      {/* 🏷️ 【修正】ステータスバッジを写真の箱の「外（下）」へ引っ越し */}
      <div className={`managed-status-badge ${statusMeta.className}`}>
        {statusMeta.text}
      </div>

      {/* 📊 下部データエリア */}
      <div className="managed-info-row">
        <div className="managed-price-area">
          <span className="managed-price">¥{Number(price).toLocaleString()}</span>
        </div>
        
        {/* 💡 いいね数 */}
        <div className="managed-like-view-only">
          <LikeButton 
            isLikedInitial={likeCount > 0} /* 💡 いいねのミントブルー発光をしっかり拝むため、1以上のときは最初からアクティブ表示にする調整 */
            likeCountInitial={likeCount} 
            onToggle={() => {}} 
          />
        </div>
      </div>

    </div>
  );
};