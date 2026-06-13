import React, { useState } from 'react';
import './LikeButton.css';

// ─────────────────────────────────────────────────────────
// LikeButton: 汎用のいいねボタンコンポーネント
//
// 楽観的UI を採用している:
//   ボタンを押した瞬間にローカルの state を更新（画面上で即座に反映）し、
//   API 呼び出しは親コンポーネント（ProductCard / ProductDetail など）に委譲する。
//   → このコンポーネント自体は API を叩かない。onToggle 経由で親に通知するだけ。
//
// Props:
//   isLikedInitial  : 初期いいね状態（サーバーから取得した値）
//   likeCountInitial: 初期いいね数
//   onToggle(nextState): トグル後の状態（true=いいね済み）を親に通知するコールバック
//
// e.stopPropagation() の理由:
//   ProductCard の中に配置されるため、ハート押下が ProductCard のクリック（詳細遷移）
//   に伝播しないようにしている。
// ─────────────────────────────────────────────────────────

export const LikeButton = ({ isLikedInitial = false, likeCountInitial = 0, onToggle }) => {
  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const [likeCount, setLikeCount] = useState(likeCountInitial);

  const handleLikeClick = (e) => {
    e.stopPropagation(); // 親要素（ProductCard等）へのクリック伝播を止める

    const nextState = !isLiked;
    setIsLiked(nextState);                                      // 楽観的UI: 即反映
    setLikeCount(prev => nextState ? prev + 1 : prev - 1);      // カウントも即更新

    if (onToggle) {
      onToggle(nextState); // 親に通知（親が API を叩く）
    }
  };

  return (
    <div className="like-component">
      <button
        className={`like-trigger-btn ${isLiked ? 'liked' : ''}`}
        onClick={handleLikeClick}
        aria-label="いいね"
      >
        {/* いいね済み: 塗りつぶしハート / 未いいね: 枠線ハート */}
        {/* fill/stroke はどちらも CSS の var(--primary) で制御 */}
        {isLiked ? (
          <svg className="heart-svg" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        ) : (
          <svg className="heart-svg" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        )}
      </button>
      <span className={`like-counter-text ${isLiked ? 'liked' : ''}`}>{likeCount}</span>
    </div>
  );
};
