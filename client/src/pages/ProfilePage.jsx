import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// import useUserStore from "../store/userStore";
import api from "../api/axiosConfig";
import './ProfilePage.css';

function ProfilePage() {
    // const { user } = useUserStore();
    const [myOrders, setMyOrders] = useState([]);
    const [myProducts, setMyProducts] = useState([]);
    const [ myProfile, setMyProfile] = useState([]);
    const [ activeTab, setActiveTab ] = useState('profile');
    const [ isLoading, setIsLoading ] = useState(true);
    const [ phoneNumber, setPhoneNumber ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ currentPassword, setCurrentPassword ] = useState('');
    const [ newPassword, setNewPassword ] = useState('');
    const [ confirmPassword, setConfirmPassword ] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // promise.all로 동시 요청
                const [productsRes, ordersRes, profileRes ] = await Promise.all([
                    api.get('/users/my-products'),
                    api.get('/users/my-orders'),
                    api.get('/users/my-profile')
                ])
                setMyProducts(productsRes.data);
                setMyOrders(ordersRes.data);
                setMyProfile(profileRes.data);
            } catch(error) {
                toast.error('내 정보를 불러오는 데 실패했습니다.');
                console.error(error);
            } finally {
                setIsLoading(false)
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/users/my-profile', { phoneNumber, email, currentPassword, newPassword });
            toast.success('사용자 정보 변경이 완료됐습니다.');
            // 성공 후 비밀번호 필드 초기화
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            // navigate('/profile');
        } catch (error) {
            console.error('사용자 정보 변경에 실패했습니다.')
            toast.error(error.response?.data?.message || '알수 없는 오류가 발생했습니다.');
        }
    }

    if(isLoading) {
    return <div className="loading-message">
        <p>내 정보를 불러오는 중...</p>
        <div className="spinner"></div>
    </div>;
    }

    // myProfile이 아직 없을 경우를 대비 (데이터 로드 실패 등)
    if (!myProfile) {
        return <div className="loading-message">사용자 정보를 불러올 수 없습니다.</div>
    }

    return (
        
        <div className="profile-page-container">
      
         <div className="profile-tabs">
                <button
                    className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    내정보
                </button>
                <button
                    className={`tab-button ${activeTab === 'sell' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sell')}
                >
                    판매 내역 ({myProducts.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'buy' ? 'active' : ''}`}
                    onClick={() => setActiveTab('buy')}
                >
                    구매 내역 ({myOrders.length})
                </button>
            </div>
              <div className="">
            {/* <h1>안녕하세요, {user?.username}님</h1> */}
            <div className="profile-header">
                <h2>안녕하세요, {myProfile.username}님!</h2>
                <p>테디마켓에서의 활동 내역을 확인해보세요.</p>
            </div>
            {/* <Link to='/'>
            <p className="button button-primary">메인으로 바로가기</p>
            </Link> */}
            </div>
            <div className="profile-content">
                {activeTab === 'profile' && (
                    <div>
                        <form onSubmit={handleSubmit}>
                <p className="form-section-title">아이디</p>
                <input 
                readOnly
                type="text" 
                className="form-input"
                placeholder="아이디가 표시됩니다."
                value={myProfile?.username || ''}
                // onChange={(e) => setUsername(e.target.value)}
                />
                
                <p className="form-section-title">이메일</p>
                <input 
                className="form-input"
                type="email"
                placeholder="이메일 주소가 없습니다."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
                <p className="form-section-title">휴대폰번호</p>
                <input 
                className="form-input"
                type="text"
                placeholder="전화번호가 없습니다."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                />
                { !myProfile.naverId && !myProfile.kakaoId ? (
                <>
                <p className="form-section-title">비밀번호 변경</p>
                <input 
                className="form-input"
                type="password"
                placeholder="기존 비밀번호를 입력하세요."
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input 
                className="form-input"
                type="password"
                placeholder="신규 비밀번호를 8자리 이상 입력하세요."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                />
                <input 
                className="form-input"
                type="password"
                placeholder="신규 비밀번호를 다시 입력하세요."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                />
                </>
                ) : (<div></div>)
                }

                <div className="auth-button-group">
                <button type="submit" className="button button-primary">정보수정</button>
                </div>
            </form>
                    </div>
                )}
                {activeTab === 'sell' && (
                     <div className="products-list">
                        {myProducts.length > 0 ? (
                            myProducts.map(product => (
                                <Link to={`/products/${product._id}`} key={product._id} className="list-item-card">
                                    <img src={product.mainImageUrl} alt={product.title} className="item-image" />
                                    <div className="item-info">
                                        <h3>{product.title}</h3>
                                        <p>{product.price.toLocaleString()}원</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="empty-message">판매 중인 상품이 없습니다.</p>
                        )}
                    </div>
                )}
                {activeTab === 'buy' && (
                       <div className="order-list">
                        {myOrders.length > 0 ? (
                            myOrders.map(order => (
                                <Link to={`/products/${order.product?._id}`} key={order._id} className="list-item-card">
                                    <img src={order.product?.mainImageUrl} alt={order.product?.title} className="item-image" />
                                    <div className="item-info">
                                        <h3>{order.product?.title || '삭제된 상품'}</h3>
                                        <p>{order.product?.price.toLocaleString() || ''}원</p>
                                        <span>주문일: {new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="empty-message">구매한 상품이 없습니다.</p>
                        )}
                    </div>
                )}
            </div>

        </div>
    )
};

export default ProfilePage;