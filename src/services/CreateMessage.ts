import { injectable } from "tsyringe";
import { Message } from "../schemas/Message";

interface ICreateMessage {
    to: string;
    text: string;
    roomId: string;
}

@injectable()
export class CreateMessage {
    async execute({ to, text, roomId }: ICreateMessage) {
        const message = await Message.create({
            to,
            text,
            roomId,
        });

        return message;
    }
}