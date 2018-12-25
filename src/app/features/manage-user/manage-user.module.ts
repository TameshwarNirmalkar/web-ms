import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageUserRoutingModule } from './manage-user-routing.module';
import { UserDetailsComponent } from './user-details/user-details.component';
import { AddUserComponent } from './add-user/add-user.component';
import { ManageUserPermissionsComponent } from './manage-user-permissions/manage-user-permissions.component';

@NgModule({
  imports: [
    CommonModule,
    ManageUserRoutingModule
  ],
  declarations: [UserDetailsComponent, AddUserComponent, ManageUserPermissionsComponent]
})
export class ManageUserModule { }
