import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy, HostListener, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '@srk/core';
import { ThmConfirmOverlayComponent, UtilService } from '@srk/shared';
import { LoggerService } from '@srk/core';
import { SearchType, SearchTypeComparator } from '@srk/core';
import { UserProfileService } from '@srk/core';
import { ApiService } from '@srk/shared';
import { MessageService } from '@srk/core';
import { DownloadStonesService } from '@srk/shared';
import { BidToBuyService } from '@srk/shared';
import { NotifyService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';
import { SearchService } from '@srk/core';
import { AddNoteService } from '@srk/shared';
import { DaypEventResolverService } from '@srk/core';
import { DaypService } from '@srk/shared';
import * as _ from 'underscore';
import { EventDetailsService } from '@srk/core';

@Component({
  selector: 'app-selected-stones-panel',
  templateUrl: './selected-stones-panel.component.html',
  styleUrls: ['./selected-stones-panel.component.scss'],

})
export class SelectedStonesPanelComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild(ThmConfirmOverlayComponent) thmConfirmOverlayComponent;
  @ViewChild('selectedStoneComponent') selectedStoneComponent;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;

  @Input() resultArray: any;
  @Input() userSelectedColumn: any;
  @Input() showPacket: boolean;
  @Input() searchType: string;
  @Input() selectionArray: any[];

  // Used to update the thing
  @Input() stonesActedOn: any;


  @Output() stoneID = new EventEmitter();
  @Output() toggleTableDisplay = new EventEmitter();
  @Output() stoneToAddPakcet = new EventEmitter();
  @Output() updateArray = new EventEmitter();
  @Output() basketAddedEventForGrid = new EventEmitter();

  public popupVisible = false;
  public selectedStones: any[];
  public viewRequestResponseMessage: any;
  public apiLink: any;
  public selectedPanelconfirmOverlayVisible = false;
  public selectedDdcOverlayVisible = false;
  public definedDDCHour: any;
  public ddcStones: any[] = [];
  public displayStoneTable = false;
  public btbOverlayVisible = false;
  public btbSelectedStones: any[];
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;
  public addnoteOverlayVisible = false;
  public downloadPopOverVisible = false;
  public downloadOptions: any[];
  public selectedDownloadType: any;
  public isBTBDataLoaded = false;
  public isBTBClosed = false;
  public commentsOverlayVisible = false;
  public allNotesForStone: any[] = [];
  public discountColumnVisible: any[] = [];
  public selectedColumnList: any;
  private addNoteSubscription: Subscription;
  public toggleComparePopup = false;
  public isPreDaypActive = false;
  public selectedStonesObject = [];
  public isDaypPermissible = false;
  public isPreSelectEventPermissible = false;
  public eventDetails: any;
  public conversionRate: any;
  public timer;
  public columnWidth = 130;
  public isIconVisible: boolean = false;
  public allColumnWidth: any;
  public gridHeight: any;
  public isColumnExpanded = false;
  public columnExpanded: any;
  public columnExpandedValue: any;

  // Media Icon Popup Menu
  public iconOverlayXPosition: Number;
  public iconOverlayYPosition: Number;
  public displayIconOverlay: Boolean = false;
  public iconDisplayStoneObject: any;
  private colorLegendFilterValue: String[] = [];
  public viewFinalPayableAndFinalOff = this.stoneDetailsService.showFinalPayableAndFinalOff();
  constructor(
    private authService: AuthService,
    private logger: LoggerService,
    private apiService: ApiService,
    private notify: NotifyService,
    private messageService: MessageService,
    private userProfileService: UserProfileService,
    public bidToBuyService: BidToBuyService,
    private appStore: ApplicationStorageService,
    public stoneDetailsService: StoneDetailsService,
    public searchService: SearchService,
    public downloadSvc: DownloadStonesService,
    private daypSvc: DaypService,
    private eventDetailsService: EventDetailsService,
    private notesService: AddNoteService,
    private utilService: UtilService) { }


  ngOnInit() {
    const priceSubscription = this.stoneDetailsService.getPriceInfoObservable().subscribe(res => {
      this.conversionRate = res.conversion_rate;
      if (priceSubscription) {
        priceSubscription.unsubscribe()
      }
    });
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.gridHeight = window.innerHeight - 265;
    this.daypSvc.checkPreDaypStatus().subscribe(res => {
      if (!res.error_status && MessageCodesComparator.AreEqual(res.code, MessageCodes.DAYP_EF_200)) {
        this.isPreDaypActive = res.data.isDAYPEventOn;
      }
    });
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.displayStoneTable = false; // this.resultArray['toggleTableDisplay'];

    this.addNoteSubscription = this.notify.addNewNotesForIggridObservable$.subscribe(res => {
      console.log("Res", res)
      if (res.isDeleteFlow) {
        this.deleteCommentsFromStones(res);
      } else {
        this.updateNotesForStones(res);
      }
    });
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
  }

  ngOnChanges() {
    if (this.resultArray && this.resultArray.selectedStoneTable && this.resultArray.selectedStoneTable.length === 0) {
      this.resultArray.selectedStoneTable.toggleTableDisplay = false;
      this.displayStoneTable = false;
    }
  }

  viewSelectedStoneTable(array) {
    if (array.selectedStoneTable && array.selectedStoneTable.length > 0) {

      if ($('#grid' + this.resultArray.shortName + 'selectedStoneGrid')[0]) {

        this.displayStoneTable = false;
        array.toggleTableDisplay = false;
        this.discountColumnVisible = this.stoneDetailsService.getColumnsVisibleFlag();
        this.toggleTableDisplay.emit({ array: array });

      } else {
        if (this.searchType === SearchType.TWIN_DIAMOND_SEARCH) {
          this.displayStoneTable = !this.displayStoneTable;
          array.toggleTableDisplay = !array.toggleTableDisplay;
        } else {
          this.displayStoneTable = true;
          array.toggleTableDisplay = true;
        }

        this.discountColumnVisible = this.stoneDetailsService.getColumnsVisibleFlag();
        this.toggleTableDisplay.emit({ array: array });

      }

    } else {
      this.displayStoneTable = false;
    }

  }

  filterSelectedStones(array, data) {

    if (Array.isArray(data) === true) {

      for (let i = 0; i < data.length; i++) {

        if (this.searchType === SearchType.TWIN_DIAMOND_SEARCH) {
          this.updateSearchResultArrayForTwinStones(array, data[i]._id);
        } else {
          array.selectedStoneButton = array.filteredStone;
          array = this.searchService.fetchSelectedStones(array, data[i]._id);
          this.updateArray.emit({ array: array });
        }

      }

    } else {

      if (this.searchType === SearchType.TWIN_DIAMOND_SEARCH) {
        this.updateSearchResultArrayForTwinStones(array, data);
      } else {
        array.selectedStoneButton = array.filteredStone;
        array = this.searchService.fetchSelectedStones(array, data.stoneId);
        this.updateArray.emit({ array: array });
      }

    }

  }

  updateSearchResultArrayForTwinStones(array, id) {
    const pairStones = this.searchService.fetchPairDiamonds(id, array.diamondTable);
    const stoneSelectedByUser = array.filteredStone.filter(stoneId => {
      return stoneId === id;
    });
    pairStones.forEach(stoneDtl => {
      if (stoneSelectedByUser && stoneSelectedByUser.length > 0
        && !(_.contains(array.filteredStone, stoneDtl.stone_id))) {
        array.filteredStone.push(stoneDtl.stone_id);
      } else if (stoneSelectedByUser.length === 0 && _.contains(array.filteredStone, stoneDtl.stone_id)) {
        array.filteredStone = _.without(array.filteredStone, stoneDtl.stone_id)
      }
      array.selectedStoneButton = array.filteredStone;
      array = this.searchService.fetchSelectedStones(array, stoneDtl.stone_id);
      this.updateArray.emit({ array: array });
    });
  }

  isAllCheckboxSelected(array) {
    if (!array.isAllSelected) {
      array.selectedStoneButton = [];
      array.selectedStoneTable = [];
      array.filteredStone = [];
      array.isAllResultSelected = false;
      array.toggleTableDisplay = this.displayStoneTable = false;
    }
    this.selectedStones = array.filteredStone;
    this.updateArray.emit({ array: array });
  }

  toggleViewRequestOverlay(array) {
    this.apiLink = this.authService.getApiLinkForKey('view_request_btn', '');
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones.length > 0) {
      this.popupVisible = !this.popupVisible;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleOverlay(e) {
    this.popupVisible = e.visible;
  }

  confirmSelectedDiamonds(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones.length > 0) {
      this.logger.logInfo('SelectedStonesPanelComponent', 'User action to confirm these stones :- ' + JSON.stringify(this.selectedStones));
      this.thmConfirmOverlayComponent.checkOrderDetails();
      this.thmConfirmOverlayComponent.verifyDiamondConfirmation(this.selectedStones, array.selectedStoneTable);
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleSelectedPanelConfirmOverlay(e) {
    this.selectedPanelconfirmOverlayVisible = e.visible;
  }

  /******************* DDC *******************************/
  applyDDC(array) {
    let countOfInvalideStone = 0;
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    this.ddcStones = [];
    this.definedDDCHour = 0;
    this.selectedStones.forEach((value) => {
      array.selectedStoneTable.forEach(stone => {
        if (stone.stone_id === value && stone.business_process) {
          this.ddcStones.push(stone.stone_id);
        }
        if (stone.business_process !== true) {
          countOfInvalideStone++;
        }
      });
    });
    if (this.ddcStones.length > 0 && countOfInvalideStone !== this.ddcStones.length) {
      this.selectedDdcOverlayVisible = true;
    } else {
      if (countOfInvalideStone > 0) {
        this.messageService.showErrorGrowlMessage('SELECTED_STONE_NV_DDC');
      } else {
        this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
      }
    }
  }

  toggleSelectedDdcOverlay(e) {
    this.selectedDdcOverlayVisible = e.visible;
  }

  updateDDC(stoneData) {
    this.ddcStones = [];
    this.thmDdcOverlay.selectedDdcHour = 0;
    this.definedDDCHour = 0;
    this.ddcStones.push(stoneData.stone_id);
    if (stoneData.ddcHour > 0) {
      this.definedDDCHour = stoneData.ddcHour;
    }
    this.logger.logInfo('SearchResultComponent', 'User action to update ddc these stones :- ' + JSON.stringify(this.ddcStones));
    this.selectedDdcOverlayVisible = true;
  }

  /*********** Basket ***************/
  addToMyBasket(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
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
            this.basketAddedEventForGrid.emit(response);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SNE_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MSG_BASKET_LIMIT_EXCEEDED_200)) {
            this.messageService.showInfoGrowlMessage(response.message);
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

  /*********** request hold ***************/
  requestHold(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    this.apiLink = this.authService.getApiLinkForKey('request_hold_btn', '');
    const servicedata = '{"stone_ids":' + JSON.stringify(this.selectedStones) + '}';
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.apiService.postCall('SearchResultComponent:addToMyHold', this.apiLink, servicedata).subscribe((response) => {
        this.notify.hideBlockUI();
        if (response !== undefined) {
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_SC_DUH_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_SC_ISH_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'holdRequested', stoneList: this.selectedStones, status: true });
            this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_PARTIAL_HOLD_201)) {
            const stoneIds = response.data.stone_ids;
            const differenceStones = _.difference(this.selectedStones, stoneIds);
            this.notify.notifyStoneStateUpdated({ source: 'holdRequested', stoneList: differenceStones, cannotConfirmStones: stoneIds, status: true });
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

  /***********  add to packet ***************/
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

  /***********  bid to buy ***************/
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

  /*********** Mmultimedia ***************/
  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp(stoneInfo);
    this.toggleMultimediaPopup = true;

  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  /*********** add notes ***************/
  addNoteForStone(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones) {
      if (this.selectedStones.length > 0) {
        this.addnoteOverlayVisible = true;
      } else {
        this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
      }
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }

  }

  getNotesForAllStones() {
    if (this.resultArray.selectedStoneTable && this.resultArray.selectedStoneTable.length > 0) {
      this.resultArray.selectedStoneTable = this.notesService.fetchStonesComment(this.resultArray.selectedStoneTable);
    };
  }

  toggleAddNoteOverlay(e) {
    if (e.forAddNote) {
      this.addnoteOverlayVisible = e.visible;
    } else {
      this.commentsOverlayVisible = e.visible;
    }
  }

  refreshData() { }

  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_regular_btn');
    this.downloadPopOverVisible = true;
  }

  /*********** download result ***************/
  downloadResult(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones) {
      this.downloadSvc.downloadStoneDetails(array, this.selectedStones, this.selectedDownloadType);
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  addStoneInfoTab(data) {

    if (typeof data === 'string') {

      data = this.resultArray.diamondTable.find(elm => { return elm._id === data; });

    }

    this.notify.notifySearchResultPageFromSelectedStone({ 'type': 'stoneDtl', 'data': data, 'result': this.resultArray });
  }

  addTwinStoneInfoTab(pairId) {
    this.notify.notifySearchResultPageFromSelectedStone({ 'type': 'twinStoneDtl', 'data': pairId, 'result': this.resultArray });
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  /*********** Add to Pre-DAYP Selection ***************/
  addStonesToPreDayp(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.daypSvc.addToPreDAYPSelection(this.selectedStones).subscribe((response) => {
        if (response && !response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_ASDE_200)) {
          this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
        } if (response && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_DNA_200)) {
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

  compareStone(array) {
    this.selectedStonesObject = [];
    this.toggleComparePopup = true;
    this.selectedStonesObject = this.createDeepCopyArray(array.selectedStoneTable);
  }

  closeCompareStoneOverlay() {
    this.selectedStonesObject = [];
    this.toggleComparePopup = false;
  }

  addStonesToEvent(array, event) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
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

  ngOnDestroy() {
    // this.addNoteSubscription.unsubscribe();
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneDetailsService.scrollLeft(this.selectedStoneComponent, '#selectedStoneContainer');
    } else if (params === 'right') {
      this.stoneDetailsService.scrollRight(this.selectedStoneComponent, '#selectedStoneContainer');
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
    this.stoneDetailsService.handleSortingOrder(this.selectedStoneComponent);
    if (this.isColumnExpanded) {
      const columns = JSON.parse(JSON.stringify(this.selectedStoneComponent.columns));
      columns[1].width = 275;
      this.selectedStoneComponent.columns = columns;
    } else {
      const columns = JSON.parse(JSON.stringify(this.selectedStoneComponent.columns));
      columns[1].width = 130;
      this.selectedStoneComponent.columns = columns;
    }
  }

  onCellPrepared(e, array) {
    this.stoneDetailsService.onCellPrepared(e, array.filteredStone);
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.resultArray.selectedStoneTable.length > 0) {
      this.gridHeight = window.innerHeight - 265;

    }
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }

  stoneMediaIconPanel(event) {
    const data = this.stoneDetailsService.returnPositionOfOverlay(event);
    this.iconOverlayXPosition = data.left;
    this.iconOverlayYPosition = data.top;
    this.iconDisplayStoneObject = event.stoneId;
    this.displayIconOverlay = true;
  };

  closeGridIconOverlay(data) {

    this.displayIconOverlay = false;

  }

  setColorLegendFilterValue(event: any, filterValue: String): void {

    if (this.colorLegendFilterValue.includes(filterValue)) {

      this.colorLegendFilterValue = this.colorLegendFilterValue.filter(elm => { return elm !== filterValue; });

    } else {

      this.colorLegendFilterValue = [...this.colorLegendFilterValue, filterValue];

    }

  }


  updateNotesForStones(res) {
    if (this.resultArray.selectedStoneTable && this.resultArray.selectedStoneTable.length > 0) {
      const toUpdateStoneArray = this.stoneDetailsService.findStoneObjUsingStoneIds(this.resultArray.selectedStoneTable, res.stoneList);
      if (toUpdateStoneArray instanceof Array && toUpdateStoneArray.length > 0) {
        this.notesService.fetchStonesAsynchronously(toUpdateStoneArray)
          .then(result => {

            this.resultArray.selectedStoneTable = this.stoneDetailsService.findAndUpdateStoneCommentFromList(this.resultArray.selectedStoneTable, result);

          }).catch(error => {

            console.error('Failed with error ');
            console.error(error);

          });
      }
    }
  }

  deleteCommentsFromStones(res) {
    const stoneList = [];
    if (this.resultArray.selectedStoneTable && this.resultArray.selectedStoneTable.length > 0) {
      const commentsId = res.commentList;
      this.resultArray.selectedStoneTable.forEach(stone => {
        if (stone.haveNote) {
          commentsId.forEach(comment => {
            stone.notes.forEach((note, noteIndex) => {
              if (Number(note.comment_id) === Number(comment)) {
                stone.notes.splice(noteIndex, 1);
                stoneList.push(stone.stone_id);
              }
            });
          });
          if (stone.notes.length === 0) {
            if (stone.notes) {
              delete stone.notes;
            }
            stone['haveNote'] = false;
            if (stone.displayNote) {
              stone['displayNote'] = '';
            }
            if (stone.totalNotes) {
              delete stone.totalNotes;
            }
          } else {
            stone['displayNote'] = stone.notes[0];
            stone['totalNotes'] = stone.notes.length;
          }
        }
      });
    }
  }

}
