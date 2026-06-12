import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

import { useAuth } from './context/AuthContext';
import { LoginForm } from './components/ui/LoginForm';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import Home from './pages/home/Home';
import ListingInput from './pages/listing/ListingInput';
import ListingConfirm from './pages/listing/ListingConfirm';
import ProductDetail from './pages/product/ProductDetail';
import ProductEdit from './pages/product/ProductEdit';
import BuyerChatRoom from './pages/chat/BuyerChatRoom';
import SellerChatRoom from './pages/chat/SellerChatRoom';
import ChatList from './pages/chat/ChatList';
import Deals from './pages/deals/Deals';
import ProductManage from './pages/deals/ProductManage';
import MyPage from './pages/mypage/MyPage';
import Account from './pages/mypage/Account';
import LikedProducts from './pages/mypage/LikedProducts';
import Purchases from './pages/mypage/Purchase';
import Notification from './pages/misc/Notification';
import Checkout from './pages/misc/Checkout';
import UserProfile from './pages/misc/UserProfile';

function App() {
  const { loginUser } = useAuth();

  return (
    <>
      {!loginUser ? (
        <LoginForm />
      ) : (
        <BrowserRouter>
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listing" element={<ListingInput />} />
              <Route path="/listing/confirm" element={<ListingConfirm />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/deals/manage/:id" element={<ProductManage />} />
              <Route path="/deals/edit/:id" element={<ProductEdit />} />
              <Route path="/chat" element={<ChatList />} />
              <Route path="/chat/:productId/:roomId" element={<BuyerChatRoom />} />
              <Route path="/chat/seller/:productId/:roomId" element={<SellerChatRoom />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/mypage/account" element={<Account />} />
              <Route path="/mypage/likes" element={<LikedProducts />} />
              <Route path="/mypage/purchases" element={<Purchases />} />
              <Route path="/notifications" element={<Notification />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/user/profile/:userId" element={<UserProfile />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
