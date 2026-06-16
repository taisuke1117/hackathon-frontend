import { categoryNamesToIds, toggleSelection } from './category';

const masterCategories = [
  { category_id: 1, name: 'ファッション' },
  { category_id: 2, name: '家電' },
  { category_id: 3, name: 'スポーツ' },
];

describe('categoryNamesToIds', () => {
  test('有効な名前 → IDの配列', () => {
    expect(categoryNamesToIds(['ファッション', '家電'], masterCategories)).toEqual([1, 2]);
  });

  test('存在しない名前は除外される', () => {
    expect(categoryNamesToIds(['ファッション', '存在しないカテゴリ'], masterCategories)).toEqual([1]);
  });

  test('空配列 → []', () => {
    expect(categoryNamesToIds([], masterCategories)).toEqual([]);
  });

  test('全て存在しない名前 → []', () => {
    expect(categoryNamesToIds(['XXX', 'YYY'], masterCategories)).toEqual([]);
  });

  test('masterCategoriesが空 → []', () => {
    expect(categoryNamesToIds(['ファッション'], [])).toEqual([]);
  });
});

describe('toggleSelection', () => {
  test('含まれていない名前を追加する', () => {
    expect(toggleSelection(['A', 'B'], 'C')).toEqual(['A', 'B', 'C']);
  });

  test('含まれている名前を削除する', () => {
    expect(toggleSelection(['A', 'B', 'C'], 'B')).toEqual(['A', 'C']);
  });

  test('空リストに追加する', () => {
    expect(toggleSelection([], 'A')).toEqual(['A']);
  });

  test('最後の1つを削除すると空になる', () => {
    expect(toggleSelection(['A'], 'A')).toEqual([]);
  });

  test('元のリストを変更しない（イミュータブル）', () => {
    const original = ['A', 'B'];
    toggleSelection(original, 'C');
    expect(original).toEqual(['A', 'B']);
  });
});
