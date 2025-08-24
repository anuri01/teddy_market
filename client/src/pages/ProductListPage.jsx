import React from "react";
import { Link } from "react-router-dom";
import './ProductListPage.css';

function ProductListPage() {

    return (
        <div className="productlist-container">
        <div className="prepare-message">
            <h1>전체상품 페이지는 준비중입니다.</h1>
            <Link to='/'>
            <p className="button button-primary">메인으로 바로가기</p>
            </Link>

        </div>
        </div>
    )
};

export default ProductListPage;