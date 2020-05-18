import { Injectable, OnDestroy } from '@angular/core';
import * as io from "socket.io-client";
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import Echo from 'laravel-echo';
import { ChannelService } from './channel.service';
import { Message } from '../_models/message';
import { Channel } from '../_models/channel';
import { ChannelListener } from '../_models/apiresponse';
import { resolve } from 'dns';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  readonly uri = "localhost:6001";
  public selectedChannel: ChannelListener;
  public channels = [new ChannelListener()];
  public joinedChannels = new Subject<ChannelListener>();
  public loaded = new Subject<boolean>();
  public loadedHappened = false;
  public displayReady: Promise<boolean>;
  public selected = new Subject<boolean>();
  public channelsChanged = new Subject<boolean>();

  get currentChannelMessages() {
    try {
      return this.selectedChannel.channel._messages;
    }
    catch (e) { return null }
  }

  audio = new Audio('https://notificationsounds.com/message-tones/juntos-607/download/mp3');


  constructor(
    private authenticationService: AuthenticationService,
    private channelService: ChannelService
  ) {
    if (authenticationService.currentUserValue) {
      this.connect();
    }
  }
  ngOnDestroy(): void {
    this.disconnect();
  }



  /**
   * Connect to socket
   */
  connect() {
    try {
      window.Echo = new Echo({
        broadcaster: 'socket.io',
        host: 'http://' + this.uri,
        auth:
        {
          headers:
          {
            'Authorization': 'Bearer ' + this.authenticationService.currentUserValue.token
          }
        }
      });
      console.log("Connected to socket")


      this.channelService.getUsersChannels().subscribe(channels => {
        this.JoinChannels(channels.success);
      })

    } catch (error) {
      console.log("Error connecting to socket: " + error.message);
    }
  }

  /**
   * Disconect from socket
   */
  disconnect() {
    this.channels.forEach(element => {
      window.Echo.leave(element.name);
    });
  }

  /**
   * Join all given channels
   * Listen for new messages
   * @param channels 
   */
  JoinChannels(channels: Channel[]) {
    this.channels.shift();
    channels.forEach(ch => {
      // Joining all channels for notifications
      this.channels.push(this.createChListener(ch));
    });
    this.loaded.next(true);
    this.loadedHappened = true;
  }

  createChListener(ch: Channel) {
    var chListener = new ChannelListener();
    chListener.channel = ch;
    chListener.name = `channel.${ch.id}`;
    chListener.listener = window.Echo.join(chListener.name);
    chListener.channel.messages = new Subject<Message>()
    chListener.channel.messagesLoadedEvent = new Subject<boolean>()
    chListener.channel.typing = null;
    chListener.channel.typingHandler = null;

    chListener.listener.here(users => {
      chListener.membersOnline = users;
    })
      .joining(user => {
        chListener.membersOnline.push(user);
      })
      .leaving(user => {
        var index = chListener.membersOnline.indexOf(chListener.membersOnline.find(u => u.id == user.id));
        if (index > -1)
          chListener.membersOnline.splice(index, 1);
      })
      .listen('.MemberJoined', (data) => {
        chListener.members.push(data.user);
      })
      .listen('.MemberLeft', (data) => {
        var index = chListener.members.indexOf(chListener.members.find(u => u.id == data.user.id));
        if (index > -1)
          chListener.members.splice(index, 1);
      })
      .listen('.NewMessage', (data) => {
        // Broadcast new message to subject
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.play();
        console.log(data);
        chListener.channel.messages.next(data.message);
      })
      .listenForWhisper('typing', (e) => {
        if (chListener.channel.typingHandler)
          clearTimeout(chListener.channel.typingHandler);
        console.log(e);
        chListener.channel.typingHandler = setTimeout(() => {
          chListener.channel.typing = null;
        }, 1000);

        chListener.channel.typing = e.name;
      });


    // Loading first page of messages
    this.channelService.getMessages(ch).subscribe(data => {
      chListener.channel._messages = data.success;
      chListener.channel.messagesLoadedEvent.next(true);
      chListener.channel.displayReady = Promise.resolve(true);
      chListener.channel.loadedMessages = true;
    })

    this.channelService.getMembers(ch.id).subscribe(data => {
      chListener.members = data.success;
    })

    // Retrieve new message from subject
    chListener.channel.messages.subscribe((msg: any) => {
      console.log("message recieved: " + msg.content)
      //add message to front of array
      chListener.channel._messages.data.push(msg);
    })
    return chListener;
  }

  selectChannel(channelId) {
    if (this.loadedHappened) {
      console.log(this.channels)
      this.select(channelId)
    }
    else {
      var handler = this.loaded.subscribe(data => {
        handler.unsubscribe();
        this.select(channelId)
      })
    }

  }

  refreshMessages() {
    this.channelService.getMessages(this.selectedChannel.channel).subscribe(data => {
      this.selectedChannel.channel._messages = data.success;
    })
  }

  addChannel(channel: ChannelListener) {
    this.channels.push(channel);
    this.channelsChanged.next(true);
  }

  removeChannel(channelId: number) {
    var index = this.channels.indexOf(this.channels.find(ch => ch.channel.id == channelId))
    if (index > -1)
      this.channels.splice(index, 1);
    this.channelsChanged.next(true);
  }

  private select(channelId) {
    this.displayReady = Promise.resolve(false);
    this.selectedChannel = null;
    this.selectedChannel = this.channels.find(ch => ch.channel.id == channelId)

    // Channel not joined
    if (!this.selectedChannel) {
      console.log("Loading from server")
      this.channelService.getById(channelId).subscribe(data => {
        this.selectedChannel = this.createChListener(data.success);
        this.displayReady = Promise.resolve(true);
        this.selected.next(true);
      })
    }
    else {
      this.displayReady = Promise.resolve(true);
      this.selected.next(true);
    }
  }
}
