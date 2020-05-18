import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChannelService } from '../_services/channel.service';
import { Message } from '../_models/message';
import { Channel } from '../_models/channel';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from '../_services/message.service';
import { User } from '../_models/user';
import { AuthenticationService } from '../_services/authentication.service';
import { WebSocketService } from '../_services/web-socket.service';
import { async } from '@angular/core/testing';
import { Subscription } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit, OnDestroy {
  user: User;
  messages: Message[];
  channel: Channel = new Channel();
  loading: boolean;
  sendMessageForm: FormGroup;
  submitted: boolean;
  sending: boolean;
  root = this;
  joined = true;

  constructor(
    private channelService: ChannelService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private socketService: WebSocketService
  ) { }

  ngOnDestroy(): void {
    this.socketService.selectedChannel = null;
  }

  msgListener: Subscription;


  ngOnInit(): void {

    this.loading = true;
    this.user = this.authenticationService.currentUserValue;

    this.sendMessageForm = this.formBuilder.group({
      'message': ['', [Validators.required, Validators.minLength(1)]],
    });

    this.loading = true;
    // subscribe for selected channel event
    this.sock.selected.subscribe(() => {
      // Check if user joined this channel
      if (this.sock.channels.find(ch => ch.channel.id == this.sock.selectedChannel.channel.id))
        this.joined = true;
      else
        this.joined = false;
      // this.channelService.joined(this.sock.selectedChannel.channel).subscribe(data => {
      //   if (data.success) {
      //     this.joined = true;
      //   }
      //   else {
      //     this.joined = false;
      //   }
      // })

      this.msgListener = this.sock.selectedChannel.channel.messages.subscribe(data => {
        console.log(this.socketService.selectedChannel.channel.name)
        // Check if scrollbar is on bottom
        if ($('#message-box').scrollTop() > $('#message-box').prop("scrollHeight") - $('#message-box').prop("offsetHeight") - 100) {
          // Bottom
          this.scrollDown('slow');
        }
      })

      this.channel = this.socketService.selectedChannel.channel;
      if (this.sock.selectedChannel.channel.loadedMessages) {
        this.displayMessages();
      } else {
        this.sock.selectedChannel.channel.messagesLoadedEvent.subscribe(() => {
          this.displayMessages();
        })
      }
    })

    // Subscribe for channel change event
    this.route.params.subscribe((params: Params) => {
      if (this.msgListener)
        this.msgListener.unsubscribe();
      this.loadChannel(params['channelId']);
    })
  }

  private displayMessages() {
    console.log("display")
    // retrieve data from socket
    // this.messages = this.sock.currentChannelMessages.data;
    console.log("current page " + this.msgs.current_page)
    if (this.msgs.data.length < 50) {
      this.appendMessages();
    }

    // Display shit so fucking slow
    // Needs to be done 1 ms after
    setTimeout(() => {
      $('#go-bottom-btn').click(this.scrollDown);
      $('#message-box').scroll(this.scrollCheck.bind(this));

      var msgbox = $('#message-box');
      msgbox.scrollTop(msgbox.prop("scrollHeight"));
    }, 1);
  }

  // Return current socket
  // Shorthand alias or smth like this
  get sock() {
    return this.socketService;
  }

  // Return messages of this channel
  get msgs() {
    return this.sock.currentChannelMessages;
  }

  private loadChannel(channelId: number) {
    this.sock.selectChannel(channelId);
  }

  scrollWainting = false;
  public scrollCheck() {
    if (this.scrollWainting  == true)
      return;
    this.scrollWainting = true;

    if ($('#message-box').scrollTop() > $('#message-box').prop("scrollHeight") - $('#message-box').prop("offsetHeight") - 100) {
      // Bottom
      $('#go-bottom-btn').addClass('hidden')
    } else {
      if ($('#message-box').scrollTop() < 200)
        this.appendMessages();

      // Show button
      $('#go-bottom-btn').removeClass('hidden')
    }

    setTimeout(() => {
      this.scrollWainting = false;
    }, 100);
  }

  getMessageTime(msg: Message) {
    console.log("l")
    return new Date(msg.created_at).toLocaleTimeString();
  }

  isNewDay(prevMsg: Message, currMsg: Message) {
    if (prevMsg) {
      var dt1 = new Date(prevMsg.created_at);
      var dt2 = new Date(currMsg.created_at);
      return dt1.getDay() != dt2.getDay();
    }
    return true;
  }

  appending: boolean = false;
  public appendMessages = () => {
    if (!this.appending && this.msgs.current_page != 1) {
      console.log("appending")
      // Used to prevent multiple appendings in one time
      this.appending = true;
      this.channelService.getMessages(this.channel, this.msgs.current_page - 1).subscribe(data => {

        // Get page data
        this.msgs.current_page = data.success.current_page;
        this.msgs.last_page = data.success.last_page;

        var msgbox = $('#message-box')

        // Scrollbar save state
        var scrHeight = msgbox.prop("scrollHeight");
        var srcTop = document.getElementById('message-box').scrollTop;

        console.log("scrTop: "+srcTop);
        console.log("height: "+scrHeight);
 
        // Append messages
        this.msgs.data = data.success.data.concat(this.msgs.data)
        setTimeout(() => {
          // Restore scrollbar position
          var hdiff = msgbox.prop("scrollHeight") - scrHeight;
          srcTop = msgbox.scrollTop();
          console.log("new height: "+msgbox.prop("scrollHeight"));
          console.log(hdiff + srcTop)
          msgbox.scrollTop(hdiff + srcTop);
          // document.getElementById('message-box').scrollBy(0,hdiff + srcTop);
          this.appending = false;
        }, 1);
      })
    }
  }

  join() {
    this.channelService.join(this.channel).subscribe(data => {
      this.joined = true;
      this.sock.addChannel(this.sock.selectedChannel);
      this.loadChannel(this.channel.id);
      this.sendMessage("joined this channel","service")
      console.log(this.sock.channels)
    })
  }

  public scrollDown(speed = 'fast') {
    // Scroll to bottom
    var msgbox = $('#message-box');
    msgbox.finish();
    setTimeout(() => {
      msgbox.animate({ scrollTop: msgbox.prop("scrollHeight") }, speed);
    }, 1);
  }

  get f() { return this.sendMessageForm.controls; }

  onSubmit() {
    if (this.sendMessageForm.invalid) {
      return;
    }
    this.sending = true;

    this.sendMessage(this.f.message.value);

  }

  sendMessage(content:string,type="message"){
    var message = new Message(
      content,
      this.user.id,
      this.channel.id,
      false
    )
    message.type = type;

    // console.log(message);
    this.messageService.sendMessage(message).subscribe(response => {
      this.f.message.setValue("");
      this.sending = false;
      this.scrollDown('slow');
    })
  }

}
