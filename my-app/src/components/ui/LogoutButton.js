import React from 'react';
import { signOut } from "firebase/auth";
import { fireAuth } from "../../lib/firebase";
import './LogoutButton.css';

// ─────────────────────────────────────────────────────────
// LogoutButton: ログアウトボタンコンポーネント
//
// Account（アカウント設定ページ）の下部に配置される。
//
// ログアウト処理:
//   Firebase の signOut を呼ぶと onAuthStateChanged が発火し、
//   loginUser が null になる → App.js が自動的に LoginForm に切り替える。
//   バックエンドへの通知は不要（Firebase の JWT は有効期限で自然に失効する）。
// ─────────────────────────────────────────────────────────

export const LogoutButton = () => {

  // Firebase からサインアウト
  const signOutWithGoogle = () => {
    signOut(fireAuth)
      .then(() => {
        alert("ログアウトしました");
      })
      .catch((err) => {
        alert("エラーが発生しました: " + err.message);
      });
  };

  return (
    <button onClick={signOutWithGoogle} className="logout-button">
      <span className="logout-btn-text">ログアウト</span>
    </button>
  );
};
