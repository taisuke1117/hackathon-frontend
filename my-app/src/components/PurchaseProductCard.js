import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PurchaseProductCard.css';

export function PurchaseProductCard({ id, title, price, image, status }) {
  const navigate = useNavigate();

  // ステータスに応じたバッジの日本語表示とCSSクラス名を設定
  const getStatusConfig = (status) => {
    switch (status) {
      case 'unshipped':
        return { text: '未発送', className: 'status-unshipped' };
      case 'shipping':
        return { text: '配達中', className: 'status-shipping' };
      case 'received':
        return { text: '受取済み', className: 'status-received' };
      default:
        return { text: '不明', className: '' };
    }
  };

  const statusConfig = getStatusConfig(status);

  // カード全体をクリックしたら、これから作る購入詳細ページへ遷移
  const handleCardClick = () => {
    navigate(`/mypage/purchases/${id}`);
  };

  return (
    <div className="purchase-card" onClick={handleCardClick}>
      <img src={image} alt={title} className="purchase-card-img" />
      
      <div className="purchase-card-info">
        <span className={`purchase-status-badge ${statusConfig.className}`}>
          {statusConfig.text}
        </span>
        <h3 className="purchase-card-title">{title}</h3>
        <p className="purchase-card-price">¥{price.toLocaleString()}</p>
      </div>

      <div className="purchase-card-arrow">＞</div>
    </div>
  );
}