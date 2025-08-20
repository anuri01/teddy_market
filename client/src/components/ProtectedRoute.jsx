import React from "react";
import { Navigate } from 'react-router-dom';
import useUserStore from "../store/userStore";

// 로그인 사용자만 접속할 수 있도록하는 코드로 해당 페이지를 이 라우트로 감싸서 처리함
// 이 컴포넌트는 'children'이라는 특별한 prop을 받습니다.
// {children}은 이 라우트로 감싼 라우트를 가르킴
// isLoggedIn 상태를 확인해 로그인한 상태면 페이지 접속을 그렇지 않을 경우 다른 페이지로 보냄
function ProtectedRoute({children}) {
    const { isLoggedIn } = useUserStore();
    return isLoggedIn ? children : <Navigate to="/login" />
}

export default ProtectedRoute;