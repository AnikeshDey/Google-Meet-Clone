import React from 'react';
import checkImg from '../resources/images/check.png';

const OnlyWithAudioCheckbox = ({ setConnectOnlyWithAudio, connectOnlyWithAudio }) => {
    const handleConnectionTypeChange = () => {
        //change info in our store about connection type
        setConnectOnlyWithAudio(!connectOnlyWithAudio);
    }


    return (
        <div className='checkbox_container'>
            <div className="checkbox_connection" onClick={handleConnectionTypeChange}>
                {connectOnlyWithAudio && 
                (<img src={checkImg} className='checkbox_image' />)}
            </div>
            <p className='checkbox_container_paragraph'>Only audio</p>
        </div>
    );
};

export default OnlyWithAudioCheckbox;