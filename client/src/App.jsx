import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
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
import SearchPage from './pages/SearchPage';
import Footer from './components/Footer';
import ChatButton from './components/ChatButton';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';
import socket from './socket'; // 소켓 인스턴스 import
import NaverCallback from './pages/NaverCallback'; // 👈 콜백 페이지 import
import KakaoCallback from './pages/KakaoCallback'; // 👈 콜백 페이지 import
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import './App.css'
import './index.css'
import './components/Modal.css'; // 👈 이 줄을 추가해주세요.
// import logoFooter from '../public/images/logo_footer.png';
// import TestPage from './pages/TestPage';
// import ParnetPage from './pages/ParentPage';
// import ProductEditor1 from './pages/ProductEditors1';
// import ParentPage from './pages/ParentPage';



function App() {
  const { isLoggedIn, user } = useUserStore();
  // const navigate = useNavigate(); // 👈 페이지 이동을 위한 navigate 함수 준비
  
  // 채팅 관련 상태 추가
  const [ isChatListOpen, setIsChatListOpen ] = useState(false);
  const [ currentChatRoom, setCurrentChatRoom ] = useState(null); // 채팅방 객체 저장
  // const [ isEventModalOpen, setIsEventModalOpen ] = useState(false); // 이벤트 모달 상태 추가

  //채팅 목록이나 채팅방이 하나라도 열려 있으면 스크롤을 막는 클래스 추가
  useEffect(() => {
    if (isChatListOpen || currentChatRoom) {
      document.body.classList.add('chat-open');
    } else {
      document.body.classList.remove('chat-open');
    }

    // 컴포넌트가 사라질 때를 대비한 정리 함수
    return () => {
      document.body.classList.remove('chat-open');
    }

  },[isChatListOpen, currentChatRoom])
  
  // 로그인 시 socket.io 연결
  useEffect(() => {
    if(isLoggedIn) {
      socket.connect();
    }

   // 컴포넌트 언마운트 시 해제
    return() => {
      socket.disconnect();
    }
  }, [isLoggedIn]);

  const openChatRoom = (room) => {
    setCurrentChatRoom(room);
    setIsChatListOpen(false); // 채팅방 열면 목록 닫기
  };

  return (
    <div className='app-container' id='modal-root'>
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
           {/* 👇 ProductDetailPage에 채팅방 여는 함수를 props로 전달 */}
          <Route path='/products/:productId' element={ <ProductDetailPage onOpenChat={openChatRoom} />}></Route>
          <Route path='/write' element={ <ProtectedRoute><ProductEditor /></ProtectedRoute>}></Route>
          <Route path='/edit/:productId' element={ <ProtectedRoute><ProductEditor /></ProtectedRoute>}></Route>
          <Route path='/purchase/:orderId' element={<ProtectedRoute><PurchasePage /></ProtectedRoute>}></Route>
          <Route path='/payment/:orderId' element={<ProtectedRoute><PaymentPage /></ProtectedRoute>}></Route>
          <Route path='/order-complete/:orderId' element={<ProtectedRoute><OrderCompletePage /></ProtectedRoute>}></Route>
          <Route path='/productlist' element={<ProductListPage />}></Route>
          <Route path='/search' element={<SearchPage />}></Route>
          <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}></Route>
          {/* 👇 콜백 경로 추가 */}
          <Route path='/auth/naver/callback' element={<NaverCallback />} />
          <Route path='/auth/kakao/callback' element={<KakaoCallback />} />
          {/* <Route path='/test' element={<TestPage />}></Route> */}
          {/* <Route path='/parent' element={<ParentPage />}></Route> */}
        </Routes>
      </main>
      {/* --- 👇 채팅 관련 UI 추가 --- */}
            {isLoggedIn && (
                <>
                    <ChatButton onToggleChatList={() => setIsChatListOpen(!isChatListOpen)} />
                    {isChatListOpen && <ChatList onClose={() => setIsChatListOpen(false)} onRoomSelect={openChatRoom} />}
                    {currentChatRoom && <ChatRoom room={currentChatRoom} onClose={() => setCurrentChatRoom(null)} />}
                </>
            )}

    </div>
  )
}

export default App
