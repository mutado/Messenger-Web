import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './_helpers/auth.guard';
import { Role } from './_models/role';
import { ProfileComponent } from './profile/profile.component';
import { ChannelCreateComponent } from './channel-create/channel-create.component';
import { ChannelComponent } from './channel/channel.component';
import { SettingsComponent } from './settings/settings.component';
import { AddContactComponent } from './add-contact/add-contact.component';
import { ChannelInfoComponent } from './channel-info/channel-info.component';
import { RegisterComponent } from './register/register.component';
import { TermsComponent } from './terms/terms.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin] }
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'terms',
        component: TermsComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'profile',
        component: ProfileComponent
    },
    {
        path: 'channel/create',
        component: ChannelCreateComponent
    },
    {
        path: 'channel/:channelId',
        component: ChannelComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'channel/info/:channelId',
        component: ChannelInfoComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'contact/add',
        component: AddContactComponent,
        canActivate: [AuthGuard],
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);