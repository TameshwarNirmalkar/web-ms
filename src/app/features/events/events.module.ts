import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsComponent } from './events.component';
import { SharedModule } from '@srk/shared';
import { SearchModule } from '../search/search.module';

import { EventVenueDetailsComponent } from './event-venue-details/event-venue-details.component';
import { BookAppointmentComponent } from './book-appointment/book-appointment.component';
import { MyAppointmentComponent } from './my-appointment/my-appointment.component';
import { ShowAllStockComponent } from './show-all-stock/show-all-stock.component';
import { RecommendedStockComponent } from './recommended-stock/recommended-stock.component';
import { MySelectionStockComponent } from './my-selection-stock/my-selection-stock.component';
import { SelectedStockPanelComponent } from './selected-stock-panel/selected-stock-panel.component';
import { PacketsModule } from '@srk/features/packets';


@NgModule({
  imports: [
    CommonModule, SharedModule, SearchModule, PacketsModule
  ],
  declarations: [EventsComponent,
    EventVenueDetailsComponent,
    BookAppointmentComponent,
    MyAppointmentComponent,
    ShowAllStockComponent,
    RecommendedStockComponent,
    MySelectionStockComponent,
    SelectedStockPanelComponent]
})
export class EventsModule { }
