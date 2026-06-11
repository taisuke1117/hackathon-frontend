import React, { useState } from 'react';
import './LikeButton.css';

export const LikeButton = ({ isLikedInitial = false, likeCountInitial = 0, onToggle }) => {
  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const [likeCount, setLikeCount] = useState(likeCountInitial);

  const handleLikeClick = (e) => {
    e.stopPropagation();

    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount(prev => nextState ? prev + 1 : prev - 1);

    if (onToggle) {
      onToggle(nextState);
    }
  };

  return (
    <div className="like-component">
      <button 
        className={`like-trigger-btn ${isLiked ? 'liked' : ''}`} 
        onClick={handleLikeClick}
        aria-label="いいね"
      >
        {isLiked ? (
          /* 💡 fillを直接指定せず、CSSの var(--primary) で制御できるように変更 */
          <svg className="heart-svg" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        ) : (
          /* 💡 strokeもCSS側で制御できるように属性をシンプルに */
          <svg className="heart-svg" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        )}
      </button>
      <span className={`like-counter-text ${isLiked ? 'liked' : ''}`}>{likeCount}</span>
    </div>
  );
};