// ─────────────────────────────────────────────────────────
// format.js: 日時フォーマットのユーティリティ関数
//
// formatTime : ISO 文字列を「相対時刻」に変換
//              （チャット一覧・通知一覧・プロフィール評価などで使う）
// formatClock: ISO 文字列を「HH:MM 形式」に変換
//              （チャットタイムラインのメッセージ時刻に使う）
// ─────────────────────────────────────────────────────────

// formatTime: 現在時刻からの経過時間を日本語の相対表現で返す
// 例: "たった今" / "3分前" / "2時間前" / "5日前" / "6/13"
export function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;                      // ミリ秒差
  const diffMin = Math.floor(diffMs / 60000);     // 分差

  if (diffMin < 1)       return 'たった今';
  if (diffMin < 60)      return `${diffMin}分前`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}時間前`;
  if (diffMin < 60 * 24 * 7) return `${Math.floor(diffMin / (60 * 24))}日前`;
  // 1週間以上前は「月/日」形式
  return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
}

// formatClock: ISO 文字列を HH:MM 形式に変換
// 例: "14:05"
export function formatClock(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('ja-JP', { hour: 'numeric', minute: '2-digit' });
}
