import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PurchaseProductCard } from './PurchaseProductCard';

const renderCard = (props) =>
  render(
    <MemoryRouter>
      <PurchaseProductCard id={1} title="テスト商品" price={1000} image="" {...props} />
    </MemoryRouter>
  );

describe('PurchaseProductCard ステータス表示', () => {
  test('unshipped → 未発送', () => {
    renderCard({ status: 'unshipped' });
    expect(screen.getByText('未発送')).toBeInTheDocument();
  });

  test('shipped かつ reviewed=false → 評価待ち', () => {
    renderCard({ status: 'shipped', reviewed: false });
    expect(screen.getByText('評価待ち')).toBeInTheDocument();
  });

  test('shipped かつ reviewed=true → 受取済み', () => {
    renderCard({ status: 'shipped', reviewed: true });
    expect(screen.getByText('受取済み')).toBeInTheDocument();
  });

  test('未知のステータス → 受取済み（fallback）', () => {
    renderCard({ status: 'unknown_status' });
    expect(screen.getByText('受取済み')).toBeInTheDocument();
  });

  test('商品名と価格が表示される', () => {
    renderCard({ status: 'unshipped' });
    expect(screen.getByText('テスト商品')).toBeInTheDocument();
    expect(screen.getByText('¥1,000')).toBeInTheDocument();
  });

  test('shipped+未評価+onReview あり → 評価ボタンが表示される', () => {
    const onReview = jest.fn();
    renderCard({ status: 'shipped', reviewed: false, onReview });
    const btn = screen.getByText('⭐ 受取評価');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onReview).toHaveBeenCalledTimes(1);
  });

  test('shipped+評価済み+onReview あり → 評価ボタンは表示されない', () => {
    const onReview = jest.fn();
    renderCard({ status: 'shipped', reviewed: true, onReview });
    expect(screen.queryByText('⭐ 受取評価')).not.toBeInTheDocument();
  });

  test('onReview なし → 評価ボタンは表示されない', () => {
    renderCard({ status: 'shipped', reviewed: false });
    expect(screen.queryByText('⭐ 受取評価')).not.toBeInTheDocument();
  });
});
