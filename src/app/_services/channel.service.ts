import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { ApiResponse, Pagination } from '../_models/apiresponse';
import { Message } from '../_models';
import { Channel } from '../_models/channel';

@Injectable({ providedIn: 'root' })
export class ChannelService {
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

    create(channel: Channel) {
        return this.http.post<ApiResponse<Channel>>(`${environment.apiUrl}/channel`, channel);
    }

    getMessages(channel: Channel,page = 1) {
        return this.http.get<ApiResponse<Pagination<Message[]>>>(`${environment.apiUrl}/channel/${channel.id}/messages`);
    }
}