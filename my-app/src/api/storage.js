import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseApp, fireAuth } from '../firebase';

const storage = getStorage(firebaseApp);

/**
 * 商品画像をFirebase Storage(GCS)へアップロードして公開URLを返す
 * @param {File} file - <input type="file"> で選択されたファイル
 * @returns {Promise<string>} ダウンロードURL
 */
export async function uploadProductImage(file) {
  const uid = fireAuth.currentUser?.uid || 'anonymous';
  const safeName = file.name.replace(/[^\w.-]/g, '_');
  const path = `products/${uid}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
