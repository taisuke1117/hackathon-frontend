import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { fireAuth } from "../../lib/firebase";
import './LoginForm.css';

import loopaLogo from '../../assets/logo.png';

// ─────────────────────────────────────────────────────────
// LoginForm: 未ログイン時に表示されるログイン画面
//
// App.js で loginUser が null のとき（Firebase の onAuthStateChanged が
// 未認証を返したとき）に表示される。
//
// 認証方式: Google OAuth2（Firebase Authentication の signInWithPopup）
//
// 認証フロー:
//   1. 「Googleでログイン」ボタンをクリック
//   2. Firebase が Google のポップアップを開く
//   3. ユーザーが Google アカウントを選択・承認
//   4. Firebase から IDToken が発行される
//   5. onAuthStateChanged が発火 → AuthContext の loginUser にセット
//   6. App.js で条件分岐が切り替わり → メインアプリが表示される
// ─────────────────────────────────────────────────────────

export const LoginForm = () => {

  // Google でログイン: ポップアップを開いて認証する
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(fireAuth, provider)
      .then((res) => {
        alert("ログインユーザー: " + res.user.displayName);
      })
      .catch((err) => {
        alert("エラーが発生しました: " + err.message);
      });
  };

  return (
    <div className="login-container">
      <div className="login-welcome-wrapper">
        {/* アプリロゴ */}
        <div className="login-logo-area">
          <img src={loopaLogo} alt="Loopa" className="login-app-logo" />
        </div>

        <div className="login-card">
          <h2 className="login-title">サインイン</h2>
          <p className="login-subtitle">Loopaを始めるにはログインしてください</p>

          <button onClick={signInWithGoogle} className="login-button google-btn">
            <span className="google-icon-placeholder">G</span>
            <span className="btn-text">Googleでログイン</span>
          </button>
        </div>
      </div>
    </div>
  );
};
