import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PurchaseProductCard } from '../components/PurchaseProductCard'; // 💡 パスは環境に合わせてね
import './Purchase.css';

function Purchases() {
  const navigate = useNavigate();

  const [hideReceived, setHideReceived] = useState(false);

  // 📦 購入履歴のダミーデータ
  // ステータスは 'unshipped' (未発送), 'shipping' (配達中), 'received' (受取済み)
  const [purchasedHistory] = useState([
    {
      id: "p_101",
      title: "オリンパス OMD デジタルカメラ",
      price: 42000,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300",
      status: "unshipped"
    },
    {
      id: "p_102",
      title: "高解像度 フルサイズ単焦点レンズ",
      price: 68000,
      image: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=300",
      status: "shipping"
    },
    {
      id: "p_103",
      title: "ヴィンテージ レザーカメラストラップ",
      price: 5800,
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300",
      status: "received"
    }
  ]);

  const displayedHistory = hideReceived
    ? purchasedHistory.filter(item => item.status !== 'received')
    : purchasedHistory;

  return (
    <div className="purchases-page-container">
      {/* ヘッダー */}
      <div className="purchases-page-header">
        <button className="purchases-page-back-btn" onClick={() => navigate(-1)}>✕</button>
        <h1 className="purchases-page-title">購入した商品</h1>
      </div>

      <div className="purchases-filter-bar">
        <label className="filter-toggle-label">
          <input 
            type="checkbox" 
            checked={hideReceived}
            onChange={(e) => setHideReceived(e.target.checked)}
            className="filter-checkbox"
          />
          <span className="filter-text">受取済みを非表示</span>
        </label>
      </div>

      {/* リストエリア */}
      <div className="purchases-page-content">
        {purchasedHistory.length === 0 ? (
          <div className="purchases-empty-state">
            <p className="empty-text">購入履歴はまだありません。</p>
            <button className="empty-shop-btn" onClick={() => navigate('/')}>
              お買い物を始める
            </button>
          </div>
        ) : (
          <div className="purchases-list-layout">
            {purchasedHistory.map((item) => (
              <PurchaseProductCard 
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                image={item.image}
                status={item.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Purchases;