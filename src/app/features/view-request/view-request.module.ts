import { PastInfraGridComponent } from './view-request-details/past-infra-grid/past-infra-grid.component';
import { VrGridComponent } from './vr-infra-grid/vr-infra-grid.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewRequestRoutingModule } from './view-request-routing.module';
import { ViewRequestComponent } from './view-request.component';
import { SharedModule } from '@srk/shared';
import { ViewRequestDetailsComponent } from './view-request-details/view-request-details.component';
import { ViewRequestService } from '@srk/shared';
import { PacketsModule } from '@srk/features/packets';
import { TodayInfraGridComponent } from './view-request-details/today-infra-grid/today-infra-grid.component';
import { UpcomingInfraGridComponent } from './view-request-details/upcoming-infra-grid/upcoming-infra-grid.component';

@NgModule({
  imports: [
    CommonModule,
    ViewRequestRoutingModule,
    SharedModule,
    PacketsModule
  ],
  declarations: [ViewRequestComponent,
    ViewRequestDetailsComponent,
    PastInfraGridComponent,
    TodayInfraGridComponent,
    UpcomingInfraGridComponent,
    VrGridComponent,
  ],
  providers: [ViewRequestService]
})
export class ViewRequestModule { }
