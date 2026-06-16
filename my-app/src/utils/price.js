// calcFinalPrice: 値引き価格が有効な場合のみ適用し、最終支払い金額を返す
// 有効条件: 0 < discountPrice < basePrice
export function calcFinalPrice(discountPrice, basePrice) {
  return discountPrice > 0 && discountPrice < basePrice ? discountPrice : basePrice;
}
