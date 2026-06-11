import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard'; // 💡 前回のインポートエラーも修正済み
import './UserProfile.css';

function UserProfile() {
  const { userId } = useParams(); // 💡 パスから userId を取得
  const navigate = useNavigate();

  // 👤 ユーザーごとのダミーデータ（本来は userId をキーにAPIから取得）
  const database = {
    // チャット相手（山田さん）のデータ
    u999: {
      name: "山田 クリス",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      rating: 4.8,
      reviewCount: 142,
      introduction: "ご覧いただきありがとうございます！都内でアパレル関係の仕事をしています。主にサイズが合わなくなったビンテージ古着や、コレクションしていたスニーカーを出品しています。丁寧な梱包と迅速な発送を心がけております。",
      products: [
        { id: "p101", title: "ビンテージレザージャケット（1990年代物）", price: 28000, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200" },
        { id: "p202", title: "ハイカットスニーカー 赤", price: 12000, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200" },
      ]
    },
    // チャットリストにいた他のユーザー（田中さん）のデータ
    u501: {
      name: "田中 太郎",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      rating: 4.5,
      reviewCount: 89,
      introduction: "こんにちは！カメラやガジェットが大好きなサラリーマンです。機材整理のため、大切に使っていたカメラやレンズを中心に出品しています。お気軽にコメントください！",
      products: [
        { id: "p501", title: "ビンテージカメラ", price: 45000, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200" }
      ]
    }
  };

  // 💡 URLの userId に一致するユーザー情報を取得。なければデフォルトで山田さんを表示
  const activeUser = database[userId] || database.u999;

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
          <img src={activeUser.avatar} alt={activeUser.name} className="profile-avatar-img" />
          <div className="profile-meta-info">
            <h3 className="profile-user-name">{activeUser.name}</h3>
            
            <div className="profile-rating-stars">
              <span className="star-icon">⭐</span>
              <span className="rating-score">{activeUser.rating}</span>
              <span className="review-count">({activeUser.reviewCount}件の評価)</span>
            </div>
          </div>
        </div>

        <div className="profile-intro-box">
          <p className="profile-intro-text">{activeUser.introduction}</p>
        </div>
      </div>

      {/* 📦 この人の出品商品一覧 */}
      <div className="profile-products-section">
        <h4 className="profile-section-title">出品した商品（{activeUser.products.length}）</h4>
        
        <div className="profile-products-grid">
          {activeUser.products.map((product) => (
            <ProductCard 
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              image={product.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;