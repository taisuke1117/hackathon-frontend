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

  // 未読バッジ（ヘッダーのベル・フッターのチャットに表示）
  const [badges, setBadges] = useState({ unread_notifications: 0, unread_chats: 0 });

  const refreshBadges = useCallback(async () => {
    try {
      const b = await apiFetch('/api/me/badges');
      setBadges(b);
    } catch {
      // バッジは取得失敗してもアプリ動作に影響させない
    }
  }, []);

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
          await refreshBadges();
        } catch (err) {
          // バックエンドが落ちていてもアプリ自体は起動させる
          console.error('バックエンドとの初期同期に失敗:', err);
        }
      } else {
        setProfile(null);
        setCategories([]);
        setLikedIds([]);
        setBadges({ unread_notifications: 0, unread_chats: 0 });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [refreshInit, refreshBadges]);

  // ログイン中は25秒ごとに未読バッジを更新
  useEffect(() => {
    if (!loginUser) return;
    const timer = setInterval(refreshBadges, 25000);
    return () => clearInterval(timer);
  }, [loginUser, refreshBadges]);

  return (
    // 箱の中にユーザー情報を入れて、子コンポーネント（アプリ全体）に共有する
    <AuthContext.Provider value={{ loginUser, loading, profile, setProfile, categories, likedIds, refreshInit, badges, refreshBadges }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. 他のファイルから簡単にユーザー情報を呼ぶためのカスタムフック
export const useAuth = () => useContext(AuthContext);
