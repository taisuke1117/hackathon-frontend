import React, { useState, useEffect } from 'react';
import { ManagedProductCard } from '../components/ManagedProductCard';
import { apiFetch } from '../api/client';
import './Deals.css';

function Deals() {
  const [filterTab, setFilterTab] = useState('available');
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/me/products')
      .then(res => {
        setProducts(res.products || []);
        setSummary(res.summary);
      })
      .catch(err => console.error('出品一覧の取得に失敗:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // 各タブの該当件数を動的にカウント
  const counts = {
    available: products.filter(p => p.status === 'available').length,
    negotiating: products.filter(p => p.status === 'negotiating').length,
    unshipped: products.filter(p => p.status === 'unshipped').length,
    shipped: products.filter(p => p.status === 'shipped').length,
  };

  const filteredProducts = products.filter(product => product.status === filterTab);

  return (
    <div className="deals-container">
      <h2 className="deals-page-title">取引・出品管理</h2>

      {/* 📊 ダッシュボードサマリーボード */}
      <div className="dashboard-summary-grid">
        <div className="summary-card gold-card">
          <span className="summary-label">累計販売金額</span>
          <span className="summary-value">¥{(summary?.total_sales || 0).toLocaleString()}</span>
        </div>

        <div className="summary-card">
          <span className="summary-label">販売済数</span>
          <span className="summary-value">{summary?.sold_count || 0}<small>品</small></span>
        </div>

        <div className="summary-card highlight-card">
          <span className="summary-label">未発送</span>
          <span className="summary-value">{summary?.pending_delivery_count || 0}<small>件</small></span>
        </div>

        <div className="summary-card">
          <span className="summary-label">出品中</span>
          <span className="summary-value">{summary?.current_listing_count || 0}<small>品</small></span>
        </div>

        <div className="summary-card">
          <span className="summary-label">交渉中チャット</span>
          <span className="summary-value">{summary?.active_chat_count || 0}<small>部屋</small></span>
        </div>
      </div>

      {/* 🔍 ステータスタブメニュー */}
      <div className="filter-tab-bar">
        <button
          className={`tab-btn ${filterTab === 'available' ? 'active' : ''}`}
          onClick={() => setFilterTab('available')}
        >
          出品中 <span className="tab-count-badge">({counts.available})</span>
        </button>

        <button
          className={`tab-btn ${filterTab === 'negotiating' ? 'active' : ''}`}
          onClick={() => setFilterTab('negotiating')}
        >
          交渉中 <span className="tab-count-badge">({counts.negotiating})</span>
        </button>

        <button
          className={`tab-btn ${filterTab === 'unshipped' ? 'active' : ''}`}
          onClick={() => setFilterTab('unshipped')}
        >
          未発送 <span className="tab-count-badge">({counts.unshipped})</span>
        </button>

        <button
          className={`tab-btn ${filterTab === 'shipped' ? 'active' : ''}`}
          onClick={() => setFilterTab('shipped')}
        >
          発送済み <span className="tab-count-badge">({counts.shipped})</span>
        </button>
      </div>

      {/* 📦 商品一覧 */}
      <div className="deals-products-section">
        {isLoading ? (
          <div className="empty-deals-message">読み込み中…</div>
        ) : filteredProducts.length > 0 ? (
          <div className="product-grid-three">
            {filteredProducts.map(item => (
              <ManagedProductCard
                key={item.product_id}
                id={item.product_id}
                image={item.image_url}
                price={item.price}
                status={item.status}
                likeCount={item.likes_count}
                unreadChatCount={item.unread_chat_count}
              />
            ))}
          </div>
        ) : (
          <div className="empty-deals-message">
            該当する商品は現在のステータスにありません
          </div>
        )}
      </div>
    </div>
  );
}

export default Deals;
