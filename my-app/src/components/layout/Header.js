import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

import loopaLogo from '../../assets/logo.png';
import bellIcon from '../../assets/bell.svg';
import userIcon from '../../assets/user.svg';

// ─────────────────────────────────────────────────────────
// Header: 全ページ共通のトップナビゲーションバー
//
// 表示内容:
//   左: Loopa ロゴ（クリックでホームへ）
//   右: 通知ベルアイコン + アカウント設定アイコン
//
// 未読通知バッジ:
//   AuthContext の badges.unread_notifications が 1 以上のとき、
//   ベルアイコンの右上に小さな赤いドット（.unread-dot）を表示する。
//   badges は AuthContext の initData で初期取得し、
//   25秒ごとのポーリングで更新される。
// ─────────────────────────────────────────────────────────

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
