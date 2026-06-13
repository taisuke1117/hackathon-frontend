import React, { useState } from 'react';
import { apiFetch } from '../../api/client';

// GeminiAssistantBox: チャット内のAI返信文自動生成ボックス

export function GeminiAssistantBox({ role, room, myId, onGenerated }) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // role によってプレースホルダーを切り替え（UXの文脈ヒント）
  const placeholder = role === 'seller'
    ? 'Geminiに断り文や返答を作ってもらう（例: 値下げを断る）'
    : 'Geminiにチャット文を作ってもらう（例: 状態の確認）';

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsLoading(true);
    try {
      // 直近10件のメッセージを is_me フラグ付きで送る
      // バックエンドはこれを Gemini に渡し、会話文脈を理解させる
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
          discount_proposed: room.discount_proposed || 0, // 提案中の値引き額
          discount_approved: room.discount_approved || 0, // 承認済みの値引き額
          messages: msgs,
          instruction: aiPrompt, // ユーザーの指示（「断り文を作って」など）
        },
      });

      onGenerated(res.text); // 生成されたテキストを親の入力欄にセット
      setAiPrompt('');        // 指示欄をクリア
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
        {isLoading ? '生成中…' : '生成'}
      </button>
    </div>
  );
}
