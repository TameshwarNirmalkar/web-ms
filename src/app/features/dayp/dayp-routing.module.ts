import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DaypComponent } from './dayp.component';
import { RouterGuard } from '@srk/shared';
import { DeactivateGuardService } from '@srk/shared';

export const routes: Routes = [
  { path: '', redirectTo: 'dayp-stones', pathMatch: 'full' },
  { path: 'dayp-stones', component: DaypComponent, canActivate: [RouterGuard], canDeactivate: [DeactivateGuardService], pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DaypRoutingModule { }
