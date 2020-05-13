import { Component, OnInit } from '@angular/core';

import { User } from '../_models/user';
import { AuthenticationService } from '../_services/authentication.service';
import { Channel } from '../_models/channel';
import { ChannelService } from '../_services/channel.service';
import { MessageService } from '../_services/message.service';
import {Message} from '../_models/message';
import { WebSocketService } from '../_services/web-socket.service';

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
    private messageService: MessageService,
    private socketService: WebSocketService
  ) {
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
  }

  sendTestMessage(){
    console.log("sending test message");
    var mes = new Message('test message',1,1,1,false);
    this.messageService.sendMessage(mes).subscribe(mes=>{
      console.log(mes);
    })
  }
}
