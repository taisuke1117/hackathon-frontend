import { fireAuth } from '../firebase';
import { API_URL } from './client';

/**
 * 商品画像をバックエンド経由でGCSへアップロードして配信URLを返す
 * （Firebase Storageはバケット未開設のため、Cloud Run経由でGCSに保存する構成）
 * @param {File} file - <input type="file"> で選択されたファイル
 * @returns {Promise<string>} 画像URL
 */
export async function uploadProductImage(file) {
  const user = fireAuth.currentUser;
  const headers = {};
  if (user) {
    headers['Authorization'] = `Bearer ${await user.getIdToken()}`;
  }

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
      // JSONでないエラーはそのまま
    }
    throw new Error(message);
  }

  const data = await res.json();
  return data.url;
}
