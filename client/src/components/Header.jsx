// 도구 가져오기
import React, {useState} from "react";
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from "react-router-dom";
import useUserStore from "../store/userStore";
import './Header.css';

// ---2. 컴포넌트 준비
function Header() {
    const [searchKeyword, setSerachKeyword] = useState('')
    const { isLoggedIn, logout } = useUserStore();
    const location = useLocation();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        toast('로그아웃 되었습니다.');
        navigate('/'); 
    }

    const handleSearch = (e) => {
        e.preventDefault();
        if(!searchKeyword.trim()) {
            return toast.error('검색어를 입력하세요.');
        } else if(searchKeyword.length > 30) {
            return toast.error('검색어가 너무 깁니다.');
        }
        navigate(`/search?keyword=${searchKeyword}`)
        setSerachKeyword('');

    }

    // 페이지 경로에 따라 동적으로 제목을 결정하는 함수
    const getPageTitle = (pathname) => {
        if ( pathname === '/login' ) return '로그인'
        if ( pathname === '/signup') return '회원가입'
        if ( pathname === '/write') return '상품등록'
        if ( pathname === '/productlist') return '상품목록'
        if ( pathname === '/search') return '검색결과'
        if ( pathname.startsWith('/products')) return '상품정보'
        if ( pathname.startsWith('/purchase')) return '상품주문'
        if ( pathname.startsWith('/payment')) return '결제진행'
        if ( pathname.startsWith('/edit')) return '상품수정'
        // 다른 경로도 같은 방식으로 추가할 수있음.
        return '';
    }

return (   
    <header className="app-header">
        <div className="header-wrap">
        <div className="header-left">
            {/* 현재 경로가 메인('/')이면 로고를, 아니면 페이지 제목을 보여줍니다. */}
            { location.pathname === '/' ? (
                <Link to="/" className="logo">
                    <img src="/images/logo.png" alt="TEDDY Market 로고" height={'30px'}></img>
                </Link>
            ) : (
                <>
                <Link to="/" className="logo">
                    <img src="/images/logo.png" alt="TEDDY Market 로고" height={'30px'}></img>
                </Link>
                <h1 className="page-title">{getPageTitle(location.pathname)}</h1>
                </>
            )}
        </div>
        <nav className="navigation">
            { isLoggedIn ? (
                <>
                    <Link to="/profile">내 정보</Link>
                    <button onClick={handleLogout} className="nav-button">로그아웃</button>
                </>
            ) : (
                <>
                    <Link to='/signup'>회원가입</Link>
                    <Link to='/login'>로그인</Link>
                </>
            )}
        </nav>
        </div>    
        { (location.pathname === '/' || location.pathname.startsWith('/search')) && 
            <form className="search-warp" onSubmit={handleSearch}>
                <input className="form-input-search"
                    type="text"
                    placeholder="검색어를 입력하세요"
                    value={searchKeyword}
                    onChange={(e) => setSerachKeyword(e.target.value)}
                    maxLength={30}
                />
                <button type="submit" className="action-button button-primary">검색</button>
            </form> }
    </header>
)
}

// ---3. 화면그리기 

export default Header;