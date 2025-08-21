import React, { useState, useEffect } from "react";
import { Link, useNavigate, navigate, useParams } from "react-router-dom"
import useUserStore from "../store/userStore";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import './ProductDetail.css';


function ProductDetailPage() {
    const [ product, setProduct ] = useState(null); // 상품 데이터 기억 상자
    const [ isLoding, setIsLoding ] = useState(true); // 로딩상태 기억상장

    //url 경로에서 상품Id를 구조분해할당으로 가져옴
    const { productId } = useParams();

    //기능 함수 정의
    // 컴포넌트가 처음 로딩되거나 productId가 바꿀때
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoding(true)
                const response = api.get(`/product/:${ProductId}`);
                setProduct(response.data);
            } catch (error) {
                console.error('상품 정보를 불러오는데 실패했습니다.', error);
            } finally {
                setIsLoding(false);
            }
        }
        fetchProduct();
    }, [productId]);
    

} 

export default ProductDetailPage;