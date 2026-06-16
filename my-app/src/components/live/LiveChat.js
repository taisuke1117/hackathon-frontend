import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../api/client';
import './LiveChat.css';

// ライブチャットオーバーレイ（配信者・視聴者両ページで共用）
// comments は親 (LiveHost/LiveRoom) が SSE で更新して渡してくれる
function LiveChat({ roomId, comments }) {
  const [text, setText] = useState('');
  const listRef = useRef(null);

  // 新しいコメントが来たら自動スクロール
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content) return;
    setText('');
    try {
      await apiFetch(`/api/live/rooms/${roomId}/comment`, {
        method: 'POST',
        body: { content },
      });
    } catch (e) {
      console.error('コメント送信失敗:', e);
    }
  };

  return (
    <div className="livechat-overlay">
      <div className="livechat-list" ref={listRef}>
        {comments.map(c => (
          <div key={c.id} className="livechat-item">
            <span className="livechat-name">{c.user_name}</span>
            <span className="livechat-text">{c.content}</span>
          </div>
        ))}
      </div>
      <div className="livechat-input-row">
        <input
          className="livechat-input"
          type="text"
          placeholder="コメントを入力..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          maxLength={100}
        />
        <button className="livechat-send-btn" onClick={handleSend}>送信</button>
      </div>
    </div>
  );
}

export default LiveChat;
