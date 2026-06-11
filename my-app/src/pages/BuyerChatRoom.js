import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import sendIcon from '../assets/send.svg';
import './ChatRoom.css'; // スタイルは共通のCSSを使用します

function BuyerChatRoom() {
  const { productId} = useParams(); 
  const navigate = useNavigate();
  const chatEndRef = useRef(null); 

  const productInfo = {
    id: productId || "1",
    title: "ビンテージレザージャケット（1990年代物）",
    price: 28000,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100"
  };

  const sellerUser = { id: "u999", name: "山田 クリス（出品者）", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" };

  const [messages, setMessages] = useState([
    { id: 1, sender: 'other', text: 'コメントありがとうございます！状態はかなり良いものですよ。', time: '10:15' },
  ]);
  const [inputText, setInputText] = useState('');
  
  // 💡 Gemini提案用の状態管理
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const now = new Date();
    const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages([...messages, { id: messages.length + 1, sender: 'me', text: inputText, time: timeString }]);
    setInputText('');
  };

  // 💡 Geminiに返答を生成してもらうダミー機能
  const handleGeminiGenerate = () => {
    if (!aiPrompt.trim()) return;
    // 本来はここでAIのAPIを叩く
    setInputText(`【AI生成】${aiPrompt}についてですが、もう少し詳しく教えていただけますか？`);
    setAiPrompt('');
  };

  const handleOfferPrice = () => {
    const offer = prompt("希望購入価格を入力してください（円）:", "25000");
    if (offer) {
      setInputText(`不躾なお願いですが、¥${Number(offer).toLocaleString()}での即決は可能でしょうか？`);
    }
  };

  return (
    <div className="room-container">
      {/* ヘッダー */}
      <div className="room-header">
        <button className="room-back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="room-header-meta">
          <h3 className="room-user-name">{sellerUser.name}</h3>
          <span className="room-header-product-title">{productInfo.title}</span>
        </div>
      </div>

      {/* サブヘッダー */}
      <div className="room-product-bar" onClick={() => navigate(`/product/${productInfo.id}`)}>
        <img src={productInfo.image} alt="商品" className="room-product-thumb" />
        <div className="room-product-meta">
          <span className="room-product-price">¥{productInfo.price.toLocaleString()}</span>
        </div>
        <span className="room-product-arrow">商品詳細へ ＞</span>
      </div>

      {/* タイムライン */}
      <div className="room-timeline">
        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <div key={msg.id} className={`msg-row ${isMe ? 'row-me' : 'row-other'}`}>
              {!isMe && <img src={sellerUser.avatar} alt="アバター" className="msg-avatar" />}
              <div className="msg-bubble-wrapper">
                {isMe && <span className="msg-time">{msg.time}</span>}
                <div className={`msg-bubble ${isMe ? 'bubble-me' : 'bubble-other'}`}>{msg.text}</div>
                {!isMe && <span className="msg-time">{msg.time}</span>}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* 🔥 購入者専用：アクション＆AI入力補助エリア */}
      <div className="room-action-dashboard">
        <div className="discount-info-notification">
          <span className="discount-sparkle">✨</span>
          <span className="discount-text">¥26,000 に値引きされています</span>
        </div>
        
        <div className="buyer-direct-actions">
          <button className="action-btn-purchase" onClick={() => navigate(`/checkout/${productInfo.id}`)}>
            購入手続きへ
          </button>
          <button className="action-btn-offer" onClick={handleOfferPrice}>
            値引き交渉
          </button>
        </div>
        
        {/* Gemini自動生成エリア */}
        <div className="gemini-assistant-box">
          <input 
            type="text" 
            placeholder="Geminiにチャット文を作ってもらう（例: 状態の確認）" 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="gemini-prompt-input"
          />
          <button type="button" className="gemini-gen-btn" onClick={handleGeminiGenerate}>✨ 生成</button>
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

export default BuyerChatRoom;