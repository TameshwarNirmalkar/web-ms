import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouterGuard } from '@srk/shared';
import { DdcComponent } from './ddc.component';

export const routes: Routes = [
  { path: '', redirectTo: 'ddc-stones', pathMatch: 'full' },
  { path: 'ddc-stones', component: DdcComponent, canActivate: [RouterGuard], pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DdcRoutingModule { }
