import io from 'socket.io-client';
import store from '../store/store';
import * as webRTCHandler from './webRTCHandler';
import { setRoomId, setParticipants, setMessage } from '../store/actions';


const SERVER = 'http://localhost:5000';

let socket = null;

export const connectWithSocketIOServer = () => {
    socket = io(SERVER);

    socket.on('connect', () => {
        console.log("Socket IO Connected successfully");
        //console.log(socket.id);
    })

    socket.on('room-id', (data) => {
        const { roomId } = data;
        console.log(roomId);
        store.dispatch(setRoomId(roomId));
    })

    socket.on('room-update', (data) => {
        const { connectedUsers } = data;
        //console.log(connectedUsers);
        store.dispatch(setParticipants(connectedUsers));
    })

    socket.on("conn-prepare", (data) => {
        const { connUserSocketId } = data;

        webRTCHandler.prepareNewPeerConnection(connUserSocketId, false);
        
        //inform the user that joined the room that we have prepared for incoming connection
        socket.emit("conn-init", { connUserSocketId: connUserSocketId });
    })

    socket.on("conn-signal", (data) => {
        webRTCHandler.handleSignalingData(data);
    })

    socket.on("conn-init", data => {
        const { connUserSocketId } = data;
        webRTCHandler.prepareNewPeerConnection(connUserSocketId, true);
    })

    socket.on("user-disconnected", (data) => {
        webRTCHandler.removePeerConnection(data);
    })

    socket.on('send-message', (data) => {
        console.log(data)
        const { content, identity, messageCreatedByMe } = data;
        store.dispatch(setMessage({content, identity, messageCreatedByMe}));
    })
}


export const createNewRoom = (identity, onlyAudio) => {
    //emit an event to server to create a room
    const data = {
        identity,
        onlyAudio
    }

    socket.emit('create-new-room', data)
}


export const joinRoom = (identity, roomId, onlyAudio) => {
    //emit an event to server to join a room
    const data = {
        identity,
        roomId,
        onlyAudio
    }

    socket.emit('join-room', data);
}

export const signalPeerData = (data) => {
    socket.emit('conn-signal', data);
}

export const sendMessageToBackend = (data) => {
    socket.emit('send-message', data);
}