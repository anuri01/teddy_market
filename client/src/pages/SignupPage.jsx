import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import { validatePassword, validateUsername } from "../utils/validation";
import useUserStore from "../store/userStore";
import '../AuthPage.css';

function SignupPage() {
    // 상태 설정(아이디, 비밀번호, 이메일, 전화번호)
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ phoneNumber, setPhoneNumber ] = useState('');
    // const [ error, setError ] = useState(''); 토스트 팝업으로 에러를 처리하므로 현재 사용하지 않음

    const { isLoggedIn }  = useUserStore();
    
    // 페이지 이동을 위한 리모턴(훅)
    const navigate = useNavigate();

    // 로그인한 사용자가 접근 시 메인페이지로 리다이렉트(app.jsx 라우트에서 이미 처리했지만 페이지 내에서 상태가 바뀔경우를 대비해 추가)
    useEffect( () => {
    if( isLoggedIn ) {
            navigate('/');
            }
        }, [isLoggedIn, navigate]
    );

    const handleSubmit = async (e) => {
        // form 태그의 기본동작을 막는 설정
        e.preventDefault();
        // 이전 에러 메시지가 있다면 비움
        // setError('');

        // validation 유틸을 통해 유효성 검사까지 확장
        // if (!username || !password) {
        //     toast.error('사용할 아이디와 비밀번호는 필수정보 입니다.');
        //     return; 
        // }

        // 사용자 이름 유효성
        const usernameError = validateUsername(username);
        console.log('사용자이름 유효성 검사', usernameError);
        if (usernameError) {
            toast.error(usernameError);
            return;
        }

        const passwordError = validatePassword(password);
        if(passwordError) {
            toast.error(passwordError);
            return;
        }

        try {
            // 서버의 회원가입 API주소로, 상태에 기억해 둔 모든 데이터를 담아 POST 요청을 보냄
            await api.post('/users/signup', {
                username,
                password,
                email,
                phoneNumber
            });
            toast.success('회원가입 완료됐습니다.');
            navigate('/login');

        } catch (err) {
            // 요청이 실패하면, 서버가 보낸 에러 메시지를 보여줌
            // 요청 실패 시 실행
            // if(err.response) {
            //     setError(err.response.data.message);
            // } else {
            //     setError('서버에 연결할 수 없습니다.');
            // }
            
            // 에러메시지도 토스트 팝업으로 변경
            const errorMessage = err.response ? err.response.data.message : "서버에 연결할 수 없습니다.";
            toast.error(errorMessage);
        }
    }
    return (
        <div className="auth-page">
            <h2>지금 테디마켓에 가입해요</h2>
            <p className="auth-description">
                테디마켓은 누구나 쉽게 가입할 수 있어요.
                <br />
                꼭 필요한 개인정보만 수집하고 있으며, 네이버나 카카오톡을 통해서 빠르게 가입할 수 있어요.
            </p>

            <form onSubmit={handleSubmit}>
                <p className="form-section-title">필수정보 입력</p>
                <input 
                className="form-input"
                type="text"
                placeholder="사용하실 아이디를 입력하세요."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />
                <input 
                className="form-input"
                type="password"
                placeholder="비밀번호를 8가지 이상 입력하세요."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />

                <p className="form-section-title">선택정보 입력</p>
                <input 
                className="form-input"
                type="text"
                placeholder="이메일 주소를 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                className="form-input"
                type="text"
                placeholder="전화번호를 입력하세요."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                />
                
                <div className="auth-button-group">
                <button type="submit" className="button button-primary">회원가입</button>
                <button type="button" className="button button-primary_naver">네이버로 회원가입</button>
                </div>
            </form>
             <p className="auth-link-text">이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
        </div>

        
    )
}

export default SignupPage;
