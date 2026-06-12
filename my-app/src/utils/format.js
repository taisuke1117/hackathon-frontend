// 日時表示の共通ヘルパー
export function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'たった今';
  if (diffMin < 60) return `${diffMin}分前`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}時間前`;
  if (diffMin < 60 * 24 * 7) return `${Math.floor(diffMin / (60 * 24))}日前`;
  return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
}

export function formatClock(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('ja-JP', { hour: 'numeric', minute: '2-digit' });
}
