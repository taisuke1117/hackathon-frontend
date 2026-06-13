import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PurchaseProductCard.css';

// ─────────────────────────────────────────────────────────
// PurchaseProductCard: 購入済み商品カード（汎用コンポーネント）
//
// 購入履歴一覧などで使う想定のカード。
// 現在は Purchase.js（購入履歴ページ）がインラインでカードを描画しているため、
// このコンポーネントは直接使われていないが再利用できる形で定義されている。
//
// ステータスのマッピング:
//   unshipped → 「未発送」
//   shipping  → 「配達中」
//   received  → 「受取済み」
//
// Props:
//   id     : 商品ID（クリック時の遷移先）
//   title  : 商品名
//   price  : 価格（数値）
//   image  : サムネイル画像URL
//   status : ステータス文字列
// ─────────────────────────────────────────────────────────

export function PurchaseProductCard({ id, title, price, image, status }) {
  const navigate = useNavigate();

  // ステータスに応じた表示設定
  const getStatusConfig = (status) => {
    switch (status) {
      case 'unshipped': return { text: '未発送',  className: 'status-unshipped' };
      case 'shipping':  return { text: '配達中',  className: 'status-shipping' };
      case 'received':  return { text: '受取済み', className: 'status-received' };
      default:          return { text: '不明',    className: '' };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    // カード全体クリックで購入詳細へ（将来追加予定のページ）
    <div className="purchase-card" onClick={() => navigate(`/mypage/purchases/${id}`)}>
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
