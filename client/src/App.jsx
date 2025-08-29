import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useUserStore from './store/userStore';
import Header from './components/Header'; // 헤더 컴포넌트 임포트
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductEditor from './pages/ProductEditor';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductListPage from './pages/ProductListPage';
import PurchasePage from './pages/PurchasePage';
import PaymentPage from './pages/PaymentPage';
import OrderCompletePage from './pages/OrderCompletePage';
import ProfilePage from './pages/ProfilePage';
import TestPage from './pages/TestPage';
import ParnetPage from './pages/ParentPage';
// import ProductEditor1 from './pages/ProductEditors1';
import NaverCallback from './pages/NaverCallback'; // 👈 콜백 페이지 import
import KakaoCallback from './pages/KakaoCallback'; // 👈 콜백 페이지 import
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
// import logoFooter from '../public/images/logo_footer.png';
import './App.css'
import './index.css'
import ParentPage from './pages/ParentPage';



function App() {
  const { isLoggedIn } = useUserStore();
  // const navigate = useNavigate(); // 👈 페이지 이동을 위한 navigate 함수 준비

  return (
    <div className='app-container'>
        <Toaster position="top-center" /> {/* 👈 앱 최상단에 Toaster '알림판' 설치 */}
     <Header />
      <main className='app-main'>
        {/* 메인 페이지의 내용이 여기에 들어옵니다. */}
        {/* 기존 내용 대신, 경로 규칙에 따라 페이지를 보여주는 Routes를 넣는다. */}
        {/* <h2>판매상품</h2>
        <p>상품 목록이 여기에 표시될 예정입니다.</p> */}
        <Routes>
          <Route path='/' element={<HomePage />}></Route>
          <Route path='/login' element={ isLoggedIn ? <Navigate to="/" /> : <LoginPage />}></Route>
          <Route path='/signup' element={ isLoggedIn ? <Navigate to="/" /> : <SignupPage />}></Route>
          <Route path='/products/:productId' element={ <ProductDetailPage />}></Route>
          {/* 👇 콜백 경로 추가 */}
          <Route path='/write' element={ <ProtectedRoute><ProductEditor /></ProtectedRoute>}></Route>
          <Route path='/edit/:productId' element={ <ProtectedRoute><ProductEditor /></ProtectedRoute>}></Route>
          <Route path='/purchase/:orderId' element={<ProtectedRoute><PurchasePage /></ProtectedRoute>}></Route>
          <Route path='/payment/:orderId' element={<ProtectedRoute><PaymentPage /></ProtectedRoute>}></Route>
          <Route path='/order-complete/:orderId' element={<ProtectedRoute><OrderCompletePage /></ProtectedRoute>}></Route>
          <Route path='/productlist' element={<ProductListPage />}></Route>
          <Route path='/test' element={<TestPage />}></Route>
          <Route path='/parent' element={<ParentPage />}></Route>
          <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}></Route>
          <Route path='/auth/naver/callback' element={<NaverCallback />} />
          <Route path='/auth/kakao/callback' element={<KakaoCallback />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
