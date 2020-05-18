import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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

declare var $: any;

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

    sidebarHidden: boolean = false;
    rootHidden: boolean = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private authenticationService: AuthenticationService,
        private webSocketService: WebSocketService
    ) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);

    }

    checkHidden = ()=> {
        if ($(window).width() < 960) {
            if (this.router.url == '/')
            {
                console.log('here')
                this.rootHidden = true;
                this.sidebarHidden = false;
            }
            else
            {
                console.log('sidebar hidden')
                this.sidebarHidden = true;
                this.rootHidden = false;
            }
        }
        else {
            this.rootHidden = false;
            this.sidebarHidden = false;
        }
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
