import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// ─────────────────────────────────────────────────────────
// firebase.js: Firebase SDK の初期化モジュール
//
// 環境変数（.env）から Firebase の接続設定を読み込む。
// Create React App の慣習で REACT_APP_ プレフィックスが必要。
// 本番環境では Vercel の環境変数として設定する。
//
// エクスポート:
//   firebaseApp: Firebase アプリインスタンス
//   fireAuth   : Firebase Authentication インスタンス
//              → AuthContext / LoginForm / LogoutButton などで使う
// ─────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};

// Firebase アプリを初期化（アプリ全体で1回だけ実行される）
export const firebaseApp = initializeApp(firebaseConfig);

// Authentication インスタンス（Google OAuth、IDToken 取得などに使う）
export const fireAuth = getAuth(firebaseApp);
