import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import './LiveCreate.css';

function LiveCreate() {
  const [title, setTitle] = useState('');
  const [myProducts, setMyProducts] = useState([]);
  const [queue, setQueue] = useState([]); // { product, mode, startPrice, instantPrice }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/api/me/products')
      .then(res => {
        const available = (res.products || []).filter(p => p.status === 'available');
        setMyProducts(available);
      })
      .catch(err => console.error('商品取得失敗:', err));
  }, []);

  const addToQueue = (product) => {
    if (queue.some(q => q.product.product_id === product.product_id)) return;
    setQueue(prev => [...prev, {
      product,
      mode: 'auction',
      startPrice: product.price || 0,
      instantPrice: '',
    }]);
  };

  const removeFromQueue = (productId) => {
    setQueue(prev => prev.filter(q => q.product.product_id !== productId));
  };

  const updateQueueItem = (productId, field, value) => {
    setQueue(prev => prev.map(q =>
      q.product.product_id === productId ? { ...q, [field]: value } : q
    ));
  };

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) { setError('タイトルを入力してください'); return; }
    if (queue.length === 0) { setError('商品を1つ以上追加してください'); return; }

    setIsSubmitting(true);
    try {
      const products = queue.map(q => ({
        product_id: q.product.product_id,
        mode: q.mode,
        start_price: Number(q.startPrice) || 0,
        instant_price: q.mode === 'instant' && q.instantPrice ? Number(q.instantPrice) : undefined,
      }));
      const res = await apiFetch('/api/live/rooms', {
        method: 'POST',
        body: { title: title.trim(), products },
      });
      navigate(`/live/host/${res.room_id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inQueue = (id) => queue.some(q => q.product.product_id === id);

  return (
    <div className="live-create-container">
      <h2 className="live-create-heading">
        <button className="live-create-back-btn" onClick={() => navigate(-1)} aria-label="戻る">←</button>
        配信を作成
      </h2>

      <div className="live-create-section">
        <label className="live-create-label">配信タイトル</label>
        <input
          className="live-create-input"
          placeholder="例: 今週の掘り出し物セール！"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      <div className="live-create-section">
        <label className="live-create-label">販売する商品を選ぶ</label>
        {myProducts.length === 0 ? (
          <p className="live-create-empty">出品中の商品がありません</p>
        ) : (
          <div className="live-product-select-list">
            {myProducts.map(p => (
              <div key={p.product_id} className={`live-product-select-item ${inQueue(p.product_id) ? 'selected' : ''}`}>
                {p.image_url && <img src={p.image_url} alt="" className="live-product-thumb" />}
                <div className="live-product-select-info">
                  <p className="live-product-select-name">{p.name}</p>
                  <p className="live-product-select-price">¥{(p.price || 0).toLocaleString()}</p>
                </div>
                <button
                  className={`live-add-btn ${inQueue(p.product_id) ? 'added' : ''}`}
                  onClick={() => inQueue(p.product_id) ? removeFromQueue(p.product_id) : addToQueue(p)}
                >
                  {inQueue(p.product_id) ? '✓ 追加済み' : '＋ 追加'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {queue.length > 0 && (
        <div className="live-create-section">
          <label className="live-create-label">販売キュー（上から順番に販売）</label>
          {queue.map((q, i) => (
            <div key={q.product.product_id} className="live-queue-item">
              <span className="live-queue-pos">{i + 1}</span>
              {q.product.image_url && <img src={q.product.image_url} alt="" className="live-product-thumb" />}
              <div className="live-queue-info">
                <p className="live-queue-name">{q.product.name}</p>
                <div className="live-queue-controls">
                  <select
                    className="live-queue-select"
                    value={q.mode}
                    onChange={e => updateQueueItem(q.product.product_id, 'mode', e.target.value)}
                  >
                    <option value="auction">オークション</option>
                    <option value="instant">即決</option>
                  </select>
                  <input
                    className="live-queue-price-input"
                    type="number"
                    placeholder="開始価格"
                    value={q.startPrice}
                    onChange={e => updateQueueItem(q.product.product_id, 'startPrice', e.target.value)}
                  />
                  {q.mode === 'instant' && (
                    <input
                      className="live-queue-price-input"
                      type="number"
                      placeholder="即決価格"
                      value={q.instantPrice}
                      onChange={e => updateQueueItem(q.product.product_id, 'instantPrice', e.target.value)}
                    />
                  )}
                </div>
              </div>
              <button className="live-queue-remove" onClick={() => removeFromQueue(q.product.product_id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="live-create-error">{error}</p>}

      <button
        className="live-create-submit"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? '作成中...' : '配信を作成して準備する'}
      </button>
    </div>
  );
}

export default LiveCreate;
