import React from 'react';
import { formatClock } from '../../utils/format';

/**
 * チャットメッセージ一覧。BuyerChatRoom/SellerChatRoomで共用。
 * props: messages, myId, otherUserIcon, chatEndRef
 */
export function ChatTimeline({ messages, myId, otherUserIcon, chatEndRef }) {
  return (
    <div className="room-timeline">
      {messages.map((msg) => {
        const isMe = msg.sender_id === myId;
        return (
          <div key={msg.chat_id} className={`msg-row ${isMe ? 'row-me' : 'row-other'}`}>
            {!isMe && (otherUserIcon
              ? <img src={otherUserIcon} alt="アバター" className="msg-avatar" />
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
  );
}
