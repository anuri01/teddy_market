import React, { useState } from "react";
import Modal from "react-modal";
import { setPopupStateWithExpiry } from '../utils/cookie'; // 👈 유틸리티 함수 import
import './Modal.css';
import Slider from "react-slick";

Modal.setAppElement('#root')

// 부모에게 props로 isOpne(팝업열림상태), onClose(팝업닫기), children(자식 요소) 받는다.
function BottomSheet ({ isOpen, onClose, items, children }) {
    const [current, setCurrent] = useState(0);

    // 다시 보지않기 버튼 클릭 처리 함수
        // 현재 슬라이드의 id로 쿠키 저장
    const handleHide = (days) => {
        const currentId = items[current]?._id;
        if (currentId) {
            setPopupStateWithExpiry(currentId, days);
        }
        onClose();
    };
        const sliderSettings = {
            dots: true,
            infinite: items.length > 1, // 아이템이 1개일땐 무한루프 x
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            afterChange: idx => setCurrent(idx), // Slide의 props(콜백함수)로 현재 인덱스 값을 인자로 넘김
        };

    return (
        <Modal 
        isOpen={isOpen}
        onRequestClose={onClose}
        className="BottomSheetContent"
        overlayClassName="ModalOverlay"
        contentLabel="Event&Notice BottomSheet"
        parentSelector={() => document.getElementById('modal-root')} // 부모 요소를 지정. 지정하지 않으면 body 기준으로 위치를 잡음.
        closeTimeoutMS={300} // 애니메이션 시간과 맞춰줌
        >
            <div className="handle-bar-container">
                <div className="handle-bar"></div>
            </div>
             <button onClick={onClose} className="close-button">&times;</button>
             <div className="bottomsheet-body">
                 <Slider {...sliderSettings}>
                {items.map(item => (
                    <div key={item._id} className="sheet-item">
                        <h2>{item.title}</h2>
                        {item.content && <p>{item.content}</p>}
                        {item.imageUrl && (
                            <a href={item.linkUrl || '#'} target="_blank" rel="noopenrer norferrer">
                                <img src={item.imageUrl} alt={item.title} style={{ maxWidth: '100%', borderRadius: '8px'}} />
                            </a>
                        )}
                    </div>
                ))}
                </Slider>
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