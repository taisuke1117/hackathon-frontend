import React, { useState, useEffect } from 'react';
import { ManagedProductCard } from '../../components/product/ManagedProductCard';
import { DealsDashboard } from '../../components/deals/DealsDashboard';
import { apiFetch } from '../../api/client';
import './Deals.css';

// ─────────────────────────────────────────────────────────
// Deals: 取引・出品管理ページ（フッターの「管理」タブから来る）
//
// 上部に DealsDashboard（総売上・出品中数などのサマリカード）を表示し、
// 下部に自分の出品一覧をステータス別タブで切り替えて表示する。
//
// ステータスの流れ:
//   available（出品中）→ negotiating（交渉中）→ unshipped（未発送）→ shipped（発送済み）
//
// バックエンドは GET /api/me/products で products 配列と summary を返す。
// products は全ステータス分が含まれており、フロントでフィルタする。
// ─────────────────────────────────────────────────────────

function Deals() {
  // filterTab: 現在選択中のタブ（デフォルトは出品中）
  const [filterTab, setFilterTab] = useState('available');
  const [products, setProducts] = useState([]);
  // summary: DealsDashboard に渡す集計情報（total_sales, sold_count など）
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

  // タブのバッジ表示用: 全商品をステータス別にカウント
  // 取得したデータをそのままフロントでフィルタするので API は1回で済む
  const counts = {
    available:   products.filter(p => p.status === 'available').length,
    negotiating: products.filter(p => p.status === 'negotiating').length,
    unshipped:   products.filter(p => p.status === 'unshipped').length,
    shipped:     products.filter(p => p.status === 'shipped').length,
  };

  // 現在のタブに合致する商品だけに絞り込む
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
