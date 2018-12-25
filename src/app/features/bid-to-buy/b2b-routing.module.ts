import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BidToBuyComponent } from './bid-to-buy.component';
import { RouterGuard, DeactivateGuardService } from '@srk/shared';

export const routes: Routes = [
  { path: '', redirectTo: 'b2b-stones', pathMatch: 'full' },
  { path: 'b2b-stones', component: BidToBuyComponent, canActivate: [RouterGuard], canDeactivate: [DeactivateGuardService], pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class B2bRoutingModule { }

