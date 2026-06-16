import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { fireAuth } from "../../lib/firebase";
import './LoginForm.css';

import loopaLogo from '../../assets/logo.png';

// LoginForm: 未ログイン時に表示されるGoogleログイン画面

export const LoginForm = () => {

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
