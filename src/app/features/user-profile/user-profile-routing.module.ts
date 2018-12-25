import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserProfileComponent } from './user-profile.component';
import { RouterGuard } from '@srk/shared';

export const routes: Routes = [
  { path: '', redirectTo: 'user-profile-setting', pathMatch: 'full' },
  { path: 'user-profile-setting', component: UserProfileComponent, canActivate: [RouterGuard], pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserProfileRoutingModule { }