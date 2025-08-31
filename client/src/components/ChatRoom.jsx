// client/src/components/ChatRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';
import socket from '../socket'; // 우리가 만든 소켓 인스턴스
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';
import './Chat.css';

// props로 채팅방 정보와 닫기 함수를 받음
function ChatRoom({ room, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { user } = useUserStore();
    const messagesEndRef = useRef(null); // 스크롤을 맨 아래로 내리기 위한 ref

    // 스크롤을 맨 아래로 이동시키는 함수
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // 컴포넌트가 마운트될 때 이전 메시지 불러오기
        const fetchMessages = async () => {
            try {
                const response = await api.get(`/chat/rooms/${room._id}/messages`);
                setMessages(response.data);
            } catch (error) {
                toast.error("메시지를 불러오는데 실패했습니다.");
            }
        };
        fetchMessages();

        // 소켓 이벤트 리스너 설정
        socket.emit('joinRoom', room._id);
        socket.on('receiveMessage', (message) => {
            // 현재 보고 있는 채팅방의 메시지만 업데이트
            if (message.chatRoom === room._id) {
                setMessages(prevMessages => [...prevMessages, message]);
            }
        });

        // 컴포넌트가 언마운트될 때 리스너 정리 (메모리 누수 방지)
        return () => {
            socket.off('receiveMessage');
        };
    }, [room._id]);

    // 메시지가 업데이트될 때마다 스크롤을 맨 아래로 이동
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        // 서버로 sendMessage 이벤트 발생
        socket.emit('sendMessage', {
            roomId: room._id,
            senderId: user.id,
            content: newMessage,
        });
        setNewMessage('');
    };

    return (
        <div className="chat-room-container">
            <div className="chat-room-header">
                <h3>{room.product.title}</h3>
                <p>판매자: {room.seller.username}</p>
                <button onClick={onClose} className="close-btn">&times;</button>
            </div>
            <div className="chat-messages">
                {messages.map(msg => (
                    <div key={msg._id} className={`message-bubble ${msg.sender._id === user.id ? 'my-message' : 'other-message'}`}>
                        <span className="sender-name">{msg.sender.username}</span>
                        <p>{msg.content}</p>
                        <span className="timestamp">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                ))}
                {/* 스크롤의 기준점이 될 빈 div */}
                <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                />
                <button type="submit">전송</button>
            </form>
        </div>
    );
}

export default ChatRoom;