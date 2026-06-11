import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import sendIcon from '../assets/send.svg';
import './ChatRoom.css';

function SellerChatRoom() {
  const { productId} = useParams(); 
  const navigate = useNavigate();
  const chatEndRef = useRef(null); 

  const productInfo = {
    id: productId || "1",
    title: "ビンテージレザージャケット（1990年代物）",
    price: 28000,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100"
  };

  const buyerUser = { id: "u111", name: "佐藤 たかし（購入希望者）", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" };

  const [messages, setMessages] = useState([
    { id: 1, sender: 'other', text: '不躾なお願いで恐縮ですが、25,000円で即決させていただけないでしょうか？', time: '10:16' },
  ]);
  const [inputText, setInputText] = useState('');
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

  const [proposedPrice] = useState(26000);

  // 値引きを承認するアクション
  const handleApproveDiscount = () => {
    if (window.confirm(`¥${proposedPrice.toLocaleString()} での販売を承認しますか？購入者に通知され、購入しやすくなります。`)) {
      setInputText(`承知いたしました。価格を ¥${proposedPrice.toLocaleString()} に変更しましたので、そのままご購入ください！`);
      alert("価格変更を承認しました。");
    }
  };

  // 💡 出品者用：Gemini返答自動生成
  const handleGeminiReplyGenerate = () => {
    if (!aiPrompt.trim()) return;
    setInputText(`お問い合わせありがとうございます。${aiPrompt}の件ですが、あいにくそこまでのお値下げは難しく、26,500円ではいかがでしょうか？`);
    setAiPrompt('');
  };

  const handleBlockUser = () => {
    if (window.confirm(`${buyerUser.name}様をブロックしますか？以降このユーザーとの取引・メッセージはできなくなります。`)) {
      alert("ユーザーをブロックしました。");
      navigate(-1);
    }
  };

  return (
    <div className="room-container">
      {/* ヘッダー */}
      <div className="room-header">
        <button className="room-back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="room-header-meta">
          <h3 className="room-user-name">{buyerUser.name}</h3>
          <span className="room-header-product-title">{productInfo.title}</span>
        </div>
      </div>

      {/* サブヘッダー */}
      <div className="room-product-bar" onClick={() => navigate(`/deals/manage/${productInfo.id}`)}>
        <img src={productInfo.image} alt="商品" className="room-product-thumb" />
        <div className="room-product-meta">
          <span className="room-product-price">¥{productInfo.price.toLocaleString()}</span>
        </div>
        <span className="room-product-arrow">取引管理画面へ ＞</span>
      </div>

      {/* タイムライン */}
      <div className="room-timeline">
        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <div key={msg.id} className={`msg-row ${isMe ? 'row-me' : 'row-other'}`}>
              {!isMe && <img src={buyerUser.avatar} alt="アバター" className="msg-avatar" />}
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

      {/* 🔥 出品者専用：アクション＆AI返答補助エリア */}
      <div className="room-action-dashboard">
        <div className="seller-direct-actions">
          <button className="action-btn-block" onClick={handleBlockUser}>
            ユーザーをブロック
          </button>
          <button className="action-btn-approve" onClick={handleApproveDiscount}>
            値引きを承認 (¥{proposedPrice.toLocaleString()})
          </button>
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
          <button type="button" className="gemini-gen-btn" onClick={handleGeminiReplyGenerate}>✨ 生成</button>
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