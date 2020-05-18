import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ChannelService } from '../_services/channel.service';
import { WebSocketService } from '../_services/web-socket.service';
import { AuthenticationService } from '../_services/authentication.service';
import { User } from '../_models/user';
import { MessageService } from '../_services/message.service';
import { Message } from '../_models/message';

@Component({
  selector: 'app-channel-info',
  templateUrl: './channel-info.component.html',
  styleUrls: ['./channel-info.component.css']
})
export class ChannelInfoComponent implements OnInit, OnDestroy {
  channelId: number;
  user: User;

  constructor(
    private auth: AuthenticationService,
    private route: ActivatedRoute,
    private channelService: ChannelService,
    private socketService: WebSocketService,
    private messageService: MessageService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.user = this.auth.currentUserValue;
    // Subscribe for channel change event
    this.route.params.subscribe((params: Params) => {
      console.log("channelId: " + params['channelId'])
      this.channelId = params['channelId'];
    })
    this.socketService.selectChannel(this.channelId)
  }

  ngOnDestroy(){
    this.socketService.selectedChannel = null;
  }

  leave() {
    var message = new Message(
      "left this channel",
      this.user.id,
      this.channelId,
      false
    )
    message.type = "service";
    this.messageService.sendMessage(message).subscribe(data => {
      console.log(data);
    })

    this.socketService.removeChannel(this.channelId);

    this.channelService.leave(this.channelId).subscribe(data => {
      if (data.success) {
        
        console.log(this.socketService.channels)
      }
      console.log(data);
    })

    this.router.navigate(['/home'])
  }
}
