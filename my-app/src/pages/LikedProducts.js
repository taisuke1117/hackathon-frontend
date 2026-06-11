import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {ProductCard} from '../components/ProductCard'; // 💡 既存のProductCardのパスに合わせて調整してください
import './LikedProducts.css';

function LikedProducts() {
  const navigate = useNavigate();

  // 📦 ユーザーが「いいね」した商品のダミーデータ
  const [likedProducts] = useState([
    {
      id: "1",
      title: "オリンパス OMD デジタルカメラ",
      price: 42000,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300",
    },
    {
      id: "2",
      title: "高解像度 フルサイズ単焦点レンズ",
      price: 68000,
      image: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=300",
    },
    {
      id: "3",
      title: "ヴィンテージ レザーカメラストラップ",
      price: 5800,
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300",
    },
    {
      id: "4",
      title: "アルミ製 軽量カメラ三脚",
      price: 12000,
      image: "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=300",
    }
  ]);

  return (
    <div className="liked-page-container">
      {/* 🌌 ヘッダー */}
      <div className="liked-page-header">
        <button 
          className="liked-page-back-btn" 
          onClick={() => navigate(-1)}
          aria-label="戻る"
        >
          ✕
        </button>
        <h1 className="liked-page-title">いいね！一覧</h1>
      </div>

      {/* 🧱 メインコンテンツ */}
      <div className="liked-page-content">
        {likedProducts.length === 0 ? (
          <div className="liked-empty-state">
            <p className="empty-text">いいねした商品はまだありません。</p>
            <button className="empty-discover-btn" onClick={() => navigate('/')}>
              商品を探す
            </button>
          </div>
        ) : (
          <div className="liked-products-grid">
            {likedProducts.map((product) => (
              /* 💡 ご指定のProps形式に修正完了 */
              <ProductCard 
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                image={product.image}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LikedProducts;