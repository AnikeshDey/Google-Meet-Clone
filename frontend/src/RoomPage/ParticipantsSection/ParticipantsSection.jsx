import React from 'react';
import ParticipantsLabel from '../../Components/ParticipantsLabel';
import Participants from '../../Components/Participants';

const ParticipantsSection = () => {
    return (
        <div className='participants_section_container'>
            <ParticipantsLabel />
            <Participants />
        </div>
    );
};

export default ParticipantsSection;