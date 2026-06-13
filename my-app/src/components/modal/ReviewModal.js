import React, { useState } from 'react';
import { apiFetch } from '../../api/client';
import './ReviewModal.css';

// ─────────────────────────────────────────────────────────
// ReviewModal: 受取評価モーダルコンポーネント
//
// 発送済み商品を受け取った購入者が出品者を星1〜5 + コメントで評価する。
// 使用箇所: Purchase（購入履歴）/ BuyerChatRoom（チャット画面）
//
// Props:
//   product     : 評価対象の商品（{ product_id, name }）
//   onClose()   : モーダルを閉じる（キャンセル or オーバーレイクリック）
//   onSubmitted(): 評価送信成功後のコールバック（一覧再取得などに使う）
//
// 星のインタラクション:
//   hovered > 0 の間は hovered の値を優先表示
//   マウスが外れたら rating（確定値）に戻る
//   クリックで rating を確定
// ─────────────────────────────────────────────────────────

export function ReviewModal({ product, onClose, onSubmitted }) {
  const [rating, setRating] = useState(5);    // 確定した星の数（デフォルト5）
  const [hovered, setHovered] = useState(0);  // ホバー中の星（0なら非ホバー）
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 星の数に対応する日本語ラベル
  const labels = {
    1: '残念だった',
    2: 'いまいち',
    3: 'ふつう',
    4: '良かった',
    5: 'とても良かった！',
  };

  // 評価送信: POST /api/products/:id/reviews
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/products/${product.product_id}/reviews`, {
        method: 'POST',
        body: { rating, comment },
      });
      onSubmitted(); // 親に完了を通知（一覧の再取得など）
    } catch (err) {
      alert(`評価の送信に失敗しました: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    // オーバーレイクリックでモーダルを閉じる
    <div className="review-modal-overlay" onClick={onClose}>
      {/* モーダル本体: クリックが親に伝播しないよう stopPropagation */}
      <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="review-modal-title">受取評価</h3>
        <p className="review-modal-product">「{product.name}」の取引はいかがでしたか？</p>

        {/* 星セレクター（1〜5）*/}
        <div className="review-star-row">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              // hovered がある間はそちらを優先（マウス追従で星が変わる）
              className={`review-star-btn ${(hovered || rating) >= n ? 'filled' : ''}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`星${n}`}
            >
              ★
            </button>
          ))}
        </div>
        {/* 現在の星数に対応するラベルを表示 */}
        <div className="review-star-label">{labels[hovered || rating]}</div>

        <textarea
          className="review-comment-input"
          rows="3"
          placeholder="出品者へのお礼や感想を書きましょう（省略可）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="review-modal-actions">
          <button type="button" className="review-cancel-btn" onClick={onClose}>キャンセル</button>
          <button type="button" className="review-submit-btn" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? '送信中…' : '評価を送信する'}
          </button>
        </div>
      </div>
    </div>
  );
}
