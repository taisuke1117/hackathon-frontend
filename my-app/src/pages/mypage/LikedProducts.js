import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../../components/product/ProductCard';
import { apiFetch } from '../../api/client';
import './LikedProducts.css';

// ─────────────────────────────────────────────────────────
// LikedProducts: いいね一覧ページ（マイページ → 「いいね一覧をすべて見る」）
//
// いいねを外す（ハートを再クリック）と、一覧から即座に消える（楽観的UI）。
// バックエンドのDELETEが失敗した場合はエラーログを出すだけで一覧は消えたまま。
// （エラー時に元に戻すリバート処理は実装していない）
// ─────────────────────────────────────────────────────────

function LikedProducts() {
  const navigate = useNavigate();
  const [likedProducts, setLikedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // マウント時にいいね済み商品一覧を取得
  useEffect(() => {
    apiFetch('/api/me/likes')
      .then(list => setLikedProducts(list || []))
      .catch(err => console.error('いいね一覧の取得に失敗:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // いいねトグル: 解除（isLiked=false）なら一覧から除去（楽観的UI）
  const handleLikeToggle = async (productId, isLiked) => {
    try {
      await apiFetch(`/api/products/${productId}/like`, { method: isLiked ? 'POST' : 'DELETE' });
      if (!isLiked) {
        // いいねを外した → 一覧から即座に削除
        setLikedProducts(prev => prev.filter(p => p.product_id !== productId));
      }
    } catch (err) {
      console.error('いいねの更新に失敗:', err);
    }
  };

  return (
    <div className="liked-page-container">
      {/* ヘッダー */}
      <div className="liked-page-header">
        <button
          className="liked-page-back-btn"
          onClick={() => navigate(-1)}
          aria-label="戻る"
        >
          ✕
        </button>
        <h1 className="liked-page-title">いいね！一覧</h1>
      </div>

      <div className="liked-page-content">
        {isLoading ? (
          <div className="liked-empty-state"><p className="empty-text">読み込み中…</p></div>
        ) : likedProducts.length === 0 ? (
          <div className="liked-empty-state">
            <p className="empty-text">いいねした商品はまだありません。</p>
            <button className="empty-discover-btn" onClick={() => navigate('/')}>
              商品を探す
            </button>
          </div>
        ) : (
          <div className="liked-products-grid">
            {likedProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                id={product.product_id}
                title={product.name}
                price={product.price}
                image={product.image_url}
                category={product.category}
                likeCountInitial={product.likes_count}
                isLikedInitial={true} // いいね一覧なので常に true
                onLikeToggle={handleLikeToggle} // 解除時に一覧から削除
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LikedProducts;
