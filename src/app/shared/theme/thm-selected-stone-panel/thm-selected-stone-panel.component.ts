import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy, HostListener, OnChanges } from '@angular/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { MessageService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '@srk/core';
import { LoggerService } from '@srk/core';
import { ThmConfirmOverlayComponent } from '../thm-confirm-overlay/thm-confirm-overlay.component';
import { DdcService } from '../../services/ddc.service';
import { UserProfileService } from '@srk/core';
import { StoneDetailsService } from '../../services/stone-details.service';
import { ApplicationStorageService } from '@srk/core';
import { DownloadStonesService } from '../../services/download-stones.service';
import { BidToBuyService } from '../../services/bid-to-buy.service';
import { DaypEventResolverService } from '@srk/core';
import { AddNoteService } from '../../services/add-note.service';
import { DaypService } from '../../services/dayp.service';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'underscore';
import { EventDetailsService } from '@srk/core';
import { UtilService } from '../../services/util.service';
import { ViewRequestService } from 'app/shared/services/view-request.service';
import { ThmSelectedGridComponent } from './thm-selected-infra-grid/thm-selected-infra-grid.component';

declare var $: any;


@Component({
  selector: 'thm-selected-stone-panel',
  templateUrl: './thm-selected-stone-panel.component.html',
  styleUrls: ['./thm-selected-stone-panel.component.scss'],
  providers: [DdcService, ThmSelectedGridComponent]
})
export class ThmSelectedStonePanelComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild(ThmConfirmOverlayComponent) thmConfirmOverlayComponent;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @ViewChild('selectedPacketStoneTable') selectedPacketStoneTable;
  @ViewChild('thmSelectedStoneContainer') thmSelectedStoneContainer;
  @Input() stoneObj: any;
  @Output() updateArray = new EventEmitter();
  @Output() viewRequestRemoveStone = new EventEmitter();
  @Output() releaseHoldStones = new EventEmitter();
  @Output() refreshAllNotes = new EventEmitter();
  @Output() displayStoneDetails = new EventEmitter();
  @Input() showButtonList: any;
  @Input() isHold: boolean;
  @Input() vrSelectedPanel: boolean;
  @Output() stoneToAddPakcet = new EventEmitter();
  @Output() appointmentRemoveStones = new EventEmitter();
  @Output() basketRemoveStone = new EventEmitter();
  @Input() showPacket: boolean;
  @Input() pageName: any;
  @Output() toggleSelectedTable = new EventEmitter();
  @Output() submitStone = new EventEmitter();


  public toggleTable = false;
  public selectedStones = [];
  public apiLink: any;
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;
  public confirmOverlayVisible = false;
  public addnoteOverlayVisible = false;
  public commentsOverlayVisible = false;
  public requestPopupVisible = false;
  public allNotesForStone = [];
  public ddcStones = [];
  public definedDDCHour: any;
  public ddcOverlayVisible = false;
  public selectedColumnList: any;
  public discountColumnVisible = [];
  public downloadOptions: any[];
  public downloadPopOverVisible = false;
  public selectedDownloadType: any;
  public selectedStonesObject = [];
  public toggleComparePopup = false;
  public compareOverlayWidth: any;
  public compareOverlayHeight: any;
  public conversionRate: any;
  public btbOverlayVisible = false;
  public isBTBDataLoaded = false;
  public isBTBClosed = false;
  public btbSelectedStones = [];
  public isPreDaypActive = false;
  public isDaypPermissible = false;
  public isPreSelectEventPermissible = false;
  public eventDetails: any;
  public packetSubscription: any;
  public timer;
  public isColumnExpanded = false;
  public columnWidth = 130;
  public isIconVisible: boolean = false;
  public allColumnWidth: any;
  public gridHeight: any;
  public isVisiableInfraGrid: boolean = false;
  public colorLegendFilterValue: String[] = [];
  public stoneConfirmedSubscription: Subscription;

  public iconOverlayXPosition: Number;
  public iconOverlayYPosition: Number;
  public displayIconOverlay: boolean = false;
  public iconDisplayStoneObject: any;


  public viewFinalPayableAndFinalOff = this.stoneDetailsService.showFinalPayableAndFinalOff();
  constructor(
    private messageService: MessageService,
    private apiService: ApiService,
    private ddcSvc: DdcService,
    private notify: NotifyService,
    private logger: LoggerService,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private stoneDetailsService: StoneDetailsService,
    private appStore: ApplicationStorageService,
    private downloadSvc: DownloadStonesService,
    private bidToBuyService: BidToBuyService,
    private daypSvc: DaypService,
    private notesService: AddNoteService,
    private eventDetailsService: EventDetailsService,
    private utilService: UtilService,
    private viewRequestService: ViewRequestService,
    private thmSelectedGridComponent: ThmSelectedGridComponent) { }


  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.isVisiableInfraGrid = this.vrSelectedPanel;
    if (window.location.href.indexOf('packet') > -1) {
      const rate = this.stoneDetailsService.getPriceExportValue();
      this.conversionRate = rate.conversion_rate;
    } else {
      const priceSubscription = this.stoneDetailsService.getPriceInfoObservable().subscribe(res => {
        this.conversionRate = res.conversion_rate;
        if (priceSubscription) {
          priceSubscription.unsubscribe();
        }
      });
    }
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    if (this.pageName === "todayVisit") {
      this.gridHeight = window.innerHeight - 295;
    } else
      if (location.pathname.indexOf("event") > 0) {
        this.gridHeight = window.innerHeight - 310;
      }
      else {
        this.gridHeight = window.innerHeight - 265;
      }
    this.compareOverlayWidth = window.innerWidth - 40;
    this.compareOverlayHeight = window.innerHeight - 40;
    this.isPreDaypActive = this.daypSvc.getPreDaypStatus();
    if (this.isPreDaypActive === undefined) {
      this.daypSvc.checkPreDaypStatus().subscribe(res => {
        if (!res.error_status && MessageCodesComparator.AreEqual(res.code, MessageCodes.DAYP_EF_200)) {
          this.isPreDaypActive = res.data.isDAYPEventOn;
        }
      });
    }
    if (this.appStore.getData('toggleTable')) {
      this.toggleTable = this.appStore.getData('toggleTable');
    }
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.eventDetailsService.checkPreEventSelectionPermission().subscribe(res => {
      let flag = false;
      if (!res.error_status) {
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_SEL_PFS_200)) {
          flag = true;
          if (res.hasOwnProperty('data')) {
            this.eventDetails = this.eventDetailsService.reorderEventDetails(res.data, 'button_order');
          }
        } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_NEF_200)) {
          flag = false;
        }
      }
      this.isPreSelectEventPermissible = flag;
    }, error => {
      this.isPreSelectEventPermissible = false;
    });
    this.toggleSelectedTable.emit({ status: this.toggleTable });
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      if (res.source) {
        this.updateStoneStateDetails(res);
      }
    });
  }

  ngOnChanges() {
    if (this.stoneObj && this.stoneObj.selectedStoneArray && this.stoneObj.selectedStoneArray.length === 0) {
      this.toggleTable = false;
      this.toggleSelectedTable.emit({ status: false });
      this.appStore.store('toggleTable', false);
      this.discountColumnVisible = this.stoneDetailsService.getColumnsVisibleFlag();
    }
  }

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    let stoneArray = [];
    stoneArray['table'] = this.stoneObj.selectedStoneArray;
    if (stoneList && this.stoneObj.selectedStoneArray) {

      const updatedData = this.viewRequestService.updateTableStoneDetails(stoneArray, stoneList, res);
      this.stoneObj.selectedStoneArray = stoneArray['table'];
      this.thmSelectedGridComponent.transformDataForGrid(this.stoneObj.selectedStoneArray);
      $('#gridselectedStoneGrid').igGrid('dataSourceObject', this.thmSelectedGridComponent.transformDataForGrid(this.stoneObj.selectedStoneArray)).igGrid('dataBind');
    }
  }

  toggleSelectedStoneTable() {
    if (this.stoneObj.selectedStoneArray.length > 0) {
      this.toggleTable = !this.toggleTable;
      this.toggleSelectedTable.emit({ status: this.toggleTable });
      this.appStore.store('toggleTable', this.toggleTable);
      this.discountColumnVisible = this.stoneDetailsService.getColumnsVisibleFlag();
    } else {
      this.toggleTable = false;
    }
  }

  isAllCheckboxSelected(array) {
    if (!array.isAllSelectedStoneSelected) {
      array.selectedStones = [];
      array.selectedStoneArray = [];
      this.stoneObj.selectedStoneArray = [];
      array.toggleTableDisplay = this.toggleTable = false;
    }
    this.updateArray.emit({ array: array });
  }

  filterSelectedStones(array, id) {

    array.selectedStoneArray.forEach((selectedStone) => {
      if (selectedStone.stone_id === id) {
        const i = array.selectedStoneArray.indexOf(selectedStone);
        array.selectedStoneArray.splice(i, 1);
      }
      if (array.selectedStoneArray.length === 0) {
        array.toggleTableDisplay = this.toggleTable = false;
      }
    });
    this.updateArray.emit({ array: array });
  }

  filterSelectedStonesOfInfraGrid(array, data) {
    if (Array.isArray(data)) {

      array.selectedStones = [];
      this.stoneObj.selectedStoneArray = [];

    } else {

      if (data.added === false) {

        array.selectedStones = array.selectedStones.filter(elm => { return elm !== data.stoneId });
        // Hacky Way Maybe but did not want to create a whole another component for just one line of code.
        $('#gridselectedStoneGrid').igGridUpdating('deleteRow', data.stoneId);

      }

    }
    array.selectedStoneArray.forEach((selectedStone) => {
      if (selectedStone.stone_id === data.stoneId) {
        const i = array.selectedStoneArray.indexOf(selectedStone);
        array.selectedStoneArray.splice(i, 1);
      }
      if (array.selectedStoneArray.length === 0) {
        array.toggleTableDisplay = this.toggleTable = false;
      }
    });
    if (this.stoneObj.selectedStones && this.stoneObj.selectedStones.length === 0) {
      this.toggleTable = false;
      this.toggleSelectedTable.emit({ status: this.toggleTable });
    }
    this.updateArray.emit({ array: array });
    if (array && array.selectedStoneArray && array.selectedStoneArray.length === 0) {
      array.toggleTableDisplay = this.toggleTable = false;
    }
  }

  /*********** Basket ***************/
  addToMyBasket(array) {
    this.selectedStones = this.createDeepCopyArray(array.selectedStones);
    this.apiLink = this.authService.getApiLinkForKey('add_basket_btn', '');
    const servicedata = '{"stone_ids":' + JSON.stringify(_.uniq(this.selectedStones)) + '}';
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.apiService.postCall('ThmSelectedStonePanelComponent:addToMyBasket', this.apiLink, servicedata).subscribe((response) => {
        this.notify.hideBlockUI();
        if (response !== undefined) {
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_NSF_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SS_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'basketRequested', stoneList: this.selectedStones });
            this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
            this.submitStone.emit({ gridRebind: array.selectedStoneArray });
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
  /*******************************************/


  /*********** request hold ***************/
  requestHold(array) {
    this.selectedStones = this.createDeepCopyArray(array.selectedStones);
    this.apiLink = this.authService.getApiLinkForKey('request_hold_btn', '');
    const servicedata = '{"stone_ids":' + JSON.stringify(_.uniq(this.selectedStones)) + '}';
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.apiService.postCall('ThmSelectedStonePanelComponent:addToMyHold', this.apiLink, servicedata).subscribe((response) => {
        this.notify.hideBlockUI();
        if (response !== undefined) {
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_SC_DUH_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_SC_ISH_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'holdRequested', stoneList: this.selectedStones, status: true });
            this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
            this.submitStone.emit({ gridRebind: array.selectedStoneArray });
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_PARTIAL_HOLD_201)) {
            const stoneIds = response.data.stone_ids;
            const differenceStones = _.difference(this.selectedStones, stoneIds);
            this.notify.notifyStoneStateUpdated({ source: 'holdRequested', stoneList: differenceStones, status: true });
            const params = { holdStones: differenceStones.toString() };
            this.messageService.showDynamicSuccessGrowlMessage('PARTIAL_HOLD_APPLIED', params);
          }
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  /************************************************/

  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp(stoneInfo);
    this.toggleMultimediaPopup = true;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  /*********** confirmations ***************/
  confirmDiamonds(array) {
    const stoneIds = _.uniq(this.createDeepCopyArray(array.selectedStones));
    if (stoneIds.length > 0) {
      this.logger.logInfo('ThmSelectedStonePanelComponent', 'User action to confirm these stones :- ' + JSON.stringify(stoneIds));
      this.thmConfirmOverlayComponent.checkOrderDetails();
      this.thmConfirmOverlayComponent.verifyDiamondConfirmation(stoneIds);
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleConfirmOverlay(e) {
    this.confirmOverlayVisible = e.visible;
  }
  /**************************************************/

  /*****************ADD NOTES************************/
  addNoteForStone(array) {
    this.selectedStones = _.uniq(this.createDeepCopyArray(array.selectedStones));
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.addnoteOverlayVisible = true;
      this.submitStone.emit({ gridRebind: array.selectedStoneArray });
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
  /****************************************************/

  /**********VIEW REQUEST*********************************/
  toggleOverlay(e) {
    this.requestPopupVisible = e.visible;
  }

  toggleViewRequestOverlay(array) {
    this.apiLink = this.authService.getApiLinkForKey('view_request_btn', '');
    this.selectedStones = _.uniq(this.createDeepCopyArray(array.selectedStones));
    if ((this.selectedStones).length > 0) {
      this.requestPopupVisible = !this.requestPopupVisible;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  /****************************************************/

  /*********** ddc ***************/
  applyDDC(array) {
    let countOfInvalideStone = 0;
    this.selectedStones = _.uniq(this.createDeepCopyArray(array.selectedStones));
    this.ddcStones = [];
    this.definedDDCHour = 0;
    this.selectedStones.forEach((value) => {
      array.selectedStoneArray.forEach(stone => {
        if (stone.stone_id === value && stone.business_process) {
          this.ddcStones.push(stone.stone_id);
        }
        if (stone.business_process !== true) {
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
    this.selectedStones = [];
  }

  updateSelectedStoneDDC(array) {
    this.selectedStones = this.createDeepCopyArray(array.selectedStones);
    if (this.selectedStones.length > 0) {
      this.updateDDcHours(this.selectedStones);
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  updateDDcHours(stoneList) {
    this.ddcStones = [];
    this.thmDdcOverlay.selectedDdcHour = 0;
    this.definedDDCHour = 0;
    stoneList.forEach(stone => {
      this.ddcStones.push(stone);
    });
    this.ddcOverlayVisible = true;
  }

  removeDDC(array) {
    this.selectedStones = this.createDeepCopyArray(array.selectedStones);
    if (this.selectedStones.length > 0) {
      this.removeDDCFromStone(this.selectedStones);
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  removeDDCFromStone(stoneList) {
    if (stoneList.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.ddcSvc.removeDDCFromStone(stoneList).subscribe((response) => {
        if (response !== undefined) {
          this.notify.hideBlockUI();
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_RM_DDC_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'ddcRequested', stoneList: stoneList, status: 'Removed', hour: 0 });
            this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
          } else {
            this.messageService.showErrorGrowlMessage('ERR_REMOVE_STONE_DDC');
          }
        }
      }, error => {
        this.messageService.showErrorGrowlMessage('ERR_REMOVE_STONE_DDC');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  addStonesToPreDayp(stoneList) {
    this.selectedStones = _.uniq(this.createDeepCopyArray(stoneList.selectedStones));
    if (this.selectedStones.length > 0) {
      this.daypSvc.addToPreDAYPSelection(this.selectedStones).subscribe((response) => {
        if (response && !response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_ASDE_200)) {
          this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
        } else if (response && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_DNA_200)) {
          this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
        } else if (response && response.error_status) {
          this.messageService.showErrorGrowlMessage('ERR_SAVE_STONE_DAYP');
        }
      }, error => {
        this.messageService.showErrorGrowlMessage('ERR_SAVE_STONE_DAYP');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  /****************************************************/

  /************REMOVE VIEW REQUEST STONE*****************/
  removeStonesFromList(array) {
    if (array.selectedStones.length > 0) {
      this.viewRequestRemoveStone.emit({ stones: _.uniq(this.createDeepCopyArray(array.selectedStones)) });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  /****************************************************/

  /************RELEASE HOLD STONES*****************/
  removeHold(array) {
    if (array.selectedStones.length > 0) {
      this.releaseHoldStones.emit({ stones: this.createDeepCopyArray(array.selectedStones) });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  /****************************************************/


  /*****************ADD NEW STONE TAB***********************/
  addStoneDetailTab(data) {
    this.displayStoneDetails.emit({ type: 'stoneDtl', data: data });
  }

  addStoneInfoTab(data) {
    data = this.stoneObj.selectedStoneArray.find(elm => { return elm._id === data; });
    this.displayStoneDetails.emit({ type: 'stoneDtl', data: data });
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'stoneDtl', 'data': data });

  }

  addTwinStoneInfoTab(pairId) {
    this.displayStoneDetails.emit({ type: 'twinStoneDtl', data: pairId });
  }

  stoneMediaIconPanel(event) {
    this.iconDisplayStoneObject = event.stoneId;
    this.iconOverlayXPosition = event.eventObject.pageX;
    this.iconOverlayYPosition = event.eventObject.pageY;
    this.displayIconOverlay = true;

  };

  /****************************************************/
  ngOnDestroy() {
    this.toggleSelectedTable.emit({ status: false });
    this.appStore.remove('toggleTable');
    this.stoneConfirmedSubscription.unsubscribe();
  }

  /********************SHOWS OPTIONS ON CLICK OF DOWNLOAD ICON****************************/
  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    const pageName = window.location.href;
    if (pageName.indexOf('event') > -1) {
      this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_show_btn');
    } else {
      this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_regular_btn');
    }
    this.downloadPopOverVisible = true;
  }

  downloadResult(array) {
    this.selectedStones = _.uniq(this.createDeepCopyArray(array.selectedStones));
    if (this.selectedStones.length > 0) {
      this.downloadSvc.downloadStoneDetails(array.selectedStoneArray, this.selectedStones, this.selectedDownloadType);
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  /****************************************************/

  /*****************STONE COMPARE******************/
  compareStone(array) {
    this.selectedStonesObject = [];
    this.toggleComparePopup = true;
    this.selectedStonesObject = this.createDeepCopyArray(array.selectedStoneArray);
  }

  refreshAllStoneNote(array) {
    this.refreshAllNotes.emit({ status: true });
    this.notesService.getCommentListforStoneIds(array.selectedStoneArray).subscribe((response) => {
      array.selectedStoneArray = response;
    }, error => {
      this.messageService.showErrorGrowlMessage('ERR_FETCH_EXTRA_STONE_INFO');
    });
    this.stoneObj.selectedStones = this.stoneObj.selectedStones;
  }

  closeCompareStoneOverlay() {
    this.selectedStonesObject = [];
    this.toggleComparePopup = false;
  }
  /****************************************************/


  /*****************BTB******************/
  openBTB(data) {
    this.btbSelectedStones = [];
    this.isBTBDataLoaded = false;
    this.isBTBClosed = false;
    this.bidToBuyService.getBTBPopuStone(data.stone_id).subscribe((response) => {
      data.bid_rate = null;
      data.offer_per_disc = null;
      data.bid_percentage = null;
      data.offer_per_disc_diff = null;
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
  /****************************************************/

  sendExcelMail() {
    const pageName = this.getPageName();
    this.selectedStones = _.uniq(this.createDeepCopyArray(this.stoneObj.selectedStones));
    if (this.selectedStones.length > 0) {
      this.downloadSvc.mailStoneExcel(this.stoneObj.selectedStoneArray, this.selectedStones, pageName);
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  getPageName() {
    const path = (window.location.pathname).split('/');
    let pageName = path[path.length - 1];
    switch (pageName) {
      case 'ddc-stones':
        pageName = 'DDC Stone List';
        break;
      case 'view-request':
        pageName = 'Online View Request Stone List';
        break;
      case 'hold-list':
        pageName = 'HOLD Stone List';
        break;
    }
    return pageName;
  }

  addToPacket(array) {
    if (array.selectedStoneArray && array.selectedStoneArray.length > 0) {
      this.stoneToAddPakcet.emit({ visible: false, object: array.selectedStoneArray });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  } a

  togglePacketOverlay(data) {
    this.stoneToAddPakcet.emit({ visible: true, object: [data] });
  }

  /************REMOVE VIEW REQUEST STONE*****************/
  removeStonesFromAppointment(array) {
    if (array.selectedStoneArray && array.selectedStoneArray.length > 0) {
      this.appointmentRemoveStones.emit({ stonesArray: this.createDeepCopyArray(array.selectedStoneArray) });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  /****************************************************/


  /************ADD TO PREEVENT STONE*****************/
  addStonesToEvent(array, event) {
    this.selectedStones = _.uniq(this.createDeepCopyArray(array.selectedStones));
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.eventDetailsService.addStoneToEvent(this.selectedStones, event.event_id).subscribe(res => {
        this.notify.hideBlockUI();
        if (!res.error_status) {
          if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_INS_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'eventAdded', stoneList: this.selectedStones });
            this.messageService.showSuccessGrowlMessage(res.message);
          } else {
            this.messageService.showErrorGrowlMessage('STONE_NOT_ADDED_EVENT');
          }
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  /****************************************************/

  /************HORIZONTAL SCROLLING*****************/
  scrollTable(params) {
    if (params === 'left') {
      this.stoneDetailsService.scrollLeft(this.thmSelectedStoneContainer, '#selectedStoneContainerStock');
    } else if (params === 'right') {
      this.stoneDetailsService.scrollRight(this.thmSelectedStoneContainer, '#selectedStoneContainerStock');
    }
  }

  scrollTableInInterval(params) {
    this.timer = setInterval(() => {
      this.scrollTable(params);
    }, 1);
  }

  stopScrolling() {
    clearInterval(this.timer);
  }
  /****************************************************/

  /************DIAMOND DETAILS TOGGLE*****************/
  scrollColumn() {
    this.isColumnExpanded = !this.isColumnExpanded;
    this.isIconVisible = !this.isIconVisible;
    this.stoneDetailsService.handleSortingOrder(this.thmSelectedStoneContainer);
    if (this.isColumnExpanded) {
      const columns = JSON.parse(JSON.stringify(this.thmSelectedStoneContainer.columns));
      columns[1].width = 275;
      this.thmSelectedStoneContainer.columns = columns;
    } else {
      const columns = JSON.parse(JSON.stringify(this.thmSelectedStoneContainer.columns));
      columns[1].width = 130;
      this.thmSelectedStoneContainer.columns = columns;
    }
  }
  /****************************************************/

  /************REMOVE BASKET STONE*****************/
  removeBasketStonesFromList(array) {
    if (array.selectedStones.length > 0) {
      this.basketRemoveStone.emit({ stones: _.uniq(this.createDeepCopyArray(array.selectedStones)) });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  /****************************************************/

  onCellPrepared(e, array) {
    this.stoneDetailsService.onCellPrepared(e, array.selectedStones);
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.stoneObj.selectedStoneArray.length > 0) {
      if (this.pageName === "todayVisit") {
        this.gridHeight = window.innerHeight - 275;
      } else
        if (location.pathname.indexOf("event") > 0) {
          this.gridHeight = window.innerHeight - 290;
        }
        else {
          this.gridHeight = window.innerHeight - 245;
        }
    }
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }

  closeGridIconOverlay(data) {
    this.displayIconOverlay = false;
  }

  setColorLegendFilterValue(event: any, filterValue: String): void {

    if (this.colorLegendFilterValue.includes(filterValue)) {

      this.colorLegendFilterValue = this.colorLegendFilterValue.filter(elm => { return elm !== filterValue; });
      event.target.classList.remove('border-active-highlight');

    } else {

      this.colorLegendFilterValue = [...this.colorLegendFilterValue, filterValue];
      event.target.classList.add('border-active-highlight');

    }

  }
}
