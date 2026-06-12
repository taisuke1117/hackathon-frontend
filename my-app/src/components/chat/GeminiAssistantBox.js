import React, { useState } from 'react';
import { apiFetch } from '../../api/client';

/**
 * Geminiチャット文生成ボックス。BuyerChatRoom/SellerChatRoomで共用。
 * props: role("buyer"|"seller"), room, myId, onGenerated(text)
 */
export function GeminiAssistantBox({ role, room, myId, onGenerated }) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const placeholder = role === 'seller'
    ? 'Geminiに断り文や返答を作ってもらう（例: 値下げを断る）'
    : 'Geminiにチャット文を作ってもらう（例: 状態の確認）';

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsLoading(true);
    try {
      const msgs = (room.messages || []).slice(-10).map(m => ({
        is_me: m.sender_id === myId,
        content: m.content,
      }));
      const res = await apiFetch('/api/gemini/reply', {
        method: 'POST',
        body: {
          role,
          product_name: room.product_name,
          product_description: room.product_description || '',
          product_price: room.product_price || 0,
          discount_proposed: room.discount_proposed || 0,
          discount_approved: room.discount_approved || 0,
          messages: msgs,
          instruction: aiPrompt,
        },
      });
      onGenerated(res.text);
      setAiPrompt('');
    } catch (err) {
      alert(`AI生成に失敗しました: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gemini-assistant-box">
      <input
        type="text"
        placeholder={placeholder}
        value={aiPrompt}
        onChange={(e) => setAiPrompt(e.target.value)}
        className="gemini-prompt-input"
      />
      <button
        type="button"
        className="gemini-gen-btn"
        disabled={isLoading}
        onClick={handleGenerate}
      >
        {isLoading ? '生成中…' : '✨ 生成'}
      </button>
    </div>
  );
}
