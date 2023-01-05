import React from 'react';
import { useState } from 'react';
import { connect } from 'react-redux';
import SendMessageButton from '../resources/images/sendMessageButton.svg';
import { setMessage } from '../store/actions';
import { sendMessageToBackend } from '../utils/wss';

const NewMessage = ({ roomId, identity, setNewMessage, messages }) => {
    const [message, setMessage] = useState('')

    const handleTextChange = (event) => {
        setMessage(event.target.value);
    }

    const handleKeyPressed = (event) => {
        if(event.key === 'Enter'){
            event.preventDefault();

            //send message to other users
            sendMessage();
        }
    }

    const sendMessage = () => {
        if(message.length > 0){
            const localMessage = {
                content:message,
                identity:identity,
                messageCreatedByMe: true
            }
            setNewMessage(localMessage);
            const data = {
                message: {
                    content:message,
                    identity:identity,
                    messageCreatedByMe: false
                },
                roomId:roomId   
            }
            sendMessageToBackend(data);
            setMessage('');
        }
    }

    return (
        <div className='new_message_container'>
            <input 
                className='new_message_input'
                value={message}
                onChange={handleTextChange}
                placeholder='Type your message...'
                type='text'
                onKeyDown={handleKeyPressed}
            />
            <img className='new_message_button'
                src={SendMessageButton}
                onClick={sendMessage}
            />
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        ...state
    }
}

const mapDispatchToProps = (dispatch) => {
    return{
        setNewMessage: message => dispatch(setMessage(message))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewMessage);