import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { formatClock } from '../utils/format';
import sendIcon from '../assets/send.svg';
import './ChatRoom.css';

function SellerChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const chatEndRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [inputText, setInputText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const detail = await apiFetch(`/api/chatrooms/${roomId}`);
      setRoom(detail);
    } catch { /* 一時的な失敗は無視 */ }
  }, [roomId]);

  useEffect(() => {
    apiFetch(`/api/chatrooms/${roomId}`)
      .then(detail => {
        setRoom(detail);
        apiFetch(`/api/chatrooms/${roomId}/read`, { method: 'PUT' }).catch(() => {});
      })
      .catch(err => {
        alert(`チャットの読み込みに失敗しました: ${err.message}`);
        navigate(-1);
      });
  }, [roomId, navigate]);

  // 8秒ごとに新着メッセージをポーリング
  useEffect(() => {
    const timer = setInterval(refresh, 8000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [room?.messages?.length]);

  if (!room) return <div className="app-center-text">読み込み中…</div>;

  const myId = loginUser?.uid;
  const proposedPrice = room.discount_proposed;
  const isApproved = room.discount_approved > 0;

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

  // 値引きを承認する（このルームの購入希望者だけに適用され、本人に通知が飛ぶ）
  const handleApproveDiscount = async () => {
    if (!window.confirm(`¥${proposedPrice.toLocaleString()} での販売を承認しますか？購入者に通知され、この価格で購入できるようになります。`)) return;
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

  // 出品者用：Gemini返答自動生成
  const handleGeminiReplyGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await apiFetch('/api/gemini/reply', {
        method: 'POST',
        body: { role: 'seller', product_name: room.product_name, instruction: aiPrompt },
      });
      setInputText(res.text);
      setAiPrompt('');
    } catch (err) {
      alert(`AI生成に失敗しました: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!window.confirm(`${room.other_user_name}様をブロックしますか？`)) return;
    try {
      await apiFetch('/api/blocks', { method: 'POST', body: { blocked_id: room.proposer_id } });
      alert("ユーザーをブロックしました。");
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

      {/* サブヘッダー */}
      <div className="room-product-bar" onClick={() => navigate(`/deals/manage/${room.product_id}`)}>
        {room.product_image && <img src={room.product_image} alt="商品" className="room-product-thumb" />}
        <div className="room-product-meta">
          <span className="room-product-price">¥{room.product_price.toLocaleString()}</span>
        </div>
        <span className="room-product-arrow">取引管理画面へ ＞</span>
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

      {/* 🔥 出品者専用：アクション＆AI返答補助エリア */}
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

        {/* Gemini自動生成エリア */}
        <div className="gemini-assistant-box">
          <input
            type="text"
            placeholder="Geminiに断り文や返答を作ってもらう（例: 値下げを断る）"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="gemini-prompt-input"
          />
          <button type="button" className="gemini-gen-btn" disabled={isAiLoading} onClick={handleGeminiReplyGenerate}>
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
    </div>
  );
}

export default SellerChatRoom;
