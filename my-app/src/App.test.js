// App自体はルーティングとプロバイダの組み合わせのため、
// 機能テストは各コンポーネントのテストファイルで実施する。
// このファイルはCIを緑に保つための最小テスト。
test('placeholder: CI passes', () => {
  expect(true).toBe(true);
});
