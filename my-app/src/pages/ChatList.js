import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { formatTime } from '../utils/format';
import './ChatList.css';

function ChatList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('buying');
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiFetch(`/api/chatrooms?role=${activeTab}`)
      .then(rooms => setChats(rooms || []))
      .catch(err => {
        console.error('チャット一覧の取得に失敗:', err);
        setChats([]);
      })
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  // タブの状態に応じて遷移先のURLパスを動的に生成
  const handleRowClick = (productId, roomId) => {
    if (activeTab === 'buying') {
      navigate(`/chat/${productId}/${roomId}`);
    } else {
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
        {isLoading ? (
          <div className="chat-empty-message">読み込み中…</div>
        ) : chats.length > 0 ? (
          chats.map(chat => (
            <div
              key={chat.chatroom_id}
              className="chat-row-item"
              onClick={() => handleRowClick(chat.product_id, chat.chatroom_id)}
            >
              <div className="chat-avatar-box">
                {chat.other_user_icon
                  ? <img src={chat.other_user_icon} alt={chat.other_user_name} className="user-avatar-img" />
                  : <div className="user-avatar-img" style={{ background: '#444' }} />}
              </div>

              <div className="chat-main-content">
                <div className="chat-top-line">
                  <span className="chat-user-name">{chat.other_user_name}</span>
                  <span className="chat-timestamp">{formatTime(chat.last_message_at)}</span>
                </div>
                <div className="chat-product-name-label">
                   商品: {chat.product_name}
                </div>
                <div className="chat-last-message">
                  {chat.last_message || 'メッセージはまだありません'}
                </div>
              </div>

              <div className="chat-right-aside">
                {chat.unread_count > 0 && (
                  <span className="chat-unread-badge">{chat.unread_count}</span>
                )}
                <div className="chat-product-img-box">
                  {chat.product_image && <img src={chat.product_image} alt={chat.product_name} className="product-thumb-img" />}
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
