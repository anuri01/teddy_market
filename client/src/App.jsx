import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useUserStore from './store/userStore';
import Header from './components/Header'; // 헤더 컴포넌트 임포트
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NaverCallback from './pages/NaverCallback'; // 👈 콜백 페이지 import
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
// import logoFooter from '../public/images/logo_footer.png';
import './App.css'
import './index.css'



function App() {
  const { isLoggedIn } = useUserStore();
  
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
          {/* 👇 콜백 경로 추가 */}
          <Route path='/auth/naver/callback' element={<NaverCallback />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
