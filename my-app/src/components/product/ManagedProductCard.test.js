import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ManagedProductCard } from './ManagedProductCard';

const renderCard = (props) =>
  render(
    <MemoryRouter>
      <ManagedProductCard id={1} title="テスト商品" price={2000} image="" likeCount={0} {...props} />
    </MemoryRouter>
  );

describe('ManagedProductCard ステータス表示', () => {
  test('available → 出品中', () => {
    renderCard({ status: 'available' });
    expect(screen.getByText('出品中')).toBeInTheDocument();
  });

  test('processing → 取引中(未配達)', () => {
    renderCard({ status: 'processing' });
    expect(screen.getByText('取引中(未配達)')).toBeInTheDocument();
  });

  test('shipped → 配達中', () => {
    renderCard({ status: 'shipped' });
    expect(screen.getByText('配達中')).toBeInTheDocument();
  });

  test('completed → 売却済み(配達済)', () => {
    renderCard({ status: 'completed' });
    expect(screen.getByText('売却済み(配達済)')).toBeInTheDocument();
  });

  test('未知のステータス → 出品中（デフォルト）', () => {
    renderCard({ status: 'unknown' });
    expect(screen.getByText('出品中')).toBeInTheDocument();
  });
});

describe('ManagedProductCard 未読バッジ', () => {
  test('unreadChatCount > 0 → バッジ表示', () => {
    const { container } = renderCard({ status: 'available', unreadChatCount: 3 });
    const badge = container.querySelector('.managed-unread-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('3');
  });

  test('unreadChatCount = 0 → バッジ非表示', () => {
    const { container } = renderCard({ status: 'available', unreadChatCount: 0 });
    expect(container.querySelector('.managed-unread-badge')).not.toBeInTheDocument();
  });
});
