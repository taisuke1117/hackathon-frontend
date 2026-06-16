import React from 'react';
import { render, screen } from '@testing-library/react';
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

  test('shipping → 配達中', () => {
    renderCard({ status: 'shipping' });
    expect(screen.getByText('配達中')).toBeInTheDocument();
  });

  test('received → 受取済み', () => {
    renderCard({ status: 'received' });
    expect(screen.getByText('受取済み')).toBeInTheDocument();
  });

  test('未知のステータス → 不明', () => {
    renderCard({ status: 'unknown_status' });
    expect(screen.getByText('不明')).toBeInTheDocument();
  });

  test('商品名と価格が表示される', () => {
    renderCard({ status: 'unshipped' });
    expect(screen.getByText('テスト商品')).toBeInTheDocument();
    expect(screen.getByText('¥1,000')).toBeInTheDocument();
  });
});
