import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import './SearchPage.css';
import './HomePage.css';

function SearchPage() {
    const [ searchResult, setSearchResult ] = useState([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ searchParams ] = useSearchParams();
    const keyword = searchParams.get('keyword');
    const navigate = useNavigate();

    // const [ searchParams, setSearchParams ] = useSearchParams(); 

    useEffect(() => {
        if(!keyword) {
            setSearchResult([]);
            setIsLoading(false);
            return;
        }
        const fetchSearchResults = async () => {
            setIsLoading(true);
        try {
            const response = await api.get(`search?keyword=${keyword}`);
            setSearchResult(response.data)
        } catch (error) {
            toast.error('검색 결과를 불러올 수 없습니다.', error)
        } finally {
            setIsLoading(false);
        }
    };
    fetchSearchResults();
    }, [keyword]);
    
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

 // 로딩중 조기반환
    if(isLoading) {
        return <div className="loading-message">검색결과를 불러오는 중...</div>;
    }

    return (
        <div className="productlist-container">
           <section className="product-list-section">
                      <div className="section-header">
                        <h2 className="all-product-list-title">검색결과({searchResult.length}개)</h2>
                      </div>
                      { searchResult.length > 0 ? (
                         <div className="product-list">
                        {searchResult.map( product => (
                          <div className="product-card" key={product._id}>
                            <Link to={`/products/${product._id}`}>
                            <img 
                            src={product.mainImageUrl}
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
                          </div>))}
                      </div>

                      ) : (
                          <p className="empty-message">검색 결과가 없습니다.</p>
                      )}
                    </section>
        </div>
    )
};

export default SearchPage;