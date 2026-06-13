import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { apiFetch, API_URL } from '../../api/client';
import { fireAuth } from '../../firebase';
import './LiveRoom.css';

function LiveRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [product, setProduct] = useState(null);    // 現在の商品
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [livekitToken, setLivekitToken] = useState(null);
  const [livekitUrl, setLivekitUrl] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [streamEnded, setStreamEnded] = useState(false);

  const timerRef = useRef(null);
  const sseRef = useRef(null);

  // 初回: ルーム詳細 + 視聴者Livekitトークン取得
  useEffect(() => {
    apiFetch(`/api/live/rooms/${roomId}`)
      .then(data => {
        setRoom(data);
        if (data.current_product) {
          setProduct(data.current_product);
          setSecondsLeft(data.current_product.seconds_left || 0);
        }
        if (data.status !== 'live') setStreamEnded(true);
      })
      .catch(err => console.error('ルーム取得失敗:', err));

    apiFetch(`/api/live/rooms/${roomId}/token`)
      .then(data => {
        setLivekitToken(data.livekit_token);
        setLivekitUrl(data.livekit_url);
      })
      .catch(err => console.error('トークン取得失敗:', err));
  }, [roomId]);

  // SSE接続: サーバーからのリアルタイムイベントを受け取る
  useEffect(() => {
    let cancelled = false;
    let reader = null;

    const connect = async () => {
      const user = fireAuth.currentUser;
      const token = user ? await user.getIdToken() : null;

      let res;
      try {
        res = await fetch(`${API_URL}/api/live/rooms/${roomId}/events`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch { return; }

      reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const resetTimer = (seconds) => {
        clearInterval(timerRef.current);
        let s = seconds;
        timerRef.current = setInterval(() => {
          s -= 1;
          setSecondsLeft(s);
          if (s <= 0) clearInterval(timerRef.current);
        }, 1000);
      };

      const onEvent = (event) => {
        switch (event.type) {
          case 'bid':
            setProduct(event.product);
            setSecondsLeft(event.seconds_left || 30);
            resetTimer(event.seconds_left || 30);
            setStatusMsg(`${event.product?.bidder_name || '誰か'}が ¥${event.product?.current_price?.toLocaleString()} で入札`);
            break;
          case 'sold':
            setProduct(prev => ({ ...prev, status: 'sold' }));
            setStatusMsg(`🎉 ¥${event.final_price?.toLocaleString()} で ${event.buyer_name} が落札！`);
            clearInterval(timerRef.current);
            break;
          case 'next':
            setProduct(event.product);
            setSecondsLeft(event.product?.seconds_left || 30);
            if (event.product?.mode === 'auction') resetTimer(event.product?.seconds_left || 30);
            setStatusMsg('次の商品です！');
            setBidAmount('');
            break;
          case 'end':
            setStreamEnded(true);
            clearInterval(timerRef.current);
            break;
          default:
            break;
        }
      };

      while (!cancelled) {
        let chunk;
        try { chunk = await reader.read(); } catch { break; }
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try { onEvent(JSON.parse(line.slice(6))); } catch {}
          }
        }
      }
    };

    connect();
    sseRef.current = { cancel: () => { cancelled = true; reader?.cancel(); } };
    return () => sseRef.current?.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleBid = async () => {
    const amount = Number(bidAmount);
    if (!amount || amount <= (product?.current_price || 0)) {
      setStatusMsg('現在価格より高い金額を入力してください');
      return;
    }
    try {
      await apiFetch(`/api/live/rooms/${roomId}/bid`, { method: 'POST', body: { amount } });
      setBidAmount('');
    } catch (e) {
      setStatusMsg(e.message);
    }
  };

  const handleBuy = async () => {
    try {
      await apiFetch(`/api/live/rooms/${roomId}/buy`, { method: 'POST' });
    } catch (e) {
      setStatusMsg(e.message);
    }
  };

  if (streamEnded) {
    return (
      <div className="live-ended">
        <p>配信は終了しました</p>
        <button onClick={() => navigate('/live')}>ライブ一覧へ戻る</button>
      </div>
    );
  }

  return (
    <div className="live-room-container">
      {/* Livekit映像エリア */}
      <div className="live-video-area">
        {livekitToken && livekitUrl ? (
          <LiveKitRoom serverUrl={livekitUrl} token={livekitToken} connect>
            <VideoConference />
          </LiveKitRoom>
        ) : (
          <div className="live-video-placeholder">
            <span>映像読み込み中...</span>
          </div>
        )}
        <div className="live-room-info-overlay">
          <div className="live-overlay-left">
            <span className="live-badge-overlay">LIVE</span>
            <span className="live-room-title-overlay">{room?.title}</span>
          </div>
          <span className="live-viewer-overlay">👁 {room?.viewer_count || 0}</span>
        </div>
      </div>

      {/* 現在の商品 */}
      {product ? (
        <div className="live-product-panel">
          <div className="live-product-row">
            {product.product_image && (
              <img src={product.product_image} alt="" className="live-product-img" />
            )}
            <div className="live-product-detail">
              <p className="live-product-name">{product.product_name}</p>
              <p className="live-current-price">¥{(product.current_price || 0).toLocaleString()}</p>
              {product.mode === 'auction' && secondsLeft > 0 && (
                <p className={`live-timer ${secondsLeft <= 10 ? 'urgent' : ''}`}>
                  残り {secondsLeft}秒
                </p>
              )}
              {product.bidder_name && (
                <p className="live-current-bidder">最高入札: {product.bidder_name}</p>
              )}
            </div>
          </div>

          {statusMsg && <p className="live-status-msg">{statusMsg}</p>}

          {/* 入札 / 即決ボタン */}
          {product.status === 'active' && (
            <div className="live-action-area">
              {product.mode === 'auction' ? (
                <div className="live-bid-row">
                  <input
                    className="live-bid-input"
                    type="number"
                    placeholder={`¥${((product.current_price || 0) + 100).toLocaleString()} 以上`}
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                  />
                  <button className="live-bid-btn" onClick={handleBid}>入札する</button>
                </div>
              ) : (
                <div className="live-buy-row">
                  <p className="live-instant-label">
                    即決価格: ¥{(product.instant_price || product.current_price || 0).toLocaleString()}
                  </p>
                  <button className="live-buy-btn" onClick={handleBuy}>今すぐ購入</button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="live-no-product">
          <p>配信準備中...</p>
        </div>
      )}
    </div>
  );
}

export default LiveRoom;
