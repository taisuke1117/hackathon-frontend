import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

import loopaLogo from '../../assets/logo.png';
import bellIcon from '../../assets/bell.svg';
import userIcon from '../../assets/user.svg';

function Header() {
  // badges: { unread_notifications: number, unread_chats: number }
  const { badges } = useAuth();

  return (
    <header className="header dark-theme">
      <div className="header-container">

        {/* 左: ロゴ（ホームへのリンク）*/}
        <div className="header-left">
          <Link to="/" className="header-logo-link">
            <img src={loopaLogo} alt="Loopa" className="header-loopa-logo" />
          </Link>
        </div>

        {/* 右: 通知ベル + アカウント設定 */}
        <div className="header-right">

          {/* 通知ベルアイコン: 未読ありなら右上に赤ドット */}
          <Link to="/notifications" className="header-icon-link" title="通知">
            <img src={bellIcon} alt="Notifications" className="header-icon inverted" />
            {badges.unread_notifications > 0 && <span className="unread-dot" />}
          </Link>

          {/* アカウント設定アイコン */}
          <Link to="/mypage/account" className="header-icon-link" title="アカウント設定">
            <img src={userIcon} alt="Account" className="header-icon inverted" />
          </Link>

        </div>

      </div>
    </header>
  );
}

export default Header;
