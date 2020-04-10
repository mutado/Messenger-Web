import { User } from "./user";

export class Message {
    id: number;
    content: string;
    userFrom: User;
    userTo: User;
}