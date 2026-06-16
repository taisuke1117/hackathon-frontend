import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogoutButton } from '../../components/ui/LogoutButton';
import { apiFetch } from '../../api/client';
import { uploadProductImage } from '../../api/storage';
import { AvatarCropModal } from '../../components/modal/AvatarCropModal';
import './Account.css';

// Account: アカウント設定（アバター切り抜き・プロフィール編集・ログアウト）

function Account() {
  const { loginUser, profile, setProfile } = useAuth();
  const fileInputRef = useRef(null); // 非表示 file input を「写真を変更」ラベルから開くため

  const [name, setName] = useState(profile?.name || loginUser?.displayName || '');
  const [email] = useState(profile?.mail || loginUser?.email || ''); // Firebase管理なので変更不可（表示のみ）
  const [bio, setBio] = useState(profile?.bio || '');
  const [region, setRegion] = useState(profile?.place || '');
  const [profileImage, setProfileImage] = useState(profile?.icon_url || loginUser?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState(null); // AvatarCropModal に渡す DataURL

  // 画像を選んだら切り抜きモーダルを開く
  // input の value をリセットすることで同じファイルを再選択できるようにする
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    e.target.value = ''; // 同一ファイルを再選択可能にするためリセット
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCropSrc(reader.result); // DataURLをモーダルに渡す
    reader.readAsDataURL(file);
  };

  // 切り抜き確定後: Blob → File変換 → GCSへアップロード → URLを保持
  const handleCropped = async (blob) => {
    setCropSrc(null); // モーダルを閉じる
    try {
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      const url = await uploadProductImage(file); // GCS署名URLを取得してアップロード
      setProfileImage(url); // 保存ボタンが押されたときにまとめて送る
    } catch (err) {
      alert(`画像のアップロードに失敗しました: ${err.message}`);
    }
  };

  // フォーム送信: PUT /api/users/me でプロフィール全体を更新
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await apiFetch('/api/users/me', {
        method: 'PUT',
        body: {
          name,
          place: region,
          icon_url: profileImage,
          bio,
          shipping_address: profile?.shipping_address || '', // 配送先は設定画面では変更しない
        },
      });
      setProfile(updated); // AuthContext のプロフィールを最新状態に更新
      alert('設定を保存しました！');
    } catch (err) {
      alert(`保存に失敗しました: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="account-container">
      <h2 className="account-title">アカウント設定</h2>

      <form onSubmit={handleSave} className="account-form">

        {/* アバター画像エリア */}
        <div className="profile-image-section">
          <div className="image-preview-wrapper">
            {profileImage
              ? <img src={profileImage} alt="プロフィール写真" className="profile-preview" />
              : <div className="profile-preview" style={{ background: '#444' }} />}
          </div>
          {/* label クリックで非表示の input を開く */}
          <label className="image-upload-label" onClick={() => fileInputRef.current?.click()}>
            写真を変更
          </label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        </div>

        {/* ニックネーム */}
        <div className="form-group">
          <label className="form-label">ニックネーム</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ニックネームを入力"
            required
          />
        </div>

        {/* メールアドレス（Firebase管理のため変更不可）*/}
        <div className="form-group">
          <label className="form-label">メールアドレス</label>
          <input
            type="email"
            className="form-input disabled-input"
            value={email}
            disabled
          />
        </div>

        {/* 地域選択 */}
        <div className="form-group">
          <label className="form-label">発送元・住んでいる地域</label>
          <select
            className="form-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="">地域を選択してください</option>
            <option value="北海道">北海道</option>
            <option value="東京都">東京都</option>
            <option value="大阪府">大阪府</option>
            <option value="福岡県">福岡県</option>
          </select>
        </div>

        {/* 自己紹介文 */}
        <div className="form-group">
          <label className="form-label">自己紹介</label>
          <textarea
            className="form-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="自己紹介文を入力してください"
            rows="4"
          />
        </div>

        <button type="submit" className="save-button" disabled={isSaving}>
          {isSaving ? '保存中…' : '設定を保存する'}
        </button>

      </form>

      {/* ログアウトセクション */}
      <div className="logout-section">
        <LogoutButton />
      </div>

      {/* 画像切り抜きモーダル（cropSrc が null でない間だけ表示）*/}
      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onClose={() => setCropSrc(null)}
          onCropped={handleCropped}
        />
      )}
    </div>
  );
}

export default Account;
