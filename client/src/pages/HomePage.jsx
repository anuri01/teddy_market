import React, { useState, useEffect } from "react";
import { Link, Navigate} from 'react-router-dom';
import useUserStore from "../store/userStore";
import api from "../api/axiosConfig";
const [imageLoadErrors, setImageLoadErrors] = useState(new Set()); // 👈 이미지 에러 상태 추가
import './HomePage.css';
import toast from "react-hot-toast";

function HomePage() {
  const [ productList, setProductList ] = useState([]); // 상품목록 기억 상자
  const { isLoggedIn } = useUserStore(); // 로그인상태 확인을 위한 전여스토어 내 상태 호출

    // 이미지 로드 에러 핸들러
  const handleImageError = (productId, imageUrl) => {
    console.warn('이미지 로드 실패:', imageUrl);
    setImageLoadErrors(prev => new Set(prev).add(productId));
  };

  // 이미지 로드 성공 핸들러
  const handleImageLoad = (productId) => {
    setImageLoadErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  //--- 기능 정의 ---
  // 화면 랜더링(컴포넌트가 처음 랜더링 될떄 상품 목록을 불러옴
  useEffect(() => {
      const fetchProducts = async () => {
      try {
      const response = await api.get('/products');
      setProductList(response.data);
      setImageLoadErrors(new Set()); // 👈 상품 목록 새로 로드 시 에러 상태 초기화
    } catch(error) {
      console.error('상품 목록을 가져올 수 없습니다.', error);
    }
  };
    fetchProducts();
  }, []);

  const handleBuy = () => {
    toast('상품구매 기능은 추후 지원됩니다.');
  }

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
                    alt={product.title} 
                    className="product-image"
                    crossOrigin="anonymous">
                    onError={() => handleImageError(product._id, product.mainImageUrl)}
                    onLoad={() => handleImageLoad(product._id)}
                    key={`${product._id}-${product.mainImageUrl}`} // 👈 강제 리로드용 key
                    </img>

                    <div className="product-list-info">
                    <h3>{product.title}</h3>
                    <p>판매가격: {product.price.toLocaleString()}원</p>
                    </div>
                    </Link>
                    <button type="submit" onClick={handleBuy} className="buy-action-button button-primary">구매하기</button>
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
