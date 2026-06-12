import React, { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { categories } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState('');

  // 検索条件をクエリ文字列にして商品一覧を取得
  const fetchProducts = useCallback(async (conditions = {}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (conditions.keyword) params.set('keyword', conditions.keyword);
      if (conditions.categoryId) params.set('category_id', conditions.categoryId);
      if (conditions.minPrice) params.set('min_price', conditions.minPrice);
      if (conditions.maxPrice) params.set('max_price', conditions.maxPrice);
      const list = await apiFetch(`/api/products?${params.toString()}`);
      setProducts(list || []);
    } catch (err) {
      console.error('商品一覧の取得に失敗:', err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // 通常の条件検索
  const handleSearchConditions = (conditions) => {
    setAiSuggestion('');
    // カテゴリ名 → カテゴリIDへ変換
    const matched = categories.find(c => c.name === conditions.category);
    fetchProducts({
      keyword: conditions.keyword,
      categoryId: matched ? matched.category_id : 0,
      minPrice: conditions.minPrice,
      maxPrice: conditions.maxPrice,
    });
  };

  // AI検索: 自然文をGeminiで検索条件に変換してから検索
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

  // いいねトグル
  const handleProductLike = async (productId, isLiked) => {
    try {
      await apiFetch(`/api/products/${productId}/like`, { method: isLiked ? 'POST' : 'DELETE' });
    } catch (err) {
      console.error('いいねの更新に失敗:', err);
    }
  };

  return (
    <div className="home-container">
      {/* 🔍 AI検索バー */}
      <SearchBar onSearchSubmit={handleSearchConditions} onAiSearchSubmit={handleAiSearch} />

      {/* ✨ AIからの提案メッセージ */}
      {aiSuggestion && (
        <div className="app-center-text" style={{ padding: '8px 16px' }}>✨ {aiSuggestion}</div>
      )}

      {/* 📦 プロダクトギャラリー */}
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
