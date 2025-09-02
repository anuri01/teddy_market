import React from "react";
import Modal from "react-modal";
import './Modal.css'
import { setCookieWithExpiry } from "../utils/cookie";

// App의 root 엘리먼트를 명시하여 스크린 리더가 모달 뒷 배경을 읽지 않도록 설정(aria-hidden 처리)
Modal.setAppElement('#root');

function SimpleModal ({ isOpen, onClose, id, children }) {
    
    // 다시 보지않기 버튼 클릭 처리 함수
    const handleHide = (days) => {
        setCookieWithExpiry(`hideModal_${id}`, 'true', days)
        onClose();
    }

    return(
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="ModalContent"
            overlayClassName="ModalOverlay"
            contentLabel="Event&Notice Modal"
            // 부요 요소를 지정해야 앱 안에서만 뜨게 할 수 있음. 앱 전체를 감싸고 있는 영역에 id를 지정하고 연결할 것
            parentSelector={() => document.getElementById('modal-root')}
        >
            <button onClick={onClose} className="close-button">&times;</button>
            <div className="modal-body">
            {children}
            </div>
            <div className="modal-footer">
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

export default SimpleModal;