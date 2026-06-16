import React from 'react';
import './StatusBanner.css';

// StatusBanner: 取引管理画面（ProductManage）のステータスアクションバナー
// ステータスに応じて異なるバナーを表示する（または何も表示しない）:

export function StatusBanner({ status, onShip }) {
  // 未発送: ユーザーにアクションが必要なため強調バナー + 発送ボタン
  if (status === 'unshipped') {
    return (
      <div className="status-alert-banner unshipped-banner">
        <div className="banner-message-row">
          <div className="banner-text-block">
            <span className="banner-title">商品が購入されました</span>
            <span className="banner-subtitle">梱包を済ませ、速やかに発送を行ってください。</span>
          </div>
        </div>
        {/* 発送ボタン: クリックで ProductManage の handleShipProduct が呼ばれる */}
        <button className="action-btn-ship" onClick={onShip}>
          発送しました
        </button>
      </div>
    );
  }

  // 発送済み: 購入者の評価待ち（出品者側に必要なアクションはない）
  if (status === 'shipped') {
    return (
      <div className="status-alert-banner shipped-banner">
        <div className="banner-message-row">
          <div className="banner-text-block">
            <span className="banner-title">発送手続き完了済み</span>
            <span className="banner-subtitle">購入者からの受取評価を待っています。</span>
          </div>
        </div>
      </div>
    );
  }

  // available / negotiating などアクション不要なステータスは表示しない
  return null;
}
