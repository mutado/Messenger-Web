import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { ApiResponse } from '../_models/apiresponse';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/user`);
    }

    getById(id: number) {
        return this.http.get<User>(`${environment.apiUrl}/user/${id}`);
    }

    search(user: User){
        return this.http.post<ApiResponse<User>>(`${environment.apiUrl}/user/search`,user);
    }

    update(user:User){
        return this.http.post<ApiResponse<User>>(`${environment.apiUrl}/user/update`,user);
    }
}