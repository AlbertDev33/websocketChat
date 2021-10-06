import { injectable } from "tsyringe";
import { User } from "../schemas/User";

interface ICreateUserDTO {
    email: string;
    socket_id: string;
    avatar: string;
    name: string;
}

@injectable()
export class CreateUser {
    async excute({ email, socket_id, avatar, name }: ICreateUserDTO) {
        const userAlreadyExists = await User.findOne({
            email,
        }).exec();

        if (userAlreadyExists) {
            const user = await User.findOneAndUpdate({
                _id: userAlreadyExists._id,    
            },
            {
                $set: { socket_id, avatar, name }
            },
            {
                new: true,
            });
            return user;
        }

        const user = await User.create({
            email,
            socket_id,
            avatar,
            name,
        });
        return user;
    }
}