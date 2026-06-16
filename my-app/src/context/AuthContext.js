import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { fireAuth } from "../lib/firebase";
import { apiFetch } from "../api/client";

// Firebase認証・ユーザー情報・バッジ数をアプリ全体に提供するコンテキスト
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [loginUser, setLoginUser] = useState(null);
  // trueの間はchildrenを描画しない（ちらつき防止）
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  // 出品フォーム・検索バーで使うカテゴリマスター（初回ログイン時に一括取得）
  const [categories, setCategories] = useState([]);
  const [likedIds, setLikedIds] = useState([]);

  const [badges, setBadges] = useState({ unread_notifications: 0, unread_chats: 0, unshipped_products: 0 });

  // useCallbackでメモ化: useEffectの依存配列に入れても無限ループしないため
  const refreshBadges = useCallback(async () => {
    try {
      const b = await apiFetch('/api/me/badges');
      setBadges(b);
    } catch {
      // バッジ取得失敗はUIに影響させない
    }
  }, []);

  // /api/init でprofile・categories・likedIdsを一括取得。いいね後などの再同期にも使う
  const refreshInit = useCallback(async () => {
    const init = await apiFetch('/api/init');
    setProfile(init.user);
    setCategories(init.categories || []);
    setLikedIds(init.liked_product_ids || []);
    return init;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, async (user) => {
      setLoginUser(user);

      if (user) {
        try {
          // 初回ログイン→INSERT、2回目以降→名前・アイコンURLを上書き同期
          await apiFetch('/api/users', {
            method: 'POST',
            body: {
              name: user.displayName || 'ユーザー',
              mail: user.email || `${user.uid}@example.com`,
              icon_url: user.photoURL || '',
            },
          });
          await refreshInit();
          await refreshBadges();
        } catch (err) {
          // バックエンドが落ちていてもFirebase認証は通っているのでアプリは起動させる
          console.error('バックエンドとの初期同期に失敗:', err);
        }
      } else {
        setProfile(null);
        setCategories([]);
        setLikedIds([]);
        setBadges({ unread_notifications: 0, unread_chats: 0, unshipped_products: 0 });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshInit, refreshBadges]);

  // 25秒ごとにポーリング（サーバー負荷とリアルタイム性のバランス値）
  useEffect(() => {
    if (!loginUser) return;
    const timer = setInterval(refreshBadges, 25000);
    return () => clearInterval(timer);
  }, [loginUser, refreshBadges]);

  return (
    <AuthContext.Provider value={{
      loginUser,
      loading,
      profile,
      setProfile,
      categories,
      likedIds,
      refreshInit,
      badges,
      refreshBadges
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
