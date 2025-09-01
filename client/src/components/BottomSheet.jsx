import React from "react";
import Modal from "react-modal";
import { setCookieWithExpiry } from '../utils/cookie'; // 👈 유틸리티 함수 import
import './Modal.css';

Modal.setAppElement('#root')

// 부모에게 props로 isOpne(팝업열림상태), onClose(팝업닫기), children(자식 요소) 받는다.
function BottomSheet ({ isOpen, onClose, sheetId, children }) {

    // 다시 보지않기 버튼 클릭 처리 함수
        const handleHide = (days) => {
            setCookieWithExpiry(`hideSheet_${sheetId}`, 'true', days)
            onClose();
        }

    return (
        <Modal 
        isOpen={isOpen}
        onRequestClose={onClose}
        className="BottomSheetContent"
        overlayClassName="ModalOverlay"
        contentLabel="Event&Notice BottomSheet"
        parentSelector={() => document.getElementById('modal-root')}
        closeTimeoutMS={300} // 애니메이션 시간과 맞춰줌
        >
            <div className="handle-bar-container">
                <div className="handle-bar"></div>
            </div>
             <button onClick={onClose} className="close-button">&times;</button>
             <div className="bottomsheet-body">
            {children}
            </div>
            <div className="bottomsheet-footer">
                   <button onClick={() => handleHide(1)} className="hide-button">
                    오늘 하루 열지 않기
                </button>
                <button onClick={() => handleHide(7)} className="hide-button">
                    일주일간 열지 않기
                </button>
            </div>
        </Modal>
    );
}
export default BottomSheet;