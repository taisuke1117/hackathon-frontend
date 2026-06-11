import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Checkout.css';

function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 📦 商品データ
  const [product] = useState({
    id: id,
    title: "オリンパス OMD デジタルカメラ",
    price: 42000,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300",
    shippingFee: 0,
  });

  // 📋 お届け先の状態管理（編集モードのフラグと入力値）
  const [address, setAddress] = useState("東京都大田区 1-2-3 氷河ビル 404号室");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);

  // 💳 支払い方法の状態管理（編集モードのフラグと選択値）
  const [payment, setPayment] = useState("クレジットカード (**** 8888)");
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [tempPayment, setTempPayment] = useState(payment);

  const paymentOptions = [
    "クレジットカード (**** 8888)",
    "コンビニ決済（ローソン・ファミリーマート等）",
    "あと払い（ペイディ）",
    "キャリア決済（au / docomo / SoftBank）"
  ];

  // 💰 計算ロジック（シンプルに商品代＋送料）
  const total = product.price + product.shippingFee;

  // 💾 お届け先の保存
  const handleSaveAddress = () => {
    setAddress(tempAddress);
    setIsEditingAddress(false);
  };

  // 💾 支払い方法の保存
  const handleSavePayment = () => {
    setPayment(tempPayment);
    setIsEditingPayment(false);
  };

  const handlePurchase = () => {
    alert("注文が確定しました！氷河の彼方から発送されます。");
    navigate('/mypage/purchases');
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
                  onChange={(e) => setTempAddress(e.target.value)} 
                />
                <div className="inline-actions">
                  <button className="inline-cancel-btn" onClick={() => setIsEditingAddress(false)}>キャンセル</button>
                  <button className="inline-save-btn" onClick={handleSaveAddress}>保存</button>
                </div>
              </div>
            ) : (
              <>
                <p className="address-text">{address}</p>
                <p className="delivery-estimate">お届け予定日: <strong>6月15日 - 6月17日</strong></p>
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
            <img src={product.image} alt="商品画像" className="item-thumb" />
            <div className="item-meta">
              <h3 className="item-title">{product.title}</h3>
              <p className="item-qty">数量: 1</p>
              <p className="item-price">¥{product.price.toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* 4. 注文明細 ＆ 確定ボタン（スクロールの最下部へ集約） */}
        <div className="checkout-summary-block">
          <div className="summary-details">
            <h3 className="summary-title">注文合計</h3>
            <div className="summary-row">
              <span>商品の小計:</span>
              <span>¥{product.price.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>配送料・手数料:</span>
              <span>{product.shippingFee === 0 ? "無料" : `¥${product.shippingFee}`}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span>ご請求額:</span>
              <span className="final-price">¥{total.toLocaleString()}</span>
            </div>
          </div>

          <button className="checkout-submit-btn" onClick={handlePurchase}>
            注文を確定する
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