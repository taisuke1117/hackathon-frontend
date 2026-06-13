import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import './LiveList.css';

function LiveList() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/api/live/rooms')
      .then(data => setRooms(data || []))
      .catch(err => console.error('ライブ一覧の取得に失敗:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="live-list-container">
      <div className="live-list-header">
        <h2 className="live-list-title">ライブ配信</h2>
        <button className="live-create-btn" onClick={() => navigate('/live/create')}>
          配信する
        </button>
      </div>

      {isLoading ? (
        <p className="live-loading">読み込み中...</p>
      ) : rooms.length === 0 ? (
        <div className="live-empty">
          <p>現在配信中のライブはありません</p>
          <button className="live-create-btn-large" onClick={() => navigate('/live/create')}>
            配信を始める
          </button>
        </div>
      ) : (
        <div className="live-room-grid">
          {rooms.map(room => (
            <div
              key={room.room_id}
              className="live-room-card"
              onClick={() => navigate(`/live/${room.room_id}`)}
            >
              <div className="live-card-top">
                <span className="live-badge">LIVE</span>
                <span className="live-viewer-count">{room.viewer_count} 視聴中</span>
              </div>
              <div className="live-card-seller">
                {room.seller_icon && (
                  <img src={room.seller_icon} alt="" className="live-seller-icon" />
                )}
                <span className="live-seller-name">{room.seller_name}</span>
              </div>
              <p className="live-card-title">{room.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LiveList;
