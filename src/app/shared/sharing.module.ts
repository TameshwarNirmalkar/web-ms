import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpClientJsonpModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import { ScrollToTopDirective } from './directives/scroll.directive';
import { EllipsisPipe } from './pipes/ellipsis.pipe';
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
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { CustomDatePipe } from './pipes/custom-date.pipe';
import { StoreAuditDirective } from './directives/store-audit.directive';
import { CustomEventAccessHandler } from './directives/custom-event-access-handler.directive';
import { ValidateNumberDigit } from './directives/validate-number-digit.directive';
import { InitCapsPipe } from './pipes/init-caps.pipe';
import { SafeStylePipe } from './pipes/safe-style.pipe';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { StoneMultimediaDetailDirective } from './directives/stone-multimedia-detail.directive';
import { CheckPermissionDirective } from './directives/check-permission.directive';

import {
  SharedModule,
  InputTextModule,
  InputTextareaModule,
  PanelModule,
  PasswordModule,
  ButtonModule,
  DialogModule,
  DropdownModule,
  RadioButtonModule,
  SelectButtonModule,
  DataTableModule,
  MultiSelectModule,
  TabViewModule,
  GrowlModule,
  CheckboxModule,
  OverlayPanelModule,
  CarouselModule,
  CalendarModule,
  TabMenuModule,
  AccordionModule,
  ConfirmDialogModule,
  ConfirmationService,
  InputSwitchModule,
  TooltipModule,
  ListboxModule,
  GalleriaModule,
  InplaceModule,
  ProgressBarModule,
  AutoCompleteModule,
  EditorModule
} from 'primeng/primeng';

const NG_MODULES = [
  SharedModule,
  InputTextModule,
  InputTextareaModule,
  PanelModule,
  PasswordModule,
  ButtonModule,
  DialogModule,
  DropdownModule,
  RadioButtonModule,
  DataTableModule,
  MultiSelectModule,
  TabViewModule,
  GrowlModule,
  CheckboxModule,
  SelectButtonModule,
  OverlayPanelModule,
  CarouselModule,
  CalendarModule,
  AccordionModule,
  TabMenuModule,
  ConfirmDialogModule,
  InputSwitchModule,
  TooltipModule,
  ListboxModule,
  GalleriaModule,
  InplaceModule,
  ProgressBarModule,
  AutoCompleteModule,
  EditorModule
];

@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, HttpClientJsonpModule, TranslateModule, ...NG_MODULES
  ],
  declarations: [
    ScrollToTopDirective, EllipsisPipe, SafeHtmlPipe, CheckPermissionDirective,
    CustomEventAccessHandler, ValidateNumberDigit, SafeUrlPipe, SafeStylePipe, CustomDatePipe,
    InitCapsPipe, StoreAuditDirective, StoneMultimediaDetailDirective
  ],
  providers: [
    CustomTranslateService, MessageService, RequestOptionsProvider,
    ValidatorService, PacketPanelService, StoneDetailsService, ApiService,
    UtilService, AddNoteService, DownloadStonesService, ConfirmationService, CustomDatePipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    TranslateModule,
    EllipsisPipe,
    SafeHtmlPipe,
    ScrollToTopDirective,
    CheckPermissionDirective,
    CustomEventAccessHandler,
    ValidateNumberDigit,
    SafeUrlPipe,
    SafeStylePipe,
    CustomDatePipe,
    InitCapsPipe,
    StoreAuditDirective,
    StoneMultimediaDetailDirective,
    ...NG_MODULES
  ]
})

export class SharingModule { }
