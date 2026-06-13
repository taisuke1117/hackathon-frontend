import { fireAuth } from '../firebase';
import { API_URL } from './client';

// storage.js: 商品画像のアップロード処理
// Cloud Run バックエンド経由で GCS に保存する構成。
// バックエンドが GCS に書き込んで公開URLを返す。

export async function uploadProductImage(file) {
  const user = fireAuth.currentUser;
  const headers = {};

  // ログイン済みなら IDToken を Authorization ヘッダーに付与
  if (user) {
    headers['Authorization'] = `Bearer ${await user.getIdToken()}`;
  }

  // multipart/form-data で送る（Content-Type は fetch が自動設定する）
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_URL}/api/images`, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!res.ok) {
    let message = `アップロード失敗 (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch {
      // JSONでないエラーレスポンスはステータスコードのみのメッセージを使う
    }
    throw new Error(message);
  }

  const data = await res.json();
  return data.url; // GCS の公開URL
}
