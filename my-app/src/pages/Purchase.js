import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import './Purchase.css';

function Purchases() {
  const navigate = useNavigate();

  const [hideReceived, setHideReceived] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    apiFetch('/api/me/purchases')
      .then(list => setPurchases(list || []))
      .catch(err => console.error('購入履歴の取得に失敗:', err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ⭐ 受取評価（発送済み商品に対して購入者→出品者）
  const handleReview = async (item) => {
    const ratingStr = prompt(`「${item.name}」の取引はいかがでしたか？\n出品者の評価を1〜5の数字で入力してください（5が最高）`, '5');
    if (!ratingStr) return;
    const rating = Number(ratingStr);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      alert('1〜5の数字で入力してください');
      return;
    }
    const comment = prompt('コメントがあれば入力してください（省略可）', '') || '';
    try {
      await apiFetch(`/api/products/${item.product_id}/reviews`, {
        method: 'POST',
        body: { rating, comment },
      });
      alert('評価を送信しました。ありがとうございました！');
      load();
    } catch (err) {
      alert(`評価の送信に失敗しました: ${err.message}`);
    }
  };

  const statusConfig = (item) => {
    if (item.status === 'unshipped') return { text: '未発送', className: 'status-unshipped' };
    if (item.status === 'shipped' && !item.reviewed) return { text: '評価待ち', className: 'status-shipping' };
    return { text: '受取済み', className: 'status-received' };
  };

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

      {/* リストエリア */}
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
          <div className="purchases-list-layout">
            {displayed.map((item) => {
              const config = statusConfig(item);
              return (
                <div key={item.product_id} className="purchase-card" onClick={() => navigate(`/product/${item.product_id}`)}>
                  {item.image_url && <img src={item.image_url} alt={item.name} className="purchase-card-img" />}

                  <div className="purchase-card-info">
                    <span className={`purchase-status-badge ${config.className}`}>
                      {config.text}
                    </span>
                    <h3 className="purchase-card-title">{item.name}</h3>
                    <p className="purchase-card-price">¥{item.price.toLocaleString()}</p>

                    {/* ⭐ 発送済み＆未評価なら受取評価ボタンを表示 */}
                    {item.status === 'shipped' && !item.reviewed && (
                      <button
                        type="button"
                        className="empty-shop-btn"
                        style={{ marginTop: '6px', padding: '6px 14px', fontSize: '13px' }}
                        onClick={(e) => { e.stopPropagation(); handleReview(item); }}
                      >
                        ⭐ 受取評価をする
                      </button>
                    )}
                  </div>

                  <div className="purchase-card-arrow">＞</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Purchases;
