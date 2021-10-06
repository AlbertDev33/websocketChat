import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import mongoose, { ConnectOptions } from 'mongoose';

interface IMongoOptions extends ConnectOptions {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
}

const app = express();
const server = createServer(app);
const io = new Server(server);

mongoose.connect('mongodb://localhost:27017/websocket', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} as IMongoOptions);

app.use(express.static(path.join(__dirname, '..', 'public')));

io.on('connection', (socket) => {
    console.log(socket.id);
});

app.get('/', (request, response) => {
    return response.json({
        message: "Hello Websocket",
    });
});

export { server, io };