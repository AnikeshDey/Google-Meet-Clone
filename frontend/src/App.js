import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { connectWithSocketIOServer } from './utils/wss';

import './App.css';
import JoinRoomPage from "./JoinRoomPage/JoinRoomPage";
import RoomPage from "./RoomPage/RoomPage";
import IntroductionPage from "./IntroductionPage/IntroductionPage";

function App() {

  useEffect(() => {
    connectWithSocketIOServer();
  },[]);

  return (
    <Router>
      <Routes>
        <Route path='/' element={<IntroductionPage />} />
        <Route path='/join-room' element={<JoinRoomPage />} />
        <Route path='/room' element={<RoomPage />} />
      </Routes>
    </Router>
  );
}

export default App;
