import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { Message } from '../_models/message';
import { User } from '../_models/user';

@Injectable({ providedIn: 'root' })
export class MessageService {
    constructor(
        private http: HttpClient,
        ) { }

    getAll(user :   User) {
        return this.http.post<Message[]>(`${environment.apiUrl}/messages`,{user: user});
    }

    getById(id: number) {
        return this.http.get<Message>(`${environment.apiUrl}/messages/${id}`);
    }
}