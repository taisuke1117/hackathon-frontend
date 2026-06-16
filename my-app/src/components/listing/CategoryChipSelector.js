import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { toggleSelection } from '../../utils/category';
import './CategoryChipSelector.css';

// カテゴリ複数選択チップUI。選択値は名前の文字列配列で管理する
export function CategoryChipSelector({ selected, onChange }) {
  const { categories } = useAuth();

  const toggle = (name) => onChange(toggleSelection(selected, name));

  return (
    <div className="category-chip-grid">
      {categories.map((cat) => (
        <button
          key={cat.category_id}
          type="button"
          className={`category-chip ${selected.includes(cat.name) ? 'active' : ''}`}
          onClick={() => toggle(cat.name)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
