import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import OnlyWithAudioCheckbox from './OnlyWithAudioCheckbox';
import JoinRoomInputs from './JoinRoomInputs';
import JoinRoomButtons from './JoinRoomButtons';
import ErrorMessage from './ErrorMessage';
import { setConnectOnlyWithAudio, setIdentity, setRoomId } from '../store/actions';
import { getRoomExists } from '../utils/api';

const JoinRoomContent = (props) => {
    const { isRoomHost, setConnectOnlyWithAudio, connectOnlyWithAudio, setIdentityAction, setRoomIdAction } = props;

    const [roomIdValue, setRoomIdValue] = useState("");
    const [nameValue, setNameValue] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    
    const navigate = useNavigate();

    const handleJoinRoom = async () => {
        setIdentityAction(nameValue);
        if(isRoomHost){
            createRoom();
        } else {
            await joinRoom();
        }
    }

    const joinRoom = async () => {
        const response = await getRoomExists(roomIdValue);

        const { roomExists, full } = response;

        if(roomExists){
            if(full){
                setErrorMessage("Meeting is full. Please try again later.")
            } else {
                // save meeting id in redux
                setRoomIdAction(roomIdValue);
                //join a room
                navigate('/room');
            }
        } else {
            setErrorMessage("Meeting not found. Check your meeting id.")
        }
    }

    const createRoom = () => {
        navigate('/room');
    }

    return (
        <>
            <JoinRoomInputs 
               roomIdValue={roomIdValue}
               setRoomIdValue={setRoomIdValue}
               nameValue={nameValue}
               setNameValue={setNameValue}
               isRoomHost={isRoomHost} 
            />
            <OnlyWithAudioCheckbox 
                setConnectOnlyWithAudio={setConnectOnlyWithAudio} 
                connectOnlyWithAudio={connectOnlyWithAudio}
            />
            <ErrorMessage errorMessage={errorMessage} />
            <JoinRoomButtons 
                handleJoinRoom={handleJoinRoom}
                isRoomHost={isRoomHost}
            />
        </>
    );
};

const mapStateToProps = (state) => {
    return {
        ...state
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setConnectOnlyWithAudio: (onlyWithAudio) => dispatch(setConnectOnlyWithAudio(onlyWithAudio)),
        setIdentityAction: (identity) => dispatch(setIdentity(identity)),
        setRoomIdAction: (roomId) => dispatch(setRoomId(roomId))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(JoinRoomContent);