import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notification.css';

function Notification() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('transaction');

  // 🔔 取引関連の通知データ
  const transactionNotifications = [
    {
      id: 1,
      title: "発送完了のお知らせ",
      description: "「ビンテージカメラ」の発送手続きが完了しました。商品の到着をお待ちください。",
      timestamp: "10分前",
      isUnread: true,
      link: "/chat/p101/501" // クリック時の遷移先例
    },
    {
      id: 2,
      title: "価格交渉が成立しました！",
      description: "「北欧風チェア」の出品者があなたの値引き要求（¥26,000）を承認しました。",
      timestamp: "3時間前",
      isUnread: true,
      link: "/chat/p102/502"
    },
    {
      id: 3,
      title: "商品が購入されました",
      description: "「古着スウェット」が購入されました。発送準備を進めてください。",
      timestamp: "昨日",
      isUnread: false,
      link: "/deals"
    }
  ];

  // 📢 運営・ニュース関連の通知データ
  const newsNotifications = [
    {
      id: 101,
      title: "システムメンテナンスのお知らせ",
      description: "明日午前2:00〜5:00の間、決済機能のメンテナンスを行います。",
      timestamp: "2日前",
      isUnread: false,
      link: null
    },
    {
      id: 102,
      title: "【キャンペーン】今だけ出品手数料が半額！",
      description: "週末限定の特大イベント開催中。この機会に不要なものを出品しよう！",
      timestamp: "5日前",
      isUnread: false,
      link: null
    }
  ];

  const currentNotifications = activeTab === 'transaction' ? transactionNotifications : newsNotifications;

  return (
    <div className="notify-container">
      {/* ヘッダーエリア */}
      <div className="notify-header">
        <button className="notify-back-btn" onClick={() => navigate(-1)}>← 戻る</button>
        <h2 className="notify-page-title">お知らせ</h2>
        <div style={{ width: '40px' }}></div> {/* 左右バランス用 */}
      </div>

      {/* タブ切り替えバー */}
      <div className="notify-tab-bar">
        <button 
          className={`notify-tab-btn ${activeTab === 'transaction' ? 'active' : ''}`}
          onClick={() => setActiveTab('transaction')}
        >
          取引関連
          {transactionNotifications.some(n => n.isUnread) && <span className="notify-alert-dot" />}
        </button>
        <button 
          className={`notify-tab-btn ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          ニュース
        </button>
      </div>

      {/* 通知リストエリア */}
      <div className="notify-list-wrapper">
        {currentNotifications.length > 0 ? (
          currentNotifications.map(item => (
            <div 
              key={item.id} 
              className={`notify-row-item ${item.isUnread ? 'unread' : ''} ${item.link ? 'clickable' : ''}`}
              onClick={() => item.link && navigate(item.link)}
            >
              <div className="notify-main-content">
                <div className="notify-title-line">
                  <span className="notify-item-title">{item.title}</span>
                  <span className="notify-timestamp">{item.timestamp}</span>
                </div>
                <p className="notify-item-desc">{item.description}</p>
              </div>
              {item.link && <span className="notify-arrow-hint">＞</span>}
            </div>
          ))
        ) : (
          <div className="notify-empty-message">お知らせはありません</div>
        )}
      </div>
    </div>
  );
}

export default Notification;