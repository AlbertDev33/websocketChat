import { Message } from "../schemas/Message";

export class GetMessageByChatRoom {
    async execute(roomId: string) {
        const messages = await Message.find({
            roomId
        }).populate('to').exec();

        return messages;
    }
}