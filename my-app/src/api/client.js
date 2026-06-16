import { fireAuth } from '../firebase';

// client.js: APIリクエストの共通処理
// バックエンドのベースURL(cloud　runのURL)

export const API_URL = process.env.REACT_APP_API_URL || 'https://hackathon-backend-688788582449.us-central1.run.app';

// アプリ全体で使うAPIリクエスト共通関数

export async function apiFetch(path, options = {}) {
  // ① ヘッダーの初期値を用意（optionsにカスタムヘッダーが来たらそれも引き継ぐ）
  const headers = { ...(options.headers || {}) };

  // ② Firebaseの現在のログインユーザーを取得する
  const user = fireAuth.currentUser;
  if (user) {
    headers['Authorization'] = `Bearer ${await user.getIdToken()}`;
  }

  // ③ bodyの処理：オブジェクトを渡したらJSON文字列に変換してContent-Typeも付ける
  let body = options.body;
  if (body && typeof body !== 'string') {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }

  // ④ 実際にfetchする（ブラウザ標準のfetch API）
  const res = await fetch(`${API_URL}${path}`, { ...options, headers, body });

  // ⑤ HTTPステータスが200番台以外（エラー）のときの処理
  if (!res.ok) {
    let message = `APIエラー (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch {
      // レスポンスがJSONでない場合はデフォルトメッセージを使う
    }
    throw new Error(message); 
  }

  // ⑥ 正常レスポンスの読み取り
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
