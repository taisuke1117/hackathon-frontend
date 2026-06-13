import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { formatTime } from '../../utils/format';
import './ChatList.css';

// ─────────────────────────────────────────────────────────
// ChatList: チャット一覧ページ（フッターの吹き出しアイコンから来る）
//
// タブ切り替えで2モードある:
//   「購入」タブ: 自分が購入希望者として参加しているチャット一覧
//   「販売」タブ: 自分が出品した商品への問い合わせチャット一覧
//
// タブによって遷移先のURLも変わる:
//   購入タブ → /chat/:productId/:roomId       （BuyerChatRoom）
//   販売タブ → /chat/seller/:productId/:roomId（SellerChatRoom）
// ─────────────────────────────────────────────────────────

function ChatList() {
  const navigate = useNavigate();

  // activeTab: 'buying'（購入）or 'selling'（販売）
  const [activeTab, setActiveTab] = useState('buying');
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // タブが切り替わるたびに対応するチャット一覧を取得
  useEffect(() => {
    setIsLoading(true);
    apiFetch(`/api/chatrooms?role=${activeTab}`)
      .then(rooms => setChats(rooms || []))
      .catch(err => {
        console.error('チャット一覧の取得に失敗:', err);
        setChats([]);
      })
      .finally(() => setIsLoading(false));
  }, [activeTab]); // activeTabが変わるたびに再実行

  // チャット行をクリックしたとき、タブに応じて適切なURLへ遷移
  const handleRowClick = (productId, roomId) => {
    if (activeTab === 'buying') {
      navigate(`/chat/${productId}/${roomId}`);        // 購入者チャット
    } else {
      navigate(`/chat/seller/${productId}/${roomId}`); // 出品者チャット
    }
  };

  return (
    <div className="chat-list-container">
      <h2 className="chat-page-title">メッセージ</h2>

      {/* タブ切り替えバー */}
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

      {/* チャット一覧 */}
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
              {/* 相手のアイコン */}
              <div className="chat-avatar-box">
                {chat.other_user_icon
                  ? <img src={chat.other_user_icon} alt={chat.other_user_name} className="user-avatar-img" />
                  : <div className="user-avatar-img" style={{ background: '#444' }} />}
              </div>

              {/* チャット内容（相手名・商品名・最後のメッセージ） */}
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

              {/* 右側: 未読バッジと商品サムネイル */}
              <div className="chat-right-aside">
                {/* 未読メッセージ数バッジ（0なら非表示） */}
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
