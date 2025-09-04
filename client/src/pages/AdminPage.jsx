import { Outlet, useLocation } from "react-router-dom";

function AdminPage() {
    const location = useLocation();

    const getAdminPageTitle = () => {
        if(location.pathname.includes('/popups')) return '팝업 관리';
        if(location.pathname.includes('/banners')) return '배너 관리';
        return '관리자 페이지';
    }
    // 팝업 관리 상태
    
    
    // 배너 관리 상태
    return (
        <div>
            <h1>{getAdminPageTitle()}</h1>
            <hr/>
             {/* 여기에 선택된 관리 메뉴에 해당하는 컴포넌트가 렌더링됩니다. */}
             <Outlet />
        </div>
    )
}

export default AdminPage;
