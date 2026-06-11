import React, { useState } from 'react';
import { ManagedProductCard } from '../components/ManagedProductCard';
import './Deals.css';

function Deals() {
  // 💡 初期状態を「すべて」から「出品中」へ変更
  const [filterTab, setFilterTab] = useState('available');

  const sellerSummary = {
    totalSales: 154800,     
    totalCount: 32,         
    activeChatCount: 3,     
    currentListingCount: 5, 
    pendingDeliveryCount: 2 
  };

  // 📦 出品商品データ
  // statusを新しい定義に最適化: 'available'(出品中), 'negotiating'(交渉中), 'unshipped'(未発送), 'shipped'(発送済み)
  const myProducts = [
    { id: 201, title: "スニーカー", price: 8500, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200", likeCount: 14, status: 'unshipped', unreadChatCount: 2 }, 
    { id: 202, title: "ワイヤレスイヤホン", price: 12000, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200", likeCount: 45, status: 'available', unreadChatCount: 1 }, 
    { id: 203, title: "ブランド腕時計", price: 98000, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200", likeCount: 89, status: 'negotiating', unreadChatCount: 0 }, 
    { id: 204, title: "古着スウェット", price: 3200, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200", likeCount: 3, status: 'available', unreadChatCount: 0 }, 
    { id: 205, title: "参考書セット", price: 1500, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200", likeCount: 0, status: 'shipped', unreadChatCount: 0 }, 
  ];

  // 📊 各タブの該当件数を動的にカウント
  const counts = {
    available: myProducts.filter(p => p.status === 'available').length,
    negotiating: myProducts.filter(p => p.status === 'negotiating').length,
    unshipped: myProducts.filter(p => p.status === 'unshipped').length,
    shipped: myProducts.filter(p => p.status === 'shipped').length,
  };

  // 🔍 選択されたタブに基づいて商品をフィルタリング
  const filteredProducts = myProducts.filter(product => product.status === filterTab);

  return (
    <div className="deals-container">
      <h2 className="deals-page-title">取引・出品管理</h2>

      {/* 📊 ダッシュボードサマリーボード */}
      <div className="dashboard-summary-grid">
        <div className="summary-card gold-card">
          <span className="summary-label">累計販売金額</span>
          <span className="summary-value">¥{sellerSummary.totalSales.toLocaleString()}</span>
        </div>
        
        <div className="summary-card">
          <span className="summary-label">販売済数</span>
          <span className="summary-value">{sellerSummary.totalCount}<small>品</small></span>
        </div>

        <div className="summary-card highlight-card">
          <span className="summary-label">未配達</span>
          <span className="summary-value">{sellerSummary.pendingDeliveryCount}<small>件</small></span>
        </div>

        <div className="summary-card">
          <span className="summary-label">出品中</span>
          <span className="summary-value">{sellerSummary.currentListingCount}<small>品</small></span>
        </div>

        <div className="summary-card">
          <span className="summary-label">交渉中チャット</span>
          <span className="summary-value">{sellerSummary.activeChatCount}<small>部屋</small></span>
        </div>
      </div>

      {/* 🔍 中段：【改造】4つの専用ステータスタブメニュー（件数カウンター付き） */}
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

      {/* 📦 下半分：商品一覧 */}
      <div className="deals-products-section">
        {filteredProducts.length > 0 ? (
          <div className="product-grid-three">
            {filteredProducts.map(item => (
              <ManagedProductCard 
                key={item.id}
                id={item.id}
                image={item.image}
                price={item.price}
                status={item.status}
                likeCount={item.likeCount}
                unreadChatCount={item.unreadChatCount}
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