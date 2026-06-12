import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { fireAuth } from "../firebase";
import { apiFetch } from "../api/client";

// 1. 認証情報を格納する箱（Context）を作る
const AuthContext = createContext();

// 2. 全体を囲うためのプロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  const [loginUser, setLoginUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // バックエンド側のデータ（プロフィール・カテゴリマスター・いいね済みID）
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [likedIds, setLikedIds] = useState([]);

  // /api/init を呼んで共有データを更新する（いいね後の再同期などにも使う）
  const refreshInit = useCallback(async () => {
    const init = await apiFetch('/api/init');
    setProfile(init.user);
    setCategories(init.categories || []);
    setLikedIds(init.liked_product_ids || []);
    return init;
  }, []);

  useEffect(() => {
    // ログイン状態の監視
    const unsubscribe = onAuthStateChanged(fireAuth, async (user) => {
      setLoginUser(user);
      if (user) {
        try {
          // 初回ログインならバックエンドにユーザー登録（既存なら名前を同期するだけ）
          await apiFetch('/api/users', {
            method: 'POST',
            body: {
              name: user.displayName || 'ユーザー',
              mail: user.email || `${user.uid}@example.com`,
              icon_url: user.photoURL || '',
            },
          });
          await refreshInit();
        } catch (err) {
          // バックエンドが落ちていてもアプリ自体は起動させる
          console.error('バックエンドとの初期同期に失敗:', err);
        }
      } else {
        setProfile(null);
        setCategories([]);
        setLikedIds([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [refreshInit]);

  return (
    // 箱の中にユーザー情報を入れて、子コンポーネント（アプリ全体）に共有する
    <AuthContext.Provider value={{ loginUser, loading, profile, setProfile, categories, likedIds, refreshInit }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. 他のファイルから簡単にユーザー情報を呼ぶためのカスタムフック
export const useAuth = () => useContext(AuthContext);
