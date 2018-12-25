import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@srk/shared';
import { WebUserComponent } from './web-user.component';
import { WebUserRoutingModule } from './web-user-routing.module';
import { WebDynamicDashboardComponent } from './web-dashboard/web-dynamic-dashboard.component';
// import { SearchModule } from '@srk/features/search';
// import { TwinDiamondsModule } from '@srk/features/twin-diamonds';
import { WebUserService } from './web-user.service';
import { WebDashboardService } from './web-dashboard/web-dashboard.service';
import { DragulaModule } from 'ng2-dragula';
import { PrimaryDashboardLayoutComponent } from './web-dashboard/primary-dashboard-layout/primary-dashboard-layout.component';
import { SecondaryDashboardLayoutComponent } from './web-dashboard/secondary-dashboard-layout/secondary-dashboard-layout.component';
import { DashboardDirective } from './web-dashboard/dashboard.directive';
import { CardItemsPipe } from './web-dashboard/primary-dashboard-layout/card-items.pipe';
import { WebSearchComponent } from './web-search/web-search.component';
import { SavedSearchesTableComponent } from './web-dashboard/primary-dashboard-layout/saved-searches-table.component';
import { ApplicationStorageService } from '@srk/core';
// import { PacketsModule } from '@srk/features/packets';
// import { EventsModule } from '@srk/features/events';
// import { ChatBotModule } from '@srk/features/chat-bot';
import { WebTwinDiamondsComponent } from './web-twin-diamonds/web-twin-diamonds.component';
import { StompService } from '@srk/shared';
import { ExclusiveStoneMovieCardComponent } from './web-dashboard/primary-dashboard-layout/exclusive-stone-movie-card.component';

@NgModule({
  imports: [
    SharedModule,
    WebUserRoutingModule,
    // SearchModule,
    // TwinDiamondsModule,
    DragulaModule,
    ReactiveFormsModule,
    //// PacketsModule,
    // EventsModule,
    // ChatBotModule
  ],
  declarations: [
    WebUserComponent,
    WebDynamicDashboardComponent,
    PrimaryDashboardLayoutComponent,
    SecondaryDashboardLayoutComponent,
    DashboardDirective,
    CardItemsPipe,
    WebSearchComponent,
    SavedSearchesTableComponent,
    ExclusiveStoneMovieCardComponent,
    WebTwinDiamondsComponent
  ],
  providers: [WebUserService, WebDashboardService, ApplicationStorageService, StompService]
})

export class WebUserModule { }
