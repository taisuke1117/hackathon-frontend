import React from 'react';
import { formatClock } from '../../utils/format';

// ChatTimeline: チャットメッセージ一覧の表示コンポーネント

export function ChatTimeline({ messages, myId, otherUserIcon, chatEndRef }) {
  return (
    <div className="room-timeline">
      {messages.map((msg) => {
        // sender_id と自分の UID が一致すれば自分のメッセージ
        const isMe = msg.sender_id === myId;

        return (
          <div key={msg.chat_id} className={`msg-row ${isMe ? 'row-me' : 'row-other'}`}>
            {/* 相手メッセージのときだけアイコンを左に表示 */}
            {!isMe && (otherUserIcon
              ? <img src={otherUserIcon} alt="アバター" className="msg-avatar" />
              : <div className="msg-avatar" style={{ background: '#444' }} />)}  {/* アイコンがないときはダミーの丸を表示 */}

            <div className="msg-bubble-wrapper">
              {/* 自分のメッセージ: 時刻を bubble の左側に表示 */}
              {isMe && <span className="msg-time">{formatClock(msg.created_at)}</span>}

              {/* メッセージ内容　*/}
              <div className={`msg-bubble ${isMe ? 'bubble-me' : 'bubble-other'}`}>
                {msg.content}
              </div>

              {/* 相手のメッセージ: 時刻を bubble の右側に表示 */}
              {!isMe && <span className="msg-time">{formatClock(msg.created_at)}</span>}
            </div>
          </div>
        );
      })}

      {/* 新メッセージ到着時に自動スクロールするためのダミー要素 */}
      {/* useChatRoom の useEffect で scrollIntoView される */}
      <div ref={chatEndRef} />
    </div>
  );
}
