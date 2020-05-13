import { Component, OnInit } from '@angular/core';
import { ChannelService } from '../_services/channel.service';
import { AuthenticationService } from '../_services/authentication.service';
import { User } from '../_models/user';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Channel } from '../_models/channel';

@Component({
  selector: 'app-channel-create',
  templateUrl: './channel-create.component.html',
  styleUrls: ['./channel-create.component.css']
})
export class ChannelCreateComponent implements OnInit {
  curentUser: User;
  createChannelFrom: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private channelService: ChannelService,
  ) {
    this.curentUser = authenticationService.currentUserValue;
  }

  ngOnInit(): void {
    this.createChannelFrom = this.formBuilder.group({
      channelName: ['', Validators.required],
      channelPrivacy: ['', Validators.required],
    })
  }

  get f() { return this.createChannelFrom.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.createChannelFrom.invalid) {
      return;
    }
    this.loading = true;
    var channel = new Channel();
    channel.name = this.f.channelName.value;
    this.channelService.create(channel).subscribe(response => {
      this.loading = false;
      console.log(response);
      var channel = response.success;
      console.log(channel.name + " created successfully")
      this.channelService.join(channel).subscribe(data => {
        window.location.href = '/channel/' + channel.id;
      })


    })
  }
}
