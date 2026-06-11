import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { fireAuth } from "../firebase";
import './LoginForm.css'; 

// 💡 生成したLoopaのロゴをインポート
import loopaLogo from '../assets/logo.png'; 

export const LoginForm = () => {
  
  // Googleでログイン
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
      
      {/* 💡 カードの上にロゴを配置するためのラッパー */}
      <div className="login-welcome-wrapper">
        <div className="login-logo-area">
          <img src={loopaLogo} alt="Loopa" className="login-app-logo" />
        </div>

        <div className="login-card">
          <h2 className="login-title">サインイン</h2>
          <p className="login-subtitle">Loopaを始めるにはログインしてください</p>
          
          <button onClick={signInWithGoogle} className="login-button google-btn">
            {/* 💡 シンプルなG風の文字を添えて少しスマートに */}
            <span className="google-icon-placeholder">G</span>
            <span className="btn-text">Googleでログイン</span>
          </button>
        </div>
      </div>

    </div>
  );
};