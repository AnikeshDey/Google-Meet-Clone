const express = require('express');
const { v4:uuidv4 } = require('uuid');
const cors = require('cors');
const twilio = require('twilio');

const app = express();

app.use(cors());

let connectedUsers = [];
let rooms = [];

app.get('/api/room-exists/:roomId', (req,res,next)=>{
    const roomId = req.params.roomId;
    const room = rooms.find(room => room.id === roomId);
    //console.log(roomId);
    if(room){
        //send response that room exists
        if(room.connectedUsers.length > 3){
            return res.send({ roomExists:true, full:true });
        } else {
            return res.send({ roomExists:true, full:false });
        }
    } else {
        //send response that room does not exist
        return res.send({roomExists: false});
    }
})

app.get('/api/get-turn-credentials', (req, res) => {
    
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server started listening on ${PORT}`));

const io = require('socket.io')(server, {
    cors:{
        origin: '*',
        methods: ['GET', 'POST']
    }
})

io.on('connection', (socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on("create-new-room", (data) => {
        createNewRoomHandler(data, socket);
    })

    socket.on("join-room", (data) => {
        joinRoomHandler(data, socket);
    })

    socket.on("disconnect", () => {
        disconnectHandler(socket);
    })

    socket.on("conn-signal", data => {
        signalingHandler(data,socket);
    })

    socket.on("conn-init", data => {
        initializeConnectionHandler(data, socket);
    })

    socket.on("send-message", data => {
        const { roomId, message } = data;
        //console.log(message);
        //join room as connected user
        const room = rooms.find(room => room.id === roomId);
        //emit to all users which are in the room to prepare peer connection
        room.connectedUsers.forEach(user => {
            if(user.socketId !== socket.id){
                io.to(user.socketId).emit("send-message", message);
            }
        })
    })
})

const createNewRoomHandler = (data, socket) => {
    //console.log("host is creating new room");
    //console.log(data);
    const { identity, onlyAudio } = data;

    const roomId = uuidv4();

    //create new user
    const newUser = {
        identity: identity,
        id: uuidv4(),
        socketId: socket.id,
        roomId: roomId,
        onlyAudio
    };

    //push that user to connectedUsers
    connectedUsers = [...connectedUsers, newUser];

    //create new room 
    const newRoom = {
        id: roomId,
        connectedUsers:[newUser]
    }

    //join socket.io room
    socket.join(roomId);

    rooms = [...rooms, newRoom];

    // emit to the clien which created that room roomId
    socket.emit("room-id", { roomId });

    //emit an event to all other users that new user has joined
    socket.emit('room-update', { connectedUsers: newRoom.connectedUsers });
}

const joinRoomHandler = (data, socket) => {
    
    const { identity, roomId, onlyAudio } = data;

    const newUser = {
        identity,
        id:uuidv4(),
        socketId:socket.id,
        roomId: roomId,
        onlyAudio
    }

    //join room as connected user
    const room = rooms.find(room => room.id === roomId);
    room.connectedUsers = [...room.connectedUsers, newUser];

    //join socket.io room
    socket.join(roomId);

    //add new user to connected users array
    connectedUsers = [...connectedUsers, newUser];

    //emit to all users which are in the room to prepare peer connection
    room.connectedUsers.forEach(user => {
        if(user.socketId !== socket.id){
            const data = {
                connUserSocketId: socket.id
            };

            io.to(user.socketId).emit("conn-prepare", data);
        }
    })

    //console.log('executed');
    io.to(roomId).emit('room-update', { connectedUsers: room.connectedUsers });
}

const disconnectHandler = (socket) => {
    //find if user has been registered - if yes remove him from room and connected users
    const user = connectedUsers.find(user => user.socketId === socket.id);

    if(user){
        // remove user from room in server
        const room = rooms.find(room => room.id === user.roomId);

        room.connectedUsers = room.connectedUsers.filter(
            user => user.socketId !== socket.id
        )
    
        //leave socket io room
        socket.leave(user.roomId);

        if(room.connectedUsers.length > 0){
            //emit to all users which are still in the room that user disconnected
            io.to(room.id).emit("user-disconnected", { socketId: socket.id })

            //emit an event to rest of the users in the room
            io.to(room.id).emit("room-update", {
                connectedUsers: room.connectedUsers
            })
        } else{
            //close the room if amount of the users which will stay in room will be 0
            rooms = rooms.filter(r => r.id !== room.id);
        }
    }
}

const signalingHandler = (data, socket) => {
    const { connUserSocketId, signal } = data;

    const signalingData = { signal, connUserSocketId:socket.id };

    io.to(connUserSocketId).emit("conn-signal", signalingData);
}

//information from the other users that they have prepared for incoming connection
const initializeConnectionHandler = (data, socket) => {
    const { connUserSocketId } = data;

    const initData = { connUserSocketId: socket.id };
    io.to(connUserSocketId).emit("conn-init", initData);
}