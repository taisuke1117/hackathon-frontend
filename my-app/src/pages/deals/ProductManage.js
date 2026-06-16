import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { formatTime } from '../../utils/format';
import { StatusBanner } from '../../components/deals/StatusBanner';
import './ProductManage.css';

// ProductManage: 個別商品の取引管理画面（ステータス操作・チャット一覧）

function ProductManage() {
  const { id } = useParams(); // URL: /deals/manage/:id
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [itemChats, setItemChats] = useState([]);

  // useCallback で安定した参照を作り useEffect の依存に含める
  const load = useCallback(async () => {
    try {
      const detail = await apiFetch(`/api/products/${id}`);
      setProduct(detail);
      // /api/chatrooms?role=selling は全チャットを返すので、
      // product_id で絞り込みてこの商品だけのチャットを取り出す
      const rooms = await apiFetch('/api/chatrooms?role=selling');
      setItemChats((rooms || []).filter(r => String(r.product_id) === String(id)));
    } catch (err) {
      alert(`読み込みに失敗しました: ${err.message}`);
      navigate(-1);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  if (!product) return <div className="app-center-text">読み込み中…</div>;

  // 発送処理: 確認ダイアログ → PUT /api/products/:id/ship → 画面リロード
  const handleShipProduct = async () => {
    if (!window.confirm("商品を発送しましたか？\n購入者に発送通知が送信されます。")) return;
    try {
      await apiFetch(`/api/products/${id}/ship`, { method: 'PUT' });
      alert("発送通知を送信しました。");
      await load(); // ステータスが shipped に変わるので再取得
    } catch (err) {
      alert(`発送処理に失敗しました: ${err.message}`);
    }
  };

  // 出品取り消し: DELETE /api/products/:id → 取引一覧に戻る
  const handleDelete = async () => {
    if (!window.confirm("この商品の出品を取り消し、削除してもよろしいですか？\n（この操作は取り消せません）")) return;
    try {
      await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      alert("商品の出品を取り消しました。");
      navigate('/deals');
    } catch (err) {
      alert(`削除に失敗しました: ${err.message}`);
    }
  };

  const status = product.status;
  // 取引中 = 購入者が決まった後（未発送 or 発送済み）
  const isTrading = status === 'unshipped' || status === 'shipped';

  // 取引中は実際の購入者チャットを先頭に並べる（複数の問い合わせがある場合のUX）
  const sortedChats = [...itemChats].sort((a, b) => {
    if (isTrading) {
      const aIsBuyer = a.other_user_id === product.buyer_id;
      const bIsBuyer = b.other_user_id === product.buyer_id;
      if (aIsBuyer && !bIsBuyer) return -1;
      if (!aIsBuyer && bIsBuyer) return 1;
    }
    return 0;
  });

  return (
    <div className="manage-page-container">
      <div className="manage-header">
        <button className="manage-back-btn" onClick={() => navigate(-1)}>← 戻る</button>
        <h2 className="manage-page-title">出品商品管理</h2>
        <div style={{ width: '48px' }}></div>
      </div>

      {/* StatusBanner: ステータスに応じたアクション表示（発送ボタンなど）*/}
      <StatusBanner status={status} onShip={handleShipProduct} />

      {/* 商品情報カード */}
      <div className="manage-product-summary-card">
        <div className="manage-product-meta-row">
          {product.images[0] && <img src={product.images[0]} alt={product.name} className="manage-product-thumb" />}
          <div className="manage-product-info-text">
            {/* ステータスバッジ（色違い）*/}
            {status === 'available'  && <span className="manage-product-status-tag">出品中</span>}
            {status === 'unshipped' && <span className="manage-product-status-tag tag-unshipped">未発送</span>}
            {status === 'shipped'   && <span className="manage-product-status-tag tag-shipped">発送済み</span>}

            <h3 className="manage-product-title-text">{product.name}</h3>
            <span className="manage-product-price-text">¥{product.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="manage-stats-row">
          <div className="stat-item">閲覧数: <strong>{product.views_count}</strong></div>
          <div className="stat-item">いいね!: <strong>{product.likes_count}</strong></div>
        </div>

        {/* 出品中のときだけ編集・削除が可能（取引開始後は変更不可）*/}
        {status === 'available' && (
          <>
            <button
              className="manage-edit-redirect-btn"
              onClick={() => navigate(`/deals/edit/${product.product_id}`)}
            >
              商品情報を書き換える / 編集
            </button>

            <button
              type="button"
              className="manage-delete-trigger-btn"
              onClick={handleDelete}
            >
              この商品の出品を取り消す
            </button>
          </>
        )}
      </div>

      {/* チャット一覧 */}
      <div className="manage-chat-section">
        <h4 className="manage-section-sub-title">
          {isTrading
            ? "取引相手のチャット（最上部固定）"
            : "この商品への問い合わせ・価格交渉"}
        </h4>

        <div className="manage-chat-list">
          {sortedChats.length === 0 && (
            <div className="app-center-text">この商品へのチャットはまだありません</div>
          )}
          {sortedChats.map(chat => {
            // isTrading かつ buyer_id が一致するチャットを購入者として強調表示
            const isBuyer = isTrading && chat.other_user_id === product.buyer_id;
            return (
              <div
                key={chat.chatroom_id}
                className={`manage-chat-row ${isBuyer ? 'active-buyer-row' : ''}`}
                onClick={() => navigate(`/chat/seller/${product.product_id}/${chat.chatroom_id}`)}
              >
                {chat.other_user_icon
                  ? <img src={chat.other_user_icon} alt={chat.other_user_name} className="manage-chat-avatar" />
                  : <div className="manage-chat-avatar" style={{ background: '#444' }} />}

                <div className="manage-chat-mid">
                  <div className="manage-chat-user-line">
                    <span className="manage-chat-user-name">
                      {chat.other_user_name}
                      {isBuyer && <span className="buyer-role-badge">購入者</span>}
                    </span>
                    <span className="manage-chat-time">{formatTime(chat.last_message_at)}</span>
                  </div>
                  <p className="manage-chat-last-msg">{chat.last_message || 'メッセージはまだありません'}</p>
                </div>

                <div className="manage-chat-right">
                  {/* 値引き交渉額バッジ（0なら「質問のみ」表示）*/}
                  {chat.discount_proposed > 0 ? (
                    <div className="negotiation-target-badge">
                      <span className="negotiation-label">希望額</span>
                      <span className="negotiation-amount">¥{chat.discount_proposed.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="negotiation-empty-placeholder">質問のみ</div>
                  )}

                  {/* 未読数バッジ */}
                  {chat.unread_count > 0 && (
                    <span className="manage-unread-count-dot">{chat.unread_count}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProductManage;
