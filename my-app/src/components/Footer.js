import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Footer.css';

import homeIcon from '../assets/home.svg';
import dealsIcon from '../assets/modeling.svg';
import listingIcon from '../assets/add_circle.svg';
import chatIcon from '../assets/chat.svg';
import PersonIcon from '../assets/person.svg';


function Footer() {
    const { badges } = useAuth();

    return(
        <footer className = "footer">
            <nav className = "footer-nav">

                <NavLink exact to = "/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <img src={homeIcon} alt="Home" className="nav-icon-img" />
                    <span className="nav-icon-text">ホーム</span>
                </NavLink>

                <NavLink to = "/deals" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <img src={dealsIcon} alt="Deals" className="nav-icon-img" />
                    <span className="nav-icon-text">取引</span>
                </NavLink>

                <NavLink to = "/listing" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <img src={listingIcon} alt="Listing" className="nav-icon-img" />
                    <span className="nav-icon-text">出品</span>
                </NavLink>

                <NavLink to = "/chat" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="nav-icon-wrapper">
                        <img src={chatIcon} alt="Chat" className="nav-icon-img" />
                        {/* 🔵 未読メッセージがあれば水色ドット */}
                        {badges.unread_chats > 0 && <span className="unread-dot" />}
                    </span>
                    <span className="nav-icon-text">チャット</span>
                </NavLink>

                <NavLink to = "/mypage" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <img src={PersonIcon} alt="MyPage" className="nav-icon-img" />
                    <span className="nav-icon-text">マイページ</span>
                </NavLink>

            </nav>
        </footer>

    )
}

export default Footer;
