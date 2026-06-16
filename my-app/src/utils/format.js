// formatTime: 相対時刻（"3分前" / "2時間前" / "5日前" / "6/13"）
export function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMin = Math.floor((now - date) / 60000);

  if (diffMin < 1)       return 'たった今';
  if (diffMin < 60)      return `${diffMin}分前`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}時間前`;
  if (diffMin < 60 * 24 * 7) return `${Math.floor(diffMin / (60 * 24))}日前`;
  return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
}

// formatClock: HH:MM形式（例: "14:05"）
export function formatClock(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('ja-JP', { hour: 'numeric', minute: '2-digit' });
}
