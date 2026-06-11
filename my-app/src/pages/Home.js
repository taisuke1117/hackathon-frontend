import React from 'react';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import './Home.css';

function Home() {
  // 📦 ダミー商品一覧（漆黒に映える美しい画像たち）
  const allProducts = [
    { id: 1, price: 3500, category: 'カメラ', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300', likeCount: 5 },
    { id: 2, price: 1200, category: '本', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300', likeCount: 0 },
    { id: 3, price: 28000, category: '家電', image: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=300', likeCount: 12 },
    { id: 4, price: 1500, category: 'レディース', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300', likeCount: 2 },
  ];

  const handleSearchConditions = (conditions) => {
    console.log("検索条件を受け取りました:", conditions);
  };

  const handleProductLike = (productId, isLiked) => {
    console.log(`商品ID: ${productId} のいいね状態: ${isLiked}`);
  };

  return (
    <div className="home-container">
      {/* 🔍 AI検索バー */}
      <SearchBar onSearchSubmit={handleSearchConditions} />

      {/* 📦 漆黒のプロダクトギャラリー */}
      <div className="home-products-section">
        {allProducts.length > 0 ? (
          <div className="product-grid-three">
            {allProducts.map(item => (
              <ProductCard 
                key={item.id} 
                id={item.id}
                price={item.price} 
                category={item.category} 
                image={item.image} 
                likeCountInitial={item.likeCount}
                isLikedInitial={false} 
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