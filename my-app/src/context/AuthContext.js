import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { fireAuth } from "../firebase";

// 1. 認証情報を格納する箱（Context）を作る
const AuthContext = createContext();

// 2. 全体を囲うためのプロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  const [loginUser, setLoginUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ログイン状態の監視
    const unsubscribe = onAuthStateChanged(fireAuth, (user) => {
      setLoginUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    // 箱の中にユーザー情報を入れて、子コンポーネント（アプリ全体）に共有する
    <AuthContext.Provider value={{ loginUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. 他のファイルから簡単にユーザー情報を呼ぶためのカスタムフック
export const useAuth = () => useContext(AuthContext);