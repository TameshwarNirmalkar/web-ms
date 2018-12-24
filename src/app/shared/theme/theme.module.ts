
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckPermissionDirective } from '../directives/check-permission.directive';
import { ThmHeaderComponent } from './thm-header/thm-header.component';

import { ThmCardComponent } from './thm-card/thm-card.component';
import { ThmMenuComponent } from './thm-menu/thm-menu.component';
import { ThmDatePickerComponent } from './thm-date-picker/thm-date-picker.component';
import { OwlModule } from 'ngx-owl-carousel';
import { ThmTooltipComponent } from './thm-tooltip/thm-tooltip.component';
import { ThmRequestOverlayComponent } from './thm-request-overlay/thm-request-overlay.component';
import { ThmConfirmOverlayComponent } from './thm-confirm-overlay/thm-confirm-overlay.component';
import { ThmPacketPanelComponent } from './thm-packet-panel/thm-packet-panel.component';
import { ThmDdcOverlayComponent } from './thm-ddc-overlay/thm-ddc-overlay.component';
import { ThmBidToBuyOverlayComponent } from './thm-bid-to-buy-overlay/thm-bid-to-buy-overlay.component';
import { ThmAddnoteOverlayComponent } from './thm-addnote-overlay/thm-addnote-overlay.component';
import { ThmMultimediaPopupComponent } from './thm-multimedia-popup/thm-multimedia-popup.component';
import { ThmStoneDetailsComponent } from './thm-stone-detail/thm-stone-details.component';
import { ThmSelectedStonePanelComponent } from './thm-selected-stone-panel/thm-selected-stone-panel.component';
import { ThmEventCardComponent } from './thm-event-card/thm-event-card.component';
import { ThmKamCardComponent } from './thm-kam-card/thm-kam-card.component';
import { ThmPageSearchComponent } from './thm-page-search/thm-page-search.component';
import { ThmDownloadProgressBarComponent } from './thm-download-progress-bar/thm-download-progress-bar.component';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { SerenawaySurveyComponent } from './thm-survey/serenaway-survey-component';
import { ThmMediaIcon } from './thm-mediaicon/thm-media-overlay.component';
import {ThemeMediaIcon} from './thm-media-icon/thm-media-overlay.component';
import { ThmCommonMediaComponent } from './thm-common-media/thm-common-media.component';

// import { DxRangeSelectorModule } from 'devextreme-angular/ui/range-selector';
import { DxCircularGaugeModule } from 'devextreme-angular/ui/circular-gauge';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxTemplateModule } from 'devextreme-angular/core/template';
import { DxTabsModule } from 'devextreme-angular/ui/tabs';
import { DxPopoverModule } from 'devextreme-angular/ui/popover';
import { SafeStylePipe } from '../pipes/safe-style.pipe';
import { SafeUrlPipe } from '../pipes/safe-url.pipe';
import { CustomDatePipe } from '../pipes/custom-date.pipe';
import { ThmTimeoutComponent } from './thm-timeout/thm-timeout.component';
import { ThmStoneCompareComponent } from './thm-stone-compare/thm-stone-compare.component';
import { ThmTwinStoneDetailComponent } from './thm-twin-stone-detail/thm-twin-stone-detail.component';
import { CustomEventAccessHandler } from '../directives/custom-event-access-handler.directive';
import { ValidateNumberDigit } from '../directives/validate-number-digit.directive';
import { InitCapsPipe } from '../pipes/init-caps.pipe';
import { StoneMultimediaDetailDirective } from '../directives/stone-multimedia-detail.directive';
import { StoreAuditDirective } from '../directives/store-audit.directive';

import { TakeExamService } from './thm-survey/take-exam.service';
import { ThmHeaderService } from './thm-header/thm-header.service';
// import { SelectionPanelGridComponent } from './../../features/view-request/past-request/selection-panel-grid/selection-panel-grid.comopnent';
import { ThmSelectedGridComponent } from './thm-selected-stone-panel/thm-selected-infra-grid/thm-selected-infra-grid.component';

