import { User } from "./user";

export class Message {
    id: number;
    content: string;
    userSender:number;
    channelId:number;
    seen:boolean;
    created_at:number;
    type="message";
    user:User;

    constructor(
        content:string,
        userSender:number,
        channelId:number,
        seen:boolean)
    {
        this.content = content;
        this.userSender=userSender;
        this.channelId = channelId;
        this.seen = seen;
    }

    getTimeString(){
        console.log("lmao")
        return new Date(this.created_at).toLocaleTimeString();
    }

}