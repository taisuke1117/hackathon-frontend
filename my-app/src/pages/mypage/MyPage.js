import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../../components/product/ProductCard';
import { PurchaseProductCard } from '../../components/product/PurchaseProductCard';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './MyPage.css';

// MyPage: マイページ（プロフィール・最近の購入3件・いいね3件）

function MyPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [likedProducts, setLikedProducts] = useState([]);

  // 購入履歴といいね一覧を並列取得
  useEffect(() => {
    apiFetch('/api/me/purchases')
      .then(list => setRecentPurchases((list || []).slice(0, 3))) // 先頭3件だけ
      .catch(err => console.error('購入履歴の取得に失敗:', err));

    apiFetch('/api/me/likes')
      .then(list => setLikedProducts((list || []).slice(0, 3)))   // 先頭3件だけ
      .catch(err => console.error('いいね一覧の取得に失敗:', err));
  }, []);

  return (
    <div className="mypage-container">

      {/* プロフィールヘッダー（クリックで設定画面へ） */}
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
            {/* 評価が1件以上あれば星スコア、なければ「評価なし」 */}
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

      {/* 最近購入した商品（3件プレビュー）*/}
      <div className="mypage-collection-section">
        <div className="collection-header-row">
          <h4 className="collection-section-title">最近購入した商品</h4>
        </div>

        <div className="mypage-products-grid">
          {recentPurchases.map((product) => (
            <PurchaseProductCard
              key={product.product_id}
              id={product.product_id}
              title={product.name}
              price={product.price}
              image={product.image_url}
              status={product.status}
              reviewed={product.reviewed}
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

      {/* いいねした商品（3件プレビュー）*/}
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
              isLikedInitial={true} // いいね一覧なので常にtrue
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
