import { User } from "./user";

export class Message {
    id: number;
    content: string;
    userSender:number;
    channelId:number;
    recieved:number;
    seen:boolean;
    send_at:number;
    created_at:number;

    constructor(
        content:string,
        userSender:number,
        channelId:number,
        send_at:number,
        seen:boolean)
    {
        this.send_at = send_at;
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