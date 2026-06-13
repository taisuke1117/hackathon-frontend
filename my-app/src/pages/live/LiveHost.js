import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { apiFetch, API_URL } from '../../api/client';
import { fireAuth } from '../../firebase';
import './LiveHost.css';

function LiveHost() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [product, setProduct] = useState(null);
  const [queue, setQueue] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [livekitToken, setLivekitToken] = useState(null);
  const [livekitUrl, setLivekitUrl] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('');
  const [streamEnded, setStreamEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const timerRef = useRef(null);
  const sseRef = useRef(null);

  useEffect(() => {
    apiFetch(`/api/live/rooms/${roomId}`)
      .then(data => {
        setRoom(data);
        setProduct(data.current_product || null);
        setQueue(data.queue || []);
        if (data.status === 'live') setIsStarted(true);
        if (data.status === 'ended') setStreamEnded(true);
      })
      .catch(err => console.error('ルーム取得失敗:', err));
  }, [roomId]);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(`/api/live/rooms/${roomId}/start`, { method: 'POST' });
      setLivekitToken(data.livekit_token);
      setLivekitUrl(data.livekit_url);
      setIsStarted(true);
      connectSSE();
      const roomData = await apiFetch(`/api/live/rooms/${roomId}`);
      setProduct(roomData.current_product || null);
      setQueue(roomData.queue || []);
    } catch (e) {
      setStatusMsg(`配信開始エラー: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      await apiFetch(`/api/live/rooms/${roomId}/next`, { method: 'POST' });
    } catch (e) {
      setStatusMsg(e.message);
    }
  };

  const handleEnd = async () => {
    if (!window.confirm('配信を終了しますか？')) return;
    try {
      await apiFetch(`/api/live/rooms/${roomId}/end`, { method: 'POST' });
      setStreamEnded(true);
      clearInterval(timerRef.current);
      sseRef.current?.cancel();
    } catch (e) {
      setStatusMsg(e.message);
    }
  };

  const connectSSE = () => {
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
            setStatusMsg(`${event.product?.bidder_name} が ¥${event.product?.current_price?.toLocaleString()} で入札`);
            setStatusType('bid');
            break;
          case 'sold':
            setProduct(prev => prev ? { ...prev, status: 'sold' } : prev);
            setStatusMsg(`¥${event.final_price?.toLocaleString()} — ${event.buyer_name} が落札`);
            setStatusType('sold');
            clearInterval(timerRef.current);
            break;
          case 'skipped':
            setStatusMsg('入札なし — 次の商品へ移動します');
            setStatusType('skipped');
            break;
          case 'queue_empty':
            setProduct(null);
            setQueue([]);
            setStatusMsg('すべての商品が終了しました。配信を終了してください。');
            setStatusType('skipped');
            clearInterval(timerRef.current);
            break;
          case 'next':
            setProduct(event.product);
            setQueue(prev => prev.filter(q => q.id !== event.product?.id));
            setSecondsLeft(event.product?.seconds_left || 30);
            if (event.product?.mode === 'auction') resetTimer(event.product?.seconds_left || 30);
            setStatusMsg('次の商品に移りました');
            setStatusType('');
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
  };

  useEffect(() => () => {
    clearInterval(timerRef.current);
    sseRef.current?.cancel();
  }, []);

  const timerPct = Math.max(0, Math.min(100, (secondsLeft / 30) * 100));

  if (streamEnded) {
    return (
      <div className="livehost-ended">
        <p>配信が終了しました</p>
        <button onClick={() => navigate('/live')}>ライブ一覧へ戻る</button>
      </div>
    );
  }

  return (
    <div className="livehost-container">
      {/* フルスクリーンカメラ */}
      <div className="livehost-video-area">
        {isStarted && livekitToken && livekitUrl ? (
          <LiveKitRoom serverUrl={livekitUrl} token={livekitToken} connect video audio>
            <VideoConference />
          </LiveKitRoom>
        ) : (
          <div className="livehost-video-placeholder">
            <button
              className="livehost-start-btn"
              onClick={handleStart}
              disabled={isLoading}
            >
              {isLoading ? '準備中...' : '配信を開始する'}
            </button>
          </div>
        )}
      </div>

      {/* 上部オーバーレイ（配信開始後） */}
      {isStarted && (
        <div className="livehost-top-bar">
          <span className="livehost-live-badge">LIVE</span>
          <span className="livehost-viewer">{room?.viewer_count || 0} 視聴中</span>
        </div>
      )}

      {/* 下部オーバーレイ（配信開始後） */}
      {isStarted && (
        <div className="livehost-bottom-panel">
          {product ? (
            <>
              {product.mode === 'auction' && product.status === 'active' && (
                <div className="livehost-timer-bar-wrap">
                  <div
                    className={`livehost-timer-bar ${secondsLeft <= 10 ? 'urgent' : secondsLeft <= 20 ? 'warning' : ''}`}
                    style={{ width: `${timerPct}%` }}
                  />
                </div>
              )}

              <div className="livehost-bottom-content">
                <p className="livehost-current-label">販売中</p>
                <div className="livehost-product-row">
                  {product.product_image && (
                    <img src={product.product_image} alt="" className="livehost-product-thumb" />
                  )}
                  <div className="livehost-product-info">
                    <p className="livehost-product-name">{product.product_name}</p>
                    <p className="livehost-product-price">¥{(product.current_price || 0).toLocaleString()}</p>
                    {product.mode === 'auction' && secondsLeft > 0 && product.status === 'active' && (
                      <p className={`livehost-timer ${secondsLeft <= 10 ? 'urgent' : ''}`}>残り {secondsLeft}秒</p>
                    )}
                    {product.bidder_name && (
                      <p className="livehost-bidder">最高入札: {product.bidder_name}</p>
                    )}
                  </div>
                </div>

                {statusMsg && (
                  <p className={`livehost-status ${statusType}`}>{statusMsg}</p>
                )}

                {queue.length > 0 && (
                  <p className="livehost-queue-hint">次: {queue[0].product_name}</p>
                )}

                <div className="livehost-controls">
                  <button className="livehost-next-btn" onClick={handleNext}>次の商品へ</button>
                  <button className="livehost-end-btn" onClick={handleEnd}>終了</button>
                </div>
              </div>
            </>
          ) : (
            <div className="livehost-bottom-content">
              {statusMsg && (
                <p className={`livehost-status ${statusType}`}>{statusMsg}</p>
              )}
              <div className="livehost-controls">
                <button className="livehost-end-btn" style={{ flex: 1 }} onClick={handleEnd}>
                  配信を終了する
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LiveHost;
