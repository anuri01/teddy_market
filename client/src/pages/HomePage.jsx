import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useUserStore from "../store/userStore";
import BannerForm from "../components/BannerForm";
import api from "../api/axiosConfig";
import './HomePage.css';
import toast from "react-hot-toast";
import Banner from "../../../server/models/Banner";

function HomePage() {
  const [ productList, setProductList ] = useState([]); // 상품목록 기억 상자
  const [ bannerList, setBannerList ] = useState([]);
  // const [ orderId, setOrderId ] = useState('');
  const { isLoggedIn, user } = useUserStore(); // 로그인상태 확인을 위한 전역스토어 내 상태 호출
  const navigate = useNavigate();
  
  //--- 기능 정의 ---
  // 화면 랜더링(컴포넌트가 처음 랜더링 될떄 상품 목록을 불러옴
  useEffect(() => {
      const fetchData = async () => {
      try {
        // Promise.all은 하나라도 실패하면 전체가 실패합니다. 일부만 성공해도 진행하려면 Promise.allSettled를 사용.
        const [ productsRes, bannersRes ] = await Promise.allSettled([
        api.get('/products?limit=4'),
        api.get('/banners')
      ]);
      console.log(bannersRes);
      if (productsRes.status === 'fulfilled') {
        setProductList(productsRes.value.data.products);
      } else {
        console.error('제품 목록 조회 실패', productsRes.reason);
        setProductList([]);
        toast.error('상품 목록을 불러오지 못했습니다.')
      }
      if (bannersRes.status === 'fulfilled') {
        setBannerList(bannersRes.value.data.banners);
      } else {
        console.error('배너 목록 조회 실패', bannersRes.reason);
        setBannerList([]);
      }
    } catch(error) {
      console.error('데이터 로드 중 예외 발생', error);
    }
  };
    fetchData();
  }, []);

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

  // --- 화면 그리기 ---
    return (
        <div className="homepage-container">
            <section className="main-banner">
              <img className="banner-image" src='/images/banner_20250822.png' alt="메인배너"></img>
              <div banner="banner-indicators">
                <p>&#9675; &#9675; &#9679; &#9675;</p>
              </div>
              {/* <div className="banner-placeholder"></div> */}
            </section>
            <section className="banner-form">
              { user?.role === 'admin' && <BannerForm /> }
              <div className="banner_fo"></div>
            </section>
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
        </div>
    );
}

export default HomePage;
