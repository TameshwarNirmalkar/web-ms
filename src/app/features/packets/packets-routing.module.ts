import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouterGuard } from '@srk/shared';
import { PacketsComponent } from './packets.component';

export const routes: Routes = [
  { path: '', redirectTo: 'packet-list', pathMatch: 'full' },
  { path: 'packet-list', component: PacketsComponent, canActivate: [RouterGuard], pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PacketsRoutingModule { }
