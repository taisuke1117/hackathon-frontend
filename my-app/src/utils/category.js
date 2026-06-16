// categoryNamesToIds: カテゴリ名の配列をIDの配列に変換する
// categories: { category_id, name }[] のマスターデータ
// IDが見つからない名前は除外（filter(Boolean)）
export function categoryNamesToIds(names, categories) {
  return names
    .map(name => categories.find(c => c.name === name)?.category_id)
    .filter(Boolean);
}

// toggleSelection: リストに name が含まれていれば削除、なければ追加して返す
export function toggleSelection(list, name) {
  if (list.includes(name)) {
    return list.filter(c => c !== name);
  }
  return [...list, name];
}
