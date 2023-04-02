import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { setIsRoomHost } from '../store/actions';
import JoinRoomTitle from '../Components/JoinRoomTitle';
import JoinRoomContent from '../Components/JoinRoomContent';

import './JoinRoomPage.css';


const JoinRoomPage = (props) => {

    const { setIsRoomHostAction, isRoomHost } = props;
    const search = useLocation().search;

    useEffect(() => {
        const isRoomHost = new URLSearchParams(search).get("host");
        if(isRoomHost){
            // setting in our redux store that user is host
            setIsRoomHostAction(true);
        }
    },[])

    return (
        <div className='join_room_page_container'>
            <div className="join_room_page_panel">
                <JoinRoomTitle isRoomHost={isRoomHost} />
                <JoinRoomContent />
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        ...state
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setIsRoomHostAction: (isRoomHost) => dispatch(setIsRoomHost(isRoomHost))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(JoinRoomPage);