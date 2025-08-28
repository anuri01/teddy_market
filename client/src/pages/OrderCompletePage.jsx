import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useParams, Link } from "react-router-dom";
import './OrderCompletePage.css'

function OrderCompletePage() {

const [ orderInfo, setOrderInfo ] = useState('');
const { orderId } = useParams();

useEffect( () => {
    const fetchOrderInfo = async () => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            setOrderInfo(response.data);
        } catch(error) {
            console.error('상품 구매 정보가 없거나, 권한이 없습니다.', error);
        } 
    }
    fetchOrderInfo();    
    }, [orderId]);


    if (!orderInfo) {
    return <div className="loading-message">주문 정보를 불러오는 중...</div>;
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
                <p>{orderInfo.product.price.toLocaleString()}원</p>
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