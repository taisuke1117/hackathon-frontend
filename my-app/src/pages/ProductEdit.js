import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductEdit.css';

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 📦 編集前の初期データ（State管理）
  const [formData, setFormData] = useState({
    title: "ビンテージレザージャケット（1990年代物）",
    price: 28000,
    category: "メンズ ＞ ジャケット/アウター ＞ レザージャケット",
    description: "1990年代の希少なレザージャケットです。\n革の状態も良く、これからの季節にぴったりです。\n\nサイズ：L\nカラー：ダークブラウン",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500"
  });

  // 入力内容が変わった時の汎用ハンドラー
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 保存ボタン（更新処理）
  const handleSave = (e) => {
    e.preventDefault();
    console.log("保存するデータ:", formData);
    alert("商品情報を更新しました！");
    navigate(`/deals/manage/${id}`); // 管理画面に戻る
  };

  // 削除ボタン
  const handleDelete = () => {
    if (window.confirm("この出品を完全に削除してもよろしいですか？")) {
      alert("商品を削除しました。");
      navigate('/deals'); // 取引一覧に戻る
    }
  };

  return (
    <div className="edit-page-container">
      {/* 🌌 サイバーなシームレスヘッダー */}
      <div className="edit-header">
        <button type="button" className="edit-cancel-btn" onClick={() => navigate(-1)}>
          キャンセル
        </button>
        <h2 className="edit-page-title">商品の編集</h2>
        <div style={{ width: '60px' }}></div>
      </div>

      <form className="edit-form" onSubmit={handleSave}>
        
        {/* 📷 画像プレビュー */}
        <div className="edit-section">
          <label className="edit-label">出品画像</label>
          <div className="edit-image-preview">
            <img src={formData.image} alt="プレビュー" />
            <div className="image-change-overlay">変更する</div>
          </div>
        </div>

        {/* 📝 商品名入力 */}
        <div className="edit-section">
          <label className="edit-label">商品名</label>
          <input 
            type="text" 
            name="title"
            className="edit-input" 
            value={formData.title} 
            onChange={handleChange}
            placeholder="商品名を入力してください"
            required
          />
        </div>

        {/* 📂 カテゴリ選択 */}
        <div className="edit-section">
          <label className="edit-label">カテゴリー</label>
          <div className="edit-category-selector" onClick={() => alert("カテゴリー選択画面へ（開発中）")}>
            {formData.category}
            <span className="arrow-right">＞</span>
          </div>
        </div>

        {/* 💬 商品の説明 */}
        <div className="edit-section">
          <label className="edit-label">商品の説明</label>
          <textarea 
            name="description"
            className="edit-textarea" 
            rows="8"
            value={formData.description}
            onChange={handleChange}
            placeholder="商品の状態、サイズ、色、素材などについて詳しく書きましょう"
          ></textarea>
        </div>

        {/* 💰 販売価格 */}
        <div className="edit-section no-border">
          <label className="edit-label">販売価格 (¥300〜9,999,999)</label>
          <div className="price-input-wrapper">
            <span className="price-currency">¥</span>
            <input 
              type="number" 
              name="price"
              className="edit-price-input" 
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              required
            />
          </div>
        </div>

        {/* 🚀 アクションボタン固定フッター */}
        <div className="edit-actions-footer">
          <button type="submit" className="edit-save-btn">
            変更を保存する
          </button>
          <button type="button" className="edit-delete-btn" onClick={handleDelete}>
            この出品を削除する
          </button>
        </div>

      </form>
    </div>
  );
}

export default ProductEdit;