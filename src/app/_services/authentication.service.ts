import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { ApiResponse } from '../_models/apiresponse';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/login`, { username, password })
            .pipe(
                catchError(this.handleError),
                map(user => {
                    // login successful if there's a jwt token in the response
                    if (user.success && user.success.token) {
                        // store user details and jwt token in local storage to keep user logged in between page refreshes
                        localStorage.setItem('currentUser', JSON.stringify(user.success));
                        this.currentUserSubject.next(user.success);
                    }
                    return user.success;
                }));
    }

    getStatus(){
        return this.http.get(`${environment.apiUrl}/status`);
    }

    register(user:any){
        return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/register`,user)
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        window.location.reload(false); 
    }

    private handleError(error: HttpErrorResponse) {
        return throwError(
            'Your username or password is incorect');
    };
}