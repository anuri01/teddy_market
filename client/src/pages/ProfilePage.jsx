import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useUserStore from "../store/userStore";
import api from "../api/axiosConfig";
import './ProfilePage.css';

function ProfilePage() {
    const { user } = useUserStore();
    const [myOrders, setMyOrders] = useState([]);
    const [myProducts, setMyProducts] = useState([]);
    const [ activeTab, setActiveTab ] = useState('profile');
    const [ isLoading, setIsLoading ] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // promise.all로 동시 요청
                const [productsRes, ordersRes] = await Promise.all([
                    api.get('/users/my-products'),
                    api.get('/users/my-orders')
                ])
                setMyProducts(productsRes.data);
                setMyOrders(ordersRes.data);
            } catch(error) {
                toast.error('내 정보를 불러오는 데 실패했습니다.');
                console.error(error);
            } finally {
                setIsLoading(false)
            }
        };
        fetchData();
    }, []);

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
                <h2>안녕하세요, {user?.username}님!</h2>
                <p>테디마켓에서의 활동 내역을 확인해보세요.</p>
            </div>
            {/* <Link to='/'>
            <p className="button button-primary">메인으로 바로가기</p>
            </Link> */}
            </div>
            <div className="profile-content">
                {activeTab === 'profile' && (
                    <div>
                        {/* 프로필 정보 표시 영역 */}
                        <p>프로필 정보를 여기에 표시하세요.</p>
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