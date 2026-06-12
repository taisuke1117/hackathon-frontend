import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { formatTime } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import './Notification.css';

function Notification() {
  const navigate = useNavigate();
  const { refreshBadges } = useAuth();
  const [activeTab, setActiveTab] = useState('transaction');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    apiFetch('/api/notifications')
      .then(list => setNotifications(list || []))
      .catch(err => console.error('通知の取得に失敗:', err));
  }, []);

  // type='transaction' は取引タブ、それ以外はニュースタブへ
  const transactionNotifications = notifications.filter(n => n.type === 'transaction');
  const newsNotifications = notifications.filter(n => n.type !== 'transaction');
  const currentNotifications = activeTab === 'transaction' ? transactionNotifications : newsNotifications;

  const handleClick = async (item) => {
    // 既読化（失敗しても遷移は続行）
    if (!item.is_read) {
      apiFetch(`/api/notifications/${item.notification_id}/read`, { method: 'PUT' })
        .then(refreshBadges)
        .catch(() => {});
      setNotifications(prev => prev.map(n =>
        n.notification_id === item.notification_id ? { ...n, is_read: true } : n
      ));
    }
    if (item.link_url) navigate(item.link_url);
  };

  return (
    <div className="notify-container">
      {/* ヘッダーエリア */}
      <div className="notify-header">
        <button className="notify-back-btn" onClick={() => navigate(-1)}>← 戻る</button>
        <h2 className="notify-page-title">お知らせ</h2>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* タブ切り替えバー */}
      <div className="notify-tab-bar">
        <button
          className={`notify-tab-btn ${activeTab === 'transaction' ? 'active' : ''}`}
          onClick={() => setActiveTab('transaction')}
        >
          取引関連
          {transactionNotifications.some(n => !n.is_read) && <span className="notify-alert-dot" />}
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
              key={item.notification_id}
              className={`notify-row-item ${!item.is_read ? 'unread' : ''} ${item.link_url ? 'clickable' : ''}`}
              onClick={() => handleClick(item)}
            >
              <div className="notify-main-content">
                <div className="notify-title-line">
                  <span className="notify-item-title">{item.title}</span>
                  <span className="notify-timestamp">{formatTime(item.created_at)}</span>
                </div>
                <p className="notify-item-desc">{item.content}</p>
              </div>
              {item.link_url && <span className="notify-arrow-hint">＞</span>}
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
