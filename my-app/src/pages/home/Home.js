import React, { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '../../components/product/ProductCard';
import { SearchBar } from '../../components/ui/SearchBar';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

// ─────────────────────────────────────────────────────────
// Home ページ（トップページ）
//
// このページでやること:
//  ① アプリ起動時に出品中の商品を全件取得して一覧表示
//  ② 通常検索: キーワード・カテゴリ・価格帯で絞り込み
//  ③ AI検索: 自然文（「夏に着られる5000円以内のシャツ」など）を
//             Geminiに送り、検索条件に変換してから検索する
//  ④ いいねのトグル（ハートボタン）
// ─────────────────────────────────────────────────────────

function Home() {
  // categories: カテゴリマスター（AuthContextで一括取得済み）
  // 検索時に「カテゴリ名」→「カテゴリID」に変換するために使う
  const { categories } = useAuth();

  // products: 取得した商品一覧。ProductCard を並べるのに使う
  const [products, setProducts] = useState([]);

  // isLoading: API取得中かどうか。trueのとき「読み込み中…」を表示
  const [isLoading, setIsLoading] = useState(true);

  // aiSuggestion: Gemini AI検索が返してくるひとことメッセージ（例: "夏のシャツを探してみます！"）
  //              検索結果の上に表示する
  const [aiSuggestion, setAiSuggestion] = useState('');

  // ── ① 商品一覧の取得 ─────────────────────────────────────────
  // conditions に渡せるキー: keyword / categoryId / minPrice / maxPrice
  // useCallback でメモ化しているのは useEffect の依存配列に入れるため
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

  // ページが最初に表示されたとき（マウント時）に全商品を取得
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── ② 通常検索（SearchBarから来る） ──────────────────────────
  // SearchBarコンポーネントが {keyword, category, minPrice, maxPrice} を渡してくる
  const handleSearchConditions = (conditions) => {
    setAiSuggestion(''); // AI検索のひとことメッセージをリセット

    // SearchBar は「カテゴリ名（文字列）」を渡してくるが、
    // APIは category_id（数値）で受け取るため、カテゴリ名からIDを探す
    const matched = categories.find(c => c.name === conditions.category);
    fetchProducts({
      keyword: conditions.keyword,
      categoryId: matched ? matched.category_id : 0, // 見つからなければ0（全カテゴリ）
      minPrice: conditions.minPrice,
      maxPrice: conditions.maxPrice,
    });
  };

  // ── ③ AI検索（Gemini経由） ────────────────────────────────────
  // ユーザーが入力した自然文（例: "黒い夏服 1万円以内"）を
  // バックエンド → Gemini に送り、{keyword, category_id, min_price, max_price} に変換してもらう
  const handleAiSearch = async (prompt) => {
    setIsLoading(true);
    setAiSuggestion('AIが検索条件を考えています…'); // 処理中メッセージ

    try {
      // POST /api/gemini/search にプロンプト文を送る
      // Geminiが {keyword, category_id, min_price, max_price, suggestion} を返してくる
      const cond = await apiFetch('/api/gemini/search', { method: 'POST', body: { prompt } });

      // Geminiからのひとこと提案（例: "黒のトップスを探してみます！"）を表示
      setAiSuggestion(cond.suggestion || '');

      // GeminiがくれたIDをそのままAPIに渡して検索
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

  // ── ④ いいねのトグル ─────────────────────────────────────────
  // ProductCardから「商品ID」と「今いいね状態かどうか」が渡ってくる
  // isLiked=true なら「いいね済み→外す」、false なら「いいねする」
  const handleProductLike = async (productId, isLiked) => {
    try {
      // isLiked=true のとき POST（いいねを付ける）
      // isLiked=false のとき DELETE（いいねを外す）
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

      {/* 商品グリッド表示 */}
      <div className="home-products-section">
        {isLoading ? (
          // API取得中
          <div className="app-center-text">読み込み中…</div>
        ) : products.length > 0 ? (
          // 商品があれば3列グリッドで表示
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
                isLikedInitial={item.liked_by_me} // 自分がいいね済みかどうか
                onLikeToggle={handleProductLike}  // ハートを押したときのコールバック
              />
            ))}
          </div>
        ) : (
          // 検索結果ゼロ or 出品なし
          <div className="app-center-text">出品されている商品がありません</div>
        )}
      </div>
    </div>
  );
}

export default Home;
