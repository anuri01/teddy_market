import React from "react";
import { Navigate, Outlet } from 'react-router-dom';
import useUserStore from "../store/userStore";

// 로그인 및 관리자만 접속할 수 있도록하는 코드로 해당 페이지를 이 라우트로 감싸서 처리함
// { Oulet }은 이 라우트로 감싸져 있는 라우트들 중 랜더링될 자식 가르킴
// isLoggedIn 상태를 확인해 로그인한 상태면 페이지 접속을 그렇지 않을 경우 다른 페이지로 보냄
function AdminProtectedRoute() {
    const { isLoggedIn, user } = useUserStore();
    if(isLoggedIn && user?.role === 'admin') {
        return <Outlet/>;
    }
    return <Navigate to ='/'/>;
}

export default AdminProtectedRoute;