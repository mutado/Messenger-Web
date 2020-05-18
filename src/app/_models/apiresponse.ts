import { Channel } from './channel';
import { User } from './user';


export class ApiResponse<type>{
    success?: type;
    error?: string;
}

export class Pagination<type>{
    current_page: number;
    data: type;
    from: number;
    to: number;
    last_page: number;
    total: number;
}

export class ShortUser{
    id:string;
    name:string;
}

export class ChannelListener{
    channel:Channel;
    listener:any;
    name:string;
    membersOnline= new Array<ShortUser>();
    members = new Array<User>();
}