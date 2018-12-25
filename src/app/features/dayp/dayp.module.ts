import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '@srk/shared';
import {SearchModule} from '../search/search.module';
import {DaypService} from '@srk/shared';
import {DaypComponent} from './dayp.component';
import {SelectedDaypStonePanelComponent} from './selected-dayp-stone-panel/selected-dayp-stone-panel.component';
import {DaypBasketComponent} from './dayp-basket/dayp-basket.component';
import {DaypMySubmittedComponent} from './dayp-my-submitted/dayp-my-submitted.component';
import {DaypPreSelectedComponent} from './dayp-pre-selected/dayp-pre-selected.component';
import {DaypSearchComponent} from './dayp-search/dayp-search.component';
import {DaypRoutingModule} from './dayp-routing.module';
import {PacketsModule} from '@srk/features/packets';
import {DecimalPipe} from '@angular/common';
import {DaypGridComponent} from './dayp-grid/dayp-grid.component';
import { DaypMySubmittedGridComponent } from './dayp-my-submitted-grid/dayp-my-submitted-grid.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DaypRoutingModule,
    SearchModule,
    PacketsModule
  ],
  declarations: [
    DaypComponent,
    SelectedDaypStonePanelComponent,
    DaypBasketComponent,
    DaypMySubmittedComponent,
    DaypPreSelectedComponent,
    DaypSearchComponent,
    DaypGridComponent,
    DaypMySubmittedGridComponent
  ],
  providers: [DaypService, DecimalPipe]
})

export class DaypModule {
}
