import Peer from "simple-peer";
import store from "../store/store";
import { setShowOverlay } from "../store/actions";
import * as wss from './wss';


const defaultContraints = {
    audio: true,
    video: {
        width:"480",
        height:"360"
    }
}

const onlyAudioConstraints = {
    audio:true,
    video: false
}


let localStream;

export const getLocalPreviewAndInitRoomConnection = async (
    isRoomHost,
    identity,
    roomId=null,
    onlyAudio
) => {

    const constraints = onlyAudio ? onlyAudioConstraints : defaultContraints;
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        console.log("Recieved Stream");
        localStream = stream;

        showLocalVideoPreview(localStream);

        store.dispatch(setShowOverlay(false))
        
        isRoomHost ? wss.createNewRoom(identity, onlyAudio) : wss.joinRoom(identity, roomId, onlyAudio);
    }).catch(err => {
        console.log(err);
    })
}

let peers = {}
let streams = []

const getConfiguration = () => {
    return {
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302"
            }
        ]
    }
}

export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
   const configuration = getConfiguration();

   peers[connUserSocketId] = new Peer({
       initiator: isInitiator,
       config: configuration,
       stream: localStream
   })

   peers[connUserSocketId].on('signal', data => {
       //webRTC offer, webRTC Answer (SDP Info), ICE
       const signalData = {
           signal: data,
           connUserSocketId: connUserSocketId
       };

       wss.signalPeerData(signalData); 
   })

   peers[connUserSocketId].on('stream', stream => {
       console.log("new stream came");

       addStream(stream, connUserSocketId);
       streams = [...streams, stream];
   })
}

export const handleSignalingData = (data) => {
    //add signaling data to peer connection
    peers[data.connUserSocketId].signal(data.signal);
}

export const removePeerConnection = (data) => {
    const { socketId } = data;
    const videoContainer = document.getElementById(socketId);
    const videoElement = document.getElementById(`${socketId}-video`);

    if(videoContainer && videoElement){
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => {
            track.stop();
        })

        videoElement.srcObject = null;
        videoContainer.removeChild(videoElement);

        videoContainer.parentNode.removeChild(videoContainer);

        if(peers[socketId]){
            peers[socketId].destroy();
        }

        delete peers[socketId];
    }
}


const showLocalVideoPreview = (stream) => {
    //show local video preview
    const videosContainer = document.getElementById("videos_portal");
    videosContainer.classList.add("videos_portal_styles");
    const videoContainer = document.createElement("div");
    videoContainer.classList.add("video_track_container");
    const videoElement = document.createElement("video");
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.srcObject = stream;

    videoElement.onloadedmetadata = () => {
        videoElement.play();
    };

    videoContainer.appendChild(videoElement);

    if(store.getState().connectOnlyWithAudio){
        videoContainer.appendChild(getAudioOnlyLabel());
    }

    videosContainer.appendChild(videoContainer);
}

const addStream = (stream, connUserSocketId) => {
    //display the incoming stream
    const videosContainer = document.getElementById("videos_portal");
    const videoContainer = document.createElement("div");
    videoContainer.id = connUserSocketId;

    videoContainer.classList.add("video_track_container");
    const videoElement = document.createElement("video");
    videoElement.autoplay = true;
    videoElement.srcObject = stream;
    videoElement.id = `${connUserSocketId}-video`;

    videoElement.onloadedmetadata = () => {
        videoElement.play();
    }

    videoElement.addEventListener("click", () => {
        if(videoElement.classList.contains("full_screen")){
            videoElement.classList.remove("full_screen");
        } else {
            videoElement.classList.add("full_screen");
        }
    })

    videoContainer.appendChild(videoElement);

    // check if other user connected only with audio
    const participants = store.getState().participants;
    const participant = participants.find(p => p.socketId === connUserSocketId) 

    if(participant?.onlyAudio){
        videoContainer.appendChild(getAudioOnlyLabel(participant.identity));
    } else {
        videoContainer.style.position = "static";
    }

    videosContainer.appendChild(videoContainer);
}

const getAudioOnlyLabel = (identity = '') => {
    const labelContainer = document.createElement('div');
    labelContainer.classList.add('label_only_audio_container');

    const label = document.createElement('p');
    label.classList.add('label_only_audio_text');
    label.innerHTML = `Only audio ${identity}`;

    labelContainer.appendChild(label);
    return labelContainer;
}

export const toggleMic = (isMuted) => {
    localStream.getAudioTracks()[0].enabled = isMuted ? true : false;
}

export const toggleCamera = (isDisabled) => {
    localStream.getVideoTracks()[0].enabled = isDisabled ? true : false;
}

export const toggleScreenShare = (isScreenSharingActive, screenSharingStream = null) => {
    if(isScreenSharingActive){
        switchVideoTracks(localStream);
    } else {
        switchVideoTracks(screenSharingStream);
    }
}

export const switchVideoTracks = (stream) => {
    for (let socket_id in peers){ //looping over every peer in the peers object
        
        //looping over the peer streams audio and video track 
        //Because the stream in the peer only holds 1 mediastream thats why we are accessing the 0 index value
        peers[socket_id].streams[0].getTracks().forEach(track => { //getTracks() gives us the audio and video track of that mediaStream
            
            //then we're looping over the given stream's audio and video tracks
            stream.getTracks().forEach(track2 => {
               
                //then checking if peer streams track and the given streams track are both video formats
               if(track.kind === 'video' && track2.kind === 'video'){
                   
                //if so replace the current peer's stream with the given stream
                   peers[socket_id].replaceTrack(track, track2,peers[socket_id].streams[0]) //replaceTrack(track to be replaced, track to replace, in which mediastream)
                   return;
               } 
            })
        })
    }
}