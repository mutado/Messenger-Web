import { Channel } from './channel';


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

export class ChannelListener{
    channel:Channel;
    listener:any;
    name:string;
}