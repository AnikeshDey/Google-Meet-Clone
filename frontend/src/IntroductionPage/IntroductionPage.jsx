import React from 'react';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import ConnectingButtons from '../Components/ConnectingButtons';
import logo from '../resources/images/logo.png';
import { setIsRoomHost } from '../store/actions';

import './IntroductionPage.css';

const IntroductionPage = ({ setIsRoomHostAction }) => {
    useEffect(() => {
        setIsRoomHostAction(false);
    },[]);
    return (
        <div className="introduction_page_container">
            <div className="introduction_page_panel">
                <img src={logo} alt="logo" className="introduction_page_image" />
                <ConnectingButtons />
            </div>
        </div>
    );
};

const mapDispatchToProps = (dispatch) => {
    return {
        setIsRoomHostAction: (isRoomHost) => dispatch(setIsRoomHost(isRoomHost))
    };
}

export default connect(null, mapDispatchToProps)(IntroductionPage);