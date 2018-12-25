import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { LoginComponent } from './views/login/login.component';
import { UserDeviceService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { LoginAsComponent } from './views/login/login-as/login-as.component';
import { ChangePasswordComponent } from './views/login/change-password/change-password.component';

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
  { path: 'changePassword' , component:ChangePasswordComponent },
  { path: 'web', loadChildren: 'app/views/web-user/web-user.module#WebUserModule' },
  { path: 'admin', loadChildren: 'app/views/admin-user/admin-user.module#AdminUserModule' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
