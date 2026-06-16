import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Footer.css';

import homeIcon    from '../../assets/home.svg';
import dealsIcon   from '../../assets/modeling.svg';
import listingIcon from '../../assets/add_circle.svg';
import liveIcon    from '../../assets/live.svg';
import chatIcon    from '../../assets/chat.svg';
import PersonIcon  from '../../assets/person.svg';

function Footer() {
  const { badges } = useAuth();

  return (
    <footer className="footer">
      <nav className="footer-nav">

        {/* ホーム */}
        <NavLink exact to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <img src={homeIcon} alt="Home" className="nav-icon-img" />
          <span className="nav-icon-text">ホーム</span>
        </NavLink>

        {/* 取引管理: 未発送商品がある場合は右上にドット */}
        <NavLink to="/deals" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon-wrapper">
            <img src={dealsIcon} alt="Deals" className="nav-icon-img" />
            {badges.unshipped_products > 0 && <span className="unread-dot" />}
          </span>
          <span className="nav-icon-text">取引</span>
        </NavLink>

        {/* 出品 */}
        <NavLink to="/listing" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <img src={listingIcon} alt="Listing" className="nav-icon-img" />
          <span className="nav-icon-text">出品</span>
        </NavLink>

        {/* ライブ */}
        <NavLink to="/live" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <img src={liveIcon} alt="Live" className="nav-icon-img" />
          <span className="nav-icon-text">ライブ</span>
        </NavLink>

        {/* チャット: 未読がある場合は右上にドット */}
        <NavLink to="/chat" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon-wrapper">
            <img src={chatIcon} alt="Chat" className="nav-icon-img" />
            {badges.unread_chats > 0 && <span className="unread-dot" />}
          </span>
          <span className="nav-icon-text">チャット</span>
        </NavLink>

        {/* マイページ */}
        <NavLink to="/mypage" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <img src={PersonIcon} alt="MyPage" className="nav-icon-img" />
          <span className="nav-icon-text">マイページ</span>
        </NavLink>

      </nav>
    </footer>
  );
}

export default Footer;
