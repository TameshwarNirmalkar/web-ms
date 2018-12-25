import { NgModule } from '@angular/core';
import { UserProfileRoutingModule } from './user-profile-routing.module';
import { CommonModule } from '@angular/common';
import { DragulaService } from 'ng2-dragula';
import { DragulaModule } from 'ng2-dragula';
import { UserProfileComponent } from './user-profile.component';
import { SharedModule } from '@srk/shared';
import { ProfileInfoComponent } from './profile-info/profile-info.component';
import { ProfileSettingComponent } from './profile-setting/profile-setting.component';
import { ChangePasswordComponent } from './profile-info/change-password/change-password.component';
import { AccountDetailComponent } from './profile-info/account-detail/account-detail.component';
import { TermsAndConditionComponent } from './terms-and-condition/terms-and-condition.component';

@NgModule({
  imports: [
    CommonModule, SharedModule, UserProfileRoutingModule, DragulaModule
  ],
  declarations: [
    UserProfileComponent,
    ProfileInfoComponent,
    ProfileSettingComponent,
    ChangePasswordComponent,
    AccountDetailComponent,
    TermsAndConditionComponent],
  exports: [UserProfileComponent]
})
export class UserProfileModule { }
