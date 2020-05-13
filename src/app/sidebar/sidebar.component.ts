import { Component, OnInit } from '@angular/core';
import { ChannelService } from '../_services/channel.service';
import { Channel } from '../_models/channel';
import { ActivatedRoute } from '@angular/router';
import { WebSocketService } from '../_services/web-socket.service';

declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  loading: boolean;
  channels: Channel[];
  channelsHidden: Channel[];
  selectedChatId: number
  constructor(
    private channelService: ChannelService,
    private route: ActivatedRoute,
    private socketService: WebSocketService
  ) { }

  ngOnInit(): void {
    this.channelService.getUsersChannels().subscribe(ch => {
      this.channels = ch.success;
      this.channelsHidden = ch.success;
      this.loading = false;
    })
  }

  public search() {
    this.channels = <Channel[]>[];
    var searchInput = $('#search').val()
    
    if (searchInput.charAt(0) == "@") {
      
    }
    else {
    this.channelsHidden.forEach(element => {
      if (element.name.includes($('#search').val())) {
        this.channels.push(element);
      }
    });
      var ch = new Channel();
      ch.name = searchInput;
      this.channelService.search(ch).subscribe(data => {

        this.channels = this.channels.concat(data.success);
      })
    }
  }
}
