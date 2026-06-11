import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Listing.css';

function ListingConfirm() {
  const location = useLocation();
  const navigate = useNavigate();

  // 💡 前のページ（ListingInput）から送られてきたデータを受け取る（防衛策付き）
  const { images, title, description, price, selectedCategories } = location.state || {
    images: [], title: '', description: '', price: '', selectedCategories: []
  };

  // 💾 バックエンド（Go）にデータを送信して出品を確定する処理
  const handleFinalSubmit = () => {
    // 🛠️ ハッカソン後半の成果として、ここに Go の API を叩く fetch 処理を繋げます！
    alert('バックエンド（Go）にデータを送信しました。出品完了です！');
    
    // 出品が終わったら、ホーム画面（/）へ飛ばす
    navigate('/');
  };

  return (
    <div className="listing-container">
      <h2 className="listing-title">出品内容の確認</h2>
      
      {/* 📝 1步深い闇の確認ボックス */}
      <div className="confirm-box">
        
        {/* 📷 画像プレビュー一覧 */}
        <div className="form-group">
          <span className="confirm-label">商品画像</span>
          <div className="image-preview-grid" style={{ marginTop: '6px' }}>
            {images.map((img, i) => (
              <div key={i} className="preview-item">
                <img src={img} alt={`確認用-${i}`} />
                {/* 1枚目の画像にはマットアイスブルーの「メイン」バッジを付与 */}
                {i === 0 && <span className="main-badge">メイン</span>}
              </div>
            ))}
            {images.length === 0 && <span className="no-cat">画像がありません</span>}
          </div>
        </div>

        {/* ✍️ 商品名 */}
        <div className="confirm-item">
          <span className="confirm-label">商品名</span>
          <p className="confirm-value">{title || <span className="no-cat">未入力</span>}</p>
        </div>

        {/* 📝 詳細説明（改行コードを保持するクラスを適用） */}
        <div className="confirm-item">
          <span className="confirm-label">詳細説明</span>
          <p className="confirm-value whitespace-pre">{description || <span className="no-cat">未入力</span>}</p>
        </div>

        {/* 💰 価格（３桁カンマ区切りに整形） */}
        <div className="confirm-item">
          <span className="confirm-label">価格</span>
          <p className="confirm-value price-text">
            {price ? `¥${Number(price).toLocaleString()}` : <span className="no-cat">未入力</span>}
          </p>
        </div>

        {/* 🏷️ 選択されたカテゴリバッジ */}
        <div className="confirm-item">
          <span className="confirm-label">選択したカテゴリ</span>
          <div className="category-tags" style={{ marginTop: '4px' }}>
            {selectedCategories.map((cat, i) => (
              <span key={i} className="cat-tag-badge">{cat}</span>
            ))}
            {selectedCategories.length === 0 && <span className="no-cat">未選択</span>}
          </div>
        </div>
      </div>

      {/* 🛠️ アクションボタンエリア */}
      <div className="action-buttons-row">
        {/* 修正ボタン：透かし背景。navigate(-1) で入力フォームの値を維持したまま戻れます */}
        <button 
          type="button" 
          className="back-button" 
          onClick={() => navigate('/listing', { // 💡 入力画面のURLパスに書き換えてください
            state: { images, title, description, price, selectedCategories } // データをそのまま送り返す
          })}
        >
          修正する
        </button>
        
        {/* 確定ボタン：マットアイスブルーに漆黒文字の主役ボタン */}
        <button type="button" className="submit-button" onClick={handleFinalSubmit}>
          この内容で出品する
        </button>
      </div>
    </div>
  );
}

export default ListingConfirm;