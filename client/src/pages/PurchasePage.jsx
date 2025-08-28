import React, { useState, useEffect} from "react";
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import '../AuthPage.css';
import './PurchasePage.css';

function PurchasePage() {
    const { orderId: orderId } = useParams();
    const [ order, setOrder ] = useState(null);
    const navigate = useNavigate();

    const [recipientName, setRecipientName ] = useState('');
    const [recipientPhone, setRecipientPhone ] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [ paymentMethod, setPaymentMethod ] = useState('') // 결제 수단(기본값 설정)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${orderId}/info`);
                setOrder(response.data);
            } catch(error) {
                toast.error('주문 정보를 불러올 수 없습니다.');
                navigate('/productlist');
            }
        };
        if(orderId) {
            fetchOrder();
        }
    }, [orderId, navigate]);
    
    // 주소 검색 api 팝업 오픈
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function(data) {
                setPostalCode(data.zonecode);
                setAddress1(data.address);
            }
        }).open();
    };

    // 네이버페이 결제처리 함수
    const handleNaverPay = async () => {
        try {
            //입력값 검증
            if (!recipientName || !recipientPhone || !address1) {
                toast.error('배송 정보를 모두 입력해주세요.');   
                return;
            }

            // 배송정보 저장
            await api.put(`/orders/${orderId}/shipping`, {
                shippingAddress: {
                    recipientName,
                    recipientPhone,
                    postalCode,
                    address1,
                    address2,
                },
                paymentMethod
            });

            // 네이버페이 SDK를 통한 결제 요청
            const oPay = window.Naver.Pay.create({
                mode: import.meta.env.VITE_NAVERPAY_MODE, // development 또는 production
                clientId: import.meta.env.VITE_NAVERPAY_CLIENT_ID,
                chainId: import.meta.env.VITE_NAVERPAY_CHAIN_ID,
            });

            // 결제정보 설정
            const paymentInfo = {
                merchantPayKey: orderId, // 주문번호
                merchantUserKey: localStorage.getItem('userId') || 'user_' + Date.now(),
                productName: order.product.title,
                totalPayAmount: order.product.price,
                taxScopeAmount: order.product.price,
                taxExScopeAmount: 0,
                returnUrl: window.location.origin + `/order-complete/${orderId}` ,
                
                // 상품 정보
                productItems: [{
                    categoryType: "ETC",
                    categoryId: "GENERAL",
                    uid: order.product._id,
                    name: order.product.title,
                    payReferrer: "NAVER_SEARCH",
                    count: 1
                }]
            };

            console.log('네이버페이 결제정보', paymentInfo);

            // 네이버페이 결제 팝업 열기
            oPay.open(paymentInfo);
        } catch (error) {
            console.error('네이버페이 결제 실패:', error);
            toast.error('네이버페이 결제에 실패했습니다.');
        }
    };

    // 일반 결제 처리
    const handleGeneralPayment = async () => {
        try {
            // 배송 정보 저장
            await api.put(`/orders/${orderId}/shipping`, {
                shippingAddress: {
                    recipientName,
                    recipientPhone,
                    postalCode,
                    address1,
                    address2
                },
                paymentMethod
            });

            // 결제 페이지로 이동
            navigate(`/payment/${orderId}`);
        } catch (error) {
            console.error('주문 처리 실패:', error);
            toast.error('주문 처리에 실패했습니다.');
        }
    };

    // 폼 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!recipientName || !recipientPhone || !address1 || !paymentMethod) {
            toast.error('모든 필수 정보를 입력해주세요.');
            return;
        }

        if (paymentMethod === 'naverpay') {
            handleNaverPay();
        } else {
            handleGeneralPayment();
        }
    };

    // 네이버 페이 연동으로 임시 주석처리
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     //(다음 단계 : 배송지 정보저장 api 호출)
    //     if(!recipientName || !postalCode || !paymentMethod) {
    //         return toast.error('배송주소와 받는분, 결제수단은 필수 사항입니다.');
    //     }
    //     try {
    //         const shippingAddress = { recipientName, recipientPhone, postalCode, address1, address2 };
    //         await api.put(`/orders/${orderId}/shipping`, { shippingAddress, paymentMethod }); // 객체 정보는 {}로 감싸서 객체로 전달할 것
    //         navigate(`/payment/${orderId}`);

    //     } catch(error) {
    //         console.error('주문 처리 실패:', error);
    //         toast.error('주문 처리에 실패했습니다.');
    //     }
    // };

     if (!order) {
    return <div className="loading-message">
        <p>주문 정보를 불러오는 중...</p>
        <div className="spinner"></div>
    </div>;
  }

    return (
        <div className="purchase-page-container">
             <h2>상품 구매를 시작합니다.</h2>
            <p className="description">
                배송받을 주소를 입력하고 결제 수단을 선택하세요. 
            </p>
            <section className="form-secton">
            <form onSubmit={handleSubmit}>
                <p className="form-section-title">받는분</p>
                {/* <label className="input-lable" htmlFor="name">받는사람</label> */}
                <input className="form-input" id="name" type="text" placeholder="받으실 분 이름을 입력하세요" value={recipientName} onChange={(e) => setRecipientName(e.target.value)}>
                </input>
                <p className="form-section-title">연락처</p>
                {/* <label className="input-lable" htmlFor="phone">연락처</label> */}
                <input className="form-input" id="phone" type="phonenumber" placeholder="받으실 분 전화번호를 입력하세요. '-'없이 입력." value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)}>
                </input>
                <p className="form-section-title">배송주소</p> 
                <div className="postcode-group">
                <input className="form-input" placeholder="우편번호" value={postalCode} readOnly />
                <button type="button" className="action-button button-primary" onClick={handleAddressSearch}>주소검색</button>
                </div>
                <input className="form-input" placeholder="기본 주소" value={address1} readOnly />
                <input className="form-input" placeholder="상세 주소" value={address2} onChange={e => setAddress2(e.target.value)} />
                <p className="form-section-title">결제수단</p> 
                <div className="payment-method-group">
                    <input id="card" type="radio" name="payment" value="card" onChange={(e) => setPaymentMethod(e.target.value)} className="payment-method" /> 
                    <label htmlFor="card" className="button payment-button">카드결제</label>
                    <input 
                            id="naverpay" 
                            type="radio" 
                            name="payment" 
                            value="naverpay" 
                            checked={paymentMethod === 'naverpay'}
                            onChange={(e) => setPaymentMethod(e.target.value)} 
                            className="payment-method" 
                        />
                        <label htmlFor="naverpay" className="button payment-button">
                            {/* <span style={{color: '#00C73C', fontWeight: 'bold'}}>N</span> */}
                            네이버페이
                        </label>
                    <input id="simple" type="radio" name="payment" value="simple" onChange={(e) => setPaymentMethod(e.target.value)} className="payment-method" />
                    <label htmlFor="simple" className="button payment-button">간편결제</label>
                    <input id="cash" type="radio" name="payment" value="cash" onChange={(e) => setPaymentMethod(e.target.value)} className="payment-method" /> 
                    <label htmlFor="cash" className="button payment-button">계좌이체</label>
                </div>
                <button type="submit" className="button button-primary">다음</button>

            </form>
            </section>

        </div>
    )
}

export default PurchasePage;