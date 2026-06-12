import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';
import { useChatRoom } from '../../hooks/useChatRoom';
import { ChatTimeline } from '../../components/chat/ChatTimeline';
import { GeminiAssistantBox } from '../../components/chat/GeminiAssistantBox';
import sendIcon from '../../assets/send.svg';
import './ChatRoom.css';

function SellerChatRoom() {
  const { productId, roomId } = useParams();
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const { room, inputText, setInputText, handleSend, refresh, chatEndRef } =
    useChatRoom(productId, roomId);

  if (!room) return <div className="app-center-text">読み込み中…</div>;

  const myId = loginUser?.uid;
  const proposedPrice = room.discount_proposed;
  const isApproved = room.discount_approved > 0;

  const handleApproveDiscount = async () => {
    if (!window.confirm(`¥${proposedPrice.toLocaleString()} での販売を承認しますか？`)) return;
    try {
      await apiFetch(`/api/chatrooms/${room.chatroom_id}/discount/approve`, { method: 'PUT' });
      await apiFetch(`/api/chatrooms/${room.chatroom_id}/messages`, {
        method: 'POST',
        body: { content: `承知いたしました。¥${proposedPrice.toLocaleString()} への値引きを承認しましたので、そのままご購入ください！` },
      });
      await refresh();
    } catch (err) {
      alert(`承認に失敗しました: ${err.message}`);
    }
  };

  const handleBlockUser = async () => {
    if (!window.confirm(`${room.other_user_name}様をブロックしますか？`)) return;
    try {
      await apiFetch('/api/blocks', { method: 'POST', body: { blocked_id: room.proposer_id } });
      alert('ユーザーをブロックしました。');
      navigate(-1);
    } catch (err) {
      alert(`ブロックに失敗しました: ${err.message}`);
    }
  };

  return (
    <div className="room-container">
      <div className="room-header">
        <button className="room-back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="room-header-meta">
          <h3 className="room-user-name">{room.other_user_name}（購入希望者）</h3>
          <span className="room-header-product-title">{room.product_name}</span>
        </div>
      </div>

      <div className="room-product-bar" onClick={() => navigate(`/deals/manage/${room.product_id}`)}>
        {room.product_image && <img src={room.product_image} alt="商品" className="room-product-thumb" />}
        <div className="room-product-meta">
          <span className="room-product-price">¥{room.product_price.toLocaleString()}</span>
        </div>
        <span className="room-product-arrow">取引管理画面へ ＞</span>
      </div>

      <ChatTimeline
        messages={room.messages}
        myId={myId}
        otherUserIcon={room.other_user_icon}
        chatEndRef={chatEndRef}
      />

      <div className="room-action-dashboard">
        {isApproved && (
          <div className="discount-info-notification">
            <span className="discount-sparkle">✅</span>
            <span className="discount-text">¥{room.discount_approved.toLocaleString()} への値引きを承認済みです</span>
          </div>
        )}

        <div className="seller-direct-actions">
          <button className="action-btn-block" onClick={handleBlockUser}>
            ユーザーをブロック
          </button>
          {proposedPrice > 0 && !isApproved && (
            <button className="action-btn-approve" onClick={handleApproveDiscount}>
              値引きを承認 (¥{proposedPrice.toLocaleString()})
            </button>
          )}
        </div>

        <GeminiAssistantBox role="seller" room={room} myId={myId} onGenerated={setInputText} />
      </div>

      <form className="room-input-area" onSubmit={handleSend}>
        <input
          type="text"
          className="room-input-field"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="メッセージを入力..."
        />
        <button type="submit" className={`room-send-btn ${inputText.trim() ? 'active' : ''}`} aria-label="送信">
          <img src={sendIcon} alt="送信" className="room-send-icon" />
        </button>
      </form>
    </div>
  );
}

export default SellerChatRoom;
