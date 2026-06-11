import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

// 💡 生成したLoopaの文字ロゴをインポート！
import loopaLogo from '../assets/logo.png'; // 保存した拡張子（.pngや.jpg）に合わせてください
import bellIcon from '../assets/bell.svg';
import userIcon from '../assets/user.svg';

function Header() {
  return (
    <header className="header dark-theme"> {/* 💡 黒背景用にクラスを追加 */}
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