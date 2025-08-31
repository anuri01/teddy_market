// client/src/components/ChatList.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import './Chat.css';

// props로 채팅방 목록창을 닫는 함수와 특정 채팅방을 여는 함수를 받음
function ChatList({ onClose, onRoomSelect }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await api.get('/chat/rooms');
                setRooms(response.data);
            } catch (error) {
                toast.error("채팅 목록을 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);
    // 화면 로딩 시 바로 컨펌창 열리는 버그 확인해야 함
    const roomDelete = async (roomId) => {
        // if(!window.confirm('채팅방을 삭제하면 대화내용이 사라집니다.')) return
        // try {
        //     await api.delete(`/chat/rooms/${roomId}`);
        //     toast.success('대화방이 삭제됐습니다.')

        // } catch(error) {
        //     toast.error('대화방 삭제에 실패했습니다.');
        //     console.error('삭제 실패', error);
        // }
    }

    return (
        <div className="chat-list-container">
            <div className="chat-list-header">
                <h3>대화 목록</h3>
                <button onClick={onClose} className="close-btn">&times;</button>
            </div>
            <div className="chat-list-body">
                {loading ? <p>로딩 중...</p> :
                    rooms.length > 0 ? (
                        rooms.map(room => (
                            <div key={room._id} className="chat-room-item" onClick={() => onRoomSelect(room)}>
                                <img src={room.product.mainImageUrl} alt={room.product.title} />
                                <div className="room-info">
                                    <p className="room-product-title">{room.product.title}</p>
                                    <p className="room-partner">대화 상대: {room.seller.username}</p>
                                </div>
                                <button type="button" className='chat-action-button button-primary' onClick={roomDelete(room._id)}>삭제</button>
                            </div>
                        ))
                    ) : (
                        <p className='loading-message'>대화방이 없습니다.</p>
                    )}
            </div>
        </div>
    );
}

export default ChatList;