import React, { useState } from 'react';
import SwitchImg from '../resources/images/switchToScreenSharing.svg';
import LocalScreenSharingPreview from './LocalScreenSharingPreview';
import { toggleScreenShare } from '../utils/webRTCHandler';

const SwitchToScreenSharingButton = () => {
    const [isScreenSharingActive, setIsScreenSharingActive] = useState(false);
    const [screenSharingStream, setScreenSharingStream] = useState(null);

    const contraints = {
        audio: false,
        video: true
    }

    const handleScreenShareToggle = async () => {
        if(isScreenSharingActive === false){
            let stream = null;
            try{
                stream = await navigator.mediaDevices.getDisplayMedia(contraints);
            } catch(err){
                console.log("Error occured when trying to get screen share stream");
                console.log(err);
            }

            if(stream){
                setScreenSharingStream(stream);
                toggleScreenShare(isScreenSharingActive, stream);
                setIsScreenSharingActive(true);
                //send this stream to users
            }
        } else{
            toggleScreenShare(isScreenSharingActive);
            //switch for video track from camera
            setIsScreenSharingActive(false);

            //stop the screen share stream
            console.log(screenSharingStream.getTracks());
            screenSharingStream.getTracks().forEach(t => t.stop());

            setScreenSharingStream(null);
        }
        
        //setIsScreenSharingActive(!isScreenSharingActive);
    }

    return (
        <>
            <div className='video_button_container'>
                <img
                    src={SwitchImg}
                    onClick={handleScreenShareToggle}
                    className="video_button_image"
                />
            </div>
            {
                isScreenSharingActive && (
                    <LocalScreenSharingPreview stream={screenSharingStream} />
                )
            }
        </>
    );
};

export default SwitchToScreenSharingButton;