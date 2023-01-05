import React from 'react';
import { connect } from 'react-redux';
// const dummyParticipants = [
//     {
//         identity: 'Anikesh'
//     },
//     {
//         identity: 'Avijit'
//     },
//     {
//         identity: 'Tuhin'
//     },
//     {
//         identity: 'Biswajit'
//     }
// ];

const SinglePaticipant = (props) => {
    const { identity, lastItem, participant } = props;

    return <>
        <p className='participants_paragraph'>
            {identity}
        </p>
        {!lastItem && <span className='participants_separator_line'></span>}
    </>
}

const Participants = ({ participants }) => {
    return (
        <div className='participants_container'>
            {
                participants.map((participant,i) =>{
                    return (
                        <SinglePaticipant 
                            key={participant.identity}
                            lastItem={participants.length === i + 1}
                            participant={participant}
                            identity={participant.identity}
                        />
                    )
                })
            }
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        ...state
    }
}

export default connect(mapStateToProps)(Participants);