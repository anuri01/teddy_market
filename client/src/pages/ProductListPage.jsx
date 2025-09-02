import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import SimpleModal from "../components/SimpleModal";
import useModalStore from "../store/modalStore";
import { getCookie } from "../utils/cookie";
import './ProductListPage.css';
import './HomePage.css';

function ProductListPage() {
    const [ products, setProducts ] = useState([]);
    const [ page, setPage ] = useState(1); // 몇페이지까지 불러왔는지 기억할 상태
    const [ isLoading, setIsLoading ] = useState(true);
    const [ hasmore, setHasMore ] = useState(true); // 불러올 상품이 더 있는지 기억할 상태. 끝까지 불러왔다면 더보기 버튼 삭제 또는 변경
    const [ totalProducts, setTotalProducts ] = useState(0);
    // const [ isEventModalOpen, setIsEventModalOpen ] = useState(false); // 이벤트 모달 상태 추가
    const { modals, openModal, closeModal} = useModalStore();
    const navigate = useNavigate();
    // const [ searchParams, setSearchParams ] = useSearchParams(); 
    
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/allproducts?page=${page}&limit=4`);
                const newProducts = response.data.products;
                if (page === 1 ) {
                    setProducts(newProducts);
                } else {
                    // 받아온 상품을 기존 상품 뒤에 붙임
                    setProducts(prevProducts => [...prevProducts, ...newProducts]);
                    // 현재 페이지가 전체 페이지 수보다 작으면 '더보기'가 가능합니다.
                }
                setTotalProducts(response.data.totalProducts);
                setHasMore(response.data.currentPage < response.data.totalPage);
                // if ( page === response.data.totalPage ) {
                    //     setHasmore(false);
                    // }
                } catch (error) {
                    toast.error('상품 목록을 불러올 수 없습니다.', error)
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProducts();
        }, [page]);
        
    useEffect(() => {
        const shouldShowModal = !getCookie('hideModal_productListEvent');
        if(shouldShowModal) {
            openModal('eventModal', {id: 'productListEvent'});
        }
    },[openModal])

     // 바텀이나 모달이 열릴때 뒷쪽 화면이 스크롤 안되도록 제어. 추후 전역스토어로 이관 필요함
    //     useEffect(() => {
    //     if (isEventModalOpen) {
    //       document.body.classList.add('chat-open');
    //     } else {
    //       document.body.classList.remove('chat-open');
    //     }
    
    //     // 컴포넌트가 사라질 때를 대비한 정리 함수
    //     return () => {
    //       document.body.classList.remove('chat-open');
    //     }
    
    //   },[isEventModalOpen])

    // '더보기' 버튼 클릭 시 실행될 함수
    const handleLoadMore = () => {
        // page 상태 값을 1 증가시킵니다. 이 변경은 위의 useEffect를 자동으로 다시 실행시킵니다.
        setPage(prevPage => prevPage + 1);
    }

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
        return <div className="loading-message">상품 리스트를 불러오는 중...</div>;
    }

    return (
        <div className="productlist-container">
        {/* <div className="prepare-message">
            <h1>전체상품 페이지는 준비중입니다.</h1>
            <Link to='/'>
            <p className="button button-primary">메인으로 바로가기</p>
            </Link>

        </div> */}
           <section className="product-list-section">
                      <div className="section-header">
                        <h2 className="all-product-list-title">전체 판매상품</h2>
                      </div>
                      <div className="product-list">
                        {products.map( product => (
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
                     {/* --- 더보기 버튼 UI --- */}
                     <div className="load-more-container">
                        {!isLoading && hasmore && (
                            <button onClick={handleLoadMore} className="button button-secondary load-more-button">
                                더보기 ({products.length} / {totalProducts})
                            </button>
                        )}
                        {!isLoading && !hasmore && products.length > 0 && (
                        <p className="no-more-products">모든 상품을 불러왔습니다.</p>
    )}
                     </div>
                     <SimpleModal
                      isOpen={modals.eventModal?.open}
                      onClose={() => closeModal('eventModal')}
                      id={modals.eventModal?.props.id}
                     >
                        <h2>🎉 테디마켓 특별 이벤트! 🎉</h2>
                        <p>지금 가입하시면 10% 할인 쿠폰을 드려요!</p>
                        <Link to='/signup'>
                          <img onClick={() => closeModal('eventModal')} src="/images/eventModal.png" alt="이벤트 배너" style={{ maxWidth: '100%', borderRadius: '8px'}} />
                        </Link>
                     </SimpleModal>
        </div>
    )
};

export default ProductListPage;