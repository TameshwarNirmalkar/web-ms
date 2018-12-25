import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { EventDetailsService } from '@srk/core';
import { ApiService, UtilService } from '@srk/shared';
import { MessageService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { NotifyService } from '@srk/core';
import { AuthService } from '@srk/core';
import { UserProfileService } from '@srk/core';
import { AddNoteService } from '@srk/shared';
import { BidToBuyService } from '@srk/shared';
import { ConfirmationService } from 'primeng/components/common/api';
import { CustomTranslateService } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';
import { LoggerService } from '@srk/core';
import { ThmConfirmOverlayComponent } from '@srk/shared';
import { DownloadStonesService } from '@srk/shared';
import * as _ from 'underscore';
@Component({
  selector: 'app-selected-stock-panel',
  templateUrl: './selected-stock-panel.component.html',
  styleUrls: ['./selected-stock-panel.component.scss']
})
export class SelectedStockPanelComponent implements OnInit, OnDestroy {
  @Input() stockObject: any;
  @Output() updateArray = new EventEmitter();
  @Output() addedNewStone = new EventEmitter();
  @Input() isPreSelectedTab: boolean;
  @Input() eventId: any;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @ViewChild(ThmConfirmOverlayComponent) thmConfirmOverlayComponent;
  @Output() refreshAllNotes = new EventEmitter();
  @Output() removeSelectedStones = new EventEmitter();
  @Output() stoneToAddPakcet = new EventEmitter();
  @Output() toggleSelectedTable = new EventEmitter();
  @Input() showPacket: any;
  @ViewChild('selectedStoneContainer') selectedStoneContainer;
  public resultArray = [];
  public selectedStones = [];
  public apiLink: any;
  public stoneStatusSubscription: any;
  public ddcStones = [];
  public definedDDCHour: any;
  public ddcOverlayVisible = false;
  public appointmentList = [];
  public appointmentPopup = false;
  public selectedEvent = [];
  public selectedColumnList: any;
  public addnoteOverlayVisible = false;
  public commentsOverlayVisible = false;
  public allNotesForStone: any;
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;
  public btbSelectedStones = [];
  public isBTBDataLoaded = false;
  public isBTBClosed = false;
  public btbOverlayVisible = false;
  public showLoadingSymbol = false;
  public selectedStonesObject = [];
  public toggleComparePopup = false;
  public selectedPanelconfirmOverlayVisible = false;
  public selectedDownloadType: any;
  public downloadPopOverVisible: any;
  public downloadOptions: any;
  public eventButtonInfo: any;
  public conversionRate: any;
  public isColumnExpanded = false;
  public timer;
  public columnWidth = 130;
  public isIconVisible: boolean = false;
  public gridHeight: any;
  public toggleTable = false;
  public allColumnWidth: any;
  public viewFinalPayableAndFinalOff = this.stoneDetailsService.showFinalPayableAndFinalOff();
  
  constructor(
    private eventDetailsService: EventDetailsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private apiService: ApiService,
    private notify: NotifyService,
    private authService: AuthService,
    private notesService: AddNoteService,
    private bidToBuyService: BidToBuyService,
    private userProfileService: UserProfileService,
    private stoneDetailsService: StoneDetailsService,
    private customTranslateSvc: CustomTranslateService,
    private logger: LoggerService,
    private downloadSvc: DownloadStonesService,
    private utilService: UtilService
  ) { }

  ngOnInit() {
    const priceSubscription = this.stoneDetailsService.getPriceInfoObservable().subscribe(res => {
      this.conversionRate = res.conversion_rate;
      if (priceSubscription) {
        priceSubscription.unsubscribe()
      }
    });
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.gridHeight = window.innerHeight - 325;
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.eventButtonInfo = this.eventDetailsService.getBooleanForRemoveButton();
    this.toggleSelectedTable.emit({ status: this.toggleTable });
  }

  toggleSelectedStoneTable(array) {
    array.toggleTable = !array.toggleTable;
    this.toggleSelectedTable.emit({ status: array.toggleTable });
  }

  isAllCheckboxSelected(array) {
    if (!array.isAllSelectedStoneSelected) {
      array.selectedStoneTable = [];
      array.selectedStoneArray = [];
      array.isAllStoneSelected = false;
      array.filteredSelectedStoneArray = [];
    }
    this.updateArray.emit({ array: array });
  }

  filterSelectedStones(array, id) {
    array.selectedStoneArray = array.filteredSelectedStoneArray;
    array = this.eventDetailsService.handleTableSelection(array, id);
    this.updateArray.emit({ array: array });
  }

  /*********** Basket ***************/
  addToMyBasket(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredSelectedStoneArray);
    this.apiLink = this.authService.getApiLinkForKey('add_basket_btn', '');
    const servicedata = '{"stone_ids":' + JSON.stringify(this.selectedStones) + '}';
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.apiService.postCall('SearchResultComponent:addToMyBasket', this.apiLink, servicedata).subscribe((response) => {
        this.notify.hideBlockUI();
        if (response !== undefined) {
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_NSF_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SS_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'basketRequested', stoneList: this.selectedStones });
            this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SNE_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          }
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('ERR_SAVE_STONE_BASKET');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.gridHeight = window.innerHeight - 325;
  }


  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  addToMySelection(array) {
    this.appointmentList = [];
    this.selectedEvent = [];
    this.showLoadingSymbol = true;
    this.eventDetailsService.fetchSubmittedAppointment(this.eventId).subscribe(res => {
      if (!res.error_status) {
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_EAD_200)
          && res.data.length > 0) {
          res.data.forEach(element => {
            const appointmentObj = {
              labelDate: element.appointment_date,
              labelFromTime: element.appointment_from_time,
              labelToTime: element.appointment_to_time,
              value: element.appointment_id,
              appointmentId: element.appointment_id,
              eventId: element.event_id,
              slotId: element.slot_id,
              slotType: element.slot_type,
              stoneIds: element.stone_ids,
              partyRemark: element.party_remark
            };
            this.appointmentList.push(appointmentObj);
          });
          this.viewAppointedListPopup(this.appointmentList, array);
        } else {
          this.messageService.showErrorGrowlMessage('NO_APPOINTMENTS');
        }
        this.showLoadingSymbol = false;
      }
    }, error => {
      this.showLoadingSymbol = false;
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  viewAppointedListPopup(list, array) {
    this.appointmentList = this.eventDetailsService.reorderEventDetails(this.appointmentList, 'labelDate');
    this.selectedStones = this.createDeepCopyArray(array.filteredSelectedStoneArray);
    this.appointmentPopup = true;
  }

  closeAppointmentOverlay() {
    this.appointmentPopup = false;
  }

  addStoneToEvent() {
    let viewShowList = {};
    if (this.selectedEvent.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.selectedEvent.forEach(element => {
        this.appointmentList.forEach(data => {
          if (data.appointmentId === Number(element)) {
            viewShowList = {
              'appointment_id': data.appointmentId,
              'event_id': data.eventId,
              'stone_ids': data.stoneIds,
              'from_time': data.labelFromTime,
              'to_time': data.labelToTime,
              'date': data.labelDate,
              'slot_id': data.slotId,
              'slot_type': data.slotType,
              'party_remark': data.partyRemark,
            };
            this.storeEventStones(viewShowList);
          }
        });
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_EVENT');
    }
  }

  storeEventStones(list) {
    let confirmedStones = [];
    const requestJson = {
      'appointment_id': list.appointment_id,
      'event_id': list.event_id,
      'stone_ids': this.selectedStones,
    };
    this.eventDetailsService.addStoneViewShow(JSON.stringify(requestJson), list.event_id).subscribe(res => {
      this.notify.hideBlockUI();
      if (!res.error_status) {
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_SUCCESS_VINS_200)) {
          confirmedStones = this.selectedStones;
          if (res.hasOwnProperty('data')) {
            if (res.data.hasOwnProperty('stone_ids') && res.data.stone_ids.length > 0) {
              confirmedStones = _.difference(this.selectedStones, res.data.stone_ids);
            }
          }
          this.notify.notifyStoneStateUpdated({ source: 'viewInShowRequested', stoneList: confirmedStones });
          list['stone_ids'] = list.stone_ids.concat(confirmedStones);
          this.updateAppointment(list);
          this.closeAppointmentOverlay();
          const params = { addedShowStones: confirmedStones.toString() };
          this.messageService.showDynamicSuccessGrowlMessage('SELECTED_EVENT_APPOINTMENT_SHOW', params);
        } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_VINS_ENVS_200)) {
          this.messageService.showErrorGrowlMessage(MessageCodes.EVENT_VINS_ENVS_200);
        } else {
          this.messageService.showErrorGrowlMessage(MessageCodes[res.code]);
        }
      }
    }, error => {
      this.notify.hideBlockUI();
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  updateAppointment(list) {
    const updatedJson = this.createAppointmentJson(list);
    this.notify.updateAppointmentList({ source: 'updateAppointment', appointmentObj: updatedJson });
  }

  createAppointmentJson(list) {
    const appointmentEntry = {
      'appointment_id': list.appointment_id,
      'appointment_date': list.date,
      'slot_id': list.slot_id,
      'event_id': list.event_id,
      'stone_ids': this.stoneDetailsService.removeDuplicateItemFromArray(list.stone_ids),
      'appointment_from_time': list.from_time,
      'appointment_to_time': list.to_time,
      'slot_type': list.slot_type,
      'party_remark': list.party_remark
    };
    return appointmentEntry;
  }

  applyDDC(array) {
    let countOfInvalideStone = 0;
    this.definedDDCHour = 0;
    this.selectedStones = this.createDeepCopyArray(array.filteredSelectedStoneArray);
    this.ddcStones = [];
    this.selectedStones.forEach(id => {
      array.stockTable.forEach(element => {
        if (element.stone_id === id && element.business_process) {
          this.ddcStones.push(element.stone_id);
        }
        if (element.business_process !== true) {
          countOfInvalideStone++;
        }
      });
    });
    if (this.ddcStones.length > 0 && countOfInvalideStone !== this.ddcStones.length) {
      this.ddcOverlayVisible = true;
    } else {
      if (countOfInvalideStone > 0) {
        this.messageService.showErrorGrowlMessage('SELECTED_STONE_NV_DDC');
      } else {
        this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
      }
    }
  }

  updateDDC(stoneData) {
    this.ddcStones = [];
    this.thmDdcOverlay.selectedDdcHour = 0;
    this.definedDDCHour = 0;
    this.ddcStones.push(stoneData.stone_id);
    if (stoneData.ddcHour > 0) {
      this.definedDDCHour = stoneData.ddcHour;
    }
    this.ddcOverlayVisible = true;
  }

  toggleDdcOverlay(e) {
    this.ddcOverlayVisible = e.visible;
  }

  addNoteForStone(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredSelectedStoneArray);
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.addnoteOverlayVisible = true;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleAddNoteOverlay(e) {
    if (e.forAddNote) {
      this.addnoteOverlayVisible = e.visible;
    } else {
      this.commentsOverlayVisible = e.visible;
    }
    if (e.noteDetil) {
      this.refreshAllNotes.emit({ status: true });
    }
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp();
    this.toggleMultimediaPopup = true;
    this.stoneMultimediaInfo = stoneInfo;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  ngOnDestroy() {
  }

  openBTB(data) {
    this.btbSelectedStones = [];
    this.isBTBDataLoaded = false;
    this.isBTBClosed = false;
    this.bidToBuyService.getBTBPopuStone(data.stone_id).subscribe((response) => {
      if (!response.is_btb_active) {
        this.isBTBClosed = true;
        this.isBTBDataLoaded = true;
        return;
      }

      if (response !== undefined) {
        if (!response.error_status) {
          this.btbSelectedStones = data;
          if (response.data) {
            response.data.forEach(element => {
              this.stoneDetailsService.getB2BPopupData(element, this.btbSelectedStones);
            });
          }
        }
        this.isBTBDataLoaded = true;
      }
    });
    this.btbOverlayVisible = true;
  }

  toggleBTBOverlay(e) {
    this.btbOverlayVisible = e.visible;
  }

  removeStoneFromPreSelected(array) {
    const removeStoneMessage = this.customTranslateSvc.translateString('REMOVE_STONE_PRESEELCTED');
    const removeStoneHeader = this.customTranslateSvc.translateString('Remove Stone');
    this.confirmationService.confirm({
      message: removeStoneMessage,
      header: removeStoneHeader,
      accept: () => {
        this.removeSelectedStones.emit({ stones: this.createDeepCopyArray(array.filteredSelectedStoneArray) });
      }
    });
  }

  addStoneDetailTab(data) {
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'stoneDtl', 'data': data });
  }

  addTwinStoneInfoTab(pairId) {
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'twinStoneDtl', 'data': pairId });
  }

  compareStone(array) {
    this.selectedStonesObject = [];
    this.toggleComparePopup = true;
    this.selectedStonesObject = this.createDeepCopyArray(array.selectedStoneTable);
  }

  refreshAllStoneNote() {
    this.refreshAllNotes.emit({ status: true });
  }

  closeCompareStoneOverlay() {
    this.selectedStonesObject = [];
    this.toggleComparePopup = false;
  }

  confirmSelectedDiamonds(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredSelectedStoneArray);
    if (this.selectedStones.length > 0) {
      this.logger.logInfo('SelectedStockPanelComponent', 'User action to confirm these stones :- ' + JSON.stringify(this.selectedStones));
      this.thmConfirmOverlayComponent.checkOrderDetails();
      this.thmConfirmOverlayComponent.verifyDiamondConfirmation(this.selectedStones);
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleSelectedPanelConfirmOverlay(e) {
    this.selectedPanelconfirmOverlayVisible = e.visible;
  }

  addToPacket(array) {
    if (array.selectedStoneTable && array.selectedStoneTable.length > 0) {
      this.stoneToAddPakcet.emit({ visible: false, object: array.selectedStoneTable });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  togglePacketOverlay(data) {
    this.stoneToAddPakcet.emit({ visible: true, object: [data] });
  }

  updatePacketDetails(event) {
    if (this.stockObject && this.stockObject.selectedStoneTable) {
      this.stockObject.selectedStoneTable = this.stoneDetailsService.setStonePacketCount(this.stockObject.selectedStoneTable);
      this.stockObject.selectedStoneTable = this.stoneDetailsService.updateStonePacketCount(event, this.stockObject.selectedStoneTable);
    }
  }

  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_show_btn');
    this.downloadPopOverVisible = true;
  }

  /*********** download result ***************/
  downloadResult(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredSelectedStoneArray);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.downloadStoneDetails(array.stockTable, this.selectedStones, this.selectedDownloadType);
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  sendExcelMail(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredSelectedStoneArray);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.mailStoneExcel(array.stockTable, this.selectedStones, 'Event list');
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneDetailsService.scrollLeft(this.selectedStoneContainer, '#selectedStoneContainerStock');
    } else if (params === 'right') {
      this.stoneDetailsService.scrollRight(this.selectedStoneContainer, '#selectedStoneContainerStock');
    }
  }

  scrollTableInInterval(params) {
    this.timer = setInterval(() => {
      this.scrollTable(params);
    }, 1)
  }

  stopScrolling() {
    clearInterval(this.timer);
  }

  scrollColumn() {
    this.isColumnExpanded = !this.isColumnExpanded;
    this.isIconVisible = !this.isIconVisible;
    this.stoneDetailsService.handleSortingOrder(this.selectedStoneContainer);
    if (this.isColumnExpanded) {
      const columns = JSON.parse(JSON.stringify(this.selectedStoneContainer.columns));
      columns[1].width = 275;
      this.selectedStoneContainer.columns = columns;
    } else {
      const columns = JSON.parse(JSON.stringify(this.selectedStoneContainer.columns));
      columns[1].width = 130;
      this.selectedStoneContainer.columns = columns;
    }
  }


  onCellPrepared(e, array) {
    this.stoneDetailsService.onCellPrepared(e, array.filteredSelectedStoneArray);
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }
}
