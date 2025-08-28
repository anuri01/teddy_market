import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import './OrderCompletePage.css'

function OrderCompletePage() {

const [ orderInfo, setOrderInfo ] = useState(null);
const [ isLoading, setIsLoading ] = useState(true);
const { orderId } = useParams();
const navigate = useNavigate();
const location = useLocation();

useEffect( () => {
    const fetchOrderInfo = async () => {
        // 1차 검증: React Router state 확인
        if(!location.state?.fromPayment){
            toast.error('잘못된 접근입니다. 정상적인 구매 절차를 거쳐주세요.');
            navigate('/productlist');
            return;
        }
        try {
            setIsLoading(true);
            // 2차 검증: 서버에서 주문 상태 확인
            const response = await api.get(`/orders/${orderId}`);
            setOrderInfo(response.data);
        } catch(error) {
            console.error('주문 완료 정보 조회 실패');
            if(error.response?.status === 404) {
                toast.error('완료된 주문을 찾을 수 없습니다.');
            } else {
                toast.error('주문 정보를 불러올 수 없습니다.');
            }
            // 에러 발생시 상품목록으로 리디렉션
            navigate('/productlist');
        } finally {
            setIsLoading(false);
        }
    }
    fetchOrderInfo();    
    }, [orderId, navigate, location.state]);


    if (isLoading) {
    return <div className="loading-message">
        <p>주문 정보를 불러오는 중...</p>
        <div className="spinner"></div>
    </div>;
  }

  if (!orderInfo) {
    return null;
  }

    return (
        <div className="orderComplete-page-container">
            <h2>🎉 구매가 완료되었습니다! 🎉</h2>
            <p className="description">
                구매하신 상품은 3영업일 내에 배송됩니다.
            </p>
            <div className="order-summary-card">
                <img src={orderInfo.product.mainImageUrl} alt={orderInfo.product.title} className="summary-image" />
                <div className="summary-info">
                <h3>{orderInfo.product.title}</h3>
                <p>결제금액: {orderInfo.product.price.toLocaleString()}원</p>
                <p>판매자: {orderInfo.product.seller.username}</p>
                <p>주문상태: {orderInfo.status === 'complete' ? '주문접수' : '접수대기중'}</p>
                <p>결제상태: {orderInfo.isPaid ? '결제완료' : '미결제'}</p>
                </div>
            </div>

            <div className="page-actions">
                <Link to="/profile" className="button button-secondary">내 구매내역 보기</Link>
                <Link to="/" className="button button-primary">계속 쇼핑하기</Link>
            </div>
    </div>

        
    )
}

export default OrderCompletePage;