import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@srk/shared';
import { HoldlistRoutingModule } from './hold-list-routing.module';
import { HoldListComponent } from './hold-list.component';
import { HoldListDetailsComponent } from './hold-list-details/hold-list-details.component';
import { HoldListService } from './hold-list.service';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    HoldlistRoutingModule
  ],
  declarations: [HoldListComponent, HoldListDetailsComponent],
  providers: [HoldListService]
})

export class HoldListModule { }
