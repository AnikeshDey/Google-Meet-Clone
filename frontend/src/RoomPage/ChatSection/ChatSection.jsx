import React from 'react';
import ChatLabel from '../../Components/ChatLabel';
import Messages from '../../Components/Messages';
import NewMessage from '../../Components/NewMessage';


const ChatSection = () => {
    return (
        <div className='chat_section_container'>
            <ChatLabel />
            <Messages />
            <NewMessage />
        </div>
    );
};

export default ChatSection;