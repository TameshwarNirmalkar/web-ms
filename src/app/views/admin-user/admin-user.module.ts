import { NgModule } from '@angular/core';
import { SharedModule } from '@srk/shared';
import { RuleConfigModule } from '@srk/features/rule-config';
import { AdminUserComponent } from './admin-user.component';
import { AdminUserRoutingModule } from './admin-user-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UpdateUserLimitComponent } from './user-limit/update-user-limit/update-user-limit.component';
import { AddUserLimitComponent } from './user-limit/add-user-limit/add-user-limit.component';
import { UserLimitService } from '../admin-user/user-limit/user-limit.service';

@NgModule({
  imports: [
    SharedModule,
    RuleConfigModule,
    AdminUserRoutingModule
  ],
  declarations: [AdminUserComponent, AdminDashboardComponent, UpdateUserLimitComponent, AddUserLimitComponent],
  providers: [UserLimitService]
})
export class AdminUserModule { }
