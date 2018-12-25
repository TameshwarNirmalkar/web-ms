import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewRequestComponent } from './view-request.component';
import { RouterGuard } from '@srk/shared';

export const routes: Routes = [
  { path: '', redirectTo: 'view-request-list', pathMatch: 'full' },
  { path: 'view-request-list', component: ViewRequestComponent, canActivate: [RouterGuard], pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewRequestRoutingModule { }