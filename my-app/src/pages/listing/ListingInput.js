import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ImageUploadSection } from '../../components/listing/ImageUploadSection';
import { CategoryChipSelector } from '../../components/listing/CategoryChipSelector';
import './Listing.css';

// ─────────────────────────────────────────────────────────
// ListingInput: 商品出品フォームページ
//
// 出品フローは2ステップ構成:
//   1. ListingInput（このファイル）: フォーム入力
//   2. ListingConfirm: 内容確認 → 出品APIを叩く
//
// 特徴:
//   - 画像をアップロードしてGeminiボタンを押すと、商品名・説明・
//     カテゴリ・状態・価格が自動入力される（AI自動入力機能）
//   - 確認画面へ遷移するとき、入力中の値を React Router の state で渡す
//   - 「戻る」で戻ってきたとき、location.state から値を復元する
// ─────────────────────────────────────────────────────────

// 商品状態の選択肢（メルカリと同じ6段階）
const CONDITIONS = [
  '新品、未使用',
  '未使用に近い',
  '目立った傷や汚れなし',
  'やや傷や汚れあり',
  '傷や汚れあり',
  '全体的に状態が悪い',
];

function ListingInput() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categories } = useAuth(); // カテゴリマスター（カテゴリ選択UIに使う）

  // 確認画面から「戻る」で戻ってきたとき、入力値を復元するために location.state を使う
  // 初回表示のときは location.state が null なので || {} でデフォルトを与える
  const savedData = location.state || {};

  // ── フォームの各フィールドのstate ─────────────────────────
  // 初期値は savedData（確認画面から戻ってきた場合）か空
  const [images, setImages] = useState(savedData.images || []);               // アップロード済み画像URL配列
  const [isUploading, setIsUploading] = useState(false);                       // 画像アップロード中フラグ
  const [title, setTitle] = useState(savedData.title || '');                   // 商品名
  const [description, setDescription] = useState(savedData.description || ''); // 商品説明
  const [condition, setCondition] = useState(savedData.condition || '');       // 商品の状態
  const [price, setPrice] = useState(savedData.price || '');                   // 販売価格
  const [selectedCategories, setSelectedCategories] = useState(savedData.selectedCategories || []); // 選択したカテゴリ名の配列
  const [tags, setTags] = useState(savedData.tags || []);                      // AIが生成したタグ

  const [isAiLoading, setIsAiLoading] = useState(false); // Gemini解析中フラグ

  // ── Gemini AI自動入力 ─────────────────────────────────────
  // 1枚目の画像URLをバックエンドに送り、Geminiが出品情報を生成して返す
  const handleAiAutoFill = async () => {
    if (images.length === 0) return; // 画像がない場合は何もしない
    setIsAiLoading(true);
    try {
      // POST /api/gemini/listing に1枚目の画像URLを送る
      // バックエンドが画像を取得してGeminiに解析させる
      const result = await apiFetch('/api/gemini/listing', {
        method: 'POST',
        body: { image_url: images[0] },
      });

      // Geminiの返答でフォームを埋める
      setTitle(result.title || '');
      setDescription(result.description || '');
      if (result.condition) setCondition(result.condition);
      if (result.price_suggestion > 0) setPrice(String(result.price_suggestion));

      // Geminiが返すカテゴリ名がマスターに存在するものだけを使う
      // （Geminiが勝手に存在しないカテゴリを生成してしまうことがあるため）
      const validNames = categories.map(c => c.name);
      setSelectedCategories((result.categories || []).filter(name => validNames.includes(name)));
      setTags(result.tags || []);
    } catch (err) {
      alert(`AI解析に失敗しました: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // ── 確認画面へ遷移 ────────────────────────────────────────
  // フォームの値を React Router の state として渡す
  // ListingConfirm ではこの state を受け取って表示・出品APIを叩く
  const handleGoToConfirm = () => {
    navigate('/listing/confirm', {
      state: { images, title, description, condition, price, selectedCategories, tags },
    });
  };

  // 画像が1枚以上あるかどうか（AIボタンと確認ボタンの有効化に使う）
  const hasImages = images.length > 0;

  return (
    <div className="listing-container">
      <h2 className="listing-title">商品の出品</h2>
      <div className="listing-form">

        {/* 画像アップロード */}
        {/* ImageUploadSection: 画像を選択→GCSにアップロード→URLを images state に追加 */}
        <div className="form-group">
          <label className="form-label">商品画像（1枚目がメイン）</label>
          <ImageUploadSection
            images={images}
            onChange={setImages}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        </div>

        {/* Gemini AI自動入力ボタン */}
        {/* 画像がアップロードされたときだけアクティブになる */}
        <div className="ai-assistant-box">
          <div className="ai-assistant-info">
            <span className="ai-sparkle-icon">✨</span>
            <p className="ai-assistant-text">
              画像をアップロードすると、Geminiが商品名・説明文・カテゴリを自動生成します。
            </p>
          </div>
          <button
            type="button"
            className={`ai-autofill-btn ${hasImages ? 'activated' : ''}`}
            disabled={!hasImages || isAiLoading}
            onClick={handleAiAutoFill}
          >
            {isAiLoading ? <span className="ai-loading-spinner">AIが画像を解析中...</span> : '✨ Geminiに商品説明を任せる'}
          </button>
        </div>

        {/* 商品名 */}
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

        {/* 商品説明 */}
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

        {/* 商品の状態 */}
        <div className="form-group">
          <label className="form-label">商品の状態</label>
          <select className="form-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="">選択してください</option>
            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* カテゴリ選択 */}
        {/* CategoryChipSelector: チップ形式で複数選択できるカテゴリ選択UI */}
        <div className="form-group">
          <label className="form-label">おすすめカテゴリ（複数選択可）</label>
          <CategoryChipSelector selected={selectedCategories} onChange={setSelectedCategories} />
        </div>

        {/* タグ（AIが生成した場合のみ表示） */}
        {/* タグは検索精度を上げるためにDBに保存する。×ボタンで個別に削除可能 */}
        {tags.length > 0 && (
          <div className="form-group">
            <label className="form-label">検索用タグ（AI生成）</label>
            <div className="category-tags">
              {tags.map((tag, i) => (
                <span key={i} className="cat-tag-badge">
                  #{tag}
                  {/* ×ボタン: そのタグだけを除いた配列で更新 */}
                  <button
                    type="button"
                    style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                    onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                  >×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 販売価格 */}
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

        {/* 確認画面へ: 商品名・説明・価格・画像のいずれかが空なら無効 */}
        <button
          type="button"
          className="next-confirm-button"
          disabled={!title || !description || !price || !hasImages}
          onClick={handleGoToConfirm}
        >
          入力内容を確認する
        </button>

      </div>
    </div>
  );
}

export default ListingInput;
