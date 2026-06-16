import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { PurchaseProductCard } from '../../components/product/PurchaseProductCard';
import { ReviewModal } from '../../components/modal/ReviewModal';
import './Purchase.css';

// Purchases: 購入履歴一覧（縦型グリッド・受取評価モーダル）

function Purchases() {
  const navigate = useNavigate();
  const [hideReceived, setHideReceived] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState(null); // 評価モーダルに渡す対象商品

  // useCallback で安定した参照（評価後に外から再取得するため）
  const load = useCallback(() => {
    apiFetch('/api/me/purchases')
      .then(list => setPurchases(list || []))
      .catch(err => console.error('購入履歴の取得に失敗:', err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // hideReceived が true なら「shipped かつ reviewed済み」の商品を除外
  const displayed = hideReceived
    ? purchases.filter(item => !(item.status === 'shipped' && item.reviewed))
    : purchases;

  return (
    <div className="purchases-page-container">
      {/* ヘッダー */}
      <div className="purchases-page-header">
        <button className="purchases-page-back-btn" onClick={() => navigate(-1)}>✕</button>
        <h1 className="purchases-page-title">購入した商品</h1>
      </div>

      {/* 受取済み非表示フィルタ */}
      <div className="purchases-filter-bar">
        <label className="filter-toggle-label">
          <input
            type="checkbox"
            checked={hideReceived}
            onChange={(e) => setHideReceived(e.target.checked)}
            className="filter-checkbox"
          />
          <span className="filter-text">受取済みを非表示</span>
        </label>
      </div>

      <div className="purchases-page-content">
        {isLoading ? (
          <div className="purchases-empty-state"><p className="empty-text">読み込み中…</p></div>
        ) : displayed.length === 0 ? (
          <div className="purchases-empty-state">
            <p className="empty-text">購入履歴はまだありません。</p>
            <button className="empty-shop-btn" onClick={() => navigate('/')}>
              お買い物を始める
            </button>
          </div>
        ) : (
          <div className="purchases-grid">
            {displayed.map((item) => (
              <PurchaseProductCard
                key={item.product_id}
                id={item.product_id}
                title={item.name}
                price={item.price}
                image={item.image_url}
                status={item.status}
                reviewed={item.reviewed}
                onReview={() => setReviewTarget(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 受取評価モーダル（reviewTarget がセットされたとき表示）*/}
      {reviewTarget && (
        <ReviewModal
          product={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => {
            setReviewTarget(null);
            load(); // 評価後に一覧を再取得してステータスを更新
          }}
        />
      )}
    </div>
  );
}

export default Purchases;
