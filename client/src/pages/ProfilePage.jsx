import React from "react";
import { Link } from "react-router-dom";
import './ProfilePage.css';

function ProfilePage() {

    return (
        <div className="profile-page-container">
        <div className="prepare-message">
            <h1>내정보 페이지는 준비중입니다.</h1>
            <Link to='/'>
            <p className="button button-primary">메인으로 바로가기</p>
            </Link>

        </div>
        </div>
    )
};

export default ProfilePage;