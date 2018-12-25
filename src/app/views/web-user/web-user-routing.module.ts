import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WebUserComponent } from './web-user.component';
import { WebDynamicDashboardComponent } from './web-dashboard/web-dynamic-dashboard.component';
import { RouterGuard } from '@srk/shared';
import { WebSearchComponent } from './web-search/web-search.component';
// import { SearchModule } from '@srk/features/search';
import { SpecificSearchComponent } from '@srk/features/search';
import { SavedSearchComponent } from '@srk/features/search';
import { SearchResultComponent } from '@srk/features/search';
// import { PacketsComponent } from '@srk/features/packets';
import { RecommendationsComponent } from '@srk/features/recommendations';
import { EventsComponent } from '@srk/features/events';
import { UserProfileService } from '@srk/core';
import { WebTwinDiamondsComponent } from './web-twin-diamonds/web-twin-diamonds.component';
import { RecommendedTwinDiamondsComponent } from '@srk/features/twin-diamonds';
import { YouMayLikeTwinDiamondsComponent } from '@srk/features/twin-diamonds';
import { YourMarkedAsTwinDiamondsComponent } from '@srk/features/twin-diamonds';
import { EventDetailsService } from '@srk/core';

export const routes: Routes = [
  {
    path: '', component: WebUserComponent,
    resolve: {
      settings: UserProfileService,
      eventDetails: EventDetailsService
    },
    children: [
      {
        path: '', redirectTo: 'dashboard', pathMatch: 'full'
      },
      { path: 'dashboard', component: WebDynamicDashboardComponent, canActivate: [RouterGuard], pathMatch: 'full' },
      {
        path: 'search', component: WebSearchComponent, children: [
          { path: '', redirectTo: 'specific-search', canActivate: [RouterGuard], pathMatch: 'full' },
          { path: 'specific-search', component: SpecificSearchComponent, canActivate: [RouterGuard], pathMatch: 'full' },
          { path: 'saved-search', component: SavedSearchComponent, canActivate: [RouterGuard], pathMatch: 'full' },
          { path: 'search-result', component: SearchResultComponent, canActivate: [RouterGuard], pathMatch: 'full' },
          { path: 'new-search', component: SpecificSearchComponent, canActivate: [RouterGuard], pathMatch: 'full' },
          { path: 'modify-search', component: SpecificSearchComponent, canActivate: [RouterGuard], pathMatch: 'full' },
          { path: 'newuploaded', component: SearchResultComponent, canActivate: [RouterGuard], pathMatch: 'full' },
        ]
      },
      {
        path: 'twin-diamonds', component: WebTwinDiamondsComponent, children: [
          { path: '', redirectTo: 'twin-diamonds-search', canActivate: [RouterGuard], pathMatch: 'full' },
          { path: 'twin-diamonds-search', component: SpecificSearchComponent,
          canActivate: [RouterGuard], pathMatch: 'full' },
          { path: 'recommended-twin-diamonds', component: RecommendedTwinDiamondsComponent,
          canActivate: [RouterGuard], pathMatch: 'full' },
          { path: 'you-may-like-twin-diamonds', component: YouMayLikeTwinDiamondsComponent,
          canActivate: [RouterGuard], pathMatch: 'full' },
          { path: 'your-marked-as-twin-diamonds', component: YourMarkedAsTwinDiamondsComponent,
          canActivate: [RouterGuard], pathMatch: 'full' },
          { path: 'twin-diamonds-result', component: SearchResultComponent, canActivate: [RouterGuard], pathMatch: 'full' },
          { path: 'new-search', component: SpecificSearchComponent, canActivate: [RouterGuard], pathMatch: 'full' },
          { path: 'modify-search', component: SpecificSearchComponent, canActivate: [RouterGuard], pathMatch: 'full' }
        ]
      },
      { path: 'dayp', loadChildren: 'app/lazy-dayp.module#LazyDaypModule' },
      { path: 'bid-to-buy', loadChildren: 'app/lazy-b2b.module#LazyBidToBuyModule' },
      { path: 'event/:name', component: EventsComponent, canActivate: [RouterGuard], pathMatch: 'full' },
      { path: 'recommendation', component: RecommendationsComponent, canActivate: [RouterGuard], pathMatch: 'full' },
      { path: 'basket', loadChildren: 'app/lazy-basket.module#LazyBasketModule' },
      { path: 'packet', loadChildren: 'app/lazy-packets.module#LazyPacketsModule' },
      { path: 'ddc', loadChildren: 'app/lazy-ddc.module#LazyDdcModule' },
      { path: 'hold-list', loadChildren: 'app/lazy-hold.module#LazyHoldModule' },
      { path: 'view-request', loadChildren: 'app/lazy-view-request.module#LazyViewRequestModule' },
      { path: 'confirmations', loadChildren: 'app/lazy-confirmations.module#LazyConfirmationsModule' },
      { path: 'user-profile', loadChildren: 'app/lazy-user-profile.module#LazyUserProfileModule' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [RouterGuard]
})
export class WebUserRoutingModule { }
