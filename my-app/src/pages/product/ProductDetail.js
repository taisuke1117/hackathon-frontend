import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LikeButton } from '../../components/ui/LikeButton';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './ProductDetail.css';

// ProductDetail: 商品詳細（画像カルーセル・いいね・チャット・購入ボタン）

function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { loginUser } = useAuth();

  const [currentImgIndex, setCurrentImgIndex] = useState(0); // カルーセルのドット表示に使う
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/api/products/${id}`)
      .then(setProduct)
      .catch(err => setError(err.message));
  }, [id]);

  if (error) return <div className="app-center-text">{error}</div>;
  if (!product) return <div className="app-center-text">読み込み中…</div>;

  // images: product_imagesテーブルの複数画像。なければimage_url（サムネイル）を使う
  const images = product.images.length > 0 ? product.images : [product.image_url].filter(Boolean);

  // 自分が出品した商品かどうか（購入ボタンの表示切り替えに使う）
  const isOwnProduct = loginUser && product.seller_id === loginUser.uid;

  // 購入可能かどうか（available 以外は売り切れ扱い）
  const isAvailable = product.status === 'available';

  // カルーセルのスクロール位置から何枚目かを計算してドットを更新
  const handleScroll = (e) => {
    const width = e.target.clientWidth;
    const scrollLeft = e.target.scrollLeft;
    const newIndex = Math.round(scrollLeft / width); // 横スクロール量 ÷ 幅 = 何枚目
    setCurrentImgIndex(newIndex);
  };

  // いいねのトグル（LikeButtonから nextState が渡ってくる）
  const handleLikeToggle = async (isLiked) => {
    try {
      await apiFetch(`/api/products/${product.product_id}/like`, { method: isLiked ? 'POST' : 'DELETE' });
    } catch (err) {
      console.error('いいねの更新に失敗:', err);
    }
  };

  // チャット開始ボタン
  // 自分の商品なら取引管理画面へ、他人の商品ならチャットルームを開く
  const handleStartChat = async () => {
    if (isOwnProduct) {
      navigate(`/deals/manage/${product.product_id}`);
      return;
    }
    try {
      // ルームが既にあれば既存のIDが返る（二重作成しない）
      const res = await apiFetch('/api/chatrooms', { method: 'POST', body: { product_id: product.product_id } });
      navigate(`/chat/${product.product_id}/${res.chatroom_id}`);
    } catch (err) {
      alert(`チャットを開始できませんでした: ${err.message}`);
    }
  };

  return (
    <div className="detail-container">

      {/* 画像カルーセル */}
      <div className="carousel-wrapper">
        <button
          type="button"
          className="detail-back-close-btn"
          onClick={() => navigate(-1)}
          aria-label="戻る"
        >
          ✕
        </button>
        {/* 横スクロールで画像を切り替える。CSSの scroll-snap で1枚ずつ止まる */}
        <div className="image-swipe-track" onScroll={handleScroll}>
          {images.map((url, i) => (
            <img key={i} src={url} alt={`${product.name} - ${i+1}`} className="carousel-img" />
          ))}
        </div>
        {/* 今何枚目かを示すドット（active クラスで強調） */}
        <div className="carousel-dots">
          {images.map((_, i) => (
            <span key={i} className={`dot ${currentImgIndex === i ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      {/* アクションバー（いいね・チャット・出品者） */}
      <div className="action-row-bar">
        <div className="action-item-wrapper border-right">
          <LikeButton
            isLikedInitial={product.liked_by_me}
            likeCountInitial={product.likes_count}
            onToggle={handleLikeToggle}
          />
        </div>

        {/* チャットボタン: 自分の商品なら取引管理へ、他人のなら購入者チャットへ */}
        <button
          className="action-item-wrapper chat-action-btn border-right"
          onClick={handleStartChat}
        >
          <svg className="chat-icon-svg" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="action-label">チャット</span>
        </button>

        {/* 出品者プロフィール: クリックで出品者のプロフィールページへ */}
        <div
          className="seller-action-block"
          onClick={() => navigate(`/user/profile/${product.seller_id}`)}
        >
          {product.seller?.icon_url
            ? <img src={product.seller.icon_url} alt="アバター" className="seller-mini-avatar" />
            : <div className="seller-mini-avatar" style={{ background: '#444' }} />}
          <div className="seller-mini-meta">
            <span className="seller-mini-name">{product.seller?.name || '出品者'}</span>
            <span className="seller-mini-rating">
              ★ {product.seller?.review_count > 0 ? product.seller.rating.toFixed(1) : '評価なし'}
            </span>
          </div>
          <span className="arrow-right-hint">＞</span>
        </div>
      </div>

      {/* 商品情報 */}
      <div className="detail-info-content">
        <h1 className="detail-product-title">{product.name}</h1>
        <div className="detail-price-tag">¥{product.price.toLocaleString()}</div>

        {product.condition && (
          <div className="detail-section-block">
            <h3 className="detail-sub-title">商品の状態</h3>
            <p className="detail-condition-badge">{product.condition}</p>
          </div>
        )}

        <div className="detail-section-block">
          <h3 className="detail-sub-title">商品の説明</h3>
          {/* pre-wrap: 改行（\n）をそのまま表示する */}
          <p className="detail-description-text" style={{ whiteSpace: 'pre-wrap' }}>{product.detail}</p>
        </div>

        <div className="detail-section-block">
          <h3 className="detail-sub-title">カテゴリー</h3>
          <div className="detail-category-path">
            {product.categories.map((cat, i) => (
              <span key={cat.category_id} className="path-node">
                {cat.name}{i < product.categories.length - 1 ? ' ＞ ' : ''}
              </span>
            ))}
            {product.categories.length === 0 && <span className="path-node">未分類</span>}
          </div>
        </div>
      </div>

      {/* 下部固定の購入フッター */}
      <div className="detail-fixed-purchase-footer">
        <div className="purchase-footer-inner">
          <div className="purchase-price-display">
            <span className="purchase-price-label">総額</span>
            <span className="purchase-price-amount">¥{product.price.toLocaleString()}</span>
          </div>
          {isOwnProduct ? (
            // 自分の商品 → 取引管理ページへ
            <button
              type="button"
              className="detail-primary-buy-btn"
              onClick={() => navigate(`/deals/manage/${product.product_id}`)}
            >
              出品を管理する
            </button>
          ) : (
            // 他人の商品 → 購入手続きへ（売り切れなら disabled）
            <button
              type="button"
              className="detail-primary-buy-btn"
              disabled={!isAvailable}
              onClick={() => navigate(`/checkout/${product.product_id}`)}
            >
              {isAvailable ? '購入手続きへ進む' : '売り切れました'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
