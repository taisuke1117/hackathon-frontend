import React from 'react';
import './StatusBanner.css';

/**
 * ProductManage用のステータスバナー。
 * props: status("unshipped"|"shipped"), onShip()
 */
export function StatusBanner({ status, onShip }) {
  if (status === 'unshipped') {
    return (
      <div className="status-alert-banner unshipped-banner">
        <div className="banner-message-row">
          <span className="banner-icon">📦</span>
          <div className="banner-text-block">
            <span className="banner-title">商品が購入されました</span>
            <span className="banner-subtitle">梱包を済ませ、速やかに発送を行ってください。</span>
          </div>
        </div>
        <button className="action-btn-ship" onClick={onShip}>
          🚛 発送しました
        </button>
      </div>
    );
  }
  if (status === 'shipped') {
    return (
      <div className="status-alert-banner shipped-banner">
        <div className="banner-message-row">
          <span className="banner-icon">✨</span>
          <div className="banner-text-block">
            <span className="banner-title">発送手続き完了済み</span>
            <span className="banner-subtitle">購入者からの受取評価を待っています。</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
