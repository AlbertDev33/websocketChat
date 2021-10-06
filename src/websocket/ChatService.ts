import { container } from "tsyringe";
import { io } from "../http";
import { CreateChatRoom } from "../services/CreateChatRoom";
import { CreateMessage } from "../services/CreateMessage";
import { CreateUser } from "../services/CreateUser";
import { GetAllUsers } from '../services/GetAllUsers';
import { GetChatRoomById } from "../services/GetChatRoomById";
import { GetChatRoomByUsers } from "../services/GetChatRoomByUsers";
import { GetMessageByChatRoom } from "../services/GetMessageByChatRoom";
import { GetUserBySocketId } from "../services/GetUserBySocketId";

io.on('connect', (socket) => {
    socket.on('start', async (data) => {
        const { email, avatar, name } = data;
        const createUser = container.resolve(CreateUser);

        const user = await createUser.excute({
            email,
            avatar,
            name,
            socket_id: socket.id,
        });

        socket.broadcast.emit('new_users', user);
    });

    socket.on('get_users', async (callback) => {
        const getAllUsers = container.resolve(GetAllUsers);
        const users = await getAllUsers.execute();

        callback(users);
    });

    socket.on('start_chat', async (data, callback) => {
        const createChatRoom = container.resolve(CreateChatRoom);
        const getUserBySocketId = container.resolve(GetUserBySocketId);
        const getChatRoomByUsers = container.resolve(GetChatRoomByUsers);
        const getMessageByChatRoom = container.resolve(GetMessageByChatRoom);

        const userLogged = await getUserBySocketId.execute(socket.id);

        let room = await getChatRoomByUsers.execute([
            data.idUser,
            userLogged._id
        ]);

        if (!room) {
            room = await createChatRoom.execute([
                data.idUser,
                userLogged._id
            ]);
        }

        socket.join(room.idChatRoom);

        const messages = await getMessageByChatRoom.execute(room.idChatRoom);
        callback({ room, messages });
    });

    socket.on('message', async (data) => {
        const getUserBySocketId = container.resolve(GetUserBySocketId);
        const user = await getUserBySocketId.execute(socket.id);

        const createMessage = container.resolve(CreateMessage);
        const getChatRoomById = container.resolve(GetChatRoomById);

        const message = await createMessage.execute({
            to: user._id,
            text: data.message,
            roomId: data.idChatRoom
        });

        io.to(data.idChatRoom).emit('message', {
            message,
            user,
        });

        const room = await getChatRoomById.execute(data.idChatRoom);
        const userFrom = room.idUsers.find((response) => {
            String(response._id) !== String(user._id);
        });

        io.to(userFrom.socket_id).emit('notification', {
            newMessage: true,
            roomId: data.idChatRoom,
            from: user,
        });
    });
});