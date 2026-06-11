import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatList.css';

function ChatList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('buying');

  // 購入関連のモックチャット
  const buyingChats = [
    { 
      id: 501, 
      productId: "p101", 
      userName: "田中 太郎", 
      userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      productName: "ビンテージカメラ", 
      productImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100",
      lastMessage: "発送ありがとうございます！到着を楽しみにしております。",
      unreadCount: 0,
      timestamp: "12:45"
    },
    { 
      id: 502, 
      productId: "p102", 
      userName: "佐藤 デザイン", 
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      productName: "北欧風チェア", 
      productImage: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=100",
      lastMessage: "お値引き可能でしょうか？",
      unreadCount: 2,
      timestamp: "昨日"
    },
  ];

  // 販売関連のモックチャット
  const sellingChats = [
    { 
      id: 601, 
      productId: "p103", 
      userName: "鈴木 ショップ", 
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      productName: "ワイヤレスイヤホン", 
      productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100",
      lastMessage: "購入させていただきます！",
      unreadCount: 1,
      timestamp: "10:20"
    },
  ];

  const currentChats = activeTab === 'buying' ? buyingChats : sellingChats;

  // 💡 タブの状態に応じて遷移先のURLパスを動的に生成する関数
  const handleRowClick = (productId, roomId) => {
    if (activeTab === 'buying') {
      // 購入タブ：既存のパス（購入者用チャット）へ
      navigate(`/chat/${productId}/${roomId}`);
    } else {
      // 販売タブ：ご指定の /chat/seller/id/id パス（出品者用チャット）へ
      navigate(`/chat/seller/${productId}/${roomId}`);
    }
  };

  return (
    <div className="chat-list-container">
      <h2 className="chat-page-title">メッセージ</h2>

      <div className="chat-tab-bar">
        <button 
          className={`chat-tab-btn ${activeTab === 'buying' ? 'active' : ''}`} 
          onClick={() => setActiveTab('buying')}
        >
          購入
        </button>
        <button 
          className={`chat-tab-btn ${activeTab === 'selling' ? 'active' : ''}`} 
          onClick={() => setActiveTab('selling')}
        >
          販売
        </button>
      </div>

      <div className="chat-items-wrapper">
        {currentChats.length > 0 ? (
          currentChats.map(chat => (
            <div 
              key={chat.id} 
              className="chat-row-item" 
              /* 💡 クリックハンドラーを共通関数へ差し替え */
              onClick={() => handleRowClick(chat.productId, chat.id)}
            >
              <div className="chat-avatar-box">
                <img src={chat.userAvatar} alt={chat.userName} className="user-avatar-img" />
              </div>

              <div className="chat-main-content">
                <div className="chat-top-line">
                  <span className="chat-user-name">{chat.userName}</span>
                  <span className="chat-timestamp">{chat.timestamp}</span>
                </div>
                <div className="chat-product-name-label">
                   商品: {chat.productName}
                </div>
                <div className="chat-last-message">
                  {chat.lastMessage}
                </div>
              </div>

              <div className="chat-right-aside">
                {chat.unreadCount > 0 && (
                  <span className="chat-unread-badge">{chat.unreadCount}</span>
                )}
                <div className="chat-product-img-box">
                  <img src={chat.productImage} alt={chat.productName} className="product-thumb-img" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="chat-empty-message">やり取りしているメッセージはありません</div>
        )}
      </div>
    </div>
  );
}

export default ChatList;