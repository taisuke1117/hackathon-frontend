import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';
import { useChatRoom } from '../../hooks/useChatRoom';
import { ChatTimeline } from '../../components/chat/ChatTimeline';
import { GeminiAssistantBox } from '../../components/chat/GeminiAssistantBox';
import sendIcon from '../../assets/send.svg';
import './ChatRoom.css';

// SellerChatRoom: 出品者側チャット（値引き承認・ユーザーブロック機能付き）

function SellerChatRoom() {
  const { productId, roomId } = useParams();
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const { room, inputText, setInputText, handleSend, refresh, chatEndRef } =
    useChatRoom(productId, roomId);

  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 104) + 'px';
  }, [inputText]);

  const [buyerReviewed, setBuyerReviewed] = useState(false);

  // 取引済み（available以外）になったら購入者が評価済みか確認する
  // 出品者が受け取った評価一覧から product_id 一致を探す
  useEffect(() => {
    if (!room?.product_status || room?.product_status === 'available') return;
    apiFetch(`/api/users/${room?.seller_id}/reviews`)
      .then(list => setBuyerReviewed((list || []).some(rv => rv.product_id === room?.product_id)))
      .catch(() => {});
  }, [room?.product_status, room?.product_id, room?.seller_id]);

  if (!room) return <div className="app-center-text">読み込み中…</div>;

  const myId = loginUser?.uid;

  // 購入希望者が提案している値引き金額（0なら提案なし）
  const proposedPrice = room.discount_proposed;
  // 出品者が承認済みかどうか
  const isApproved = room.discount_approved > 0;

  // 値引き承認: 確認後、APIを叩いて承認メッセージもチャットに送る
  const handleApproveDiscount = async () => {
    if (!window.confirm(`¥${proposedPrice.toLocaleString()} での販売を承認しますか？`)) return;
    try {
      // 承認API（購入者に通知が届く）
      await apiFetch(`/api/chatrooms/${room.chatroom_id}/discount/approve`, { method: 'PUT' });
      // 承認した旨をチャットにも送信
      await apiFetch(`/api/chatrooms/${room.chatroom_id}/messages`, {
        method: 'POST',
        body: { content: `承知いたしました。¥${proposedPrice.toLocaleString()} への値引きを承認しましたので、そのままご購入ください！` },
      });
      await refresh();
    } catch (err) {
      alert(`承認に失敗しました: ${err.message}`);
    }
  };

  // ユーザーブロック: 迷惑なユーザーをブロックして前の画面に戻る
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
      {/* ヘッダー */}
      <div className="room-header">
        <button className="room-back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="room-header-meta">
          <h3 className="room-user-name">{room.other_user_name}（購入希望者）</h3>
          <span className="room-header-product-title">{room.product_name}</span>
        </div>
      </div>

      {/* 商品バー: 出品者には取引管理画面へのリンク */}
      <div className="room-product-bar" onClick={() => navigate(`/deals/manage/${room.product_id}`)}>
        {room.product_image && <img src={room.product_image} alt="商品" className="room-product-thumb" />}
        <div className="room-product-meta">
          <span className="room-product-price">¥{room.product_price.toLocaleString()}</span>
        </div>
        <span className="room-product-arrow">取引管理画面へ ＞</span>
      </div>

      {/* メッセージ一覧 */}
      <ChatTimeline
        messages={room.messages}
        myId={myId}
        otherUserIcon={room.other_user_icon}
        chatEndRef={chatEndRef}
      />

      {/* アクションエリア */}
      <div className="room-action-dashboard">
        {room.product_status === 'available' ? (
          /* 出品中: 承認済みバナー・ブロック・値引き承認 */
          <>
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
          </>
        ) : (
          /* 取引済み: 購入者の評価ステータスを表示 */
          <div className="deal-closed-box">
            <p className="deal-closed-label">取引が完了しました</p>
            <p className="deal-closed-sub">
              {buyerReviewed ? '⭐ 購入者から評価が届きました' : '購入者の評価をお待ちください'}
            </p>
          </div>
        )}

        {/* GeminiAIによる返信文自動生成（出品者ロール） */}
        <GeminiAssistantBox role="seller" room={room} myId={myId} onGenerated={setInputText} />
      </div>

      {/* メッセージ入力フォーム */}
      <form className="room-input-area" onSubmit={handleSend}>
        <textarea
          ref={textareaRef}
          className="room-input-field"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="メッセージを入力..."
          rows={1}
        />
        <button type="submit" className={`room-send-btn ${inputText.trim() ? 'active' : ''}`} aria-label="送信">
          <img src={sendIcon} alt="送信" className="room-send-icon" />
        </button>
      </form>
    </div>
  );
}

export default SellerChatRoom;
