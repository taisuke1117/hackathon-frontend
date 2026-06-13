import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './Checkout.css';

// ─────────────────────────────────────────────────────────
// Checkout: 購入手続きページ
//
// 商品詳細の「購入手続きへ進む」ボタンで来る。
//
// 表示内容:
//   1. お届け先（プロフィールの配送先住所。インライン編集可能でPUT /api/users/me に保存）
//   2. お支払い方法（ダミーの選択肢。実際の決済API連携は未実装）
//   3. 発送商品（商品名・画像・最終価格）
//   4. 注文明細（値引き適用後の合計）と「注文を確定する」ボタン
//
// 値引き価格の取得:
//   自分の購入チャット一覧から対象商品のルームを探し、
//   discount_approved > 0 なら最終価格として適用する。
//   これにより「同じ商品でも交渉した人だけが安く買える」仕組みになる。
// ─────────────────────────────────────────────────────────

function Checkout() {
  const { id } = useParams(); // URL: /checkout/:id（商品ID）
  const navigate = useNavigate();
  const { profile, setProfile } = useAuth();

  const [product, setProduct] = useState(null);
  // discountPrice: このユーザーに承認された値引き価格（0なら未承認）
  const [discountPrice, setDiscountPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 配送先住所（インライン編集用に temp バージョンを別に持つ）
  const [address, setAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

  // 支払い方法（表示のみ。実際の決済APIとは連携していない）
  const [payment, setPayment] = useState("クレジットカード (**** 8888)");
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [tempPayment, setTempPayment] = useState(payment);

  const paymentOptions = [
    "クレジットカード (**** 8888)",
    "コンビニ決済（ローソン・ファミリーマート等）",
    "あと払い（ペイディ）",
    "キャリア決済（au / docomo / SoftBank）"
  ];

  // マウント時: 商品情報と、自分への値引き承認情報を並列取得
  useEffect(() => {
    apiFetch(`/api/products/${id}`).then(setProduct).catch(err => alert(err.message));

    // 自分が購入者として参加しているチャット一覧から、この商品の値引き承認を探す
    apiFetch('/api/chatrooms?role=buying').then(rooms => {
      const room = (rooms || []).find(r => String(r.product_id) === String(id) && r.discount_approved > 0);
      if (room) setDiscountPrice(room.discount_approved);
    }).catch(() => {});
  }, [id]);

  // プロフィールがロードされたら配送先住所の初期値をセット
  useEffect(() => {
    if (profile) {
      setAddress(profile.shipping_address || '');
      setTempAddress(profile.shipping_address || '');
    }
  }, [profile]);

  if (!product) return <div className="app-center-text">読み込み中…</div>;

  // 値引き価格が正当な場合（0より大かつ通常価格より小）のみ適用
  const finalPrice = discountPrice > 0 && discountPrice < product.price ? discountPrice : product.price;
  const shippingFee = 0; // 送料は現在無料
  const total = finalPrice + shippingFee;

  // 配送先住所をインライン保存（PUT /api/users/me でプロフィールに永続化）
  const handleSaveAddress = async () => {
    try {
      const updated = await apiFetch('/api/users/me', {
        method: 'PUT',
        body: {
          name: profile?.name || 'ユーザー',
          place: profile?.place || '',
          icon_url: profile?.icon_url || '',
          bio: profile?.bio || '',
          shipping_address: tempAddress,
        },
      });
      setProfile(updated);
      setAddress(tempAddress);
      setIsEditingAddress(false);
    } catch (err) {
      alert(`住所の保存に失敗しました: ${err.message}`);
    }
  };

  const handleSavePayment = () => {
    setPayment(tempPayment);
    setIsEditingPayment(false);
  };

  // 購入確定: POST /api/products/:id/purchase
  // バックエンドが在庫確認・ステータス変更・通知送信をまとめて処理する
  const handlePurchase = async () => {
    if (!address) {
      alert('お届け先を入力してください');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/products/${id}/purchase`, { method: 'POST' });
      alert(`注文が確定しました！（お支払い金額: ¥${res.price.toLocaleString()}）`);
      navigate('/mypage/purchases'); // 購入履歴ページへ
    } catch (err) {
      alert(`購入に失敗しました: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="checkout-back-btn" onClick={() => navigate(-1)}>✕</button>
        <h1 className="checkout-page-title">注文内容の確認</h1>
      </div>

      <div className="checkout-scroll-flow">

        {/* 1. お届け先 */}
        <section className="checkout-section-card">
          <div className="section-header">
            <h2 className="section-title">1. お届け先</h2>
            {!isEditingAddress && (
              <button className="section-edit-btn" onClick={() => { setTempAddress(address); setIsEditingAddress(true); }}>変更</button>
            )}
          </div>
          <div className="section-body">
            {isEditingAddress ? (
              <div className="inline-edit-form">
                <input
                  type="text"
                  className="inline-input"
                  value={tempAddress}
                  placeholder="お届け先住所を入力"
                  onChange={(e) => setTempAddress(e.target.value)}
                />
                <div className="inline-actions">
                  <button className="inline-cancel-btn" onClick={() => setIsEditingAddress(false)}>キャンセル</button>
                  <button className="inline-save-btn" onClick={handleSaveAddress}>保存</button>
                </div>
              </div>
            ) : (
              <>
                <p className="address-text">{address || '未設定（「変更」から入力してください）'}</p>
                <p className="delivery-estimate">お届け予定日: <strong>3〜5日後</strong></p>
              </>
            )}
          </div>
        </section>

        {/* 2. お支払い方法 */}
        <section className="checkout-section-card">
          <div className="section-header">
            <h2 className="section-title">2. お支払い方法</h2>
            {!isEditingPayment && (
              <button className="section-edit-btn" onClick={() => { setTempPayment(payment); setIsEditingPayment(true); }}>変更</button>
            )}
          </div>
          <div className="section-body">
            {isEditingPayment ? (
              <div className="inline-edit-form">
                <select
                  className="inline-select"
                  value={tempPayment}
                  onChange={(e) => setTempPayment(e.target.value)}
                >
                  {paymentOptions.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                  ))}
                </select>
                <div className="inline-actions">
                  <button className="inline-cancel-btn" onClick={() => setIsEditingPayment(false)}>キャンセル</button>
                  <button className="inline-save-btn" onClick={handleSavePayment}>保存</button>
                </div>
              </div>
            ) : (
              <p className="payment-method-text">{payment}</p>
            )}
          </div>
        </section>

        {/* 3. 発送商品 */}
        <section className="checkout-section-card">
          <h2 className="section-title">3. 発送商品</h2>
          <div className="checkout-item-preview">
            <img src={product.images[0] || ''} alt="商品画像" className="item-thumb" />
            <div className="item-meta">
              <h3 className="item-title">{product.name}</h3>
              <p className="item-qty">数量: 1</p>
              <p className="item-price">¥{finalPrice.toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* 4. 注文合計 */}
        <div className="checkout-summary-block">
          <div className="summary-details">
            <h3 className="summary-title">注文合計</h3>
            <div className="summary-row">
              <span>商品の小計:</span>
              <span>¥{product.price.toLocaleString()}</span>
            </div>
            {/* 値引き行: 承認済みかつ通常価格より低い場合のみ表示 */}
            {discountPrice > 0 && discountPrice < product.price && (
              <div className="summary-row">
                <span>✨ 交渉成立による値引き:</span>
                <span>-¥{(product.price - discountPrice).toLocaleString()}</span>
              </div>
            )}
            <div className="summary-row">
              <span>配送料・手数料:</span>
              <span>{shippingFee === 0 ? "無料" : `¥${shippingFee}`}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span>ご請求額:</span>
              <span className="final-price">¥{total.toLocaleString()}</span>
            </div>
          </div>

          <button className="checkout-submit-btn" disabled={isSubmitting} onClick={handlePurchase}>
            {isSubmitting ? '処理中…' : '注文を確定する'}
          </button>
          <p className="terms-text">
            注文を確定すると、利用規約およびプライバシーポリシーに同意したことになります。
          </p>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
