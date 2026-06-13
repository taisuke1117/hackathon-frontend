import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { formatTime } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import './Notification.css';

// ─────────────────────────────────────────────────────────
// Notification: お知らせ一覧ページ（ヘッダーのベルアイコンから来る）
//
// タブ切り替えで2種類の通知を表示:
//   「取引関連」: 値引き承認・発送通知・購入通知など（type='transaction'）
//   「ニュース」: キャンペーンや一般的なお知らせ（type以外）
//
// 既読処理:
//   通知行をクリックすると即座にローカルで is_read=true にして
//   バッジを消す（楽観的UI）。バックエンドのPUTは失敗しても無視。
//   refreshBadges でヘッダーの未読数バッジも更新する。
// ─────────────────────────────────────────────────────────

function Notification() {
  const navigate = useNavigate();
  // refreshBadges: ヘッダーのバッジ数を再取得するためのコールバック（AuthContextに定義）
  const { refreshBadges } = useAuth();
  // activeTab: 'transaction'（取引関連）or 'news'（ニュース）
  const [activeTab, setActiveTab] = useState('transaction');
  const [notifications, setNotifications] = useState([]);

  // マウント時に全通知を取得
  useEffect(() => {
    apiFetch('/api/notifications')
      .then(list => setNotifications(list || []))
      .catch(err => console.error('通知の取得に失敗:', err));
  }, []);

  // タブ別に通知をフィルタ
  const transactionNotifications = notifications.filter(n => n.type === 'transaction');
  const newsNotifications         = notifications.filter(n => n.type !== 'transaction');
  const currentNotifications = activeTab === 'transaction' ? transactionNotifications : newsNotifications;

  // 通知クリック時: 既読化 → ヘッダーバッジ更新 → link_url があれば遷移
  const handleClick = async (item) => {
    if (!item.is_read) {
      // ローカルで即座に既読にする（楽観的UI）
      setNotifications(prev => prev.map(n =>
        n.notification_id === item.notification_id ? { ...n, is_read: true } : n
      ));
      // バックエンドに既読を記録（失敗してもUIには影響しない）
      apiFetch(`/api/notifications/${item.notification_id}/read`, { method: 'PUT' })
        .then(refreshBadges) // ヘッダーの赤バッジを更新
        .catch(() => {});
    }
    if (item.link_url) navigate(item.link_url);
  };

  return (
    <div className="notify-container">
      <div className="notify-header">
        <button className="notify-back-btn" onClick={() => navigate(-1)}>← 戻る</button>
        <h2 className="notify-page-title">お知らせ</h2>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* タブ切り替え（未読通知があるタブにはドットを表示）*/}
      <div className="notify-tab-bar">
        <button
          className={`notify-tab-btn ${activeTab === 'transaction' ? 'active' : ''}`}
          onClick={() => setActiveTab('transaction')}
        >
          取引関連
          {/* 未読がある場合は赤いドットで示す */}
          {transactionNotifications.some(n => !n.is_read) && <span className="notify-alert-dot" />}
        </button>
        <button
          className={`notify-tab-btn ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          ニュース
        </button>
      </div>

      {/* 通知リスト */}
      <div className="notify-list-wrapper">
        {currentNotifications.length > 0 ? (
          currentNotifications.map(item => (
            <div
              key={item.notification_id}
              // 未読なら 'unread' クラス（背景色などで視覚的に区別）
              // link_url があれば 'clickable' クラス（カーソルがポインターになる）
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
