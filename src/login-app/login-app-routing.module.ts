import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UserDeviceService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { LoginAsComponent } from './login/login-as/login-as.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    resolve: {
      env: ApplicationDataService,
      countrycode: UserDeviceService
    }
  },
  { path: 'login/reset', redirectTo: 'login' },
  { path: 'login/login-as', redirectTo: 'login' },
  { path: 'login/register', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class LoginAppRoutingModule { }
