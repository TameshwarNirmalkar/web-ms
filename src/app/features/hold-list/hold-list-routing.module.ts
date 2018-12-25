import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HoldListComponent } from './hold-list.component';
import { RouterGuard } from '@srk/shared';

export const routes: Routes = [
  { path: '', redirectTo: 'hold-list-stones', pathMatch: 'full' },
  { path: 'hold-list-stones', component: HoldListComponent, canActivate: [RouterGuard], pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HoldlistRoutingModule { }