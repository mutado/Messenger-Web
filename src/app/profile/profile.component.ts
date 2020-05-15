import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';
import { User } from '../_models/user';
import { WebSocketService } from '../_services/web-socket.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  curentUser: User;
  loading: boolean;

  constructor(
    private authenticationService: AuthenticationService,
    private socketService: WebSocketService,
  ) {
    this.socketService.selectedChannel = null;
   }

  ngOnInit(): void {
    this.loading = true;
    this.curentUser = this.authenticationService.currentUserValue;
    this.loading = false;
  }

}
