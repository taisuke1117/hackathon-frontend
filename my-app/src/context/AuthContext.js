import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { fireAuth } from "../lib/firebase";
import { apiFetch } from "../api/client";

// ─────────────────────────────────────────────────────────
// AuthContext の役割
//
// ① Firebaseのログイン状態（loginUser）を監視して全体に共有する
// ② ログイン成功時にバックエンドのユーザー情報・カテゴリ・いいね状態を取得する
// ③ ヘッダーのバッジ数（未読通知・未読チャット）を定期更新する
//
// アプリ全体でログインユーザー情報が必要なので、一番上（index.js）でアプリ全体を
// <AuthProvider> で囲み、どこからでも useAuth() で取り出せるようにしている
// ─────────────────────────────────────────────────────────

// createContext: 「箱」を作る。この箱にユーザー情報を入れて全コンポーネントに配る
const AuthContext = createContext();

// AuthProvider: アプリ全体を囲むラッパーコンポーネント
// index.js で <AuthProvider><App /></AuthProvider> のように使う
export const AuthProvider = ({ children }) => {

  // ── ログイン状態 ──────────────────────────────────────────
  // loginUser: Firebaseが返すUserオブジェクト（未ログインならnull）
  //            uid / displayName / email / photoURL などが入っている
  const [loginUser, setLoginUser] = useState(null);

  // loading: Firebaseのログイン状態確認中（アプリ起動直後の一瞬）はtrue
  //          trueの間はchildrenを描画しない（ちらつき防止）
  const [loading, setLoading] = useState(true);

  // ── バックエンドから取得するデータ ───────────────────────────
  // profile: バックエンドのusersテーブルのユーザー情報（名前・アイコン・評価など）
  const [profile, setProfile] = useState(null);

  // categories: 商品カテゴリのマスターデータ（例: [{category_id:1, name:"レディース"}, ...]）
  //             出品フォームや検索バーで使う。毎回APIを叩かないよう最初に一括取得して共有
  const [categories, setCategories] = useState([]);

  // likedIds: 自分がいいねしている商品IDの配列（例: [3, 7, 42]）
  //           商品一覧でハートを赤くするかどうかの判定に使う
  const [likedIds, setLikedIds] = useState([]);

  // ── バッジ（未読カウント） ───────────────────────────────────
  // ヘッダーのベルアイコンやチャットアイコンに表示する数字
  // unread_notifications: 未読の通知件数
  // unread_chats: 未読のチャットメッセージ件数
  const [badges, setBadges] = useState({ unread_notifications: 0, unread_chats: 0 });

  // ── バッジ更新関数 ───────────────────────────────────────────
  // useCallback でメモ化しているのは、useEffect の依存配列に入れても無限ループしないため
  const refreshBadges = useCallback(async () => {
    try {
      const b = await apiFetch('/api/me/badges');
      setBadges(b);
    } catch {
      // バッジの取得失敗はUIに影響させない（エラー表示しない）
    }
  }, []);

  // ── 初期データ一括取得関数 ───────────────────────────────────
  // /api/init を叩くと profile・categories・likedIds をまとめて返してくれる
  // いいねした後など、データの再同期が必要なときも呼ぶ
  const refreshInit = useCallback(async () => {
    const init = await apiFetch('/api/init');
    setProfile(init.user);
    setCategories(init.categories || []);
    setLikedIds(init.liked_product_ids || []);
    return init;
  }, []);

  // ── Firebaseのログイン状態を監視 ────────────────────────────
  useEffect(() => {
    // onAuthStateChanged: ログイン・ログアウト・セッション復元のたびに呼ばれるコールバックを登録
    // user が来たらログイン済み、null が来たら未ログイン
    const unsubscribe = onAuthStateChanged(fireAuth, async (user) => {
      setLoginUser(user);

      if (user) {
        try {
          // POST /api/users でバックエンドにユーザーを登録する
          // 初回ログイン → usersテーブルにINSERTされる
          // 2回目以降 → 同じFirebase UIDが既にあれば名前・アイコンURLを上書き同期するだけ
          await apiFetch('/api/users', {
            method: 'POST',
            body: {
              name: user.displayName || 'ユーザー',
              mail: user.email || `${user.uid}@example.com`,
              icon_url: user.photoURL || '',
            },
          });

          // プロフィール・カテゴリ・いいねを取得
          await refreshInit();
          // 未読バッジを取得
          await refreshBadges();
        } catch (err) {
          // バックエンドが落ちていても、Firebase認証は通っているのでアプリは起動させる
          console.error('バックエンドとの初期同期に失敗:', err);
        }
      } else {
        // ログアウト時：全ての状態をリセット
        setProfile(null);
        setCategories([]);
        setLikedIds([]);
        setBadges({ unread_notifications: 0, unread_chats: 0 });
      }

      // ログイン状態の確認が終わったのでloading解除 → childrenを描画する
      setLoading(false);
    });

    // useEffectのクリーンアップ: コンポーネントがアンマウントされたときに監視を解除
    return () => unsubscribe();
  }, [refreshInit, refreshBadges]);

  // ── バッジの定期更新（25秒ごと） ────────────────────────────
  // チャットや通知はリアルタイムではなくポーリング方式
  // 25秒はサーバー負荷とリアルタイム性のバランスを取った値
  useEffect(() => {
    if (!loginUser) return; // 未ログイン時は不要
    const timer = setInterval(refreshBadges, 25000);
    return () => clearInterval(timer); // アンマウント時にタイマーを止める
  }, [loginUser, refreshBadges]);

  return (
    // AuthContext.Provider: 箱の中に値を入れて全子コンポーネントに配布
    // valueに入れたものがどのコンポーネントからも useAuth() で取り出せる
    <AuthContext.Provider value={{
      loginUser,    // Firebaseのユーザーオブジェクト（null=未ログイン）
      loading,      // 初期化中かどうか
      profile,      // バックエンドのユーザー情報
      setProfile,   // プロフィール更新後に外から呼ぶ用
      categories,   // カテゴリマスター
      likedIds,     // いいね済み商品IDリスト
      refreshInit,  // データの再同期（いいね後などに使う）
      badges,       // 未読カウント
      refreshBadges // バッジの手動更新
    }}>
      {/* loading中は何も描画しない（Firebaseの確認が終わってから表示する） */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// useAuth: どのコンポーネントからでも認証情報にアクセスするためのカスタムフック
// 使い方: const { loginUser, profile, categories } = useAuth();
export const useAuth = () => useContext(AuthContext);
