import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './CategoryChipSelector.css';

// ─────────────────────────────────────────────────────────
// CategoryChipSelector: カテゴリ複数選択チップUIコンポーネント
//
// 使用箇所: ListingInput（出品フォーム）/ ProductEdit（商品編集）
//
// カテゴリは「名前の文字列配列」として管理する。
// DBに送るときは ListingConfirm / ProductEdit で名前→IDに変換する。
//
// Props:
//   selected : 現在選択中のカテゴリ名の配列（親が管理）
//   onChange : 配列が変わったとき親に通知するコールバック
//
// AuthContext の categories（全カテゴリマスター）からチップを生成し、
// クリックするたびに選択/解除をトグルする。
// ─────────────────────────────────────────────────────────

export function CategoryChipSelector({ selected, onChange }) {
  // categories: GET /api/init で取得したカテゴリマスター（{ category_id, name }[]）
  const { categories } = useAuth();

  // チップのトグル: 選択済みなら外す、未選択なら追加する
  const toggle = (name) => {
    if (selected.includes(name)) {
      onChange(selected.filter(c => c !== name)); // 選択解除
    } else {
      onChange([...selected, name]); // 選択追加
    }
  };

  return (
    <div className="category-chip-grid">
      {categories.map((cat) => (
        <button
          key={cat.category_id}
          type="button"
          // selected に名前が含まれていれば 'active' クラスを付与して強調
          className={`category-chip ${selected.includes(cat.name) ? 'active' : ''}`}
          onClick={() => toggle(cat.name)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
