import { Component, OnInit } from '@angular/core';
import { ChannelService } from '../_services/channel.service';
import { Message } from '../_models/message';
import { Channel } from '../_models/channel';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit {
  messages: Message[];
  channel:Channel;
  page:number;
  loading:boolean;
  sendMessageForm:FormGroup;
  submitted:boolean;
  sending:boolean;

  constructor(
    private channelService:ChannelService,
    private formBuilder:FormBuilder,
    private route:ActivatedRoute,
  ) { }

  get f(){return this.sendMessageForm.controls;}

  ngOnInit(): void {
    this.sendMessageForm = this.formBuilder.group({
      'message':['',[Validators.required,Validators.minLength(1)]],
    });

    this.loading = true;
    //get parameters
    this.route.paramMap.subscribe(params=>{
      //load channel
      this.channelService.getById(+params.get('channelId')).subscribe(response=>{
        this.channel = response.success;

        //load messages
        this.channelService.getMessages(this.channel).subscribe(response=>{
          var paginator = response.success;
          this.page=paginator.curent_page;
          this.loading = false;
          this.messages = paginator.data;
        })

      })
    });

  }

  onSubmit(){
    console.log(this.sendMessageForm.errors);
  }

}
