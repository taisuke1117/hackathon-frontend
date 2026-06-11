import React from 'react';
import { BrowserRouter, Route , Routes} from 'react-router-dom';
import './App.css';

import { useAuth } from './context/AuthContext'; 
import { LoginForm } from "./components/LoginForm";
import Footer from './components/Footer';
import Header from './components/Header';
import Account from './pages/Account';
import MyPage from './pages/MyPage';
import Home from './pages/Home';
import ListingInput from './pages/ListingInput';
import ListingConfirm from './pages/ListingConfirm';
import ProductDetail from './pages/ProductDetail';
import Deals from './pages/Deals';
import ChatList from './pages/ChatList';
import ProductManage from './pages/ProductManage';
import ProductEdit from './pages/ProductEdit';
import ChatRoom from './pages/BuyerChatRoom';
import SellerChatRoom from './pages/SellerChatRoom';
import UserProfile from './pages/UserProfile';
import Checkout from './pages/Checkout'; 
import LikedProducts from './pages/LikedProducts';
import Purchases from './pages/Purchase';
import Notification from './pages/Notification';

function App() {
  const { loginUser } = useAuth();

  return (
    <>
      {!loginUser ? (
        <LoginForm />
      ) : (
          <BrowserRouter>
            <Header/>

              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/mypage/account" element={<Account />} />
                  <Route path="/mypage" element={<MyPage />} />
                  <Route path="/listing" element={<ListingInput />} />
                  <Route path="/listing/confirm" element={<ListingConfirm />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/chat" element={<ChatList />} />
                  <Route path="/deals/manage/:id" element={<ProductManage />} />
                  <Route path="/deals/edit/:id" element={<ProductEdit />} />
                  <Route path="/chat/:productId/:roomId" element={<ChatRoom />} />
                  <Route path="/user/profile/:userId" element={<UserProfile />} />
                  <Route path="/checkout/:id" element={<Checkout />} /> {/* 💡 追加したCheckoutページへのルート */}
                  <Route path="/mypage/likes" element={<LikedProducts />} /> {/* 💡 追加したいいね一覧ページへのルート */}
                  <Route path="/mypage/purchases" element={<Purchases />} /> {/* 💡 追加した購入履歴ページへのルート */}
                  <Route path="/chat/seller/:productId/:roomId" element={<SellerChatRoom />} /> {/* 💡 追加したセラーチャットルームへのルート */}
                  <Route path="/notifications" element={<Notification />} /> {/* 💡 追加した通知ページへのルート */}
              {/* ※ 他の /search や /listing などの画面も、同じようにここに追加していけばOKです */}
                </Routes>
              </main>

            <Footer />
          </BrowserRouter>
      )}
    </>
  );
}

export default App;