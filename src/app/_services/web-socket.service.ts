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
  public selectedChannel : ChannelListener;
  public channels = [new ChannelListener()];
  public joinedChannels = new Subject<ChannelListener>();
  public loaded = new Subject<boolean>();
  public displayReady:Promise<boolean>;

  get currentChannelMessages(){
    try{
      return this.selectedChannel.channel._messages;
    }
    catch(e){return null}
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
    console.log("Joining channels");
    var i = 0;
    this.channels.shift();
    channels.forEach(ch => {
      i++;
      // Joining all channels for notifications
      var chListener = new ChannelListener();
      chListener.channel = ch;
      chListener.name = `channel.${ch.id}`;
      chListener.listener = window.Echo.join(chListener.name);
      chListener.channel.messages = new Subject<Message>()
      chListener.channel.loadedMessages = new Subject<boolean>()

      // Loading first page of messages
      this.channelService.getMessages(ch).subscribe(data => {
        chListener.channel._messages = data.success;
        chListener.channel._messages.data.reverse();
        chListener.channel.loadedMessages.next(true);
        chListener.channel.displayReady = Promise.resolve(true);
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
      this.channels.push(chListener);
      
      this.joinedChannels.next(null)
      console.log("joining")
    });
    console.log("Channels joined " + i);
    this.loaded.next(true);
  }
  
  selectChannel(channelId){
    this.selectedChannel = this.channels.find(ch=>ch.channel.id == channelId)
    this.displayReady = Promise.resolve(true);
  }
}
