import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LiveKitRoom,
  useTracks,
  VideoTrack,
  RoomAudioRenderer,
  useLocalParticipant,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { apiFetch, API_URL } from '../../api/client';
import { fireAuth } from '../../firebase';
import LiveChat from '../../components/live/LiveChat';
import './LiveHost.css';

// ── HostStage: LiveKitRoom コンテキスト内で実行される配信者UI ──
// useTracks / useLocalParticipant はここで使う（LiveKitRoom の外では使えない）
function HostStage({
  room, product, queue, secondsLeft, statusMsg, statusType,
  comments, roomId, onNext, onEnd,
}) {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: false }
  );
  const localCam = tracks.find(t => t.participant.isLocal);

  const timerSeconds = room?.timer_seconds || 30;
  const timerPct = Math.max(0, Math.min(100, (secondsLeft / timerSeconds) * 100));

  return (
    <div className="livehost-stage">
      <RoomAudioRenderer />

      {/* カメラ映像（フルスクリーン背景） */}
      {localCam ? (
        <VideoTrack trackRef={localCam} className="livehost-video-fill" />
      ) : (
        <div className="livehost-video-off">カメラオフ</div>
      )}

      {/* 上部バー: LIVE / マイク・カメラトグル / 視聴者数 */}
      <div className="livehost-top-bar">
        <span className="livehost-live-badge">LIVE</span>
        <div className="livehost-media-controls">
          <button
            className={`livehost-track-btn ${isCameraEnabled ? 'on' : 'off'}`}
            onClick={() => localParticipant?.setCameraEnabled(!isCameraEnabled)}
          >
            カメラ {isCameraEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            className={`livehost-track-btn ${isMicrophoneEnabled ? 'on' : 'off'}`}
            onClick={() => localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled)}
          >
            マイク {isMicrophoneEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        <span className="livehost-viewer">{room?.viewer_count || 0} 視聴中</span>
      </div>

      {/* チャットオーバーレイ（左下） */}
      <LiveChat roomId={roomId} comments={comments} />

      {/* 下部パネル: タイマーバー / 商品情報 / 操作ボタン */}
      <div className="livehost-bottom-panel">
        {product ? (
          <>
            {product.mode === 'auction' && product.status === 'active' && secondsLeft > 0 && (
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
                  {product.mode === 'auction' && secondsLeft === 0 && product.status === 'active' && !product.current_bidder && (
                    <p className="livehost-timer-waiting">入札待ち</p>
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
                <button className="livehost-next-btn" onClick={onNext}>次の商品へ</button>
                <button className="livehost-end-btn" onClick={onEnd}>終了</button>
              </div>
            </div>
          </>
        ) : (
          <div className="livehost-bottom-content">
            {statusMsg && (
              <p className={`livehost-status ${statusType}`}>{statusMsg}</p>
            )}
            <div className="livehost-controls">
              <button className="livehost-end-btn" style={{ flex: 1 }} onClick={onEnd}>
                配信を終了する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── LiveHost: 配信者ページ本体（SSE・商品管理・状態管理） ──
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
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [comments, setComments] = useState([]);

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

  const resetTimer = useCallback((seconds) => {
    clearInterval(timerRef.current);
    let s = seconds;
    timerRef.current = setInterval(() => {
      s -= 1;
      setSecondsLeft(s);
      if (s <= 0) clearInterval(timerRef.current);
    }, 1000);
  }, []);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(`/api/live/rooms/${roomId}/start`, { method: 'POST' });
      setLivekitToken(data.livekit_token);
      setLivekitUrl(data.livekit_url);
      setIsStarted(true);
      connectSSE();
      const roomData = await apiFetch(`/api/live/rooms/${roomId}`);
      setRoom(roomData);
      setProduct(roomData.current_product || null);
      setQueue(roomData.queue || []);
      // 過去コメントを取得
      apiFetch(`/api/live/rooms/${roomId}/comments`)
        .then(list => setComments(list || []))
        .catch(() => {});
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
            clearInterval(timerRef.current);
            setSecondsLeft(0); // 初入札まで表示しない
            setStatusMsg('次の商品に移りました');
            setStatusType('');
            break;
          case 'comment':
            if (event.comment) setComments(prev => [...prev, event.comment]);
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
      <div className="livehost-video-area">
        {isStarted && livekitToken && livekitUrl ? (
          <LiveKitRoom
            serverUrl={livekitUrl}
            token={livekitToken}
            connect
            video={camOn}
            audio={micOn}
          >
            <HostStage
              room={room}
              product={product}
              queue={queue}
              secondsLeft={secondsLeft}
              statusMsg={statusMsg}
              statusType={statusType}
              comments={comments}
              roomId={roomId}
              onNext={handleNext}
              onEnd={handleEnd}
            />
          </LiveKitRoom>
        ) : (
          <div className="livehost-video-placeholder">
            <div className="livehost-prestart-controls">
              <button
                className={`livehost-media-toggle ${camOn ? 'on' : 'off'}`}
                onClick={() => setCamOn(v => !v)}
              >
                カメラ {camOn ? 'ON' : 'OFF'}
              </button>
              <button
                className={`livehost-media-toggle ${micOn ? 'on' : 'off'}`}
                onClick={() => setMicOn(v => !v)}
              >
                マイク {micOn ? 'ON' : 'OFF'}
              </button>
            </div>
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
    </div>
  );
}

export default LiveHost;
