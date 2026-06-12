import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './MyPage.css';

function MyPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [recentPurchases, setRecentPurchases] = useState([]);
  const [likedProducts, setLikedProducts] = useState([]);

  useEffect(() => {
    apiFetch('/api/me/purchases')
      .then(list => setRecentPurchases((list || []).slice(0, 3)))
      .catch(err => console.error('購入履歴の取得に失敗:', err));
    apiFetch('/api/me/likes')
      .then(list => setLikedProducts((list || []).slice(0, 3)))
      .catch(err => console.error('いいね一覧の取得に失敗:', err));
  }, []);

  return (
    <div className="mypage-container">

      {/* 👤 1. プロフィールヘッダー */}
      <div
        className="mypage-profile-section clickable"
        onClick={() => navigate('/mypage/account')}
      >
        {profile?.icon_url
          ? <img src={profile.icon_url} alt="マイアイコン" className="mypage-avatar" />
          : <div className="mypage-avatar" style={{ background: '#444' }} />}
        <div className="mypage-profile-info">
          <div className="mypage-user-name-row">
            <h3 className="mypage-user-name">{profile?.name || 'ユーザー'}</h3>
            <span className="mypage-settings-arrow">⚙️</span>
          </div>
          <div className="mypage-rating">
            {profile?.review_count > 0 ? (
              <>
                <span>⭐ {profile.rating.toFixed(1)}</span>
                <span className="mypage-reviews">({profile.review_count}件の評価)</span>
              </>
            ) : (
              <span className="mypage-reviews">評価はまだありません</span>
            )}
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
              key={product.product_id}
              id={product.product_id}
              title={product.name}
              price={product.price}
              image={product.image_url}
              category={product.category}
              likeCountInitial={product.likes_count}
              isLikedInitial={product.liked_by_me}
            />
          ))}
          {recentPurchases.length === 0 && <span className="mypage-reviews">まだ購入した商品はありません</span>}
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
              key={product.product_id}
              id={product.product_id}
              title={product.name}
              price={product.price}
              image={product.image_url}
              category={product.category}
              likeCountInitial={product.likes_count}
              isLikedInitial={true}
            />
          ))}
          {likedProducts.length === 0 && <span className="mypage-reviews">いいねした商品はまだありません</span>}
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
