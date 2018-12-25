import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@srk/shared';
import { DdcRoutingModule } from './ddc-routing.module';
import { DdcService } from '@srk/shared';
import { DdcStonesDetailComponent } from './ddc-stones-detail/ddc-stones-detail.component';
import { PacketsModule } from '@srk/features/packets';
import { DdcComponent } from './ddc.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DdcRoutingModule,
    PacketsModule
  ],
  declarations: [DdcStonesDetailComponent, DdcComponent],
  providers: [DdcService]
})
export class DdcModule { }
