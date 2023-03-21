import express from 'express';
import bodyParser from "body-parser";
import cors from 'cors';
import dotenv from "dotenv";
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import ConverstationRoutes from './routes/converstationRoutes.js';
import MessageRoutes from './routes/messagesRoutes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';


/* CONFIGURATION */
dotenv.config()
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'https://main.d28inamof83ye7.amplifyapp.com'
    }
});

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
connectDB();


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range');
    res.setHeader('Access-Control-Max-Age', '1728000');
    next();
});


app.use('/api', userRoutes);
app.use('/api/converstation', ConverstationRoutes);
app.use('/api/message', MessageRoutes);



let users = []

const addUser = (urId, socketId) => {
    !users.some(user => user.urId === urId) &&
        users.push({ urId, socketId });
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}

const getUser = (id) => {
    return users.find(user => user.urId === id)
}

io.on('connection', (socket) => {
    console.log(' connection');
    // take urId and socketId from user
    socket.on('addUser', urId => {
        console.log('add new connection');
        addUser(urId, socket.id);
        io.emit('getUsers', users)
    })
    // Send and Get message
    socket.on('sendMessage', ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        console.log('new message');
        io.to(user?.socketId).emit('getMessage', {
            senderId, text
        })
    })

    // Disconnect
    socket.on('disconnect', () => {
        console.log('dissconnecte');
        removeUser(socket.id)
        io.emit('getUsers', users)
    })
})

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
