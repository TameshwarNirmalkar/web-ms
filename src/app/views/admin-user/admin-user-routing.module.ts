import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminUserComponent } from './admin-user.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AddUserLimitComponent } from './user-limit/add-user-limit/add-user-limit.component';
import { UpdateUserLimitComponent } from './user-limit/update-user-limit/update-user-limit.component';

export const routes: Routes = [
  {
    path: '', component: AdminUserComponent, children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent, pathMatch: 'full' },
      { path: 'add-user-rule', component: AddUserLimitComponent, pathMatch: 'full' },
      { path: 'view-user-rule', component: UpdateUserLimitComponent, pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class AdminUserRoutingModule { }
