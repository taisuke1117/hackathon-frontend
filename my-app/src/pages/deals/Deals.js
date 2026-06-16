import React, { useState, useEffect } from 'react';
import { ManagedProductCard } from '../../components/product/ManagedProductCard';
import { DealsDashboard } from '../../components/deals/DealsDashboard';
import { apiFetch } from '../../api/client';
import './Deals.css';

// Deals: 取引・出品管理ページ（サマリーダッシュボード＋ステータス別タブ一覧）

function Deals() {
  const [filterTab, setFilterTab] = useState('available');
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // マウント時に自分の出品商品一覧と集計情報を取得
  useEffect(() => {
    apiFetch('/api/me/products')
      .then(res => {
        setProducts(res.products || []);
        setSummary(res.summary);
      })
      .catch(err => console.error('出品一覧の取得に失敗:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // API1回で全ステータス取得し、フロントでフィルタ
  const counts = {
    available:   products.filter(p => p.status === 'available').length,
    negotiating: products.filter(p => p.status === 'negotiating').length,
    unshipped:   products.filter(p => p.status === 'unshipped').length,
    shipped:     products.filter(p => p.status === 'shipped').length,
  };

  const filteredProducts = products.filter(product => product.status === filterTab);

  return (
    <div className="deals-container">
      <h2 className="deals-page-title">取引・出品管理</h2>

      {/* サマリーダッシュボード: 総売上・売却件数・未発送数など */}
      <DealsDashboard summary={summary} />

      {/* ステータスタブバー */}
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

      {/* 商品カード一覧 */}
      <div className="deals-products-section">
        {isLoading ? (
          <div className="empty-deals-message">読み込み中…</div>
        ) : filteredProducts.length > 0 ? (
          <div className="product-grid-three">
            {filteredProducts.map(item => (
              // ManagedProductCard: 出品者視点の商品カード（未読チャット数バッジ付き）
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