// import {
//   SharedModule,
//   InputTextModule,
//   InputTextareaModule,
//   PanelModule,
//   PasswordModule,
//   ButtonModule,
//   DialogModule,
//   DropdownModule,
//   RadioButtonModule,
//   SelectButtonModule,
//   DataTableModule,
//   MultiSelectModule,
//   TabViewModule,
//   GrowlModule,
//   CheckboxModule,
//   OverlayPanelModule,
//   CarouselModule,
//   CalendarModule,
//   TabMenuModule,
//   AccordionModule,
//   ConfirmDialogModule,
//   ConfirmationService,
//   InputSwitchModule,
//   TooltipModule,
//   ListboxModule,
//   GalleriaModule,
//   InplaceModule,
//   ProgressBarModule,
//   AutoCompleteModule,
//   EditorModule,
// } from 'primeng/primeng';


import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DataTableModule } from 'primeng/datatable';
import { MultiSelectModule } from 'primeng/multiselect';
import { GrowlModule } from 'primeng/growl';
import { CheckboxModule } from 'primeng/checkbox';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TooltipModule } from 'primeng/tooltip';
import { ListboxModule } from 'primeng/listbox';
import { GalleriaModule } from 'primeng/galleria';
import { ProgressBarModule } from 'primeng/progressbar';
import { DataListModule } from 'primeng/datalist';
import { ChipsModule } from 'primeng/chips';
import { TableModule } from 'primeng/table';
import { SharedModule } from 'primeng/primeng';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { KeyFilterModule } from 'primeng/keyfilter';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CarouselModule } from 'primeng/carousel';
import { TreeTableModule } from 'primeng/treetable';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { InplaceModule } from 'primeng/inplace';
import { EditorModule } from 'primeng/editor';


import { SharingModule } from '../sharing.module';
import { ThmFilterPopoverComponent } from './thm-filter-popover/thm-filter-popover.component';
import {ContextMenuComponent} from './context-menu/context-menu.component';
import { ThmInfraGridComponent } from 'app/shared/theme/thm-infra-grid/thm-infra-grid.component';

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
  EditorModule,
  DataListModule,
  ChipsModule,
  ToggleButtonModule,
  KeyFilterModule,
  ProgressSpinnerModule,
  TreeTableModule,
  ScrollPanelModule,
  TableModule
];

const THM_COMPONENTS = [ThmHeaderComponent, ThmCardComponent,
  ThmMenuComponent, ThmDatePickerComponent, ThmTooltipComponent,
  ThmRequestOverlayComponent, ThmConfirmOverlayComponent, ThmPacketPanelComponent, ThmDdcOverlayComponent,
  ThmBidToBuyOverlayComponent, ThmMultimediaPopupComponent, ThmAddnoteOverlayComponent, ThmStoneDetailsComponent,
  ThmSelectedStonePanelComponent, ThmTimeoutComponent, ThmStoneCompareComponent, ThmTwinStoneDetailComponent,
  ThmEventCardComponent, ThmKamCardComponent, ThmPageSearchComponent, ThmDownloadProgressBarComponent, ThmFilterPopoverComponent,
  SerenawaySurveyComponent, ThmMediaIcon, ThemeMediaIcon, ContextMenuComponent, ThmCommonMediaComponent, ThmSelectedGridComponent, ThmInfraGridComponent ];

const DEVEXTREME_COMPONENTS = [DxDataGridModule,
  DxCircularGaugeModule, DxTooltipModule, DxTemplateModule, DxTabPanelModule,
  DxTemplateModule, DxTabsModule, DxPopoverModule];

//  DxRangeSelectorModule
@NgModule({
  imports: [
    CommonModule, 
    RouterModule, 
    TranslateModule, 
    OwlModule, 
    FormsModule, 
    ReactiveFormsModule,
    ...DEVEXTREME_COMPONENTS, 
    ...NG_MODULES, 
    SharingModule],
  declarations: [...THM_COMPONENTS],
  exports: [
    ...THM_COMPONENTS,
    ...DEVEXTREME_COMPONENTS,
    OwlModule
  ],
  providers: [ConfirmationService, TakeExamService, ThmHeaderService],
})

export class ThemeModule { }
