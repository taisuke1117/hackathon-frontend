import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';
import { useChatRoom } from '../../hooks/useChatRoom';
import { ChatTimeline } from '../../components/chat/ChatTimeline';
import { GeminiAssistantBox } from '../../components/chat/GeminiAssistantBox';
import { ReviewModal } from '../../components/modal/ReviewModal';
import sendIcon from '../../assets/send.svg';
import './ChatRoom.css';

// ─────────────────────────────────────────────────────────
// BuyerChatRoom: 購入希望者側のチャット画面
//
// 機能:
//   - メッセージの送受信（useChatRoom フックに委譲）
//   - 値引き交渉ボタン（希望価格を入力してバックエンドに送る）
//   - 購入ボタン（値引き承認済みならその価格で購入できる）
//   - 発送後に「受取評価」ボタンが現れる
//   - Geminiで返信文を自動生成する（GeminiAssistantBox）
// ─────────────────────────────────────────────────────────

function BuyerChatRoom() {
  const { productId, roomId } = useParams(); // URL: /chat/:productId/:roomId
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  // useChatRoom: ルーム情報の取得・ポーリング・送信処理をまとめたカスタムフック
  const { room, inputText, setInputText, handleSend, refresh, chatEndRef } =
    useChatRoom(productId, roomId);

  const textareaRef = useRef(null);

  // inputText が変わるたびに textarea の高さを自動調整（最大4行 = 104px）
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 104) + 'px';
  }, [inputText]);


  // myPurchase: 購入済みかどうか（発送後の受取評価ボタン表示に使う）
  const [myPurchase, setMyPurchase] = useState(null);
  // showReview: 受取評価モーダルの表示フラグ
  const [showReview, setShowReview] = useState(false);

  // 発送済みステータスになったとき、購入履歴から自分のこの取引を探す
  useEffect(() => {
    if (room?.product_status !== 'shipped') return; // まだ発送されていなければ不要
    apiFetch('/api/me/purchases')
      .then(list => {
        const mine = (list || []).find(p => p.product_id === room.product_id);
        setMyPurchase(mine || null);
      })
      .catch(() => {});
  }, [room?.product_status, room?.product_id]);

  if (!room) return <div className="app-center-text">読み込み中…</div>;

  const myId = loginUser?.uid;

  // 値引きが承認済みかどうか（discount_approved > 0 なら承認済み）
  const isDiscountApproved = room.discount_approved > 0;

  // 値引き交渉ボタン: 希望価格をpromptで入力してバックエンドに送る
  // 同時にチャットに「【値引き交渉】...」メッセージも送信する
  const handleOfferPrice = async () => {
    // デフォルト提案金額は現在価格の90%
    const offer = prompt('希望購入価格を入力してください（円）:', String(Math.floor(room.product_price * 0.9)));
    if (!offer || isNaN(Number(offer)) || Number(offer) <= 0) return;
    try {
      // 値引き提案API（出品者に通知が届く）
      await apiFetch(`/api/chatrooms/${room.chatroom_id}/discount`, { method: 'POST', body: { price: Number(offer) } });
      // 交渉内容をチャットメッセージとしても送信（相手が文脈を把握しやすいように）
      await apiFetch(`/api/chatrooms/${room.chatroom_id}/messages`, {
        method: 'POST',
        body: { content: `【値引き交渉】¥${Number(offer).toLocaleString()} での購入を希望します。ご検討いただけますか？` },
      });
      await refresh(); // 画面を最新状態に更新
    } catch (err) {
      alert(`値引き交渉に失敗しました: ${err.message}`);
    }
  };

  return (
    <div className="room-container">
      {/* ヘッダー: 相手の名前と商品名 */}
      <div className="room-header">
        <button className="room-back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="room-header-meta">
          <h3 className="room-user-name">{room.other_user_name}（出品者）</h3>
          <span className="room-header-product-title">{room.product_name}</span>
        </div>
      </div>

      {/* 商品バー: クリックで商品詳細へ */}
      <div className="room-product-bar" onClick={() => navigate(`/product/${room.product_id}`)}>
        {room.product_image && <img src={room.product_image} alt="商品" className="room-product-thumb" />}
        <div className="room-product-meta">
          <span className="room-product-price">¥{room.product_price.toLocaleString()}</span>
        </div>
        <span className="room-product-arrow">商品詳細へ ＞</span>
      </div>

      {/* メッセージ一覧 */}
      <ChatTimeline
        messages={room.messages}
        myId={myId}
        otherUserIcon={room.other_user_icon}
        chatEndRef={chatEndRef}
      />

      {/* アクションエリア（値引き状況・購入ボタン・評価ボタン） */}
      <div className="room-action-dashboard">
        {/* 値引き承認済みのバナー */}
        {isDiscountApproved && (
          <div className="discount-info-notification">
            <span className="discount-sparkle">✨</span>
            <span className="discount-text">¥{room.discount_approved.toLocaleString()} への値引きが承認されています</span>
          </div>
        )}

        {/* 発送済み＆未評価 → 受取評価ボタン */}
        {/* それ以外 → 購入ボタン＋値引き交渉ボタン */}
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
              disabled={room.product_status !== 'available'} // 出品中のときだけ押せる
              onClick={() => navigate(`/checkout/${room.product_id}`)}
            >
              {room.product_status === 'available' ? '購入手続きへ' : '取引済み'}
            </button>
            <button className="action-btn-offer" onClick={handleOfferPrice}>
              値引き交渉
            </button>
          </div>
        )}

        {/* GeminiAIによる返信文自動生成（購入者ロール） */}
        <GeminiAssistantBox role="buyer" room={room} myId={myId} onGenerated={setInputText} />
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

      {/* 受取評価モーダル（発送済みかつ未評価のとき） */}
      {showReview && myPurchase && (
        <ReviewModal
          product={{ product_id: room.product_id, name: room.product_name }}
          onClose={() => setShowReview(false)}
          onSubmitted={() => {
            setShowReview(false);
            setMyPurchase({ ...myPurchase, reviewed: true }); // ローカルで評価済みに更新
          }}
        />
      )}
    </div>
  );
}

export default BuyerChatRoom;
