import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacketsModule } from '../packets/packets.module';
import { B2bRoutingModule } from './b2b-routing.module';
import { BidToBuyComponent } from './bid-to-buy.component';
import { BidToBuyService } from '@srk/shared';
import { SelectedBtbPanelComponent } from './selected-btb-panel/selected-btb-panel.component';
import { BtbBasketComponent } from './btb-basket/btb-basket.component';
import { BtbSubmissionComponent } from './btb-submission/btb-submission.component';
import { BtbAllStonesComponent } from './btb-all-stones/btb-all-stones.component';
import { SharedModule } from '@srk/shared';
import { SearchModule } from '../search/search.module';
import { BtbResultComponent } from './btb-result/btb-result.component';
import { BtbInfraGridComponent } from './btb-infra-grid/btb-infra-grid.component';
import { BtbResultInfraGridComponent } from './btb-result-infra-grid/btb-result-infra-grid.component';


@NgModule({
  imports: [
    CommonModule, SharedModule, B2bRoutingModule, SearchModule, PacketsModule
  ],
  declarations: [BidToBuyComponent,
    SelectedBtbPanelComponent,
    BtbBasketComponent,
    BtbSubmissionComponent,
    BtbAllStonesComponent,
    BtbInfraGridComponent,
    BtbResultInfraGridComponent,
    BtbResultComponent],
  providers: [BidToBuyService]
})
export class BidToBuyModule { }
