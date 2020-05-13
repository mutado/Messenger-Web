import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';
import { User } from '../_models/user';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  user : User;
  constructor(
    private authService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
  }

  logout(){
    this.authService.logout();
  }
}
