import { Component, OnInit, OnChanges, ViewChild, Output, EventEmitter, OnDestroy, Input, AfterViewInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { ViewRequestService } from '@srk/shared';
import { ConfirmationService } from 'primeng/components/common/api';
import { AuthService } from '@srk/core';
import { UserProfileService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import { ApiService } from '@srk/shared';
import { StoneDetailsService } from '@srk/shared';
import { ApplicationDataService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';
import { LoggerService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageService } from '@srk/core';
import { BidToBuyService } from '@srk/shared';
import { UtilService } from '@srk/shared';
import { ApplicationStorageService } from '@srk/core';
import { AddNoteService } from '@srk/shared';
import * as _ from 'underscore';
import { PastInfraGridComponent } from './past-infra-grid/past-infra-grid.component';
// import { UpcomingInfraGridComponent } from './upcoming-infra-grid/upcoming-infra-grid.component';
// import { pastInfraGridComponent } from './today-infra-grid/today-infra-grid.component';

declare var $: any;

import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
@Component({
  providers: [PastInfraGridComponent],
  selector: 'app-view-request-details',
  templateUrl: './view-request-details.component.html',
  styleUrls: ['./view-request-details.component.scss', '../view-request.component.scss']
})
export class ViewRequestDetailsComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() visiblePacketIcon = false;
  @Output() statusMessage = new EventEmitter();
  @ViewChild('pastPopup') pastPopup;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;

  @Output() viewRequestPacket = new EventEmitter();
  @ViewChild('pastVrTableContainer') pastVrTableContainer;
  @ViewChildren(DxDataGridComponent) dataTables: QueryList<DxDataGridComponent>;
  private stoneConfirmedSubscription: Subscription;
  public pastRequestData: any;
  public todayRequestedData: any;
  public headerData: any;
  public upcomingRequestData: any;
  public selecteData: any[] = [];
  public allRequestData = [];
  public pastPopupVisible = false;
  public pastRequestComment: any;
  public requestPopupVisible = false;
  public apiLink: any;
  public popUpTitle: any;
  public blockSaveCommentBtn: boolean = false;
  public showCommentPopUp = false;
  public isPastData = false;
  public messageDisplay: any;
  public newComments: any;
  public pickUpDate: any;
  public ddcOverlayVisible = false;
  public definedDDCHour: any;
  public ddcStones: any[] = [];
  public selectedStones: any[] = [];
  public clientName: any;
  public currentPopUp: any;
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;
  public confirmOverlayVisible = false;
  public subscriptionInterval: Subscription;
  public btbOverlayVisible = false;
  public btbSelectedStones: any[];
  public isBTBDataLoaded = false;
  public isBTBClosed = false;
  public selectedColumnList: any;
  public addnoteOverlayVisible = false;
  public allNotesForStone = [];
  public commentsOverlayVisible = false;
  public selectedStonesArray = [];
  public selectedStone = [];
  public selectedStoneObj: any;
  public httpSubscription: Subscription;
  public stoneButtonList: any;
  public packetSubscription: any;
  public isColumnExpanded = false;
  public isIconVisible: boolean = false;
  public timer;
  public allColumnWidth: any;
  public selectedTableToggle = false;
  public isUpcomingData = false;
  public allPastData = [];
  public allUpcomingData = [];
  public allTodayData = [];
  public allPastStoneId: any;
  public totalStone = 0;
  public notAvalStone = 0;
  public seenStone = 0;
  public onTableStone = 0;
  public pendingStone = 0;
  public stonesActedOn: any;
  public stonesActedOnPast: any;
  public stonesActedOnUpcoming: any;
  public stonesActedOnToday: any;
  public iconOverlayXPosition: Number;
  public iconOverlayYPosition: Number;
  public displayIconOverlay: Boolean = false;
  public iconDisplayStoneObject: any;
  public updateIconRow: any;
  public submitedStoneList: any;

  // Visiable Packet Icon For Packet Data
  public packetIconDataForGrid: any[];
  // Today View Request Para
  public stoneViewedList = [];
  public stoneOnTableList = [];

  public requestedTableNotAvailable = false;
  public onTableNotAvailable = false;
  public viewNotAvailable = false;
  // Toggle Grid 
  public toggleGrid: boolean = true;
  public toggleGridToday: boolean = true;
  public toggleGridPast: boolean = true;

  public colorLegendFilterValue: String[] = [];
  public gridHeight: any;



  // Filter On All Three Table
  public dataToDisplay = [];
  public dataToDisplayOfPast = [];
  public dataToDisplayOfUpcoming = [];
  public dataToDisplayOfToday = [];
  public dataToDisplayStoneId = [];
  public addNoteSubscription: any;

  public showLoadingMessage: boolean;
  public activeToggle = 'totalStone';
  constructor(
    private utilService: UtilService,
    private viewRequestService: ViewRequestService,
    private authService: AuthService,
    private stoneSvc: StoneDetailsService,
    private applicationDataService: ApplicationDataService,
    private customTranslateSvc: CustomTranslateService,
    private userProfileService: UserProfileService,
    private apiService: ApiService,
    private logger: LoggerService,
    private notify: NotifyService,
    private messageService: MessageService,
    private appStore: ApplicationStorageService,
    private notesService: AddNoteService,
    private bidToBuyService: BidToBuyService,
    private confirmationService: ConfirmationService,

    private pastInfraGridComponent: PastInfraGridComponent,
    // private pastInfraGridComponent: pastInfraGridComponent,
    // private pastInfraGridComponent: pastInfraGridComponent,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.showLoadingMessage = true;
    this.messageDisplay = 'Loading..';
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.gridHeight = window.innerHeight - 450;
    this.headerData = {
      table: [],
      selectedStones: []
    };
    this.stoneButtonList = {
      addNote: true,
      addToEvent: true,
      requestHold: true,
      applyDDC: true,
      addToBasket: true,
      viewRequest: true,
      confirmButton: true,
      addToDayp: true
    };
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.selectedStoneObj = {
      selectedStones: [],
      selectedStoneArray: [],
      panelData: {},
      isAllSelectedStoneSelected: false
    };
    this.allPastStoneId = [{
      stoneId: '',
      view_Date: ''
    }];

    this.checkIsApiCalledIsMade();
    if (this.appStore.getData('past-selected-stone-panel')) {
      const selectionObj = this.appStore.getData('past-selected-stone-panel');
      this.selectedStones = selectionObj['selectedStones'];
      this.selectedStonesArray = selectionObj['selectedStoneArray'];
      this.updateSelectedStonePanel();
    }

    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.getUpcomingRequests(true);
    this.clientName = this.authService.getUserDetail().person_name;
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      if (res.source) {
        this.updateStoneStateDetails(res);
      }
    });
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
  }

  checkIsApiCalledIsMade() {
    // if (this.appStore.getData('upcomingRequestArray')) {
    //   this.getUpcomingRequests(false);
    // } else if (this.appStore.getData('pastRequestArray')) {
    //   this.getPastRequests(false);
    // } else if (this.appStore.getData('stoneRequestedArray')) {
    //   this.getTodayVisitRequests(false);
    // } else {
    //   this.getUpcomingRequests(true);
    // }
  }

  ngOnChanges() {
    this.addNoteSubscription = this.notify.notifyAddNewCommentActionObservable$.subscribe((res) => {
      this.refreshNotes();
    });
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
    this.cdr.detectChanges();
  }

  getPastRequests(flag) {
    this.pastRequestData = {
      toggleTable: false,
      selectedStones: [],
      gridName: 'pastGrid',
    };
    this.viewRequestService.getPastDataList().subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_VR_LF_200) && res.data) {
        const pastResponse = this.viewRequestService.sortByDateTime(res.data, true);
        const stoneIds = _.pluck(res.data, ['stone_ids']).toString().split(',');
        this.stoneSvc.getStoneDetails(stoneIds).subscribe(response => {
          this.pastRequestData['table'] = response;
          this.pastRequestData['table'] = this.utilService.updateStonesForDecimal(this.pastRequestData['table']);
          this.pastRequestData['table'] = this.stoneSvc.fetchStoneAdditionalInfo(this.pastRequestData['table']);
          this.notesService.getCommentListforStoneIds(this.pastRequestData.table).subscribe(data => {
            this.pastRequestData.table = data;
            this.stonesActedOnPast = { 'source': 'noteAdded', data: this.pastRequestData.table };
          }, err => {
            this.stonesActedOnPast = { 'source': 'noteAdded' };
          });
          this.pastRequestData['selectedStones'] = [];
          this.pastRequestData['table'].forEach(element => {
            const data = pastResponse.filter(id => id.stone_ids[0] === element._id);
            element['view_date_time'] = data[0].view_date_time;
            element['stones_on_table'] = data[0].stones_on_table;
            element['stones_viewed'] = data[0].stones_viewed;
            element['view_request_note'] = data[0].view_request_note;
          });
          this.appStore.store('pastRequestArray', this.pastRequestData);
          this.upcomingRequestData['table'].forEach((element, index) => {
            if (this.todayRequestedData['table']) {
              if (this.todayRequestedData['table'].filter(id => id._id === element._id).length > 0) {
                this.upcomingRequestData['table'].splice(index, 1);
              }
            }
          });
          this.pastRequestData['table'].forEach((element, index) => {
            if (this.todayRequestedData['table']) {
              if (this.todayRequestedData['table'].filter(id => id._id === element._id).length > 0) {
                this.pastRequestData['table'].splice(index, 1);
              }
            }
          });
          this.pastRequestData['table'].forEach((element, index) => {
            if (this.upcomingRequestData['table'].filter(id => id._id === element._id).length > 0) {
              this.pastRequestData['table'].splice(index, 1);
            }
          });
          if (this.todayRequestedData['table']) {
            this.allRequestData = this.pastRequestData['table'].concat(this.todayRequestedData['table']);
          } else {
            this.allRequestData = this.pastRequestData['table'];
          }
          this.allRequestData['table'] = this.allRequestData.concat(this.upcomingRequestData['table']);
        });
        this.pastRequestData.toggleTable = true;
        this.appStore.store('stoneRequestedArray', this.todayRequestedData);
        this.appStore.store('pastRequestArray', this.pastRequestData);
        this.appStore.store('upcomingRequestArray', this.upcomingRequestData);
      } else {
        this.pastRequestData.toggleTable = false;
        this.pastRequestData['table'] = [];
        this.pastRequestData['selectedStones'] = [];
        this.appStore.store('pastRequestArray', this.pastRequestData);
      }
    }, error => {
      this.pastRequestData.toggleTable = false;
      this.pastRequestData['table'] = [];
      this.appStore.store('pastRequestArray', this.pastRequestData);
    });
  }

  getUpcomingRequests(flag) {
    this.upcomingRequestData = {
      toggleTable: false,
      selectedStones: [],
      gridName: 'upcomingGrid'
    };
    this.viewRequestService.getUpcomingDataList().subscribe(res => {
      if (res.data && MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_VR_LF_200)) {
        const upcomingResponse = this.viewRequestService.sortByDateTime(res.data, true);
        const stoneIds = _.pluck(upcomingResponse, ['stone_ids']).toString().split(',');
        this.stoneSvc.getStoneDetails(stoneIds).subscribe(response => {
          this.upcomingRequestData['table'] = response;
          this.upcomingRequestData['table'] = this.utilService.updateStonesForDecimal(this.upcomingRequestData['table']);
          this.upcomingRequestData['table'] = this.stoneSvc.fetchStoneAdditionalInfo(this.upcomingRequestData['table']);
          this.upcomingRequestData['table'] = this.notesService.fetchStonesComment(this.upcomingRequestData['table']);

          this.notesService.getCommentListforStoneIds(this.upcomingRequestData.table).subscribe(data => {
            this.upcomingRequestData.table = data;
            this.stonesActedOnPast = { 'source': 'noteAdded', data: this.upcomingRequestData.table };
          }, err => {
            this.stonesActedOnPast = { 'source': 'noteAdded' };
          });

          this.upcomingRequestData['table'].forEach(element => {
            const data = upcomingResponse.filter(id => id.stone_ids[0] === element._id);
            element['view_date_time'] = data[0].view_date_time;
            element['not_available_stones'] = data[0].not_available_stones;
            element['stones_on_table'] = data[0].stones_on_table;
            element['stones_viewed'] = data[0].stones_viewed;
            element['view_request_note'] = data[0].view_request_note;
          });
          this.upcomingRequestData['selectedStones'] = [];
          this.upcomingRequestData['toggleTable'] = true;
          this.appStore.store('upcomingRequestArray', this.upcomingRequestData);
          if (flag) {
            this.getTodayVisitRequests(true);
          }
        });
      } else {
        this.upcomingRequestData['table'] = [];
        this.upcomingRequestData['selectedStones'] = [];
        this.upcomingRequestData['toggleTable'] = false;
        this.appStore.store('upcomingRequestArray', this.upcomingRequestData);
        if (flag) {
          this.getTodayVisitRequests(true);
        }
      }
      this.showLoadingMessage = false;
    }, error => {
      this.upcomingRequestData['table'] = [];
      this.showLoadingMessage = false;
      this.appStore.store('upcomingRequestArray', this.upcomingRequestData);
      if (flag) {
        this.getTodayVisitRequests(true);
      }
    });
  }

  getTodayVisitRequests(flag) {
    this.todayRequestedData = {
      toggleTable: false,
      selectedStones: [],
      gridName: 'todayGrid'
    };
    this.viewRequestService.getTodayRequestList().subscribe(res => {
      if (res.data) {
        const todayResponse = this.viewRequestService.sortByDateTime(res.data, true);
        const stoneIds = _.pluck(res.data, ['stone_ids']).toString().split(',');
        if (stoneIds.length > 0) {
          this.stoneSvc.getStoneDetails(stoneIds).subscribe(response => {
            if (response) {
              this.todayRequestedData['table'] = response;
              this.todayRequestedData['table'] = this.utilService.updateStonesForDecimal(this.todayRequestedData['table']);
              this.todayRequestedData['table'] = this.stoneSvc.fetchStoneAdditionalInfo(this.todayRequestedData['table']);
              this.todayRequestedData['table'] = this.notesService.fetchStonesComment(this.todayRequestedData['table']);
              this.notesService.getCommentListforStoneIds(this.todayRequestedData.table).subscribe(data => {
                this.todayRequestedData.table = data;
                this.stonesActedOnPast = { 'source': 'noteAdded', data: this.todayRequestedData.table };
              }, err => {
                this.stonesActedOnPast = { 'source': 'noteAdded' };
              });
              this.todayRequestedData['table'].forEach(element => {
                const data = todayResponse.filter(id => id.stone_ids[0] === element._id);
                element['view_date_time'] = data[0].view_date_time;
                element['not_available_stones'] = data[0].not_available_stones;
                element['stones_on_table'] = data[0].stones_on_table;
                element['stones_viewed'] = data[0].stones_viewed;
                element['view_request_note'] = data[0].view_request_note;
              });
              this.todayRequestedData.toggleTable = true;
            } else {
              this.todayRequestedData['table'] = [];
            }
            this.todayRequestedData['selectedStones'] = [];
            this.appStore.store('stoneRequestedArray', this.todayRequestedData);
            if (flag) {
              this.getPastRequests(true);
            }
          });
        } else {
          this.todayRequestedData['table'] = [];
          this.todayRequestedData['selectedStones'] = [];
          this.appStore.store('stoneRequestedArray', this.todayRequestedData);
          if (flag) {
            this.getPastRequests(true);
          }
        }
      } else {
        this.todayRequestedData['table'] = [];
        this.todayRequestedData['selectedStones'] = [];
        this.appStore.store('stoneRequestedArray', this.todayRequestedData);
        if (flag) {
          this.getPastRequests(true);
        }
      }
    }, error => {
      this.todayRequestedData['table'] = [];
      this.todayRequestedData['selectedStones'] = [];
      this.appStore.store('stoneRequestedArray', this.todayRequestedData);
      if (flag) {
        this.getPastRequests(true);
      }
    });
  }

  updateTogglingTable(data, dataFor) {
    data.toggleTable = !data.toggleTable;
    if (dataFor === 'upcoming') {
      this.appStore.store('upcomingRequestArray', this.upcomingRequestData);
    } else if (dataFor === 'past') {
      this.appStore.store('pastRequestArray', this.pastRequestData);
    } else {
      this.appStore.store('stoneRequestedArray', this.todayRequestedData);
    }
  }

  stoneCount(count) {
    this.totalStone += count.totalStone;
    this.seenStone += count.seenStone;
    this.onTableStone += count.onTableStone;
    this.pendingStone += count.pendingStone;
    this.notAvalStone += count.notAval;
  }

  checkVrDataIsInitialized() { }

  toggleCommentOverlay(data) {
    this.currentPopUp = 'commentList';
    this.popUpTitle = this.customTranslateSvc.translateString('Comments');
    this.showCommentPopUp = true;
    this.pastRequestComment = data.view_request_note;
  }

  changePopUpInfo(title, height, width) {
    this.pastPopup.title = title;
    this.pastPopup.height = height;
    this.pastPopup.width = width;
    this.pastPopupVisible = true;
  }

  toggleAddCommentsOverlay(date) {
    this.newComments = '';
    this.currentPopUp = 'addComments';
    this.popUpTitle = this.customTranslateSvc.translateString('Add Comment');
    this.showCommentPopUp = true;
    this.pickUpDate = date;
  }

  saveNewComments(commentText) {
    const reg = new RegExp('^(?=.*[\\w\\d]).+');
    const isMatched = reg.test(commentText);
    if (commentText.trim() !== '' && isMatched) {
      this.blockSaveCommentBtn = true;
      this.viewRequestService.addNewComments(commentText, this.pickUpDate).subscribe(res => {
        this.blockSaveCommentBtn = false;
        this.addNewComment(commentText);
        this.reportSuccessOccured('VIEW_REQUEST_ADDED_COMMENT');
        this.showCommentPopUp = false;

      }, error => {
        this.showCommentPopUp = false;
        this.reportFailureOccured('SERVER_ERROR_OCCURRED');
      });
    } else {
      this.reportFailureOccured('ENTER_MESSAGE');
    }
  }

  addNewComment(commentValue) {
    this.pastRequestData.table.forEach((element) => {
      if (this.pickUpDate === element.data.view_date_time) {
        const i = this.pastRequestData.table.indexOf(element);
        const getCurrentTime = new Date();
        const commentObj = {
          comment: commentValue,
          comment_date_time: this.utilService.tranformDate(getCurrentTime, 'yyyy-MM-dd HH:mm')
        };
        this.pastRequestData.table[i].data.view_request_note.push(commentObj);
        this.appStore.store('pastRequestArray', this.pastRequestData);
      }
    });
  }

  reportFailureOccured(failureMessage) {
    // this.statusMessage.emit({ status: false, message: failureMessage });
  }

  reportSuccessOccured(successMessage) {
    this.statusMessage.emit({ status: true, message: successMessage });
  }

  selectStoneData(event, id) {
    this.selectedStones = [];
    this.pastRequestData.forEach((object) => {
      if (object.data.view_request_id === id) {
        object.selectedStones = [];
        event.selectedRowsData.forEach((stone) => {
          object.selectedStones.push(stone);
          this.selectedStones.push(stone.stone_id);
        });
      }
    });
  }

  /*********** ddc ***************/
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

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp(stoneInfo);
    this.toggleMultimediaPopup = true;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    if (stoneList && this.pastRequestData) {
      if (this.upcomingRequestData.table && this.upcomingRequestData.table.length > 0) {
        const [updatedData, anyEventOccur] = this.viewRequestService.updateTableStoneDetails(this.upcomingRequestData, stoneList, res);
        this.appStore.store('upcomingRequestArray', updatedData);
        if (anyEventOccur) {
          this.stonesActedOnUpcoming = res;
        }
        // this.upcomingRequestData = JSON.parse(JSON.stringify(updatedData));
        // this.upcomingRequestData = this.upcomingRequestData[0];
      }
      if (this.todayRequestedData['table'] && this.todayRequestedData['table'].length > 0) {
        const [updatedData, anyEventOccur] = this.viewRequestService.updateTableStoneDetails(this.todayRequestedData, stoneList, res);
        // this.todayRequestedData = JSON.parse(JSON.stringify(updatedData));
        this.appStore.store('stoneRequestedArray', updatedData);
        if (anyEventOccur) {
          this.stonesActedOnToday = res;
        }
        // this.todayRequestedData = this.todayRequestedData[0];
      }
      if (this.pastRequestData.table && this.pastRequestData.table.length > 0) {
        const [updatedData, anyEventOccur] = this.viewRequestService.updateTableStoneDetails(this.pastRequestData, stoneList, res);
        this.appStore.store('pastRequestArray', updatedData);
        if (anyEventOccur) {
          this.stonesActedOnPast = res;
        }
        // this.pastRequestData = JSON.parse(JSON.stringify(updatedData));

        // this.pastRequestData = this.pastRequestData[0];
      }
      this.isListEmpty();
      // this.stonesActedOnUpcoming = res;
      // this.stonesActedOnToday = res;
      // this.stonesActedOnPast = res;
      // this.appStore.store('pastRequestArray', this.pastRequestData);
      // this.appStore.store('stoneRequestedArray', this.todayRequestedData);
      // this.appStore.store('upcomingRequestArray', this.upcomingRequestData);
    }
  }

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
              this.stoneSvc.getB2BPopupData(element, this.btbSelectedStones);
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

  addTab(e) {
    if (e.data && e.type === 'stoneDtl') {
      this.addStoneDetailTabOfPast(e.data);
    } else if (e.data && e.type === 'twinStoneDtl') {
      this.addTwinStoneInfoTab(e.data);
    }
  }

  addStoneDetailTabOfPast(data) {
    // const windowTopScroll: any = jQuery(window).scrollTop();
    // this.appStore.store('pageScrollPast', windowTopScroll);
    data = this.allRequestData['table'].find(elm => { return elm._id === data; });
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'stoneDtl', 'data': data });
  }

  addTwinStoneInfoTab(pairId) {
    // const windowTopScroll: any = jQuery(window).scrollTop();
    // this.appStore.store('pageScrollPast', windowTopScroll);
    // pairId = this.allRequestData['table'].find(elm => { return elm._id === pairId; });
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'twinStoneDtl', 'data': pairId });
  }

  isAllCheckboxSelected(array) {
    array['table'] = this.allRequestData['table'];
    array.selectedStones = _.pluck(this.allRequestData['table'], ['_id']).toString().split(',');
    this.selectedStones = _.pluck(this.allRequestData['table'], ['_id']).toString().split(',');
    array = this.viewRequestService.filterFetchedSelectedStones(array);
    this.selectedStones = array.selectedStones;
    if (this.dataToDisplay.length > 0) {
      this.dataToDisplayStoneId = _.pluck(this.dataToDisplay, ['_id']).toString().split(',');
      this.selectedStones = this.dataToDisplayStoneId;
    }

    if (this.dataToDisplay.length > 0) {
      this.pastRequestData['table'].forEach(element => {
        if (this.dataToDisplay.filter(id => id._id === element._id).length > 0) {
          $('#gridpastGrid').igGridSelection('selectRowById', element._id);
        }
      });
      this.upcomingRequestData['table'].forEach(element => {
        if (this.dataToDisplay.filter(id => id._id === element._id).length > 0) {
          $('#gridupcomingGrid').igGridSelection('selectRowById', element._id);
        }
      });
      if (this.todayRequestedData['table']) {
        this.todayRequestedData['table'].forEach(element => {
          if (this.dataToDisplay.filter(id => id._id === element._id).length > 0) {
            $('#gridtodayGrid').igGridSelection('selectRowById', element._id);
          }
        });
      }
    } else {
      this.pastRequestData['table'].forEach(element => {
        $('#gridpastGrid').igGridSelection('selectRowById', element._id);
      });
      this.upcomingRequestData['table'].forEach(element => {
        $('#gridupcomingGrid').igGridSelection('selectRowById', element._id);
      });
      if (this.todayRequestedData['table']) {
        this.todayRequestedData['table'].forEach(element => {
          $('#gridtodayGrid').igGridSelection('selectRowById', element._id);
        });
      }
    }

    this.fetchStoneDetails();
  }

  unSelectAllStone(array) {
    if (this.pastRequestData['selectedStones'].length > 0) {
      $('#gridpastGrid').igGridSelection('clearSelection');
    }
    if (this.todayRequestedData['selectedStones'].length > 0) {
      $('#gridtodayGrid').igGridSelection('clearSelection');
    }
    if (this.upcomingRequestData['selectedStones'].length > 0) {
      $('#gridupcomingGrid').igGridSelection('clearSelection');
    }
    array['table'] = this.allRequestData['table'];
    array.selectedStones = [];
    this.selectedStones = [];
    array = this.viewRequestService.filterFetchedSelectedStones(array);
    this.fetchStoneDetails();
  }

  filterSelectedStones(array, data, gridKey) {
    if (data.added === true) {

      if (Array.isArray(data)) {
        if (data.length > 0) {

          data.forEach((elm, index) => {
            array.selectedStones.push(elm.stoneId);
            this.selectedStones.push(elm.stoneId);
          });
        }


      } else {
        array.selectedStones.push(data.stoneId);
        this.selectedStones.push(data.stoneId);
      }



    } else {

      array.selectedStones = array.selectedStones.filter(elm => { return elm !== data.stoneId; });
      this.selectedStones = this.selectedStones.filter(elm => { return elm !== data.stoneId; });
      $('#gridheaderGrid').igGridSelection('clearSelection');

    }
    // array.selectedStones.push(data.stoneId);
    array = this.viewRequestService.filterFetchedSelectedStones(array);
    if (gridKey === 'todayData') {
      this.fetchStoneDetailsToday();
    }
    if (gridKey === 'pastData') {
      // this.pastRequestData['selectedStones'] = data.stoneId;
      this.fetchStoneDetails();
    }
    if (gridKey === 'upcomingData') {
      // this.upcomingRequestData['selectedStones'] = data.stoneId;
      this.fetchStoneDetailsupcoming();
    }

  }

  refreshNotes() {
    this.notesService.getCommentListforStoneIds(this.pastRequestData.table).subscribe(res => {
      this.pastRequestData.table = res;
      this.stonesActedOnPast = { 'source': 'noteAdded', data: this.pastRequestData.table };
    }, err => {
      this.stonesActedOnPast = { 'source': 'noteAdded' };
    });
    this.notesService.getCommentListforStoneIds(this.todayRequestedData.table).subscribe(res => {
      this.todayRequestedData.table = res;
      this.stonesActedOnPast = { 'source': 'noteAdded', data: this.todayRequestedData.table };
    }, err => {
      this.stonesActedOnPast = { 'source': 'noteAdded' };
    });
    this.notesService.getCommentListforStoneIds(this.upcomingRequestData.table).subscribe(res => {
      this.upcomingRequestData.table = res;
      this.stonesActedOnPast = { 'source': 'noteAdded', data: this.upcomingRequestData.table };
    }, err => {
      this.stonesActedOnPast = { 'source': 'noteAdded' };
    });
    this.selectedStones = this.selectedStones;
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  fetchStoneDetails() {
    this.selectedStonesArray = [];
    // this.selectedStones = this.viewRequestService.fetchAllSelectedStones(this.pastRequestData);
    this.selectedStonesArray = this.viewRequestService.fetchSelectedStoneDetails(this.selectedStones, this.allRequestData['table']);
    this.updateSelectedStonePanel();
  }
  fetchStoneDetailsToday() {
    this.selectedStonesArray = [];
    // this.selectedStones = this.viewRequestService.fetchAllSelectedStones(this.todayRequestedData);
    this.selectedStonesArray = this.viewRequestService.fetchSelectedStoneDetails(this.selectedStones, this.allRequestData['table']);
    this.updateSelectedStonePanel();
  }
  fetchStoneDetailsupcoming() {
    this.selectedStonesArray = [];
    // this.selectedStones = this.viewRequestService.fetchAllSelectedStones(this.upcomingRequestData);
    this.selectedStonesArray = this.viewRequestService.fetchSelectedStoneDetails(this.selectedStones, this.allRequestData['table']);
    this.updateSelectedStonePanel();
  }

  toggleSelectedTable(e) {
    this.selectedTableToggle = e.status;
  }


  updateSelectedStonePanel() {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    this.selectedStoneObj['selectedStones'] = this.selectedStones;
    this.selectedStoneObj['selectedStoneArray'] = this.selectedStonesArray;
    this.selectedStoneObj['table'] = this.selectedStonesArray;
    this.selectedStoneObj['panelData'] = {};
    if (this.selectedStones.length > 0) {
      this.selectedStoneObj.isAllSelectedStoneSelected = true;
      this.httpSubscription = this.stoneSvc.getDiamondPriceInfo(this.selectedStoneObj.selectedStoneArray).subscribe(res => {
        this.selectedStoneObj['selectedStoneArray'] = res;
        this.selectedStoneObj['panelData'] = this.stoneSvc.calculateSelectedStoneData(this.selectedStoneObj.selectedStoneArray);
      });
    } else {
      this.selectedStoneObj.isAllSelectedStoneSelected = false;
    }
    this.updateRowColor();
    this.appStore.store('past-selected-stone-panel', this.selectedStoneObj);
  }

  updateVRStoneArray(e) {
    let unselectedStones = [];
    unselectedStones = this.selectedStones.filter(stone => {
      return e.array.selectedStones.indexOf(stone) === -1;
    });
    this.pastRequestData = this.viewRequestService.removeUnselectedStones(this.pastRequestData, unselectedStones);
    this.selectedStones = e.array.selectedStones;
    if (this.selectedStones.length === 0) {
      this.selectedTableToggle = false;
    }

    this.selectedStonesArray = e.array.selectedStoneArray;
    this.updateSelectedStonePanel();
  }

  ngOnDestroy() {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    if (this.packetSubscription) {
      this.packetSubscription.unsubscribe();
    }
    if (this.subscriptionInterval) {
      this.subscriptionInterval.unsubscribe();
    }
    this.stoneConfirmedSubscription.unsubscribe();
  }

  toggleAddNoteOverlay(e) {
    if (e.forAddNote) {
      this.addnoteOverlayVisible = e.visible;
    } else {
      this.commentsOverlayVisible = e.visible;
    }
    if (e.noteDetil) {
      this.refreshNotes();
    }
  }

  addToPacket(data) {
    this.viewRequestPacket.emit({ visible: true, object: [data] });
  }

  stoneFromSelectedStone(event) {
    this.viewRequestPacket.emit({ visible: event.visible, object: event.object });
  }

  updatePacketDetails(event) {
    this.packetIconDataForGrid = event.array.map(elm => { return elm.stones.toString(); }).toString();
    if (this.pastRequestData) {
      this.pastRequestData.table = this.stoneSvc.setStonePacketCount(this.pastRequestData.table);
      this.pastRequestData.table = this.stoneSvc.updateStonePacketCount(event, this.pastRequestData.table);
    }
    if (this.todayRequestedData) {
      this.todayRequestedData.table = this.stoneSvc.setStonePacketCount(this.todayRequestedData.table);
      this.todayRequestedData.table = this.stoneSvc.updateStonePacketCount(event, this.todayRequestedData.table);
    }
    if (this.upcomingRequestData) {
      this.upcomingRequestData.table = this.stoneSvc.setStonePacketCount(this.upcomingRequestData.table);
      this.upcomingRequestData.table = this.stoneSvc.updateStonePacketCount(event, this.upcomingRequestData.table);
    }
  }

  removeConfirmedVRStone(id, time) {
    const removeStoneMessage = this.customTranslateSvc.translateString('Are you sure, you want to remove this stone ?');
    const removeStoneHeader = this.customTranslateSvc.translateString('Remove stone');
    this.confirmationService.confirm({
      message: removeStoneMessage,
      header: removeStoneHeader,
      accept: () => {
        this.initiateRemoveConfirmedStones(id, time);
      }
    });
  }

  initiateRemoveConfirmedStones(id, time) {
    const reqJson = {
      'view_date_time': time,
      'stone_ids': [id]
    };
    this.viewRequestService.removeViewRequestStone(reqJson).subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_VR_DDS_200)) {
        this.pastRequestData = this.viewRequestService.removeStoneFromList(this.pastRequestData, time, id);
        this.isListEmpty();
        this.reportSuccessOccured('STONE_REMOVED_SUCCESSFULLY');
      } else {
        this.reportFailureOccured(res.message);
      }
    });
  }

  isListEmpty() {
    if (this.pastRequestData.length === 0) {
      this.isPastData = false;
      this.messageDisplay = 'NO_LIST_EXIST';
    } else {
      this.fetchStoneDetails();
    }
  }

  getPageRef(pastData) {
    const gridIdName = '#' + pastData.data.view_date_time + 'PastRequestContainer';
    const scrollable = this.pastVrTableContainer.instance.getScrollable(gridIdName);
    pastData['pageRefPosition'] = scrollable.scrollTop();
    this.appStore.store('pastRequestArray', this.pastRequestData);
  }

  ngAfterViewInit() {
    if (this.addNoteSubscription) {
      this.addNoteSubscription.unsubscribe();
    }
  }

  getDataGridContainer(gridId) {
    let container;
    if (this.dataTables && this.dataTables.hasOwnProperty('_results')) {
      const dataGrids = this.dataTables['_results'];
      dataGrids.forEach(dataGrid => {
        if (dataGrid.element.hasOwnProperty('nativeElement')) {
          if (gridId === dataGrid.element['nativeElement'].id) {
            container = dataGrid;
          }
        }
      });
    }
    if (container === undefined || container === null) {
      container = this.pastVrTableContainer;
    }
    return container;
  }

  scrollTable(params, name) {
    const gridId = name + 'PastRequestContainer';
    const container = this.getDataGridContainer(gridId);
    if (params === 'left') {
      this.stoneSvc.scrollLeft(container, '#' + gridId);
    } else if (params === 'right') {
      this.stoneSvc.scrollRight(container, '#' + gridId);
    }
  }

  scrollTableInInterval(params, name) {
    this.timer = setInterval(() => {
      this.scrollTable(params, name);
    }, 1)
  }

  stopScrolling() {
    clearInterval(this.timer);
  }

  scrollColumn(name, data) {
    const gridId = name + 'PastRequestContainer';
    this.isColumnExpanded = !this.isColumnExpanded;
    this.isIconVisible = !this.isIconVisible;
    const gridContainer = this.getDataGridContainer(gridId);
    this.stoneSvc.handleSortingOrder(gridContainer);
    const columns = JSON.parse(JSON.stringify(gridContainer.columns));
    if (this.isColumnExpanded) {
      columns[1].width = 275;
    } else {
      columns[1].width = 130;
    }






    gridContainer.columns = columns;
  }

  updateRowColor() {
    this.allRequestData.forEach(array => {
      if (array.toggleTable) {
        const gridId = array.data.view_date_time + 'PastRequestContainer';
        const container = this.getDataGridContainer(gridId);
        if (container) {
          array.table.forEach((element, index) => {
            this.stoneSvc.showRowColorChanges(container, array.selectedStones, element.stone_id, index);
          });
        }
      }
    });
  }

  submitedStone(eve) {
    this.submitedStoneList = eve.gridRebind;
  }

  stoneMediaIconPanel(event) {
    this.iconDisplayStoneObject = event.stoneId;
    this.iconOverlayXPosition = event.eventObject.pageX;
    this.iconOverlayYPosition = event.eventObject.pageY;
    this.displayIconOverlay = true;
    return false;

  };

  closeGridIconOverlay(data) {

    this.displayIconOverlay = false;

  }

  onCellPrepared(e, array) {
    this.stoneSvc.onCellPrepared(e, array.selectedStones);
  }

  onResultLoading(event) {
    const gridId = event.data.view_date_time + 'PastRequestContainer';
    const container = this.getDataGridContainer(gridId);
    this.utilService.handleSort(event, container, 'pastRequestArray', this.pastRequestData);
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }

  showNotAvaStone() {
    this.dataToDisplayOfPast = this.pastInfraGridComponent.transformDataForGrid(this.pastRequestData['table'].filter(id => id.stone_state === 6));
    // this.stonesActedOnPast = { source: 'filterStone', data: this.dataToDisplayOfPast };
    $('#gridpastGrid').igGrid('dataSourceObject', this.dataToDisplayOfPast).igGrid('dataBind');
    if (this.todayRequestedData['table']) {
      this.dataToDisplayOfToday = this.pastInfraGridComponent.transformDataForGrid(this.todayRequestedData['table'].filter(id => id.stone_state === 6));
      $('#gridtodayGrid').igGrid('dataSourceObject', this.dataToDisplayOfToday).igGrid('dataBind');
    }
    this.dataToDisplayOfUpcoming = this.pastInfraGridComponent.transformDataForGrid(this.upcomingRequestData['table'].filter(id => id.stone_state === 6));
    $('#gridupcomingGrid').igGrid('dataSourceObject', this.dataToDisplayOfUpcoming).igGrid('dataBind');

    this.dataToDisplay = this.dataToDisplayOfPast.concat(this.dataToDisplayOfToday);
    this.dataToDisplay = this.dataToDisplay.concat(this.dataToDisplayOfUpcoming);
    this.activeToggle = 'notAvailableStone';
  }
  showAllStone() {
    // this.stonesActedOnPast = { source: 'filterStone', data: this.pastRequestData['table'] };
    $('#gridpastGrid').igGrid('dataSourceObject', this.pastInfraGridComponent.transformDataForGrid(this.pastRequestData['table'])).igGrid('dataBind');

    if (this.todayRequestedData['table']) {
      $('#gridtodayGrid').igGrid('dataSourceObject', this.pastInfraGridComponent.transformDataForGrid(this.todayRequestedData['table'])).igGrid('dataBind');
    }
    // this.stonesActedOnUpcoming = { source: 'filterStone', data: this.upcomingRequestData['table'] };
    $('#gridupcomingGrid').igGrid('dataSourceObject', this.pastInfraGridComponent.transformDataForGrid(this.upcomingRequestData['table'])).igGrid('dataBind');

    this.dataToDisplay = this.pastInfraGridComponent.transformDataForGrid(this.pastRequestData['table']).concat(this.pastInfraGridComponent.transformDataForGrid(this.todayRequestedData['table']));
    this.dataToDisplay = this.dataToDisplay.concat(this.pastInfraGridComponent.transformDataForGrid(this.upcomingRequestData['table']));
    this.activeToggle = 'totalStone';
  }

  showOnTable() {
    this.dataToDisplayOfPast = this.pastInfraGridComponent.transformDataForGrid(this.pastRequestData['table'].filter(id => id.stones_on_table.length > 0));
    // this.stonesActedOnPast = { source: 'filterStone', data: this.dataToDisplayOfPast };
    $('#gridpastGrid').igGrid('dataSourceObject', this.dataToDisplayOfPast).igGrid('dataBind');

    if (this.todayRequestedData['table']) {
      this.dataToDisplayOfToday = this.pastInfraGridComponent.transformDataForGrid(this.todayRequestedData['table'].filter(id => id.stones_on_table.length > 0));
      $('#gridtodayGrid').igGrid('dataSourceObject', this.dataToDisplayOfToday).igGrid('dataBind');
    }


    this.dataToDisplayOfUpcoming = this.pastInfraGridComponent.transformDataForGrid(this.upcomingRequestData['table'].filter(id => id.stones_on_table.length > 0));
    $('#gridupcomingGrid').igGrid('dataSourceObject', this.dataToDisplayOfUpcoming).igGrid('dataBind');

    this.dataToDisplay = this.dataToDisplayOfPast.concat(this.dataToDisplayOfToday);
    this.dataToDisplay = this.dataToDisplay.concat(this.dataToDisplayOfUpcoming);
    this.activeToggle = 'onTableStone';
  }

  showSeenStone() {
    this.dataToDisplayOfPast = this.pastInfraGridComponent.transformDataForGrid(this.pastRequestData['table'].filter(id => id.stones_viewed.length > 0));
    $('#gridpastGrid').igGrid('dataSourceObject', this.dataToDisplayOfPast).igGrid('dataBind');

    if (this.todayRequestedData['table']) {
      this.dataToDisplayOfToday = this.pastInfraGridComponent.transformDataForGrid(this.todayRequestedData['table'].filter(id => id.stones_viewed.length > 0));
      $('#gridtodayGrid').igGrid('dataSourceObject', this.dataToDisplayOfToday).igGrid('dataBind');
    }

    this.dataToDisplayOfUpcoming = this.pastInfraGridComponent.transformDataForGrid(this.upcomingRequestData['table'].filter(id => id.stones_viewed.length > 0));
    $('#gridupcomingGrid').igGrid('dataSourceObject', this.dataToDisplayOfUpcoming).igGrid('dataBind');
    this.dataToDisplay = this.dataToDisplayOfPast.concat(this.dataToDisplayOfToday);
    this.dataToDisplay = this.dataToDisplay.concat(this.dataToDisplayOfUpcoming);
    this.activeToggle = 'seenStone';
  }

  showPendingStone() {
    this.dataToDisplayOfPast = this.pastInfraGridComponent.transformDataForGrid(this.pastRequestData['table'].filter(id => id.viewRequestStatus === 1));
    // this.stonesActedOnPast = { source: 'filterStone', data: this.dataToDisplayOfPast };
    $('#gridpastGrid').igGrid('dataSourceObject', this.dataToDisplayOfPast).igGrid('dataBind');

    if (this.todayRequestedData['table']) {
      this.dataToDisplayOfToday = this.pastInfraGridComponent.transformDataForGrid(this.todayRequestedData['table'].filter(id => id.viewRequestStatus === 1));
      $('#gridtodayGrid').igGrid('dataSourceObject', this.dataToDisplayOfToday).igGrid('dataBind');
    }

    this.dataToDisplayOfUpcoming = this.pastInfraGridComponent.transformDataForGrid(this.upcomingRequestData['table'].filter(id => id.viewRequestStatus === 1));
    $('#gridupcomingGrid').igGrid('dataSourceObject', this.dataToDisplayOfUpcoming).igGrid('dataBind');
    this.dataToDisplay = this.dataToDisplayOfPast.concat(this.dataToDisplayOfToday);
    this.dataToDisplay = this.dataToDisplay.concat(this.dataToDisplayOfUpcoming);
    this.activeToggle = 'pendingStone';
  }

  setColorLegendFilterValue(event: any, filterValue: String): void {

    if (this.colorLegendFilterValue.includes(filterValue)) {

      this.colorLegendFilterValue = this.colorLegendFilterValue.filter(elm => { return elm !== filterValue; });

    } else {

      this.colorLegendFilterValue = [...this.colorLegendFilterValue, filterValue];

    }

  }

  colorFilterStone(eve) {
    if (eve.id === 'past') {
      this.dataToDisplayOfPast = eve.data;
    }
    if (eve.id === 'today') {
      this.dataToDisplayOfToday = eve.data;
    }
    if (eve.id === 'upcoming') {
      this.dataToDisplayOfUpcoming = eve.data;
    }
    this.dataToDisplay = this.dataToDisplayOfPast.concat(this.dataToDisplayOfToday);
    this.dataToDisplay = this.dataToDisplay.concat(this.dataToDisplayOfUpcoming);
  }
}
