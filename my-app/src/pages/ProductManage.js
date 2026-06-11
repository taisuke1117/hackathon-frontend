import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductManage.css';

function ProductManage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 📦 管理対象の商品データ（ステータス変更の検証のため useState 化）
  // テスト用に status は 'unshipped' (未発送), 'shipped' (発送済み), 'available' (出品中) に切り替え可能です
  const [managedProduct, setManagedProduct] = useState({
    id: id,
    title: "ビンテージレザージャケット（1990年代物）",
    price: 28000,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300",
    status: "unshipped", // 🔥 ここを 'unshipped' や 'shipped' にして動作確認できます
    views: 245,
    likes: 18,
  });

  // 💬 この商品に紐づいているチャット
  const [itemChats] = useState([
    {
      id: 701,
      userName: "山田 クリス",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      lastMessage: "はじめまして。こちらの商品、お値下げは可能でしょうか？",
      targetPrice: 25000,
      unreadCount: 1,
      timestamp: "10分前",
      isBuyer: true // 🔥 この人が購入者（未発送・発送済みの相手）というフラグ
    },
    {
      id: 702,
      userName: "美咲（プロフ必読）",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      lastMessage: "即決しますので、24,000円でお願いできませんか？",
      targetPrice: 24000,
      unreadCount: 0,
      timestamp: "昨日",
      isBuyer: false
    },
    {
      id: 703,
      userName: "ケン@断捨離中",
      userAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100",
      lastMessage: "状態について質問なのですが、袖口に擦れはありますか？",
      targetPrice: null,
      unreadCount: 0,
      timestamp: "3日前",
      isBuyer: false
    }
  ]);

  // 💡 発送処理アクション
  const handleShipProduct = () => {
    if (window.confirm("商品を発送しましたか？\n購入者に発送通知メッセージが送信されます。")) {
      setManagedProduct(prev => ({ ...prev, status: 'shipped' }));
      alert("発送通知を送信しました。");
    }
  };

  // 💡 チャットの並び替えロジック
  // 未発送(unshipped) または 発送済み(shipped) の場合は購入者(isBuyer)を最上位にする
  const sortedChats = [...itemChats].sort((a, b) => {
    if (managedProduct.status === 'unshipped' || managedProduct.status === 'shipped') {
      if (a.isBuyer && !b.isBuyer) return -1;
      if (!a.isBuyer && b.isBuyer) return 1;
    }
    return 0; // 通常時はそのままの順序
  });

  return (
    <div className="manage-page-container">
      <div className="manage-header">
        <button className="manage-back-btn" onClick={() => navigate(-1)}>← 戻る</button>
        <h2 className="manage-page-title">出品商品管理</h2>
        <div style={{ width: '48px' }}></div>
      </div>

      {/* 🛑 【新設】「未発送」時の最上部アラート＆発送ボタン */}
      {managedProduct.status === 'unshipped' && (
        <div className="status-alert-banner unshipped-banner">
          <div className="banner-message-row">
            <span className="banner-icon">📦</span>
            <div className="banner-text-block">
              <span className="banner-title">商品が購入されました</span>
              <span className="banner-subtitle">梱包を済ませ、速やかに発送を行ってください。</span>
            </div>
          </div>
          <button className="action-btn-ship" onClick={handleShipProduct}>
            🚛 発送しました
          </button>
        </div>
      )}

      {/* ⭐️ 【新設】「発送済み」時の最上部レビュー評価表示 */}
      {managedProduct.status === 'shipped' && (
        <div className="status-alert-banner shipped-banner">
          <div className="banner-message-row">
            <span className="banner-icon">✨</span>
            <div className="banner-text-block">
              <span className="banner-title">発送手続き完了済み</span>
              <span className="banner-subtitle">購入者からの受取評価を待っています。</span>
            </div>
          </div>
          {/* 取引レビュー表示のモック */}
          <div className="seller-review-preview-box">
            <span className="review-label">現在の取引状況</span>
            <div className="review-stars">★★★★★ <small>5.0 (自動反映待ち)</small></div>
            <p className="review-hint-text">※購入者が商品を確認するとここに評価コメントが届きます。</p>
          </div>
        </div>
      )}

      {/* 📊 上段：商品情報セクション */}
      <div className="manage-product-summary-card">
        <div className="manage-product-meta-row">
          <img src={managedProduct.image} alt={managedProduct.title} className="manage-product-thumb" />
          <div className="manage-product-info-text">
            {/* ステータスタグの出し分け */}
            {managedProduct.status === 'available' && <span className="manage-product-status-tag">出品中</span>}
            {managedProduct.status === 'unshipped' && <span className="manage-product-status-tag tag-unshipped">未発送</span>}
            {managedProduct.status === 'shipped' && <span className="manage-product-status-tag tag-shipped">発送済み</span>}
            
            <h3 className="manage-product-title-text">{managedProduct.title}</h3>
            <span className="manage-product-price-text">¥{managedProduct.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="manage-stats-row">
          <div className="stat-item">閲覧数: <strong>{managedProduct.views}</strong></div>
          <div className="stat-item">いいね!: <strong>{managedProduct.likes}</strong></div>
        </div>

        <button 
          className="manage-edit-redirect-btn"
          onClick={() => navigate(`/deals/edit/${managedProduct.id}`)}
        >
          商品情報を書き換える / 編集
        </button>

        <button 
          type="button"
          className="manage-delete-trigger-btn"
          onClick={() => {
            if (window.confirm("この商品の出品を完全にゼロに戻し、削除してもよろしいですか？\n（この操作は取り消せません）")) {
              alert("商品の出品を取り消しました。");
              navigate('/deals');
            }
          }}
        >
          この商品の出品を取り消す
        </button>
      </div>

      {/* 💬 下段：チャット一覧 */}
      <div className="manage-chat-section">
        {/* ステータスに応じた見出しの変更 */}
        <h4 className="manage-section-sub-title">
          {managedProduct.status === 'unshipped' || managedProduct.status === 'shipped' 
            ? "⚠️ 取引相手のチャット（最上部固定）" 
            : "この商品への問い合わせ・価格交渉"}
        </h4>
        
        <div className="manage-chat-list">
          {sortedChats.map(chat => (
            <div 
              key={chat.id} 
              /* 取引中（購入者）の行をハイライトして判別しやすく */
              className={`manage-chat-row ${chat.isBuyer && (managedProduct.status === 'unshipped' || managedProduct.status === 'shipped') ? 'active-buyer-row' : ''}`} 
              onClick={() => navigate(`/chat/seller/${managedProduct.id}/${chat.id}`)}
            >
              <img src={chat.userAvatar} alt={chat.userName} className="manage-chat-avatar" />
              
              <div className="manage-chat-mid">
                <div className="manage-chat-user-line">
                  <span className="manage-chat-user-name">
                    {chat.userName} 
                    {chat.isBuyer && (managedProduct.status === 'unshipped' || managedProduct.status === 'shipped') && (
                      <span className="buyer-role-badge">購入者</span>
                    )}
                  </span>
                  <span className="manage-chat-time">{chat.timestamp}</span>
                </div>
                <p className="manage-chat-last-msg">{chat.lastMessage}</p>
              </div>

              <div className="manage-chat-right">
                {chat.targetPrice ? (
                  <div className="negotiation-target-badge">
                    <span className="negotiation-label">希望額</span>
                    <span className="negotiation-amount">¥{chat.targetPrice.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="negotiation-empty-placeholder">質問のみ</div>
                )}
                
                {chat.unreadCount > 0 && (
                  <span className="manage-unread-count-dot">{chat.unreadCount}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductManage;