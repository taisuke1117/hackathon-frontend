import React, { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '../../components/product/ProductCard';
import { SearchBar } from '../../components/ui/SearchBar';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

// Home: 商品一覧表示・通常検索・AI検索・いいねトグルを担うトップページ

function Home() {
  const { categories } = useAuth(); // カテゴリ名→IDの変換に使う

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState('');

  // useCallback でメモ化（useEffect の依存配列に入れるため）
  const fetchProducts = useCallback(async (conditions = {}) => {
    setIsLoading(true);
    try {
      // URLSearchParams: クエリ文字列（?keyword=シャツ&min_price=1000）を組み立てるブラウザ標準API
      const params = new URLSearchParams();
      if (conditions.keyword) params.set('keyword', conditions.keyword);
      if (conditions.categoryId) params.set('category_id', conditions.categoryId);
      if (conditions.minPrice) params.set('min_price', conditions.minPrice);
      if (conditions.maxPrice) params.set('max_price', conditions.maxPrice);

      // GET /api/products?keyword=...&category_id=...
      const list = await apiFetch(`/api/products?${params.toString()}`);
      setProducts(list || []); // nullが返ってきた場合は空配列にする
    } catch (err) {
      console.error('商品一覧の取得に失敗:', err);
      setProducts([]);
    } finally {
      setIsLoading(false); // 成功・失敗どちらでもローディングを終了
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearchConditions = (conditions) => {
    setAiSuggestion('');
    // SearchBar はカテゴリ名を渡すが API は category_id を受け取るため変換
    const matched = categories.find(c => c.name === conditions.category);
    fetchProducts({
      keyword: conditions.keyword,
      categoryId: matched ? matched.category_id : 0,
      minPrice: conditions.minPrice,
      maxPrice: conditions.maxPrice,
    });
  };

  const handleAiSearch = async (prompt) => {
    setIsLoading(true);
    setAiSuggestion('AIが検索条件を考えています…');
    try {
      const cond = await apiFetch('/api/gemini/search', { method: 'POST', body: { prompt } });
      setAiSuggestion(cond.suggestion || '');
      await fetchProducts({
        keyword: cond.keyword,
        categoryId: cond.category_id,
        minPrice: cond.min_price,
        maxPrice: cond.max_price,
      });
    } catch (err) {
      setAiSuggestion('');
      alert(`AI検索に失敗しました: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleProductLike = async (productId, isLiked) => {
    try {
      await apiFetch(`/api/products/${productId}/like`, { method: isLiked ? 'POST' : 'DELETE' });
    } catch (err) {
      console.error('いいねの更新に失敗:', err);
    }
  };

  return (
    <div className="home-container">
      {/* 検索バー（通常検索 + AI検索を両方渡す） */}
      <SearchBar onSearchSubmit={handleSearchConditions} onAiSearchSubmit={handleAiSearch} />

      {/* AI検索後のGeminiからのひとことメッセージ（ある場合だけ表示） */}
      {aiSuggestion && (
        <div className="app-center-text" style={{ padding: '8px 16px' }}>✨ {aiSuggestion}</div>
      )}

      <div className="home-products-section">
        {isLoading ? (
          <div className="app-center-text">読み込み中…</div>
        ) : products.length > 0 ? (
          <div className="product-grid-three">
            {products.map(item => (
              <ProductCard
                key={item.product_id}
                id={item.product_id}
                title={item.name}
                price={item.price}
                category={item.category}
                image={item.image_url}
                likeCountInitial={item.likes_count}
                isLikedInitial={item.liked_by_me}
                onLikeToggle={handleProductLike}
              />
            ))}
          </div>
        ) : (
          <div className="app-center-text">出品されている商品がありません</div>
        )}
      </div>
    </div>
  );
}

export default Home;
