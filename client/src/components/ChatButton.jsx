import React from "react";
import './Chat.css';

// App.jsx로부터 채팅방 목록을 열고 닫는 함수를 props로 받음
function ChatButton({onToggleChatList}) {
    return (
        <button className="chat-button" onClick={onToggleChatList}>💬</button>
    )
}

export default ChatButton;