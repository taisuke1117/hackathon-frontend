import { fireAuth } from '../firebase';

// バックエンド(Cloud Run)のベースURL。ローカル開発時は .env.local で上書きできる
const API_URL = process.env.REACT_APP_API_URL || 'https://hackathon-backend-688788582449.us-central1.run.app';

/**
 * 認証トークン付きでバックエンドAPIを呼ぶ共通関数
 * 例: apiFetch('/api/products')
 *     apiFetch('/api/products', { method: 'POST', body: { name: '...' } })
 */
export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  const user = fireAuth.currentUser;
  if (user) {
    headers['Authorization'] = `Bearer ${await user.getIdToken()}`;
  }

  let body = options.body;
  if (body && typeof body !== 'string') {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, body });

  if (!res.ok) {
    let message = `APIエラー (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch {
      // JSONでないエラーレスポンスはそのまま汎用メッセージ
    }
    throw new Error(message);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
