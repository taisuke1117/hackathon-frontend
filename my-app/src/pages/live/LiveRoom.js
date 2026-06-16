import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LiveKitRoom,
  useTracks,
  VideoTrack,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { apiFetch, API_URL } from '../../api/client';
import { fireAuth } from '../../firebase';
import LiveChat from '../../components/live/LiveChat';
import './LiveRoom.css';

// ── ViewerStage: LiveKitRoom コンテキスト内で実行される視聴者UI ──
// useTracks はここで使う（LiveKitRoom の外では使えない）
function ViewerStage({
  room, roomId, product, secondsLeft, statusMsg, setStatusMsg, statusType, setStatusType,
  comments, bidAmount, setBidAmount, navigate,
}) {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: false }
  );
  // 配信者（リモート）のカメラトラックだけを取得
  const remoteCam = tracks.find(t => !t.participant.isLocal);

  const timerSeconds = room?.timer_seconds || 30;
  const timerPct = Math.max(0, Math.min(100, (secondsLeft / timerSeconds) * 100));

  const handleBid = async () => {
    const amount = Number(bidAmount);
    if (!amount || amount <= (product?.current_price || 0)) {
      setStatusMsg('現在価格より高い金額を入力してください');
      setStatusType('');
      return;
    }
    try {
      await apiFetch(`/api/live/rooms/${roomId}/bid`, { method: 'POST', body: { amount } });
      setBidAmount('');
    } catch (e) {
      setStatusMsg(e.message);
      setStatusType('');
    }
  };

  const handleBuy = async () => {
    try {
      await apiFetch(`/api/live/rooms/${roomId}/buy`, { method: 'POST' });
    } catch (e) {
      setStatusMsg(e.message);
      setStatusType('');
    }
  };

  return (
    <div className="live-stage">
      <RoomAudioRenderer />

      {/* 配信者のカメラ映像（フルスクリーン） */}
      {remoteCam ? (
        <VideoTrack trackRef={remoteCam} className="live-video-fill" />
      ) : (
        <div className="live-video-placeholder">配信準備中...</div>
      )}

      {/* 上部オーバーレイ */}
      <div className="live-top-bar">
        <div className="live-overlay-left">
          <button className="live-back-btn" onClick={() => navigate('/live')}>&#8249;</button>
          <span className="live-badge-overlay">LIVE</span>
          <span className="live-room-title-overlay">{room?.title}</span>
        </div>
        <span className="live-viewer-overlay">{room?.viewer_count || 0} 視聴中</span>
      </div>

      {/* チャットオーバーレイ（左下） */}
      <LiveChat roomId={roomId} comments={comments} />

      {/* 下部オーバーレイ */}
      <div className="live-bottom-panel">
        {product ? (
          <>
            {product.mode === 'auction' && product.status === 'active' && secondsLeft > 0 && (
              <div className="live-timer-bar-wrap">
                <div
                  className={`live-timer-bar ${secondsLeft <= 10 ? 'urgent' : secondsLeft <= 20 ? 'warning' : ''}`}
                  style={{ width: `${timerPct}%` }}
                />
              </div>
            )}

            <div className="live-bottom-content">
              <div className="live-product-row">
                {product.product_image && (
                  <img src={product.product_image} alt="" className="live-product-img" />
                )}
                <div className="live-product-detail">
                  <p className="live-product-name">{product.product_name}</p>
                  <p className="live-current-price">¥{(product.current_price || 0).toLocaleString()}</p>
                  {product.mode === 'auction' && secondsLeft > 0 && product.status === 'active' && (
                    <p className={`live-timer-text ${secondsLeft <= 10 ? 'urgent' : ''}`}>残り {secondsLeft}秒</p>
                  )}
                  {product.mode === 'auction' && secondsLeft === 0 && product.status === 'active' && !product.current_bidder && (
                    <p className="live-timer-text">入札待ち中...</p>
                  )}
                  {product.bidder_name && (
                    <p className="live-current-bidder">最高入札: {product.bidder_name}</p>
                  )}
                </div>
              </div>

              {statusMsg && (
                <p className={`live-status-msg ${statusType}`}>{statusMsg}</p>
              )}

              {product.status === 'active' && (
                <div className="live-action-area">
                  {product.mode === 'auction' ? (
                    <div className="live-bid-area">
                      <div className="live-bid-presets">
                        {[100, 500, 1000].map(delta => (
                          <button
                            key={delta}
                            className="live-bid-preset-btn"
                            onClick={() => setBidAmount(String((product.current_price || 0) + delta))}
                          >
                            +{delta.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <div className="live-bid-row">
                        <input
                          className="live-bid-input"
                          type="number"
                          placeholder={`¥${((product.current_price || 0) + 100).toLocaleString()} 以上`}
                          value={bidAmount}
                          onChange={e => setBidAmount(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleBid()}
                        />
                        <button className="live-bid-btn" onClick={handleBid}>入札する</button>
                      </div>
                    </div>
                  ) : (
                    <div className="live-buy-row">
                      <p className="live-instant-label">
                        即決 ¥{(product.instant_price || product.current_price || 0).toLocaleString()}
                      </p>
                      <button className="live-buy-btn" onClick={handleBuy}>今すぐ購入</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="live-bottom-content">
            <p className="live-no-product">配信準備中...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── LiveRoom: 視聴者ページ本体（SSE・商品管理・状態管理） ──
function LiveRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [product, setProduct] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [livekitToken, setLivekitToken] = useState(null);
  const [livekitUrl, setLivekitUrl] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('');
  const [streamEnded, setStreamEnded] = useState(false);
  const [streamStatus, setStreamStatus] = useState('live');
  const [comments, setComments] = useState([]);

  const timerRef = useRef(null);
  const sseRef = useRef(null);

  const resetTimer = useCallback((seconds) => {
    clearInterval(timerRef.current);
    let s = seconds;
    timerRef.current = setInterval(() => {
      s -= 1;
      setSecondsLeft(s);
      if (s <= 0) clearInterval(timerRef.current);
    }, 1000);
  }, []);

  useEffect(() => {
    apiFetch(`/api/live/rooms/${roomId}`)
      .then(data => {
        setRoom(data);
        setStreamStatus(data.status);
        if (data.current_product) {
          setProduct(data.current_product);
          const sl = data.current_product.seconds_left || 0;
          setSecondsLeft(sl);
          // 途中参加でタイマーが既に動いている場合（auction_end_at が設定済み）
          if (data.current_product.mode === 'auction' && sl > 0) {
            resetTimer(sl);
          }
        }
        if (data.status === 'ended') setStreamEnded(true);
      })
      .catch(err => console.error('ルーム取得失敗:', err));

    apiFetch(`/api/live/rooms/${roomId}/token`)
      .then(data => {
        setLivekitToken(data.livekit_token);
        setLivekitUrl(data.livekit_url);
      })
      .catch(err => console.error('トークン取得失敗:', err));

    apiFetch(`/api/live/rooms/${roomId}/comments`)
      .then(list => setComments(list || []))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

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

      const onEvent = (event) => {
        switch (event.type) {
          case 'bid':
            setProduct(event.product);
            setSecondsLeft(event.seconds_left || 30);
            resetTimer(event.seconds_left || 30);
            setStatusMsg(`${event.product?.bidder_name || '誰か'} が ¥${event.product?.current_price?.toLocaleString()} で入札`);
            setStatusType('bid');
            break;
          case 'sold':
            setProduct(prev => ({ ...prev, status: 'sold' }));
            setStatusMsg(`落札 ¥${event.final_price?.toLocaleString()} — ${event.buyer_name}`);
            setStatusType('sold');
            clearInterval(timerRef.current);
            break;
          case 'skipped':
            setStatusMsg('入札なし — 次の商品へ移動します');
            setStatusType('skipped');
            setBidAmount('');
            break;
          case 'queue_empty':
            setProduct(null);
            setStatusMsg('すべての商品が終了しました');
            setStatusType('skipped');
            clearInterval(timerRef.current);
            break;
          case 'next':
            setStreamStatus('live');
            setProduct(event.product);
            clearInterval(timerRef.current);
            setSecondsLeft(0); // 初入札まで表示しない
            setStatusMsg('');
            setStatusType('');
            setBidAmount('');
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
    return () => sseRef.current?.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  if (streamStatus === 'scheduled') {
    return (
      <div className="live-ended">
        <p className="live-ended-text">配信開始まで少々お待ちください</p>
        <button className="live-ended-btn" onClick={() => navigate('/live')}>一覧へ戻る</button>
      </div>
    );
  }

  if (streamEnded) {
    return (
      <div className="live-ended">
        <p className="live-ended-text">配信は終了しました</p>
        <button className="live-ended-btn" onClick={() => navigate('/live')}>一覧へ戻る</button>
      </div>
    );
  }

  return (
    <div className="live-room-container">
      <div className="live-video-area">
        {livekitToken && livekitUrl ? (
          <LiveKitRoom serverUrl={livekitUrl} token={livekitToken} connect>
            <ViewerStage
              room={room}
              roomId={roomId}
              product={product}
              secondsLeft={secondsLeft}
              statusMsg={statusMsg}
              setStatusMsg={setStatusMsg}
              statusType={statusType}
              setStatusType={setStatusType}
              comments={comments}
              bidAmount={bidAmount}
              setBidAmount={setBidAmount}
              navigate={navigate}
            />
          </LiveKitRoom>
        ) : (
          <div className="live-video-placeholder">映像読み込み中...</div>
        )}
      </div>
    </div>
  );
}

export default LiveRoom;
