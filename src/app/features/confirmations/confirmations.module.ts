import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationsComponent } from './confirmations.component';
import { ConfirmationsRoutingModule } from './confirmations-routing.module';
import { MyConfirmationsComponent } from './my-confirmations/my-confirmations.component';
import { SharedModule } from '@srk/shared';
import { MyInvoicesComponent } from './my-invoices/my-invoices.component';
import { GenerateInvoicesComponent } from './generate-invoices/generate-invoices.component';
import { ConfirmationStoneDetailComponent } from './confirmation-stone-detail/confirmation-stone-detail.component';
import { ConfirmationService } from './confirmation.service';
import { ConfirmationDetailsComponent } from './my-confirmations/confirmation-details/confirmation-details.component';

@NgModule({
  imports: [
    CommonModule,
    ConfirmationsRoutingModule,
    SharedModule
  ],
  declarations: [ConfirmationsComponent, MyConfirmationsComponent, MyInvoicesComponent,
                 GenerateInvoicesComponent, ConfirmationStoneDetailComponent, ConfirmationDetailsComponent],
  providers: [ConfirmationService]
})
export class ConfirmationsModule { }
