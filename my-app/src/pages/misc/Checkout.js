import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './Checkout.css';

function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, setProfile } = useAuth();

  const [product, setProduct] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(0); // 自分に承認された値引き価格（0なら無し）
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📋 お届け先
  const [address, setAddress] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

  // 💳 支払い方法（決済API連携は課題対象外なので表示のみ）
  const [payment, setPayment] = useState("クレジットカード (**** 8888)");
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [tempPayment, setTempPayment] = useState(payment);

  const paymentOptions = [
    "クレジットカード (**** 8888)",
    "コンビニ決済（ローソン・ファミリーマート等）",
    "あと払い（ペイディ）",
    "キャリア決済（au / docomo / SoftBank）"
  ];

  useEffect(() => {
    // 商品情報
    apiFetch(`/api/products/${id}`).then(setProduct).catch(err => alert(err.message));
    // 自分宛てに承認された値引きがあるか（このルームの自分だけに適用される）
    apiFetch('/api/chatrooms?role=buying').then(rooms => {
      const room = (rooms || []).find(r => String(r.product_id) === String(id) && r.discount_approved > 0);
      if (room) setDiscountPrice(room.discount_approved);
    }).catch(() => {});
  }, [id]);

  // プロフィールの配送先住所を初期値に
  useEffect(() => {
    if (profile) {
      setAddress(profile.shipping_address || '');
      setTempAddress(profile.shipping_address || '');
    }
  }, [profile]);

  if (!product) return <div className="app-center-text">読み込み中…</div>;

  const finalPrice = discountPrice > 0 && discountPrice < product.price ? discountPrice : product.price;
  const shippingFee = 0;
  const total = finalPrice + shippingFee;

  // 💾 お届け先の保存（users.shipping_address に永続化）
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

  // 🛒 購入確定
  const handlePurchase = async () => {
    if (!address) {
      alert('お届け先を入力してください');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/products/${id}/purchase`, { method: 'POST' });
      alert(`注文が確定しました！（お支払い金額: ¥${res.price.toLocaleString()}）`);
      navigate('/mypage/purchases');
    } catch (err) {
      alert(`購入に失敗しました: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-container">
      {/* ヘッダー */}
      <div className="checkout-header">
        <button className="checkout-back-btn" onClick={() => navigate(-1)}>✕</button>
        <h1 className="checkout-page-title">注文内容の確認</h1>
      </div>

      <div className="checkout-scroll-flow">

        {/* 1. お届け先セクション */}
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

        {/* 2. 支払い方法セクション */}
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

        {/* 4. 注文明細 ＆ 確定ボタン */}
        <div className="checkout-summary-block">
          <div className="summary-details">
            <h3 className="summary-title">注文合計</h3>
            <div className="summary-row">
              <span>商品の小計:</span>
              <span>¥{product.price.toLocaleString()}</span>
            </div>
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
