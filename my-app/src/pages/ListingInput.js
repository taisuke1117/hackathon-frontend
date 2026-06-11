import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 💡 useLocation を追加インポート！
import './Listing.css';

function ListingInput() {
  const navigate = useNavigate();
  const location = useLocation(); // 💡 送り返されてきた荷物をキャッチする

  // 💡 確認画面から戻ってきたデータ（location.state）があればそれを初期値にし、なければ空にする
  const savedData = location.state || {};

  // 📝 フォームの状態管理（初期値に savedData をマッピング！）
  const [images, setImages] = useState(savedData.images || []); 
  const [title, setTitle] = useState(savedData.title || '');
  const [description, setDescription] = useState(savedData.description || '');
  const [price, setPrice] = useState(savedData.price || '');
  const [selectedCategories, setSelectedCategories] = useState(savedData.selectedCategories || []);
  
  // 🤖 AI自動入力のローディング状態
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 💡 [デモ用] ダミーの画像アップロード処理（ボタンを押したらサンプル画像が追加される想定）
  const handleAddImageMock = () => {
    const mockImage = "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400";
    setImages([...images, mockImage]);
  };

  // 💡 画像削除
  const handleDeleteImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // 🤖 【大本命】Geminiに商品説明とカテゴリを自動入力してもらう処理
  const handleAiAutoFill = async () => {
    if (images.length === 0) return;

    setIsAiLoading(true);

    try {
      // 🛠️ ハッカソン本番では、ここに Go の API を叩く fetch 処理を書きます！
      // 例: const response = await fetch('/api/ai/analyze', { method: 'POST', body: JSON.stringify({ image: images[0] }) });
      
      // 今回はデモが確実に動くように、2秒後に自動入力されるリッチなモック（偽処理）にします
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Geminiが解析して返してきた体にするデータ
      setTitle("ビンテージレザージャケット（1990年代物）");
      setDescription("ご覧いただきありがとうございます。\n1990年代物の肉厚な高級カウハイド（牛革）を使用した、風合い抜群のビンテージレザージャケットです。\n\n【サイズ】L相当\n【状態】経年による細かい擦れはありますが、革の手入れは定期的に行っており、かなり状態の良い極上品です。ジッパーの開閉もスムーズです。");
      setPrice("28000");
      setSelectedCategories(["ジャケット・アウター", "メンズ", "ビンテージ"]);

    } catch (error) {
      console.error("AI解析に失敗しました:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // カテゴリチップの選択トグル
  const handleCategoryToggle = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // 確認画面への遷移
  const handleGoToConfirm = () => {
    navigate('/listing/confirm', {
      state: { images, title, description, price, selectedCategories }
    });
  };

  // 💡 写真が1枚以上入っているかどうかの判定フラグ
  const hasImages = images.length > 0;

  return (
    <div className="listing-container">
      <h2 className="listing-title">商品の出品</h2>

      <div className="listing-form">
        
        {/* 📷 画像アップロードエリア */}
        <div className="form-group">
          <label className="form-label">商品画像（1枚目がメイン）</label>
          <div className="image-upload-wrapper-row">
            <div className="image-preview-grid">
              {images.map((img, i) => (
                <div key={i} className="preview-item">
                  <img src={img} alt="プレビュー" />
                  {i === 0 && <span className="main-badge">メイン</span>}
                  <button type="button" className="delete-img-btn" onClick={() => handleDeleteImage(i)}>×</button>
                </div>
              ))}
            </div>
            {/* デモ用にクリックしたら画像が入る枠 */}
            <div className="upload-box-placeholder" onClick={handleAddImageMock}>
              ＋
            </div>
          </div>
        </div>

        {/* 💡 🤖 【新設】Gemini AI 自動入力トリガーセクション */}
        <div className="ai-assistant-box">
          <div className="ai-assistant-info">
            <span className="ai-sparkle-icon">✨</span>
            <p className="ai-assistant-text">
              画像をアップロードすると、Geminiが商品名・説明文・カテゴリを自動生成します。
            </p>
          </div>
          {/* 💡 hasImages が true の時だけ disabled が外れて、マット水色に発光します */}
          <button 
            type="button" 
            className={`ai-autofill-btn ${hasImages ? 'activated' : ''}`}
            disabled={!hasImages || isAiLoading}
            onClick={handleAiAutoFill}
          >
            {isAiLoading ? (
              <span className="ai-loading-spinner">AIが画像を解析中...</span>
            ) : (
              "✨ Geminiに商品説明を任せる"
            )}
          </button>
        </div>

        {/* ✍️ 商品名入力 */}
        <div className="form-group">
          <label className="form-label">商品名</label>
          <input 
            type="text" 
            className="form-input" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="商品名を入力（AI自動入力も可能）"
          />
        </div>

        {/* 📝 説明文入力 */}
        <div className="form-group">
          <label className="form-label">商品の説明</label>
          <textarea 
            className="form-textarea" 
            rows="6"
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="商品の状態、サイズ、購入時期など（AI自動入力も可能）"
          />
        </div>

        {/* 🏷️ カテゴリ選択チップ */}
        <div className="form-group">
          <label className="form-label">おすすめカテゴリ（複数選択可）</label>
          <div className="category-chip-grid">
            {["ジャケット・アウター", "メンズ", "レディース", "家電", "カメラ", "ビンテージ"].map((cat) => {
              const isActive = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  className={`category-chip ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategoryToggle(cat)}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 💰 価格入力 */}
        <div className="form-group">
          <label className="form-label">販売価格</label>
          <input 
            type="number" 
            className="form-input" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            placeholder="¥ 金額を入力"
          />
        </div>

        {/* 次へ進むボタン */}
        <button 
          type="button" 
          className="next-confirm-button" 
          disabled={!title || !description || !price}
          onClick={handleGoToConfirm}
        >
          入力内容を確認する
        </button>

      </div>
    </div>
  );
}

export default ListingInput;