import React, { useState } from 'react';
import sendIcon from '../../assets/send.svg';
import './SearchBar.css';

// SearchBar: 通常検索（キーワード・カテゴリ・価格帯）とAI検索の2モードを提供

export const SearchBar = ({ onSearchSubmit, onAiSearchSubmit }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [category, setCategory] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit({
        keyword: searchWord,
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
        category: category
      });
    }
    setIsFilterOpen(false); // 送信後はパネルを閉じる
  };

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    if (onAiSearchSubmit) {
      onAiSearchSubmit(aiPrompt);
    }
    setAiPrompt('');
    setIsFilterOpen(false);
  };

  return (
    <div className="search-wrapper">
      {/* 検索バー本体 */}
      <div className="search-bar-row">
        <input
          type="text"
          className="main-search-input"
          placeholder="何をお探しですか？"
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          onFocus={() => setIsFilterOpen(true)} // フォーカス時にパネルを開く
        />
        {isFilterOpen && (
          <button className="close-filter-btn" onClick={() => setIsFilterOpen(false)}>
            閉じる
          </button>
        )}
      </div>

      {/* フィルタパネル（isFilterOpen=true のとき表示）*/}
      <div className={`detailed-filter-menu ${isFilterOpen ? 'open' : ''}`}>

        <form onSubmit={handleSubmit} className="filter-form">
          <div className="filter-group">
            <label>カテゴリ</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">すべて</option>
              <option value="レディース">レディース</option>
              <option value="メンズ">メンズ</option>
              <option value="家電・スマホ">家電・スマホ</option>
              <option value="本・ゲーム">本・ゲーム</option>
            </select>
          </div>

          <div className="filter-group">
            <label>価格帯</label>
            <div className="price-range-inputs">
              <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <span>〜</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="filter-search-btn">
            この条件で検索する
          </button>
        </form>

        <div className="ai-search-divider">
          <span>または AIに相談して探す</span>
        </div>

        {/* Geminiが自然言語を検索条件に変換する */}
        <form onSubmit={handleAiSubmit} className="ai-search-form">
          <div className="ai-input-wrapper">
            <input
              type="text"
              className="ai-search-input"
              placeholder="例: 20代男性に似合う、1万円以内の黒い夏服を提案して"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button type="submit" className="ai-search-btn" aria-label="AI検索送信">
              <img src={sendIcon} alt="送信" className="ai-send-icon" />
            </button>
          </div>
        </form>

      </div>

      {/* オーバーレイ: フィルタパネル外をクリックしたら閉じる */}
      {isFilterOpen && <div className="search-overlay" onClick={() => setIsFilterOpen(false)} />}
    </div>
  );
};
