import React from "react";
import { Link } from "react-router-dom";
import './AdminMenu.css';

function Menu({ isOpen, onClose }) {
    return (
        <>
        {/* 메뉴가 열렸을 때 뒷 배경을 어둡게 처리하는 오버레이 */}
        <div className={`admin-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
        <div className={`admin-menu-container ${isOpen ? 'open' : ''}`}>
            <div className="admin-menu-header">
                <h2>전체메뉴</h2>
                <button onClick={onClose} className="close-btn">&times;</button>
            </div>
            <nav className="admin-menu-nav">
                <ul>
                <li><Link to='/productlist'>상품목록</Link></li>
                <li><Link to='/admin/banners'>구매내역</Link></li>
                </ul>
                {/* 나중에 메뉴 추가 */}
            </nav>
        </div>
        </>
    );
}

export default Menu;