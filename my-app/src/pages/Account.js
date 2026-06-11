import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoutButton } from '../components/LogoutButton';
import './Account.css';

function Account() {
  const { loginUser } = useAuth();

  const [name, setName] = useState(loginUser?.displayName || '');
  const [email] = useState(loginUser?.email || '');
  const [bio, setBio] = useState('');
  const [region, setRegion] = useState('');
  const [profileImage, setProfileImage] = useState(loginUser?.photoURL || 'https://via.placeholder.com/150');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert(`設定を保存しました！\n名前: ${name}\n地域: ${region}`);
  };

  return (
    <div className="account-container">
      <h2 className="account-title">アカウント設定</h2>
      
      <form onSubmit={handleSave} className="account-form">
        
        {/* プロフィール写真エリア */}
        <div className="profile-image-section">
          <div className="image-preview-wrapper">
            <img src={profileImage} alt="プロフィール写真" className="profile-preview" />
          </div>
          <label className="image-upload-label">
            写真を変更
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </label>
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
            required
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
        <button type="submit" className="save-button">
          設定を保存する
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