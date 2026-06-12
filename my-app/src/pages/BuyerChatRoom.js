import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { formatClock } from '../utils/format';
import { ReviewModal } from '../components/ReviewModal';
import sendIcon from '../assets/send.svg';
import './ChatRoom.css';

function BuyerChatRoom() {
  const { productId, roomId } = useParams();
  const navigate = useNavigate();
  const { loginUser, refreshBadges } = useAuth();
  const chatEndRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [inputText, setInputText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [myPurchase, setMyPurchase] = useState(null); // 自分が購入した商品なら購入情報（評価導線用）
  const [showReview, setShowReview] = useState(false);

  // ルーム読み込み（roomIdが'new'なら作成してURLを差し替える）
  useEffect(() => {
    let cancelled = false;
    const setup = async () => {
      try {
        let actualRoomId = roomId;
        if (roomId === 'new') {
          const res = await apiFetch('/api/chatrooms', { method: 'POST', body: { product_id: Number(productId) } });
          actualRoomId = res.chatroom_id;
          navigate(`/chat/${productId}/${actualRoomId}`, { replace: true });
          return; // URL差し替え後に再マウントされる
        }
        const detail = await apiFetch(`/api/chatrooms/${actualRoomId}`);
        if (!cancelled) setRoom(detail);
        // 相手のメッセージを既読化（フッターの未読ドットも更新）
        apiFetch(`/api/chatrooms/${actualRoomId}/read`, { method: 'PUT' }).then(refreshBadges).catch(() => {});
      } catch (err) {
        alert(`チャットの読み込みに失敗しました: ${err.message}`);
        navigate(-1);
      }
    };
    setup();
    return () => { cancelled = true; };
  }, [productId, roomId, navigate, refreshBadges]);

  // 8秒ごとに新着メッセージをポーリング
  const refresh = useCallback(async () => {
    if (roomId === 'new') return;
    try {
      const detail = await apiFetch(`/api/chatrooms/${roomId}`);
      setRoom(detail);
    } catch { /* 一時的な失敗は無視 */ }
  }, [roomId]);

  useEffect(() => {
    const timer = setInterval(refresh, 8000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [room?.messages?.length]);

  // 発送済みなら自分の購入情報を取得（受取評価ボタンの表示判定）
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    try {
      await apiFetch(`/api/chatrooms/${room.chatroom_id}/messages`, { method: 'POST', body: { content: text } });
      await refresh();
    } catch (err) {
      alert(`送信に失敗しました: ${err.message}`);
      setInputText(text);
    }
  };

  // Geminiにチャット文を作ってもらう
  const handleGeminiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await apiFetch('/api/gemini/reply', {
        method: 'POST',
        body: { role: 'buyer', product_name: room.product_name, instruction: aiPrompt },
      });
      setInputText(res.text);
      setAiPrompt('');
    } catch (err) {
      alert(`AI生成に失敗しました: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 値引き交渉（chatrooms.discount_proposed に記録され、出品者へ通知が飛ぶ）
  const handleOfferPrice = async () => {
    const offer = prompt("希望購入価格を入力してください（円）:", String(Math.floor(room.product_price * 0.9)));
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

  const isDiscountApproved = room.discount_approved > 0;

  return (
    <div className="room-container">
      {/* ヘッダー */}
      <div className="room-header">
        <button className="room-back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="room-header-meta">
          <h3 className="room-user-name">{room.other_user_name}（出品者）</h3>
          <span className="room-header-product-title">{room.product_name}</span>
        </div>
      </div>

      {/* サブヘッダー */}
      <div className="room-product-bar" onClick={() => navigate(`/product/${room.product_id}`)}>
        {room.product_image && <img src={room.product_image} alt="商品" className="room-product-thumb" />}
        <div className="room-product-meta">
          <span className="room-product-price">¥{room.product_price.toLocaleString()}</span>
        </div>
        <span className="room-product-arrow">商品詳細へ ＞</span>
      </div>

      {/* タイムライン */}
      <div className="room-timeline">
        {room.messages.map((msg) => {
          const isMe = msg.sender_id === myId;
          return (
            <div key={msg.chat_id} className={`msg-row ${isMe ? 'row-me' : 'row-other'}`}>
              {!isMe && (room.other_user_icon
                ? <img src={room.other_user_icon} alt="アバター" className="msg-avatar" />
                : <div className="msg-avatar" style={{ background: '#444' }} />)}
              <div className="msg-bubble-wrapper">
                {isMe && <span className="msg-time">{formatClock(msg.created_at)}</span>}
                <div className={`msg-bubble ${isMe ? 'bubble-me' : 'bubble-other'}`}>{msg.content}</div>
                {!isMe && <span className="msg-time">{formatClock(msg.created_at)}</span>}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* 🔥 購入者専用：アクション＆AI入力補助エリア */}
      <div className="room-action-dashboard">
        {isDiscountApproved && (
          <div className="discount-info-notification">
            <span className="discount-sparkle">✨</span>
            <span className="discount-text">¥{room.discount_approved.toLocaleString()} への値引きが承認されています</span>
          </div>
        )}

        {/* ⭐ 商品が届いたら（発送済み＆未評価）評価導線を最優先で表示 */}
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

        {/* Gemini自動生成エリア */}
        <div className="gemini-assistant-box">
          <input
            type="text"
            placeholder="Geminiにチャット文を作ってもらう（例: 状態の確認）"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="gemini-prompt-input"
          />
          <button type="button" className="gemini-gen-btn" disabled={isAiLoading} onClick={handleGeminiGenerate}>
            {isAiLoading ? '生成中…' : '✨ 生成'}
          </button>
        </div>
      </div>

      {/* メッセージ入力フォーム */}
      <form className="room-input-area" onSubmit={handleSend}>
        <input type="text" className="room-input-field" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="メッセージを入力..." />
        <button type="submit" className={`room-send-btn ${inputText.trim() ? 'active' : ''}`} aria-label="送信">
          <img src={sendIcon} alt="送信" className="room-send-icon" />
        </button>
      </form>

      {/* ⭐ 受取評価モーダル */}
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
