import React, { useState } from 'react';
import { apiFetch } from '../api/client';
import './ReviewModal.css';

/**
 * 受取評価モーダル。発送済み商品の購入者が出品者を星1〜5＋コメントで評価する
 * props: product {product_id, name}, onClose(), onSubmitted()
 */
export function ReviewModal({ product, onClose, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labels = { 1: '残念だった', 2: 'いまいち', 3: 'ふつう', 4: '良かった', 5: 'とても良かった！' };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/products/${product.product_id}/reviews`, {
        method: 'POST',
        body: { rating, comment },
      });
      onSubmitted();
    } catch (err) {
      alert(`評価の送信に失敗しました: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="review-modal-title">受取評価</h3>
        <p className="review-modal-product">「{product.name}」の取引はいかがでしたか？</p>

        {/* ⭐ 星セレクター */}
        <div className="review-star-row">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
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
