import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// used to create fake backend
// import { fakeBackendProvider } from './_helpers/fake-backend';

import { AppComponent } from './app.component';
import { appRoutingModule } from './app.routing';


import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { ChannelCreateComponent } from './channel-create/channel-create.component';
import { ChannelComponent } from './channel/channel.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MessagesComponent } from './messages/messages.component';
import { SettingsComponent } from './settings/settings.component';
import { AddContactComponent } from './add-contact/add-contact.component';
// import { EchoService, ECHO_CONFIG, SocketIoEchoConfig } from 'angular-laravel-echo';


// export const echoConfig: SocketIoEchoConfig = {
//   userModel: 'App.User',
//   notificationNamespace: 'App\\Notifications',
//   options: {
//     broadcaster: 'socket.io',
//     host: window.location.hostname + ':6001'
//   }
// }

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    HomeComponent,
    LoginComponent,
    ProfileComponent,
    ChannelCreateComponent,
    ChannelComponent,
    SidebarComponent,
    MessagesComponent,
    SettingsComponent,
    AddContactComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    appRoutingModule
  ],
  providers: [
    // EchoService,
    // { provide: ECHO_CONFIG, useValue: echoConfig },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    // provider used to create fake backend
    // fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
