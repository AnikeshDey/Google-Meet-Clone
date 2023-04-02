import React from 'react';
import { connect } from 'react-redux';
import MicButton from './MicButton';
import SwitchToScreenSharingButton from './SwitchToScreenSharingButton';
import LeaveRoomButton from './LeaveRoomButton';
import CameraButton from './CameraButton';

const VideoButtons = ({ connectOnlyWithAudio }) => {
    return (
        <div className='video_buttons_container'>
            <MicButton />
            {!connectOnlyWithAudio && <CameraButton />}
            <LeaveRoomButton />
            {!connectOnlyWithAudio && <SwitchToScreenSharingButton />}
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        ...state
    }
}

export default connect(mapStateToProps)(VideoButtons);