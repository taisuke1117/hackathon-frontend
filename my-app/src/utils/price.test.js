import { calcFinalPrice } from './price';

describe('calcFinalPrice', () => {
  test('discountPrice=0 → 通常価格', () => {
    expect(calcFinalPrice(0, 10000)).toBe(10000);
  });

  test('discountPrice < 0 → 通常価格', () => {
    expect(calcFinalPrice(-500, 10000)).toBe(10000);
  });

  test('discountPrice > basePrice → 通常価格', () => {
    expect(calcFinalPrice(12000, 10000)).toBe(10000);
  });

  test('discountPrice === basePrice → 通常価格（同額は値引きなし）', () => {
    expect(calcFinalPrice(10000, 10000)).toBe(10000);
  });

  test('0 < discountPrice < basePrice → 値引き価格', () => {
    expect(calcFinalPrice(8000, 10000)).toBe(8000);
  });

  test('discountPrice=1（最小値）でも適用される', () => {
    expect(calcFinalPrice(1, 10000)).toBe(1);
  });
});
