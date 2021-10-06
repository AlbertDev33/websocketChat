import { injectable } from "tsyringe";
import { User } from "../schemas/User";

@injectable()
export class GetAllUsers {
    async execute() {
        const users = await User.find();
        return users;
    }
}