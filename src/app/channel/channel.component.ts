import { Component, OnInit } from '@angular/core';
import { ChannelService } from '../_services/channel.service';
import { Message } from '../_models/message';
import { Channel } from '../_models/channel';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from '../_services/message.service';
import { User } from '../_models/user';
import { AuthenticationService } from '../_services/authentication.service';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit {
  user: User;
  messages: Message[];
  channel: Channel;
  page: number;
  loading: boolean;
  sendMessageForm: FormGroup;
  submitted: boolean;
  sending: boolean;

  constructor(
    private channelService: ChannelService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
  ) { }

  get f() { return this.sendMessageForm.controls; }

  ngOnInit(): void {
    this.user = this.authenticationService.currentUserValue;

    this.sendMessageForm = this.formBuilder.group({
      'message': ['', [Validators.required, Validators.minLength(1)]],
    });

    this.loading = true;
    //get parameters
    this.route.paramMap.subscribe(params => {
      //load channel
      this.channelService.getById(+params.get('channelId')).subscribe(response => {
        this.channel = response.success;

        //load messages
        this.loadMessages();

      })
    });

  }

  loadMessages() {
    this.channelService.getMessages(this.channel).subscribe(response => {
      var paginator = response.success;
      this.page = paginator.curent_page;
      this.loading = false;
      this.messages = paginator.data;
    })
  }

  onSubmit() {
    console.log(this.sendMessageForm.errors);
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

    console.log(message);
    this.messageService.sendMessage(message).subscribe(response => {
      this.loadMessages();
      this.f.message.setValue("");
      this.sending=false;
    })

  }

}
