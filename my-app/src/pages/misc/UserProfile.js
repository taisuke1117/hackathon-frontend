import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '../../components/product/ProductCard';
import { apiFetch } from '../../api/client';
import { formatTime } from '../../utils/format';
import './UserProfile.css';

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null); // { user, products, reviews }
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/api/users/${userId}`)
      .then(setData)
      .catch(err => setError(err.message));
  }, [userId]);

  if (error) return <div className="app-center-text">{error}</div>;
  if (!data) return <div className="app-center-text">読み込み中…</div>;

  const { user, products, reviews } = data;
  // 公開プロフィールでは出品中の商品だけを見せる
  const visibleProducts = (products || []).filter(p => p.status === 'available' || p.status === 'negotiating');

  return (
    <div className="profile-page-container">
      {/* ヘッダー */}
      <div className="profile-header">
        <button className="profile-back-btn" onClick={() => navigate(-1)}>← 戻る</button>
        <h2 className="profile-page-title">プロフィール</h2>
        <div style={{ width: '48px' }}></div>
      </div>

      {/* 👤 ユーザー基本情報セクション */}
      <div className="profile-top-card">
        <div className="profile-main-row">
          {user.icon_url
            ? <img src={user.icon_url} alt={user.name} className="profile-avatar-img" />
            : <div className="profile-avatar-img" style={{ background: '#444' }} />}
          <div className="profile-meta-info">
            <h3 className="profile-user-name">{user.name}</h3>

            <div className="profile-rating-stars">
              <span className="star-icon">⭐</span>
              {user.review_count > 0 ? (
                <>
                  <span className="rating-score">{user.rating.toFixed(1)}</span>
                  <span className="review-count">({user.review_count}件の評価)</span>
                </>
              ) : (
                <span className="review-count">評価はまだありません</span>
              )}
            </div>
          </div>
        </div>

        {user.bio && (
          <div className="profile-intro-box">
            <p className="profile-intro-text">{user.bio}</p>
          </div>
        )}
      </div>

      {/* 📦 この人の出品商品一覧 */}
      <div className="profile-products-section">
        <h4 className="profile-section-title">出品した商品（{visibleProducts.length}）</h4>

        <div className="profile-products-grid">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              id={product.product_id}
              title={product.name}
              price={product.price}
              image={product.image_url}
              category={product.category}
              likeCountInitial={product.likes_count}
            />
          ))}
          {visibleProducts.length === 0 && <span className="review-count">出品中の商品はありません</span>}
        </div>
      </div>

      {/* ⭐ 受け取った評価一覧 */}
      <div className="profile-products-section">
        <h4 className="profile-section-title">取引の評価（{(reviews || []).length}）</h4>
        {(reviews || []).map(review => (
          <div key={review.review_id} className="profile-top-card" style={{ marginBottom: '10px' }}>
            <div className="profile-main-row">
              {review.reviewer_icon
                ? <img src={review.reviewer_icon} alt={review.reviewer_name} className="profile-avatar-img" style={{ width: 36, height: 36 }} />
                : <div className="profile-avatar-img" style={{ width: 36, height: 36, background: '#444' }} />}
              <div className="profile-meta-info">
                <span className="profile-user-name" style={{ fontSize: '14px' }}>{review.reviewer_name}</span>
                <span className="review-count">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}・{formatTime(review.created_at)}
                </span>
              </div>
            </div>
            {review.comment && (
              <div className="profile-intro-box">
                <p className="profile-intro-text">{review.comment}</p>
              </div>
            )}
          </div>
        ))}
        {(reviews || []).length === 0 && <span className="review-count">評価はまだありません</span>}
      </div>
    </div>
  );
}

export default UserProfile;
