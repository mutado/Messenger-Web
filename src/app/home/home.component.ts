import { Component, OnInit } from '@angular/core';

import { User } from '../_models/user';
import { AuthenticationService } from '../_services/authentication.service';
import { Channel } from '../_models/channel';
import { ChannelService } from '../_services/channel.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loading = false;
  currentUser: User;
  userFromApi: User;
  channels: Channel[];
  loadingDialogs = false;

  constructor(
    private authenticationService: AuthenticationService,
    private channelService: ChannelService,
  ) {
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    console.log(this.currentUser);
    this.loading = true;
    this.channelService.getUsersChannels().subscribe(response=>{
      var channels = response.success;
      this.loading = false;
      this.channels = channels;
    })
  }
}
