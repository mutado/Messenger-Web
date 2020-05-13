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
  page: number;
  last_page: number;
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
  }


  ngOnInit(): void {
    console.log("init channel")
    this.loading = true;
    this.user = this.authenticationService.currentUserValue;

    this.sendMessageForm = this.formBuilder.group({
      'message': ['', [Validators.required, Validators.minLength(1)]],
    });

    this.loading = true;
    console.log(this.route.snapshot.params);
    this.channel.id = +this.route.snapshot.params.channelId;

    this.route.params.subscribe((params: Params) => {
      console.log("Selected channel " + params['channelId']);
      // if (this.socketService.loaded) {
      //   this.loadChannel(params['channelId'])
      // }
      // else {
      //   setTimeout(() => {
      //   }, 200);
      // }
      // this.sock.loaded.subscribe((data)=>{
      //   console.log("then")
      //   // this.loadChannel(params['channelId']);
      // })
      this.socketService.loaded.subscribe(data => {
        this.loadChannel(params['channelId']);
      });
    })

    // this.channelService.getById(this.channel.id).subscribe(ch => {
    //   this.channel = ch.success;
    //   this.socketService.SelectChannel(this.channel);

    //   // Load messages
    //   console.log("Loading Messages");
    //   this.channelService.getMessages(this.channel).subscribe(data => {
    //     this.page = data.success.current_page;
    //     this.last_page = data.success.last_page;
    //     this.messages = data.success.data.reverse();
    //     console.log("Loaded messages");
    //     this.loading = true;

    //     //Scroll to bottom
    //     setTimeout(() => {
    //       var msgbox = $('#message-box');
    //       msgbox.scrollTop(msgbox.prop("scrollHeight"));
    //     }, 1);
    //   });

    this.channelService.joined(this.channel).subscribe(data => {
      if (data.success) {
        this.joined = true;
      }
      else {
        this.joined = false;
      }
    })

    //   this.socketService.selectedJoinedChannel.channel.messages.subscribe(msg=>{
    //     this.messages.push(msg);
    //     this.scrollDown();
    //   })



    // })
  }

  // Return current socket
  // Shorthand alias or smth like
  get sock() {
    return this.socketService;
  }

  get msgs() {
    return this.sock.currentChannelMessages;
  }

  private loadChannel(channelId: number) {
    this.socketService.selectChannel(channelId);
    this.channel = this.socketService.selectedChannel.channel;
    this.sock.selectedChannel.channel.loadedMessages.subscribe(data => {

      // retrieve data from socket
      // this.messages = this.sock.currentChannelMessages.data;
      this.page = this.sock.currentChannelMessages.current_page;
      this.last_page = this.sock.currentChannelMessages.last_page;

      
      // Display shit so fucking slow
      // Needs to be done 1 ms after
      setTimeout(() => {
        $('#go-bottom-btn').click(this.scrollDown);
        $('#message-box').scroll(this.scrollCheck.bind(this));
        var msgbox = $('#message-box');
        msgbox.scrollTop(msgbox.prop("scrollHeight"));
      }, 1);
    })
  }

  public scrollCheck() {
    if ($('#message-box').scrollTop() > $('#message-box').prop("scrollHeight") - $('#message-box').prop("offsetHeight") - 100) {
      // Bottom
      $('#go-bottom-btn').addClass('hidden')
    } else {
      if ($('#message-box').scrollTop() < 200)
        this.appendMessages();

      // Show button
      $('#go-bottom-btn').removeClass('hidden')
    }
  }

  appending: boolean = false;
  public appendMessages = () => {
    if (!this.appending && this.page != this.last_page) {
      this.appending = true;
      console.log("Loading page: " + (this.page + 1))
      this.channelService.getMessages(this.channel, this.page + 1).subscribe(data => {
        this.page = data.success.current_page;
        this.last_page = data.success.last_page;
        var msgbox = $('#message-box')
        var scrHeight = msgbox.prop("scrollHeight");
        var srcTop = msgbox.scrollTop();
        this.messages = data.success.data.reverse().concat(this.messages);
        setTimeout(() => {
          var hdiff = msgbox.prop("scrollHeight") - scrHeight;
          srcTop = msgbox.scrollTop();
          msgbox.scrollTop(hdiff + srcTop);
          this.appending = false;
        }, 1);
      })
    }
  }

  join() {
    this.channelService.join(this.channel).subscribe(data => {
      window.location.reload(false);
    })
  }

  public scrollDown(speed = 'fast') {
    // Scroll to bottom
    console.log("Scroll to bottom");
    var msgbox = $('#message-box');
    msgbox.animate({ scrollTop: msgbox.prop("scrollHeight") }, speed);
  }

  get f() { return this.sendMessageForm.controls; }

  onSubmit() {
    if (this.sendMessageForm.invalid) {
      console.log(this.sendMessageForm.errors);
      return;
    }
    this.sending = true;

    var message = new Message(
      this.f.message.value,
      this.user.id,
      this.channel.id,
      Date.now(),
      false
    )

    // console.log(message);
    this.messageService.sendMessage(message).subscribe(response => {
      this.f.message.setValue("");
      this.sending = false;
      this.scrollDown('slow');
    })

  }

}
