import { formatTime, formatClock } from './format';

function isoMinutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

describe('formatTime', () => {
  test('nullは空文字を返す', () => {
    expect(formatTime(null)).toBe('');
  });

  test('undefinedは空文字を返す', () => {
    expect(formatTime(undefined)).toBe('');
  });

  test('30秒前はたった今', () => {
    const iso = new Date(Date.now() - 30 * 1000).toISOString();
    expect(formatTime(iso)).toBe('たった今');
  });

  test('5分前は5分前', () => {
    expect(formatTime(isoMinutesAgo(5))).toBe('5分前');
  });

  test('59分前は59分前', () => {
    expect(formatTime(isoMinutesAgo(59))).toBe('59分前');
  });

  test('60分前は1時間前', () => {
    expect(formatTime(isoMinutesAgo(60))).toBe('1時間前');
  });

  test('23時間前は23時間前', () => {
    expect(formatTime(isoMinutesAgo(60 * 23))).toBe('23時間前');
  });

  test('24時間前は1日前', () => {
    expect(formatTime(isoMinutesAgo(60 * 24))).toBe('1日前');
  });

  test('6日前は6日前', () => {
    expect(formatTime(isoMinutesAgo(60 * 24 * 6))).toBe('6日前');
  });

  test('7日以上前は日付フォーマット', () => {
    const result = formatTime(isoMinutesAgo(60 * 24 * 8));
    // 「M/D」形式（例: 6/8 など）になること
    expect(result).toMatch(/^\d+\/\d+$/);
  });
});

describe('formatClock', () => {
  test('nullは空文字を返す', () => {
    expect(formatClock(null)).toBe('');
  });

  test('ISO文字列をHH:MM形式で返す', () => {
    // 2024-01-15T14:30:00.000Z (UTC+9 = 23:30 JST) のような時刻
    // ローカル環境に依存するため、形式のみ検証する
    const result = formatClock(new Date().toISOString());
    expect(result).toMatch(/^\d+:\d{2}$/);
  });
});
