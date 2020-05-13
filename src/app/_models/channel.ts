import { User } from "./user";
import { Observable, of, Subject } from 'rxjs';
import { Message } from './message';
import { Pagination, ApiResponse } from './apiresponse';
import { MessageService } from '../_services/message.service';

export class Channel {
    id:number;
    name:string;
    members:number;
    messagesLoadedEvent = new Subject<boolean>();
    loadedMessages = false;
    _messages = new Pagination<Message[]>();
    messages = new Subject<Message>();
    displayReady:Promise<boolean>;
}