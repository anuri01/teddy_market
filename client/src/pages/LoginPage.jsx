import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import useUserStore from "../store/userStore";
import '../AuthPage.css';

function LoginPage() {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');

    const navigate = useNavigate();
    const { isLoggedIn, setToken }  = useUserStore();
    const backendUrl = import.meta.env.VITE_API_URL;

    useEffect( () => {
        if( isLoggedIn ) {
            navigate('/')
            }
        }, [isLoggedIn, navigate]
        );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/users/login', { username, password });
            setToken(response.data.token);
            toast.success('로그인 되었습니다!');
            // toast.success(response.data.message); 서버에서 전달하는 메시지도 표시할 수 있음
        } catch (err) {
            if(err.response) {
            const errorMessage = err.response.data.message;
            toast.error(errorMessage)
            } else {
                toast.error('서버에 연결할 수 없습니다.');
            }
        }
    }
    return (
        <div className="auth-page">
            <h2>테디마켓에 로그인 하세요.</h2>
            <p className="auth-description">
                로그인하면 중고제품을 저렴한 가격에 만날 수 있어요. 
                <br />
                네이버로 가입했다면, 네이버 로그인을 통해 로그인 해주세요. 
            </p>
             <form onSubmit={handleSubmit}> 
                <input className="form-input"
                type="text"
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />
                <input className="form-input"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <div className="auth-button-group">
                    <button type="submit" className="button button-primary">로그인</button>
                    {/* a 태그를 사용해 백엔드의 네이버 로그인 시작 API로 이동시킵니다. */}
                    <a href={`${backendUrl}/users/naver`} className="button button-primary_naver">네이버로 로그인</a>
                    <a href={`${backendUrl}/users/kakao`} className="button button-primary_kakao">카카오로 로그인</a>
                </div>
            </form>
            <p className="auth-link-text">아직 계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
        </div>
        
    );
}

export default LoginPage;
