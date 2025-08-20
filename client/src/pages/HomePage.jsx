import React from "react";
import { Link, Navigate} from 'react-router-dom';
import useUserStore from "../store/userStore";

function HomePage() {
    const { isLoggedIn } = useUserStore();

    return (
        <div className="Homepage">
            <h2>판매상품</h2>
            <p>상품 목록과 배너가 여기에 표시될 예정입니다.</p>
            {/* 👇 상품 등록 버튼을 Link 컴포넌트로 변경 */}
          {isLoggedIn && (
            <div className="add-product-button-container">
              <Link to="/write" className="button button-primary add-product-button">상품 등록</Link>
            </div>
           )}
          {/* {isLoggedIn && (
            <div className="add-product-button-container">
              <Link to="/write1" className="button button-primary add-product-button">상품 등록2</Link>
            </div>
           )} */}
        </div>
    );
}

export default HomePage;
