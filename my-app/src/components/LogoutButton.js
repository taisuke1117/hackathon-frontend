import React from 'react';
import { signOut } from "firebase/auth";
import { fireAuth } from "../firebase";
import './LogoutButton.css'; 

export const LogoutButton = () => {
  
  // ログアウト処理
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