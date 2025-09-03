import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useUserStore from "../store/userStore";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import Slider from "react-slick"; // 👈 Slider 컴포넌트 import
import "slick-carousel/slick/slick.css"; // 👈 slick 기본 CSS
import "slick-carousel/slick/slick-theme.css"; // 👈 slick 테마 CSS
import SimpleModal from '../components/SimpleModal'; // 👈 SimpleModal import
import BottomSheet from "../components/BottomSheet"; //👈 BottomSheet import
import { getPopupState } from '../utils/cookie'; // 👈 유틸리티 함수(팝업 일정기간 보기 않기 설정) import
import BannerForm from "../components/BannerForm";
import useModalStore from "../store/modalStore";
import './HomePage.css';

function HomePage() {
  const [ productList, setProductList ] = useState([]); // 상품목록 기억 상자
  const [ bannerList, setBannerList ] = useState([]);
  const [ isLoading, setIsLoading ]= useState(true);
  // const [ orderId, setOrderId ] = useState('');
  const { isLoggedIn, user } = useUserStore(); // 로그인상태 확인을 위한 전역스토어 내 상태 호출
  const { modals, openModal, closeModal } = useModalStore();
  const navigate = useNavigate();
  
  
  //--- 기능 정의 ---
  // 화면 랜더링(컴포넌트가 처음 랜더링 될떄 상품 목록을 불러옴
  // fetchData를 useEffect 밖에서 정의하여 컴포넌트 전체에서 사용 가능하게 함
  const fetchData = async () => {
    try {
      // Promise.all은 하나라도 실패하면 전체가 실패합니다. 일부만 성공해도 진행하려면 Promise.allSettled를 사용.
      const [ productsRes, bannersRes ] = await Promise.allSettled([
        api.get('/products?limit=4'),
        api.get('/banners')
      ]);
      if (productsRes.status === 'fulfilled') {
        setProductList(productsRes.value.data.products);
      } else {
        console.error('제품 목록 조회 실패', productsRes.reason);
        setProductList([]);
        toast.error('상품 목록을 불러오지 못했습니다.')
      }
      if (bannersRes.status === 'fulfilled') {
        setBannerList(bannersRes.value.data);
      } else {
        console.error('배너 목록 조회 실패', bannersRes.reason);
        setBannerList([]);
      }
    } catch(error) {
      console.error('데이터 로드 중 예외 발생', error);
    } finally {
      setIsLoading(false)
    }
  };


  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, []);
  
  useEffect(() => {
    const shouldShowModal = !getPopupState('mainEventModal');
    if(shouldShowModal) {
      openModal('mainEventModal', { id: 'mainEventModal'}); // value같이 리턴되면되면 false로 리턴해 바텀시트 오픈 안함.
    };

    const shouldShowBottomSheet = !getPopupState('mainEventBottom');
    if(shouldShowBottomSheet) {
      openModal('mainEventBottom', { id: 'mainEventBottom'}); // value같이 리턴되면되면 false로 리턴해 바텀시트 오픈 안함.
    };

  }, [openModal]);

  // react-slick 설정
    const sliderSettings = {
        centerMode: true,
        centerPadding: '20px',
        dots: true, // 하단 점 인디케이터
        infinite: true, // 무한 루프
        speed: 500, // 슬라이드 전환 속도
        slidesToShow: 1, // 한 번에 보여줄 슬라이드 개수
        slidesToScroll: 1, // 한 번에 스크롤될 슬라이드 개수
        autoplay: true, // 자동 재생
        autoplaySpeed: 2000, // 3초마다 자동 재생
        arrows: false, // 좌우 화살표 (기본값)
        // fade: true,
        // customPaging: i => ( // 커스텀 점 (선택 사항)
        //     <div
        //         style={{
        //             width: "30px",
        //             height: "30px",
        //             border: "1px #f8f8f8 solid"
        //         }}
        //     >
        //         {i + 1}
        //     </div>
        // )
    };


  const handleBuy = async (productId) => {
    try{
    // 1. 서버에 '임시 주문서' 생성을 요청하고 orderId를 받는다. 
    const response = await api.post('/orders/initiate', {productId});
    const orderId = response.data.orderId;
    
    // 2. 받은 오더id를 가지고 구매 페이지로 이동한다. 
    navigate(`/purchase/${orderId}`);
    // toast('상품구매 기능은 추후 지원됩니다.');
    } catch(error) {
      console.error('구매페이지 이동에 실패했습니다.');
    }
  };

