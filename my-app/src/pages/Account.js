import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoutButton } from '../components/LogoutButton';
import { apiFetch } from '../api/client';
import { uploadProductImage } from '../api/storage';
import './Account.css';

function Account() {
  const { loginUser, profile, setProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(profile?.name || loginUser?.displayName || '');
  const [email] = useState(profile?.mail || loginUser?.email || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [region, setRegion] = useState(profile?.place || '');
  const [profileImage, setProfileImage] = useState(profile?.icon_url || loginUser?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);

  // 画像はFirebase Storageへアップロードし、URLを保持
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadProductImage(file);
      setProfileImage(url);
    } catch (err) {
      alert(`画像のアップロードに失敗しました: ${err.message}`);
    }
  };

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
          shipping_address: profile?.shipping_address || '',
        },
      });
      setProfile(updated);
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

        {/* プロフィール写真エリア */}
        <div className="profile-image-section">
          <div className="image-preview-wrapper">
            {profileImage
              ? <img src={profileImage} alt="プロフィール写真" className="profile-preview" />
              : <div className="profile-preview" style={{ background: '#444' }} />}
          </div>
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

        {/* メールアドレス（編集不可） */}
        <div className="form-group">
          <label className="form-label">メールアドレス</label>
          <input
            type="email"
            className="form-input disabled-input"
            value={email}
            disabled
          />
        </div>

        {/* 住んでいる地域 */}
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

        {/* 保存ボタン */}
        <button type="submit" className="save-button" disabled={isSaving}>
          {isSaving ? '保存中…' : '設定を保存する'}
        </button>

      </form>

      {/* ログアウトセクション */}
      <div className="logout-section">
        <LogoutButton />
      </div>
    </div>
  );
}

export default Account;
