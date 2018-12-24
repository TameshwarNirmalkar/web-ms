import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import { ThemeModule } from './theme/theme.module';
import { CustomTranslateService } from '@srk/core';
import { MessageService } from '@srk/core';
import { ValidatorService } from './services/validator.service';
import { StoneDetailsService } from './services/stone-details.service';
import { PacketPanelService } from './services/packet-panel.service';
import { DownloadStonesService } from './services/download-stones.service';
import { RequestOptionsProvider } from './services/default-request-options.service';
import { ApiService } from './services/api.service';
import { UtilService } from './services/util.service';
import { AddNoteService } from './services/add-note.service';
import { ViewRequestService } from './services/view-request.service';
import { SharingModule } from './sharing.module';
import { BidToBuyDetailService } from './services/bid-to-buy-detail.service';
import { BidToBuyService } from './services/bid-to-buy.service';
import { DaypService } from './services/dayp.service';
import { DecimalPipe } from '@angular/common';
import { DeactivateGuardService } from './services/deactivate-guard.service';

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, HttpClientJsonpModule, TranslateModule, SharingModule
  ],
  declarations: [],
  providers: [CustomTranslateService, MessageService, RequestOptionsProvider,
    ValidatorService, PacketPanelService, StoneDetailsService, ApiService,
    UtilService, AddNoteService, DownloadStonesService, ViewRequestService,
    BidToBuyDetailService, BidToBuyService, DaypService, DecimalPipe, DeactivateGuardService],
  exports: [
    SharingModule,
    ThemeModule
  ]
})

export class SharedModule { }
