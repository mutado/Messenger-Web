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
  displayChannels: Channel[];
  private allChannels: Channel[];

  constructor(
    private channelService: ChannelService,
    private route: ActivatedRoute,
    private socketService: WebSocketService
  ) { }

  get sock() {
    return this.socketService;
  }

  ngOnInit(): void {
    this.socketService.loaded.subscribe(ch => {
      this.allChannels = this.socketService.channels.map(chl=>chl.channel);
      this.displayChannels = this.allChannels;
      this.loading = false;
    })
  }

  get selectedChatId(){
    try{
      return this.socketService.selectedChannel.channel.id;
    }
    catch{
      return 0;
    }
  }

  public search() {
    console.log('search')
    this.displayChannels = <Channel[]>[];
    var searchInput = $('#search').val()
    
    if (searchInput.charAt(0) == "@") {
      console.log("user find")
    }
    else {
      this.allChannels.map(ch=>{
        if (ch.name.includes($('#search').val()))
          return ch;
      })
      var ch = new Channel();
      ch.name = searchInput;
      this.channelService.search(ch).subscribe(data => {
        // this.displayChannels = this.allChannels.concat(data.success);
        var ids = new Set(this.displayChannels.map(d => d.id));
        this.displayChannels = [...this.displayChannels, ...data.success.filter(d => !ids.has(d.id))];
      })
    }
  }
}
