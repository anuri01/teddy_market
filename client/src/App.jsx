import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import useUserStore from './store/userStore';
import useModalStore from './store/modalStore';
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
import NaverCallback from './pages/NaverCallback'; // 👈 콜백 페이지 import
import KakaoCallback from './pages/KakaoCallback'; // 👈 콜백 페이지 import
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import PopupManager from './components/PopupManager';
import BannerManager from './components/BannerManager';
import Footer from './components/Footer';
import ChatButton from './components/ChatButton';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';
import SimpleModal from './components/SimpleModal';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { getPopupState } from "./utils/cookie";
import socket from './socket'; // 소켓 인스턴스 import
import AdminPage from './pages/AdminPage';
import { Toaster } from 'react-hot-toast';
import api from './api/axiosConfig';
import './App.css'
import './index.css'
import './components/Modal.css'; // 👈 이 줄을 추가해주세요.
import BottomSheet from './components/BottomSheet';
// import logoFooter from '../public/images/logo_footer.png';
// import TestPage from './pages/TestPage';
// import ParnetPage from './pages/ParentPage';
// import ProductEditor1 from './pages/ProductEditors1';
// import ParentPage from './pages/ParentPage';

function App() {
  const { isLoggedIn, user } = useUserStore();
  const { modals, openModal, closeModal} = useModalStore();
  const location = useLocation();
  // const navigate = useNavigate(); // 👈 페이지 이동을 위한 navigate 함수 준비
  
  // 채팅 관련 상태 추가
  const [ isChatListOpen, setIsChatListOpen ] = useState(false);
  const [ currentChatRoom, setCurrentChatRoom ] = useState(null); // 채팅방 객체 저장
  const { scrollControl } = useModalStore();
  // const [ isEventModalOpen, setIsEventModalOpen ] = useState(false); // 이벤트 모달 상태 추가

  // 팝업/배너 상태 
  const [ banners, setBanners ] = useState([]);
  const [ modalPopup, setModlaPopups ] = useState([]);
  const [ bottomSheet, setBottomSheet] = useState([]);

  useEffect(() => {
     if (location.pathname.startsWith('/admin')) return;
    if (location.pathname === '/signup') return;
    if (location.pathname === '/login') return;
    if (location.pathname === '/write') return;

    const fetchPopupsAndBanners = async () => {
      let currentPosition = 'all'; // 기본값
      if(location.pathname === '/') {
        currentPosition = 'home';
      } else if(location.pathname === '/productlist') {
        currentPosition = 'productList'
      } else if (location.pathname === 'profile') {
        currentPosition = 'profile'
      } else if (location.pathname === 'order-complete') {
        currentPosition = 'orderComplete'
      }
      
      try {
        const [ bannerRes, popupRes ] = await Promise.all([
          api.get(`banners/active/${currentPosition}`),
          api.get(`popups/active/${currentPosition}`)
        ]);

        // 배너 상태 업데이트
        setBanners(bannerRes.data);
        
        // 팝업 상태 업데이트
        const popups = popupRes.data;

        // 모달 팝업: 첫 번째 것만 (서버에서 이미 최신순 정렬됨)
        const modal = popups.find(p => p.type === 'modal'); // 서버에서 내림차순으로 내려온 데이터 중 1개만 찾아서 가져오기 때문에 아래 소스는 필요없음
        // const latestModal = modal.length > 0 ? modal[0] : null; // 서버에서 이미 createdAt 내림차순 정렬됨
         
        // 바텀시트 팝업: 모든 것
        const sheets = popups.filter(p => p.type === 'bottom');
        const filteredSheets = sheets.filter(sheet => !getPopupState(sheet._id)); // 바텀시트가 여러개 일때는 쿠키 체크를 해서 통과하는 것만 전달
        
        if(filteredSheets && filteredSheets.length > 0) {
          filteredSheets.forEach(sheet => {
              const sheetKey = sheet._id;
              openModal(sheetKey, { sheet });
            });
        }

        if (modal) {
        const shouldShowModal = !getPopupState(modal._id);
        if (shouldShowModal) {
          const modalKey = modal._id;
          openModal(modalKey, { modal });
        }
      }
        // 상태관리는 삭제 가능확인
        setModlaPopups(modal);
        setBottomSheet(filteredSheets); 
        console.log('함수 실행후 데이터', sheets)
      } catch (error) {
        console.error('배너/팝업 로딩 실패', error)
      }
    }
    fetchPopupsAndBanners();
  },[location.pathname, openModal]);
  
  //채팅 목록이나 채팅방이 하나라도 열려 있으면 스크롤을 막는 클래스 추가 + 팝업까지 추가
  useEffect(() => {
    if (isChatListOpen || currentChatRoom || scrollControl) {
      document.body.classList.add('chat-open');
    } else {
      document.body.classList.remove('chat-open');
    }
    // 컴포넌트가 사라질 때를 대비한 정리 함수
    return () => {
      document.body.classList.remove('chat-open');
    }

  },[isChatListOpen, currentChatRoom, scrollControl])
  
  // 로그인 시 socket.io 연결
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    if(isLoggedIn) {
      socket.connect();
    }

   // 컴포넌트 언마운트 시 해제
    return() => {
      socket.disconnect();
    }
  }, [isLoggedIn, location.pathname]);

  const openChatRoom = (room) => {
    setCurrentChatRoom(room);
    setIsChatListOpen(false); // 채팅방 열면 목록 닫기
  };

  return (
    <div className={`app-container ${location.pathname.startsWith('/admin') ? 'admin-wide' : ''}`} id='modal-root'>
        <Toaster position="top-center" /> {/* 👈 앱 최상단에 Toaster '알림판' 설치 */}
     <Header />
      <main className='app-main'>
        {/* 메인 페이지의 내용이 여기에 들어옵니다. */}
        {/* 기존 내용 대신, 경로 규칙에 따라 페이지를 보여주는 Routes를 넣는다. */}
        {/* <h2>판매상품</h2>
        <p>상품 목록이 여기에 표시될 예정입니다.</p> */}
        <Routes>
          <Route path='/' element={<HomePage banners={banners}/>}></Route>
          <Route path='/login' element={ isLoggedIn ? <Navigate to="/" /> : <LoginPage />}></Route>
          <Route path='/signup' element={ isLoggedIn ? <Navigate to="/" /> : <SignupPage />}></Route>
           {/* 👇 ProductDetailPage에 채팅방 여는 함수를 props로 전달 */}
          <Route path='/products/:productId' element={ <ProductDetailPage onOpenChat={openChatRoom} />}></Route>
          <Route path='/write' element={ <ProtectedRoute><ProductEditor /></ProtectedRoute>}></Route>
          <Route path='/edit/:productId' element={ <ProtectedRoute><ProductEditor /></ProtectedRoute>}></Route>
          <Route path='/purchase/:orderId' element={<ProtectedRoute><PurchasePage /></ProtectedRoute>}></Route>
          <Route path='/payment/:orderId' element={<ProtectedRoute><PaymentPage /></ProtectedRoute>}></Route>
          <Route path='/order-complete/:orderId' element={<ProtectedRoute><OrderCompletePage /></ProtectedRoute>}></Route>
          <Route path='/productlist' element={<ProductListPage banners={banners}/>}></Route>
          <Route element={<AdminProtectedRoute />}>
            <Route path='/admin' element={<AdminPage />}>
               {/* 나중에 여기에 중첩 라우트 추가 */}
              <Route path='popups' element={<PopupManager />} />
              <Route path='banners' element={<BannerManager />} />
            </Route> 
          </Route>
          <Route path='/search' element={<SearchPage />}></Route>
          <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}></Route>
          {/* 👇 콜백 경로 추가 */}
          <Route path='/auth/naver/callback' element={<NaverCallback />} />
          <Route path='/auth/kakao/callback' element={<KakaoCallback />} />
          {/* <Route path='/test' element={<TestPage />}></Route> */}
          {/* <Route path='/parent' element={<ParentPage />}></Route> */}
        </Routes>
      </main>
      {/* 팝업 랜더링 */}
      {modalPopup && (
                <SimpleModal isOpen={modals[modalPopup._id]?.open} onClose={() => closeModal(modalPopup._id)} id={modalPopup._id} item={modalPopup}>
                </SimpleModal>
            )} 
      {bottomSheet.length > 0 && (
        <BottomSheet 
        isOpen={bottomSheet.some(sheet => modals[sheet._id]?.open)} // 하나라도 열려있으면 열림
        onClose={() => {
      bottomSheet.forEach(sheet => closeModal(sheet._id)); // 모든 바텀시트 닫기
      }}
        // id={bottomSheet[0]._id} 컴포넌트에서 id를 판별하므로 넘겨줄 필요 없음
        items={bottomSheet}></BottomSheet>
      )}
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
