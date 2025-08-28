import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import './PaymentPage.css'

function PaymentPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [ isPaid, setIsPaid ] = useState(false);
    
    useEffect(() => {
        const handleToPay = () => {
            setTimeout(() => {
                setIsPaid(true);
                toast.success('결제가 완료됐습니다. 확인 버튼을 눌러주세요')},
                1000);
        };
        handleToPay();
    }, [])

    // handleToPay();


    const handleSubmit = async () => {
        try {
        const response = await api.put(`/orders/${orderId}/complete`, { isPaid });
        if(response) {
            toast.success(`${response.data.buyer.username}님, 정상구매 되었습니다.`);
            // setTimeout(() => navigate(`/order-complete/${orderId}`), 500); 완료 페이지 추후 제공.
        }
        } catch(error) {
            toast.error('상품구매에 실패했습니다.');
            console.error('상품구매에 실패했습니다.', error);
        }

    }

    return (
        !isPaid ? (
            <div className="payment-page-container">
                <h1>상품 결제를 진행중입니다.</h1>
                <div className="spinner"></div>
                
            </div>
        ) : <div className="payment-page-container">
                <h1>상품 결제가 완료됐습니다.</h1>
                <button type="button" className="button button-primary" onClick={handleSubmit}>확인</button>
                {/* <Link to={`/orders/${orderId}/complete`} className="button button-primary float">확인</Link> */}
            </div>
    );
}

export default PaymentPage;