import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';
import { User } from '../_models/user';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UserService } from '../_services/user.service';
import { WebSocketService } from '../_services/web-socket.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  user: User;
  editForm: FormGroup;
  editMode = false;
  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private userService: UserService,
  ) {
    this.user = this.authService.currentUserValue;
    this.editForm = this.formBuilder.group({
      fullName: [this.user.name, Validators.required],
      email: [this.user.email, Validators.required],
    })

  }

  ngOnInit(): void {
  }

  logout() {
    this.authService.logout();
  }

  get f() { return this.editForm.controls; }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  saveUser() {
    if (!this.editForm.valid)
      console.log(this.editForm.errors)

    this.user.name = this.f.fullName.value;
    this.user.email = this.f.email.value;
    this.userService.update(this.user).subscribe(data=>{
      console.log(data);
      localStorage.setItem('currentUser', JSON.stringify(data.success));
    })
  }
}
