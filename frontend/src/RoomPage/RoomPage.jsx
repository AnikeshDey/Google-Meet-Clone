import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import ChatSection from './ChatSection/ChatSection';
import ParticipantsSection from './ParticipantsSection/ParticipantsSection';
import VideoSection from './VideoSection/VideoSection';
import RoomLabel from '../Components/RoomLabel';
import * as webRTCHandler from '../utils/webRTCHandler';
import Overlay from '../Components/Overlay';


import './RoomPage.css';

const RoomPage = ({ roomId, identity, isRoomHost, showOverlay, connectOnlyWithAudio }) => {
    useEffect(() => {
        if(!isRoomHost && !roomId){
            const siteUrl = window.location.origin;
            window.location.href = siteUrl;
        } else {
            webRTCHandler.getLocalPreviewAndInitRoomConnection(
                isRoomHost,
                identity,
                roomId,
                connectOnlyWithAudio
            );
        }
    },[]);
    
    return (
        <div className='room_container'>
            <ParticipantsSection />
            <VideoSection />
            <ChatSection />
            <RoomLabel roomId={roomId} />
            {showOverlay && <Overlay />}
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        ...state
    }
}

export default connect(mapStateToProps)(RoomPage);