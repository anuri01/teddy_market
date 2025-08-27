import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import './PaymentPage.css'

function PaymentPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [ orderComplete, setOrderComplete ] = useState(false);

    useEffect(() => {
        const payProcessing = () => {
            setOrderComplete(true);
        }
        toast.success('결제가 완료됐습니다. 확인 버튼을 눌러주세요.')
        payProcessing();
    }, [])
    console.log(orderComplete);

    return (
        <div className="payment-page-container">
            <h1>상품 결제를 진행중입니다.</h1>
            <Link to={`/orders/${orderId}/complete`} className="button button-primary float">확인</Link>
        </div>

    )
}

export default PaymentPage;