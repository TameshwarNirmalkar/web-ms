import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmationsComponent } from './confirmations.component';
import { MyConfirmationsComponent } from './my-confirmations/my-confirmations.component';
import { MyInvoicesComponent } from './my-invoices/my-invoices.component';
import { GenerateInvoicesComponent } from './generate-invoices/generate-invoices.component';
import { ConfirmationStoneDetailComponent } from './confirmation-stone-detail/confirmation-stone-detail.component';
import { RouterGuard } from '@srk/shared';

export const routes: Routes = [
  {
       path: '', component: ConfirmationsComponent, children: [
      { path: 'my-confirmations', component: MyConfirmationsComponent, canActivate: [RouterGuard], pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfirmationsRoutingModule { }
