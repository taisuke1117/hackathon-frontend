import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard'; // 共通コンポーネント
import './MyPage.css';

function MyPage() {
  const navigate = useNavigate();

  // 👤 ユーザー情報
  const currentUser = {
    name: "ガジェット古着マニア",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    rating: 4.9,
    reviewCount: 230
  };

  // 🛍️ 最近購入した商品（最大3件表示）
  const recentPurchases = [
    { id: "p801", title: "ソニー メカニカルキーボード", price: 14500, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200" },
    { id: "p802", title: "防水ミリタリーバックパック", price: 8900, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200" },
    { id: "p803", title: "アンカー 急速充電スタンド", price: 4200, image: "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=200" }
  ];

  // ❤️ いいね!した商品（最大3件表示）
  const likedProducts = [
    { id: "p101", title: "ビンテージレザージャケット", price: 28000, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200" },
    { id: "p501", title: "オリンパス デジタルカメラ", price: 45000, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200" },
    { id: "p202", title: "ハイカットスニーカー 赤", price: 12000, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200" }
  ];

  return (
    <div className="mypage-container">
      
      {/* 👤 1. プロフィールヘッダー（タップするとアカウント設定に遷移） */}
      <div 
        className="mypage-profile-section clickable" 
        onClick={() => navigate('/mypage/account')} /* 💡 先行URL設計 */
      >
        <img src={currentUser.avatar} alt="マイアイコン" className="mypage-avatar" />
        <div className="mypage-profile-info">
          <div className="mypage-user-name-row">
            <h3 className="mypage-user-name">{currentUser.name}</h3>
            <span className="mypage-settings-arrow">⚙️</span> {/* 💡 設定変更を匂わせるギアアイコン */}
          </div>
          <div className="mypage-rating">
            <span>⭐ {currentUser.rating}</span>
            <span className="mypage-reviews">({currentUser.reviewCount}件の評価)</span>
          </div>
        </div>
      </div>

      {/* 🤝 2. 最近購入した商品セクション */}
      <div className="mypage-collection-section">
        <div className="collection-header-row">
          <h4 className="collection-section-title">最近購入した商品</h4>
        </div>
        
        <div className="mypage-products-grid">
          {recentPurchases.map((product) => (
            <ProductCard 
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              image={product.image}
            />
          ))}
        </div>
        
        <button 
          className="collection-see-all-btn"
          onClick={() => navigate('/mypage/purchases')}
        >
          購入履歴をすべて見る
        </button>
      </div>

      {/* ❤️ 3. いいねした商品セクション */}
      <div className="mypage-collection-section">
        <div className="collection-header-row">
          <h4 className="collection-section-title">いいね！した商品</h4>
        </div>
        
        <div className="mypage-products-grid">
          {likedProducts.map((product) => (
            <ProductCard 
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              image={product.image}
            />
          ))}
        </div>
        
        <button 
          className="collection-see-all-btn"
          onClick={() => navigate('/mypage/likes')}
        >
          いいね一覧をすべて見る
        </button>
      </div>

    </div>
  );
}

export default MyPage;