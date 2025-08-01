// server.js

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB Connected')).catch(err => console.error(err));

const io = new Server(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/appointments', require('./routes/appointments.js'));
app.use('/api/users', require('./routes/userRoutes.js'));
app.use('/api/messages', require('./routes/messageRoutes.js'));

const usersInRooms = {};

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, username) => {
        socket.data.username = username;
        socket.join(roomId);

        if (!usersInRooms[roomId]) {
            usersInRooms[roomId] = [];
        }
        
        // Remove any old connection with the same username (for HMR)
        usersInRooms[roomId] = usersInRooms[roomId].filter(u => u.username !== username);
        
        usersInRooms[roomId].push({ id: socket.id, username });
        console.log(`User ${username} (${socket.id}) joined room ${roomId}.`);

        // ** THE FIX IS HERE **
        // Instead of a complex back-and-forth, we simply tell everyone in the room
        // the complete, updated list of participants.
        const participants = usersInRooms[roomId];
        io.to(roomId).emit('room-participants', participants);
    });

    socket.on('offer', payload => {
        io.to(payload.targetSocketID).emit('offer-received', {
            signal: payload.signal,
            callerID: socket.id,
            username: socket.data.username
        });
    });

    socket.on('answer', payload => {
        io.to(payload.targetSocketID).emit('answer-received', {
            signal: payload.signal,
            callerID: socket.id,
            username: socket.data.username
        });
    });

    socket.on('disconnecting', () => {
        for (const roomId in usersInRooms) {
            const userIndex = usersInRooms[roomId].findIndex(user => user.id === socket.id);
            if (userIndex > -1) {
                usersInRooms[roomId].splice(userIndex, 1);
                console.log(`User ${socket.id} left room ${roomId}.`);
                // Broadcast the new participant list to the remaining users
                io.to(roomId).emit('room-participants', usersInRooms[roomId]);
                if (usersInRooms[roomId].length === 0) {
                    delete usersInRooms[roomId];
                }
            }
        }
    });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));