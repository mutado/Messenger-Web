import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from './_services/authentication.service';
import { User } from './_models/user';
import { Role } from './_models/role';
import io from "socket.io-client";
import Echo from 'laravel-echo';
import { WebSocketService } from './_services/web-socket.service';


// At the top of the file
declare global {
    interface Window { io: any; }
    interface Window { Echo: any; }
}


window.io = window.io || require('socket.io-client');
window.Echo = window.Echo || {};

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    currentUser: User;
    socket: io.SocketIOClient.Socket;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private webSocketService : WebSocketService
    ) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
        console.log("hell");
        // window.Echo = new Echo({
        //     broadcaster: 'socket.io',
        //     host: 'http://localhost:6001',
        //     auth:
        //     {
        //         headers:
        //         {
        //             'Authorization': 'Bearer ' + this.currentUser.token
        //         }
        //     }
        // });

        // window.Echo.private('channel.1')
        //     .listen('.NewMessage', (data) => {
        //         console.log("recieved data");
        //     });
        // window.Echo.join(`channel.1`)
        //     .here((users) => {
        //         //
        //     })
        //     .joining((user) => {
        //         console.log(user.name);
        //     })
        //     .leaving((user) => {
        //         console.log(user.name);
        //     });
    }
    
    ngOnInit(): void {
    }

    get isAdmin() {
        return this.currentUser && this.currentUser.role === Role.Admin;
    }

    logout() {
        this.authenticationService.logout();
        this.webSocketService.disconnect()
        this.router.navigate(['/login']);
    }
}
