import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

// 💡 生成したLoopaの文字ロゴをインポート！
import loopaLogo from '../../assets/logo.png';
import bellIcon from '../../assets/bell.svg';
import userIcon from '../../assets/user.svg';

function Header() {
  const { badges } = useAuth();

  return (
    <header className="header dark-theme">
      <div className="header-container">

        {/* 左側：新ロゴ画像 */}
        <div className="header-left">
          <Link to="/" className="header-logo-link">
            <img src={loopaLogo} alt="Loopa" className="header-loopa-logo" />
          </Link>
        </div>

        {/* 右側：アイコン */}
        <div className="header-right">

          <Link to="/notifications" className="header-icon-link" title="通知">
            <img src={bellIcon} alt="Notifications" className="header-icon inverted" />
            {/* 🔵 未読通知があれば水色ドット */}
            {badges.unread_notifications > 0 && <span className="unread-dot" />}
          </Link>

          <Link to="/mypage/account" className="header-icon-link" title="アカウント設定">
            <img src={userIcon} alt="Account" className="header-icon inverted" />
          </Link>

        </div>

      </div>
    </header>
  );
}

export default Header;
