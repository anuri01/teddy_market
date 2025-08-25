import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"
import useUserStore from "../store/userStore";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import './ProductDetailPage.css';


function ProductDetailPage() {
    const [ product, setProduct ] = useState(null); // 상품 데이터 기억상자
    const [ isLoading, setIsLoading ] = useState(true); // 로딩상태 기억상자

    //url 경로에서 상품Id를 구조분해할당으로 가져옴
    const { productId } = useParams();
    // 구조분해 할당으로 isLoggedIn 상태와 user정보 가져오기
    const { isLoggedIn, user } = useUserStore();
    // 화면이동 훅 생성
    const navigate = useNavigate();
    
    //기능 함수 정의 

    // 컴포넌트가 처음 로딩되거나 productId가 바꿀때 실행. useEffect함수는 useEffect((콜백함수), [의존성배열(랜더링조건)]을 인자로 받는다.
    useEffect(() => {
         const fetchProduct = async () => {
            try {
                setIsLoading(true) // 로딩중 설정
                const response = await api.get(`/products/${productId}`);
                setProduct(response.data);
            } catch (error) {
                console.error('상품 정보를 불러오는데 실패했습니다.', error);
            } finally {
                setIsLoading(false); // 로딩중 끝. 에러든 정상이든 항상 실행
            }
        }

        fetchProduct();
    }, [productId]);

    // 삭제 함수 
    const handleDeleteProduct = async () => {
        if(!window.confirm('상품을 정말 삭제하시겠어요?')) return;
        try {
        await api.delete(`/products/${productId}`);
        toast.success('상품이 삭제됐습니다.');
        navigate('/');
        } catch(error) {
            toast.error('삭제에 실패했어요');
        }

    }
    // -- 화면 ui 그리기 
    // 로딩중 조기반환
    if(isLoading) {
        return <div className="loading-message">상품 정보를 불러오는 중...</div>;
    }

    // 상품 정보가 없을때 조기반환 처리
    if(!product) {
        <div className="noresult-message">
        <h1>상품 정보가 없습니다.</h1>
        <Link to="/" className="gotoamin">메인으로</Link>
        {/* <a href="#">메인으로 이동</a> react의 내부 라우트로 이동이기 때문에 a태그 사용안함 */}
        </div>
        return;
    }

    const isAuthor = isLoggedIn && user?.id === product.seller._id;

    return (
        <div className="product-detail-page">
            <img src={product.mainImageUrl} alt={product.title} className="detail-product-image" />
            
            <section className="product-main-info">
                <h1 className="product-title">제목: {product.title}</h1>
            </section>
            
            <section className="seller-info">
                <span>작성자: {product.seller.username}</span>
                <span>작성일: {new Date(product.createdAt).toLocaleDateString()}</span>
            </section>
            <div className="product-description" dangerouslySetInnerHTML={{ __html: product.content }} />

            <section className="product-info">
                <p className="price">판매가격: {product.price.toLocaleString()}원</p>
            </section>

      
            <div className="product-attachments">
            {/* (첨부파일 UI는 나중에 추가) */}
            </div>

            {/* <div className="product-actions"> */}
            { isAuthor ? (
            <div className="product-actions">
                    <button type="submit" onClick={handleDeleteProduct} className="button button-secondary button-tertiary">상품삭제</button>
                    <Link to={`/edit/${productId}`} className="button button-primary">정보수정</Link>
            </div>
            ) : (
                <div className="product-actions">
                    <Link to="/" className="button button-secondary">메인으로</Link>
                    <Link to={`/buy/${productId}`} className="button button-primary">상품구매</Link>
                </div>
            )
            }
    </div>
    )
    
} 

export default ProductDetailPage;