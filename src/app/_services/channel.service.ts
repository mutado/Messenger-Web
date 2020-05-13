import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { ApiResponse, Pagination } from '../_models/apiresponse';
import { Message } from '../_models/message';
import { Channel } from '../_models/channel';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChannelService {
    public channels: Observable<ApiResponse<Channel[]>>;

    constructor(
        private http: HttpClient,
    ) { }



    getAll() {
        return this.http.get<ApiResponse<Channel[]>>(`${environment.apiUrl}/channel`);
    }

    getById(id: number) {
        return this.http.get<ApiResponse<Channel>>(`${environment.apiUrl}/channel/${id}`);
    }

    getUsersChannels() {
        return this.http.get<ApiResponse<Channel[]>>(`${environment.apiUrl}/user/channels`);
    }


    join(channel: Channel) {
        return this.http.get(`${environment.apiUrl}/channel/join/${channel.id}`);
    }
    joined(channel: Channel) {
        return this.http.get<ApiResponse<string>>(`${environment.apiUrl}/channel/joined/${channel.id}`);
    }

    create(channel: Channel) {
        return this.http.post<ApiResponse<Channel>>(`${environment.apiUrl}/channel`, channel);
    }

    getMessages(channel: Channel, page = 1) {
        return this.http.get<ApiResponse<Pagination<Message[]>>>(`${environment.apiUrl}/channel/${channel.id}/messages?page=${page}`);
    }

    search(querry: Channel) {
        console.log(querry);
        return this.http.post<ApiResponse<Channel[]>>(`${environment.apiUrl}/channel/search`, querry);
    }
}