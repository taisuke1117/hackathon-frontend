import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';
import { useChatRoom } from '../../hooks/useChatRoom';
import { ChatTimeline } from '../../components/chat/ChatTimeline';
import { GeminiAssistantBox } from '../../components/chat/GeminiAssistantBox';
import { ReviewModal } from '../../components/modal/ReviewModal';
import sendIcon from '../../assets/send.svg';
import './ChatRoom.css';

function BuyerChatRoom() {
  const { productId, roomId } = useParams();
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const { room, inputText, setInputText, handleSend, refresh, chatEndRef } =
    useChatRoom(productId, roomId);

  const [myPurchase, setMyPurchase] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (room?.product_status !== 'shipped') return;
    apiFetch('/api/me/purchases')
      .then(list => {
        const mine = (list || []).find(p => p.product_id === room.product_id);
        setMyPurchase(mine || null);
      })
      .catch(() => {});
  }, [room?.product_status, room?.product_id]);

  if (!room) return <div className="app-center-text">読み込み中…</div>;

  const myId = loginUser?.uid;
  const isDiscountApproved = room.discount_approved > 0;

  const handleOfferPrice = async () => {
    const offer = prompt('希望購入価格を入力してください（円）:', String(Math.floor(room.product_price * 0.9)));
    if (!offer || isNaN(Number(offer)) || Number(offer) <= 0) return;
    try {
      await apiFetch(`/api/chatrooms/${room.chatroom_id}/discount`, { method: 'POST', body: { price: Number(offer) } });
      await apiFetch(`/api/chatrooms/${room.chatroom_id}/messages`, {
        method: 'POST',
        body: { content: `【値引き交渉】¥${Number(offer).toLocaleString()} での購入を希望します。ご検討いただけますか？` },
      });
      await refresh();
    } catch (err) {
      alert(`値引き交渉に失敗しました: ${err.message}`);
    }
  };

  return (
    <div className="room-container">
      <div className="room-header">
        <button className="room-back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="room-header-meta">
          <h3 className="room-user-name">{room.other_user_name}（出品者）</h3>
          <span className="room-header-product-title">{room.product_name}</span>
        </div>
      </div>

      <div className="room-product-bar" onClick={() => navigate(`/product/${room.product_id}`)}>
        {room.product_image && <img src={room.product_image} alt="商品" className="room-product-thumb" />}
        <div className="room-product-meta">
          <span className="room-product-price">¥{room.product_price.toLocaleString()}</span>
        </div>
        <span className="room-product-arrow">商品詳細へ ＞</span>
      </div>

      <ChatTimeline
        messages={room.messages}
        myId={myId}
        otherUserIcon={room.other_user_icon}
        chatEndRef={chatEndRef}
      />

      <div className="room-action-dashboard">
        {isDiscountApproved && (
          <div className="discount-info-notification">
            <span className="discount-sparkle">✨</span>
            <span className="discount-text">¥{room.discount_approved.toLocaleString()} への値引きが承認されています</span>
          </div>
        )}

        {myPurchase && !myPurchase.reviewed ? (
          <div className="buyer-direct-actions">
            <button className="action-btn-purchase" onClick={() => setShowReview(true)}>
              ⭐ 受取評価をする
            </button>
          </div>
        ) : (
          <div className="buyer-direct-actions">
            <button
              className="action-btn-purchase"
              disabled={room.product_status !== 'available'}
              onClick={() => navigate(`/checkout/${room.product_id}`)}
            >
              {room.product_status === 'available' ? '購入手続きへ' : '取引済み'}
            </button>
            <button className="action-btn-offer" onClick={handleOfferPrice}>
              値引き交渉
            </button>
          </div>
        )}

        <GeminiAssistantBox role="buyer" room={room} myId={myId} onGenerated={setInputText} />
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

      {showReview && myPurchase && (
        <ReviewModal
          product={{ product_id: room.product_id, name: room.product_name }}
          onClose={() => setShowReview(false)}
          onSubmitted={() => {
            setShowReview(false);
            setMyPurchase({ ...myPurchase, reviewed: true });
          }}
        />
      )}
    </div>
  );
}

export default BuyerChatRoom;
