import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LikeButton } from './LikeButton';

describe('LikeButton', () => {
  test('初期状態でlikeCountが表示される', () => {
    render(<LikeButton isLikedInitial={false} likeCountInitial={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('クリックでいいね状態がトグルする', () => {
    render(<LikeButton isLikedInitial={false} likeCountInitial={3} />);
    const btn = screen.getByRole('button', { name: 'いいね' });
    fireEvent.click(btn);
    // いいね後: カウントが4に増える
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  test('いいね済み状態からクリックでカウントが減る', () => {
    render(<LikeButton isLikedInitial={true} likeCountInitial={7} />);
    const btn = screen.getByRole('button', { name: 'いいね' });
    fireEvent.click(btn);
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  test('クリックでonToggleが正しい次の状態を渡して呼ばれる', () => {
    const onToggle = jest.fn();
    render(<LikeButton isLikedInitial={false} likeCountInitial={0} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'いいね' }));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  test('onToggleなしでもエラーにならない', () => {
    render(<LikeButton isLikedInitial={false} likeCountInitial={0} />);
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'いいね' }));
    }).not.toThrow();
  });

  test('クリックイベントが親に伝播しない（stopPropagation）', () => {
    const parentClick = jest.fn();
    render(
      <div onClick={parentClick}>
        <LikeButton isLikedInitial={false} likeCountInitial={0} />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: 'いいね' }));
    expect(parentClick).not.toHaveBeenCalled();
  });
});