if(isLoading) {
  return <div className="loading-message">
    <p>페이지를 불러오는 중입니다.</p>
    <p>(최대 1~2분 소요)</p>
    <div className="spinner"></div>
  </div>
}

  // --- 화면 그리기 ---
    return (
        <div className="homepage-container">
            <section className="banner-area">
              {bannerList.length > 0 ? (
                <Slider {...sliderSettings}>
                  {bannerList.map((banner) => (
                    <div key={banner._id} className="banner-slide">
                      <a href={banner.linkUrl || '#'} target="_blank" rel="noopener noreferrer">
                        <img src={banner.imageUrl} alt="배너 이미지" className="banner-image"></img>
                      </a> 
                    </div>
                  ))}
                </Slider>
              ) : (
                <div className="no-banners">
                  <p>현재 등록된 배너가 없습니다.</p>
                </div>
              )}
            </section>
            { user?.role === 'admin' &&
            <section className="banner-form">
               <BannerForm onBannerAdded={fetchData} /> 
            </section>
            }
            <section className="product-list-section">
              <div className="section-header">
                <h2>판매상품</h2>
                <Link to="productlist" className="see-more-link">더보기 &gt;</Link>
              </div>
              <div className="product-list">
                {productList.map( product => (
                  <div className="product-card" key={product._id}>
                    <Link to={`/products/${product._id}`}>
                    <img 
                    src={product.mainImageUrl}
                    // src={`${product.mainImageUrl}?t=${Date.now()}`} // 👈 캐시 우회
                    alt={product.title} 
                    className="product-image"
                    // crossOrigin="anonymous"
                    >
                    </img>
                    <div className="product-list-info">
                    <h3>{product.title}</h3>
                    <p>판매가격: {product.price.toLocaleString()}원</p>
                    </div>
                    </Link>
                    <button type="submit" onClick={() => handleBuy(product._id)} className="buy-action-button button-primary">구매하기</button>
                    {/* <Link to={`/buy/${product._id}`}>
                    <div className="buy-action-button button-primary">
                    구매하기
                    </div> 
                    </Link> */}
                  </div>))}
              </div>
            </section>

          {isLoggedIn && (
            <div className="add-product-button-container">
              <Link to="/write" className="button button-primary add-product-button">상품 등록</Link>
            </div>
           )}
          {/* {isLoggedIn && (
            <div className="add-product-button-container">
              <Link to="/write1" className="button button-primary add-product-button">상품 등록2</Link>
            </div>
           )} */}
          <BottomSheet 
            isOpen={modals.mainEventBottom?.open} // 바텀 오픈 여부 props 전달
            onClose={() => closeModal('mainEventBottom')} // 바텀시트 닫기 함수 전달
            id={modals.mainEventBottom?.props.id} // 각 바텀을 구분하기 위한 고유 ID 전달
           >
             <h2>🎉 테디마켓 특별 이벤트! 🎉</h2>
             <p>지금 가입하시면 10% 할인 쿠폰을 드려요!</p>
            <Link to='/signup'>
              <img onClick={() => closeModal('mainEventBottom')} src="/images/eventModal.png" alt="이벤트 배너" style={{ maxWidth: '100%', borderRadius: '8px'}} />
            </Link>
          </BottomSheet>
           <SimpleModal 
            isOpen={modals.mainEventModal?.open} // 바텀 오픈 여부 props 전달
            onClose={() => closeModal('mainEventModal')} // 바텀시트 닫기 함수 전달
            id={modals.mainEventModal?.props.id} // 각 바텀을 구분하기 위한 고유 ID 전달
           >
             <h2>🎉 테디마켓 특별 이벤트! 🎉</h2>
             <p>지금 가입하시면 10% 할인 쿠폰을 드려요!</p>
            <Link to='/signup'>
              <img onClick={() => closeModal('mainEventModal')} src="/images/eventModal.png" alt="이벤트 배너" style={{ maxWidth: '100%', borderRadius: '8px'}} />
            </Link>
          </SimpleModal>
        </div>
    );
}

export default HomePage;
