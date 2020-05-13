import { Injectable } from '@angular/core';
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
export class WebSocketService {
  readonly uri = "localhost:6001";
  public selectedChannel: ChannelListener;
  public channels = [new ChannelListener()];
  public joinedChannels = new Subject<ChannelListener>();
  public loaded = new Subject<boolean>();
  public loadedHappened = false;
  public displayReady: Promise<boolean>;
  public selected = new Subject<boolean>();

  get currentChannelMessages() {
    try {
      return this.selectedChannel.channel._messages;
    }
    catch (e) { return null }
  }

  constructor(
    private authenticationService: AuthenticationService,
    private channelService: ChannelService
  ) {
    if (authenticationService.currentUserValue) {
      this.connect();
    }
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


    // this.channelService.getUsersChannels().subscribe(data => {
    //   data.success.forEach(element => {

    //     window.Echo.join(`channel.${element.id}`)
    //       .here((users) => {
    //         console.log(users);
    //       })
    //       .listen('.NewMessage', (data) => {
    //         // this.channelService.channels.subscribe(data=>{
    //         //   var msg = new Message('hell yeah',1,1,10,false);
    //         //   data.success.find(element=>element.id == msg.channelId).messages.subscribe(messages=>messages.success.data.push(msg));
    //         // })

    //         this.channelService.channels.subscribe(data=>{
    //           console.log("data");
    //           console.log(data);
    //           var chan = data.success.find(element=>element.id == 1)
    //           console.log(chan.messages);
    //           chan.messages.subscribe(messages=>console.log(messages));

    //         })
    //       })
    //   });
    // })
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

  private createChListener(ch: Channel) {
    var chListener = new ChannelListener();
    chListener.channel = ch;
    chListener.name = `channel.${ch.id}`;
    chListener.listener = window.Echo.join(chListener.name);
    chListener.channel.messages = new Subject<Message>()
    chListener.channel.messagesLoadedEvent = new Subject<boolean>()

    // Loading first page of messages
    this.channelService.getMessages(ch).subscribe(data => {
      chListener.channel._messages = data.success;
      chListener.channel._messages.data.reverse();
      chListener.channel.messagesLoadedEvent.next(true);
      chListener.channel.displayReady = Promise.resolve(true);
      chListener.channel.loadedMessages = true;
    })

    // Listen for new messages
    chListener.listener.listen('.NewMessage', (data) => {
      // Broadcast new message to subject
      chListener.channel.messages.next(data.message);
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
      this.select(channelId)
    }
    else {
      var handler = this.loaded.subscribe(data => {
        handler.unsubscribe();
        this.select(channelId)
      })
    }

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
