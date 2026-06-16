import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PurchaseProductCard.css';

export function PurchaseProductCard({ id, title, price, image, status, reviewed, onReview }) {
  const navigate = useNavigate();

  // APIの実値に合わせたステータス判定
  // unshipped: 未発送 / shipped+未評価: 評価待ち / それ以外: 受取済み
  const getStatusConfig = (status, reviewed) => {
    if (status === 'unshipped') return { text: '未発送', className: 'status-unshipped' };
    if (status === 'shipped' && !reviewed) return { text: '評価待ち', className: 'status-shipping' };
    return { text: '受取済み', className: 'status-received' };
  };

  const statusConfig = getStatusConfig(status, reviewed);

  return (
    <div className="purchase-card-vertical" onClick={() => navigate(`/product/${id}`)}>
      {/* 画像（正方形）＋ ステータスバッジをオーバーレイ */}
      <div className="purchase-image-wrapper">
        <img src={image} alt={title} className="purchase-image" />
        <span className={`purchase-status-badge ${statusConfig.className}`}>
          {statusConfig.text}
        </span>
      </div>

      {/* 価格・タイトル行 */}
      <div className="purchase-info-row">
        <div className="purchase-text-meta">
          <span className="purchase-price">¥{Number(price).toLocaleString()}</span>
          <span className="purchase-title">{title}</span>
        </div>
      </div>

      {/* 評価ボタン: onReview が渡され、発送済み未評価のときのみ表示 */}
      {onReview && status === 'shipped' && !reviewed && (
        <button
          type="button"
          className="purchase-review-btn"
          onClick={(e) => { e.stopPropagation(); onReview(); }}
        >
          ⭐ 受取評価
        </button>
      )}
    </div>
  );
}
