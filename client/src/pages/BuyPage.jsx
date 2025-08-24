import React from "react";
import { Link } from "react-router-dom";
import './BuyPage.css';

function BuyPage() {

    return (
        <div className="buy-page-container">
        <div className="prepare-message">
            <h1>상품구매 페이지는 준비중입니다.</h1>
            <Link to='/'>
            <p className="button button-primary">메인으로 바로가기</p>
            </Link>

        </div>
        </div>
    )
};

export default BuyPage;