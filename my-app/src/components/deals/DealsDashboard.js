import React from 'react';
import './DealsDashboard.css';

/**
 * 取引管理ダッシュボードのサマリーカード群。
 * props: summary({ total_sales, sold_count, pending_delivery_count, current_listing_count, active_chat_count })
 */
export function DealsDashboard({ summary }) {
  const s = summary || {};
  return (
    <div className="dashboard-summary-grid">
      <div className="summary-card gold-card">
        <span className="summary-label">累計販売金額</span>
        <span className="summary-value">¥{(s.total_sales || 0).toLocaleString()}</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">販売済数</span>
        <span className="summary-value">{s.sold_count || 0}<small>品</small></span>
      </div>
      <div className="summary-card highlight-card">
        <span className="summary-label">未発送</span>
        <span className="summary-value">{s.pending_delivery_count || 0}<small>件</small></span>
      </div>
      <div className="summary-card">
        <span className="summary-label">出品中</span>
        <span className="summary-value">{s.current_listing_count || 0}<small>品</small></span>
      </div>
      <div className="summary-card">
        <span className="summary-label">交渉中チャット</span>
        <span className="summary-value">{s.active_chat_count || 0}<small>部屋</small></span>
      </div>
    </div>
  );
}
