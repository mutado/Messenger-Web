import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service';
import { WebSocketService } from '../_services/web-socket.service';
import { first, throwIfEmpty } from 'rxjs/operators';
import { User } from '../_models/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error:Array<string> = null;
  status: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private socketService: WebSocketService
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      username: ['deci5', [Validators.required, Validators.maxLength(255)]],
      email: ['temp5@mail.com', [Validators.required, Validators.email]],
      password: ['12345678', [Validators.required, Validators.minLength(8)]],
      c_password: ['12345678', [Validators.required, Validators.minLength(8)]],
      fullName: [''],
      terms: ['']
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.authenticationService.getStatus().subscribe(data => { this.status = data.toString() })
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  isSubmitDisabled(): boolean {
    if (this.loading || !this.f.terms.value) {
      // console.log(this.f.password.errors)
      return true;
    }
    return false;
  }

  onSubmit() {
    this.error = null;
    this.submitted = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    if (this.f.password.value != this.f.c_password.value) {
      this.error.push("Passwords should match")
      this.loading = false;
      return;
    }


    this.loading = true;
    var usr: any = {
      password: this.f.password.value,
      c_password: this.f.c_password.value,
      email: this.f.email.value,
      username: this.f.username.value,
    }
    if (this.f.fullName.value !== "") {
      usr.name = this.f.fullName.value;
    }
    this.authenticationService.register(usr)
      .subscribe(data => {
        if (data.success) {
          this.authenticationService.login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
              data => {
                this.socketService.connect();
                this.router.navigate([this.returnUrl]);
              },
              error => {
                this.error = error;
                this.loading = false;
              });
        }
        else{
          this.error = Object.values(data.error)
        }
        this.loading = false;
      })
  }
}