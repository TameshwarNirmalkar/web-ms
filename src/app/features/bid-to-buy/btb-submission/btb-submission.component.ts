import { Component, OnInit, Input, OnChanges, OnDestroy, ViewChild, Output, EventEmitter, AfterViewInit, HostListener } from '@angular/core';
import { BidToBuyService } from '@srk/shared';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { UtilService } from '@srk/shared';
import { StoneDetailsService } from '@srk/shared';
import { AddNoteService } from '@srk/shared';
import { UserProfileService } from '@srk/core';
import * as _ from 'underscore';
import { NotifyService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { DownloadStonesService } from '@srk/shared';
import { MessageService } from '@srk/core';
import { AuthService } from '@srk/core';

declare var $: any;

import { Subscription } from 'rxjs/Subscription';
@Component({
  selector: 'app-btb-submission',
  templateUrl: './btb-submission.component.html',
  styleUrls: ['./btb-submission.component.scss']
})
export class BtbSubmissionComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('btbSubmissionTableContainer') btbSubmissionTableContainer;
  @ViewChild('appSelectedPanel') appSelectedPanel;
  @ViewChild('daypGrid') daypGrid: any;
  @Input() visiblePacketIcon = false;
  @Input() packetStoneArray: any;

  @Output() btbPacket = new EventEmitter();
  public btbSubmissionTableEntry: any;
  public submitedStoneList: any;
  public isBtbSubmissionDataFetched = false;
  public errorMessage: any;
  public selectedColumnList: any;
  public stoneConfirmedSubscription: any;
  public toggleMultimediaPopup = false;
  public commentsOverlayVisible = false;
  public allNotesForStone: any;
  public addnoteOverlayVisible = false;
  public packetSubscription: any;
  public selectedDownloadType: any;
  public downloadPopOverVisible = false;
  public downloadOptions: any;
  public selectedStones = [];
  public isBtbSubmissionEmpty = false;
  public timer;
  public isColumnExpanded = false;
  public columnWidth = 130;
  public isIconVisible: boolean = false;
  public packetIconDataForGrid: any[];
  public isEditable = false;
  public isCancelled = false;
  public isDone = false;
  public originalJson: any;
  public menuDistanceFromTop: any;
  public currentScroll: any;
  public btbHeight = window.innerHeight - 295;
  public selectedTableToggle = false;
  public allColumnWidth: any;
  public stonesActedOn: any;
  public iconOverlayXPosition: Number;
  public iconOverlayYPosition: Number;
  public displayIconOverlay: Boolean = false;
  public iconDisplayStoneObject: any;
  public gridRebind = false;
  public colorLegendFilterValue: String[] = [];
  public focusedElement: any;

  public addNoteSubscription: Subscription;
  public isB2bRequestedFromPacket = false;
  constructor(
    private btbService: BidToBuyService,
    private utilService: UtilService,
    private stoneDetailsService: StoneDetailsService,
    private notesService: AddNoteService,
    private userProfileService: UserProfileService,
    private notify: NotifyService,
    private appStore: ApplicationStorageService,
    private messageService: MessageService,
    private downloadSvc: DownloadStonesService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.validateAndUpdatedBtbSubmission({});
    this.updateRowColor();
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      this.updateStoneStateDetails(res);
    });
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
    if (this.appStore.getData('editableSubmission')) {
      this.isEditable = this.appStore.getData('editableSubmission').edit;
    }
    this.btbService.handlekeyupEvent('btbSubmissionContainer');
    this.addNoteSubscription = this.notify.addNewNotesForIggridObservable$.subscribe(res => {
      if (res.isDeleteFlow) {
        this.deleteCommentsFromStones(res);
      } else {
        this.updateNotesForStones(res);
      }
    });
  }

  ngOnChanges() {


  }

  validateAndUpdatedBtbSubmission(stoneResponse) {
    if (this.appStore.getData('btbSubmission')) {
      this.btbSubmissionTableEntry = this.appStore.getData('btbSubmission');
      // this.isBtbSubmissionDataFetched = true;
      this.btbService.getBTBSubmittedStoneList().subscribe(res => {
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_ES_DF_200)) {
          const allStoneID = this.stoneDetailsService.createStoneIdList(res.data);
          const selectedStones = _.intersection(allStoneID, this.btbSubmissionTableEntry['selectedStones']);
          this.btbSubmissionTableEntry['table'] = res.data;
          this.btbSubmissionTableEntry['table'] = this.btbService.addFinalSubmitFlag('b2bSubmission', this.btbSubmissionTableEntry.table);
          this.btbSubmissionTableEntry['table'] = this.utilService.updateStonesForDecimal(this.btbSubmissionTableEntry.table);
          this.btbSubmissionTableEntry['selectedStones'] = JSON.parse(JSON.stringify(selectedStones));
          this.stoneDetailsService.storeStoneAdditionalInfo(this.btbSubmissionTableEntry.table).subscribe(data => {
            this.btbSubmissionTableEntry['table'] = data;
            this.btbSubmissionTableEntry = this.btbService.fetchSelectedStones(this.btbSubmissionTableEntry);
            this.btbSubmissionTableEntry['totalOfferAmt'] = this.btbService.calculateOfferAmount(this.btbSubmissionTableEntry);
            this.notesService.fetchStonesAsynchronously(this.btbSubmissionTableEntry.table)
              .then(response => {
                this.btbSubmissionTableEntry.table = response;
                setTimeout(() => {
                  this.updateSelectedStonesNote();
                  this.stonesActedOn = {
                    'source': 'noteAdded',
                    stoneList: this.stoneDetailsService.createStoneIdList(this.btbSubmissionTableEntry.table)
                  };
                }, 1000);

              })
              .catch(err => {

                console.error(err);

              });
          });
          // this.btbSubmissionTableEntry = this.btbService.fetchStonesComment(this.btbSubmissionTableEntry);
          if (this.isB2bRequestedFromPacket && !_.isEmpty(stoneResponse)) {
            const newResponse = { ...stoneResponse };
            newResponse['stoneObj'] = this.btbSubmissionTableEntry['table'];
            this.stonesActedOn = newResponse;
            this.isB2bRequestedFromPacket = false;
          }
          this.isBtbSubmissionDataFetched = true;
          this.updatePacketDetails(this.packetStoneArray);
          this.appStore.store('btbSubmission', this.btbSubmissionTableEntry);
          this.updateRowColor();
        } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_NSS_200)
          || MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_ES_DNF_200)) {
          if (this.isB2bRequestedFromPacket && !_.isEmpty(stoneResponse)) {
            this.appStore.remove('btbSubmission');
            this.initBtbSubmissionTable();
            this.isB2bRequestedFromPacket = false;
          }
          this.isBtbSubmissionDataFetched = false;
          this.errorMessage = 'BTB_SUBMISSION_EMPTY';
          this.isBtbSubmissionEmpty = true;
        }
      }, error => {
        this.errorMessage = 'SERVER_ERROR_OCCURRED';
      });
    } else {
      this.initBtbSubmissionTable();
      this.errorMessage = 'Loading..';
    }
  }

  initBtbSubmissionTable() {
    this.btbService.getBTBSubmittedStoneList().subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_ES_DF_200)) {
        this.createBtbEntry(res.data);
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_NSS_200)
        || MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_ES_DNF_200)) {
        this.isBtbSubmissionDataFetched = false;
        this.errorMessage = 'BTB_SUBMISSION_EMPTY';
        this.isBtbSubmissionEmpty = true;
      }
    }, error => {
      this.errorMessage = 'SERVER_ERROR_OCCURRED';
    });
  }

  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_btb_btn');
    this.downloadPopOverVisible = true;
  }

  downloadResult(array) {
    this.selectedStones = this.createDeepCopyArray(array.selectedStones);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.downloadStoneDetails(array.table, this.selectedStones, this.selectedDownloadType);
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  sendExcelMail() {
    this.selectedStones = this.createDeepCopyArray(this.btbSubmissionTableEntry.selectedStones);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.mailStoneExcel(this.btbSubmissionTableEntry.selectedStoneArray, this.selectedStones, 'B2B List');
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  createBtbEntry(entry) {
    const dataEntry = this.btbService.createDataEntry(entry);
    dataEntry['table'] = this.btbService.addFinalSubmitFlag('b2bSubmission', dataEntry.table);
    dataEntry['totalOfferAmt'] = this.btbService.calculateOfferAmount(dataEntry.selectedStoneArray);
    this.btbSubmissionTableEntry = dataEntry;
    this.isBtbSubmissionDataFetched = true;
    this.updatePacketDetails(this.packetStoneArray);
    this.appStore.store('btbSubmission', this.btbSubmissionTableEntry);
  }

  isAllCheckboxSelected(array) {
    if (this.btbSubmissionTableEntry.isAllSelected) {
      array.selectedStoneArray = JSON.parse(JSON.stringify(array.table));
      array.filteredStone = this.stoneDetailsService.createStoneIdList(array.selectedStoneArray);
      array.selectedStones = this.stoneDetailsService.createStoneIdList(array.selectedStoneArray);
    } else {
      array.selectedStoneArray = [];
      array.selectedStone = [];
      array.filteredStone = [];
    }

    array = this.btbService.checkAllStoneSelected(array);
    array.totalOfferAmt = this.btbService.calculateOfferAmount(array);
    this.updateRowColor();
    this.appStore.store('btbSubmission', this.btbSubmissionTableEntry);
    if (array.selectedStones.length === 0 && this.isEditable) {
      this.resetPrice();
      this.isEditable = false;
      this.isCancelled = false;
      this.isDone = false;
      this.appSelectedPanel.cancelBTBSubmissionPrice(array);
    }
    this.adjustTableSize();
  }

  filterSelectedStones(array, data) {
    const stoneCount = array.table.filter(id => id._id === data.stoneId);
    if (stoneCount.length > 0) {
      if (stoneCount[0].is_btb_running === false) {
        $('#gridbtbSubmissionStone').igGridSelection('deselectRowById', stoneCount[0]._id);
        this.messageService.showInfoGrowlMessage('BID_TIME_CPMPLETE');
      } else {
        if (data.added === true) {
          array.selectedStones.push(data.stoneId);
        } else {
          array.selectedStones = array.selectedStones.filter(elm => { return elm !== data.stoneId; });
        }
        array = this.btbService.fetchSelectedStones(array);
        this.appStore.store('btbSubmission', this.btbSubmissionTableEntry);
        if (this.btbSubmissionTableEntry.selectedStones.length === 0 && this.isEditable) {
          this.resetPrice();
          this.isEditable = false;
          this.isCancelled = false;
          this.isDone = false;
          // this.appSelectedPanel.currentStoneArray = [];
          this.appSelectedPanel.cancelBTBSubmissionPrice(this.btbSubmissionTableEntry);
        }
        this.appStore.store('isModify', false);
        this.updateRowColor();
        this.adjustTableSize();
      }
    } else {
      if (Array.isArray(data)) {
        array.selectedStoneButton = [];
        array.filteredStone = [];
        array.selectedStoneTable = [];
        array.selectedStones = [];
        array.selectedStoneArray = [];
        array.selectedStone = [];

        if (data.length > 0) {

          data.forEach((elm, index) => {
            const stoneIdCount = array.table.filter(id => id._id === elm._id);
            if (stoneIdCount[0].is_btb_running === true) {
              array.selectedStoneButton.push(elm._id);
              array.filteredStone.push(elm._id);
              array.selectedStones.push(elm._id);
              array.selectedStoneTable.push(

                array.table.find(elem => { return elm._id === elem._id; })

              );
            } else {
              $('#gridbtbSubmissionStone').igGridSelection('deselectRowById', elm._id);
            }
            if (index === data.length - 1) {
              array = this.btbService.fetchSelectedStones(array);
              array.totalCarat = this.btbService.calculateCarat(array);
              this.appStore.store('btbSubmission', this.btbSubmissionTableEntry);
              if (this.btbSubmissionTableEntry.selectedStones.length === 0 && this.isEditable) {
                this.resetPrice();
                this.isEditable = false;
                this.isCancelled = false;
                this.isDone = false;
                this.appSelectedPanel.cancelBTBSubmissionPrice(this.btbSubmissionTableEntry);
              }
              this.appStore.store('isModify', false);
              this.updateRowColor();
              this.adjustTableSize();
            }
          });
        } else {
          this.btbSubmissionTableEntry.isAllSelected = false;
          array.isAllSelected = false;
          array.totalCarat = 0;
          this.isAllCheckboxSelected(array);
        }

      } else {

        if (data.added === true) {
          array.selectedStones.push(data.stoneId);
        } else {
          array.selectedStones = array.selectedStones.filter(elm => { return elm !== data.stoneId; });
        }
        array = this.btbService.fetchSelectedStones(array);
        this.appStore.store('btbSubmission', this.btbSubmissionTableEntry);
        if (this.btbSubmissionTableEntry.selectedStones.length === 0 && this.isEditable) {
          this.resetPrice();
          this.isEditable = false;
          this.isCancelled = false;
          this.isDone = false;
          // this.appSelectedPanel.currentStoneArray = [];
          this.appSelectedPanel.cancelBTBSubmissionPrice(this.btbSubmissionTableEntry);
        }
        this.appStore.store('isModify', false);
        this.updateRowColor();
        this.adjustTableSize();
      }
    }



  }

  gridRefresh(eve) {
    // this.gridRebind = eve.gridRebind;
  }

  submitedStone(eve) {
    // this.submitedStoneList = eve.gridRebind;
  }

  updatePriceInTab(res) {
    this.stonesActedOn = res;
  }

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    if (stoneList) {
      if (!this.btbSubmissionTableEntry && res.b2bAction !== 'b2bPriceInserted') {
        this.createBtbEntry(res.stoneObj);
      }
      if (this.btbSubmissionTableEntry) {
        const initialCount = this.btbSubmissionTableEntry.table.length;
        if (res.hasOwnProperty('b2bAction')) {
          this.isBtbSubmissionDataFetched = true;
          this.btbSubmissionTableEntry = this.updateB2BStoneInfo(this.btbSubmissionTableEntry, stoneList, res);
          const newResponse = { ...res };
          if (res.b2bAction === 'b2bDeleted') {
            newResponse['source'] = 'confirmedStones';
          } else {
            newResponse['source'] = res.b2bAction;
          }
          this.stonesActedOn = newResponse;
        } else if (res.source === 'b2bRequested') {
          this.isB2bRequestedFromPacket = true;
          this.validateAndUpdatedBtbSubmission(res);
        } else {
          this.btbSubmissionTableEntry.table = this.btbService.updateTableStoneDetails(this.btbSubmissionTableEntry.table, stoneList, res);
          if (this.btbSubmissionTableEntry.selectedStoneArray && this.btbSubmissionTableEntry.selectedStoneArray.length > 0) {
            this.btbSubmissionTableEntry.selectedStoneArray =
              this.btbService.updateTableStoneDetails(this.btbSubmissionTableEntry.selectedStoneArray, stoneList, res);
          }
          this.stonesActedOn = res;
        }
        this.btbSubmissionTableEntry.table =
          this.stoneDetailsService.removeDuplicatesFromObject(this.btbSubmissionTableEntry.table, 'stone_id');
        this.isListEmpty();
        this.appStore.store('btbSubmission', this.btbSubmissionTableEntry);
        this.updateRowColor();
      }
    }
  }

  updateB2BStoneInfo(tableObj, stoneList, res) {
    if (res.b2bAction === 'b2bPriceUpdated') {
      tableObj.table = this.btbService.updateBTBStonePriceValue(JSON.parse(JSON.stringify(tableObj.table)), res.stoneObj, false);
    } else if (res.b2bAction === 'b2bDeleted') {
      tableObj = this.btbService.removeBtbEntry(tableObj, res.stoneList);
    } else if (res.b2bAction === 'b2bSubmitted') {
      tableObj.table = this.btbService.updateBTBStonePriceValue(JSON.parse(JSON.stringify(tableObj.table)), res.stoneObj, true);
    } else if (res.b2bAction === 'b2bPriceMidUpdated') {
      tableObj.table = this.btbService.updateBTBStonePriceValue(JSON.parse(JSON.stringify(tableObj.table)), res.stoneObj, true);
      this.appStore.store('btbSubmission', this.btbSubmissionTableEntry);
    }
    return tableObj;
  }

  addStoneDetailTab(data) {
    data = this.btbSubmissionTableEntry.table.find(elm => { return elm._id === data; });
    data['CurrentSelectedTab'] = 'btbSubmmit';
    // this.fetchPageRef();
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'stoneDtl', 'data': data });
  }

  addTwinStoneInfoTab(pairId) {
    // this.fetchPageRef();
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'twinStoneDtl', 'data': pairId });
  }


  updateComments() {
    this.btbService.fetchStonesCommentAsync(this.btbSubmissionTableEntry)
      .then((response) => {
        this.btbSubmissionTableEntry.table = response;
        setTimeout(() => {
          this.stonesActedOn = { 'source': 'noteAdded', data: this.btbSubmissionTableEntry.table };
        }, 1000);
      });
    if (this.btbSubmissionTableEntry.selectedStoneArray && this.btbSubmissionTableEntry.selectedStoneArray.length > 0) {
      this.btbSubmissionTableEntry.selectedStoneArray = this.notesService.fetchStonesComment(this.btbSubmissionTableEntry.selectedStoneArray);
    }
    this.appStore.store('btbSubmission', this.btbSubmissionTableEntry);
  }

  isListEmpty() {
    if (this.btbSubmissionTableEntry.table.length === 0) {
      this.isBtbSubmissionDataFetched = false;
      this.errorMessage = 'BTB_SUBMISSION_EMPTY';
    }
  }

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp(stoneInfo);
    this.toggleMultimediaPopup = true;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  addToPacket(data) {
    this.btbPacket.emit({ visible: true, object: [data] });
  }

  stoneFromSelectedStone(event) {
    this.btbPacket.emit({ visible: event.visible, object: event.object });
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  toggleAddNoteOverlay(e) {
    if (e.forAddNote) {
      this.addnoteOverlayVisible = e.visible;
    } else {
      this.commentsOverlayVisible = e.visible;
    }
  }

  updatePacketDetails(event) {
    if (event && event.array && event.array.length > 0) {
      this.packetIconDataForGrid = event.array.map(elm => { return elm.stones.toString(); }).toString();
    }
    if (this.btbSubmissionTableEntry) {
      if (this.btbSubmissionTableEntry.table) {
        this.btbSubmissionTableEntry.table = this.stoneDetailsService.setStonePacketCount(this.btbSubmissionTableEntry.table);
        this.btbSubmissionTableEntry.table = this.stoneDetailsService.updateStonePacketCount(event, this.btbSubmissionTableEntry.table);
        this.btbSubmissionTableEntry.selectedStoneArray = this.stoneDetailsService.setStonePacketCount(this.btbSubmissionTableEntry.selectedStoneArray);
        this.btbSubmissionTableEntry.selectedStoneArray = this.stoneDetailsService.updateStonePacketCount(event, this.btbSubmissionTableEntry.selectedStoneArray);
      }
    }
  }

  ngOnDestroy() {
    if (this.stoneConfirmedSubscription) {
      this.stoneConfirmedSubscription.unsubscribe();
    }
    if (this.packetSubscription) {
      this.packetSubscription.unsubscribe();
    }
    if (this.addNoteSubscription) {
      this.addNoteSubscription.unsubscribe();
    }
  }

  fetchPageRef() {
    const scrollable = this.btbSubmissionTableContainer.instance.getScrollable('#btbBasketContainer');
    this.btbSubmissionTableEntry['pageRefId'] = scrollable.scrollTop();
    this.appStore.store('btbSubmission', this.btbSubmissionTableEntry);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const container = this.btbSubmissionTableContainer;
      if (this.btbSubmissionTableEntry && this.btbSubmissionTableEntry.hasOwnProperty('sortedColumnOrder') && this.btbSubmissionTableEntry.hasOwnProperty('sortedColumn') && container) {
        container.instance.columnOption(this.btbSubmissionTableEntry.sortedColumn, 'sortOrder', this.btbSubmissionTableEntry.sortedColumnOrder);
      }
      if (this.btbSubmissionTableEntry && this.btbSubmissionTableEntry.pageRefId) {
        const scrollable = this.btbSubmissionTableContainer.instance.getScrollable('#btbSubmissionContainer');
        scrollable.scrollTo({ left: 0, top: this.btbSubmissionTableEntry.pageRefId });
      }
      this.updateRowColor();
    }, 1000);
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneDetailsService.scrollLeft(this.btbSubmissionTableContainer, '#btbSubmissionContainer');
    } else if (params === 'right') {
      this.stoneDetailsService.scrollRight(this.btbSubmissionTableContainer, '#btbSubmissionContainer');
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
    this.stoneDetailsService.handleSortingOrder(this.btbSubmissionTableContainer);
    if (this.isColumnExpanded) {
      const columns = JSON.parse(JSON.stringify(this.btbSubmissionTableContainer.columns));
      columns[1].width = 275;
      this.btbSubmissionTableContainer.columns = columns;
    } else {
      const columns = JSON.parse(JSON.stringify(this.btbSubmissionTableContainer.columns));
      columns[1].width = 130;
      this.btbSubmissionTableContainer.columns = columns;
    }
  }

  updateRowColor() {
    this.btbService.updateRowColor(this.btbSubmissionTableContainer, this.btbSubmissionTableEntry);
  }

  onCellPrepared(e) {
    if (e.rowType === 'data') {
      this.btbSubmissionTableEntry.selectedStones.forEach(stoneId => {
        if (e.key.stone_id === stoneId) {
          this.stoneDetailsService.changeRowColor(e.cellElement, true);
        }
      });
    }
  }

  editSubmissionList(e) {
    this.isEditable = e.edit;
    if (this.isEditable) {
      this.originalJson = JSON.parse(JSON.stringify(this.btbSubmissionTableEntry.table));
      this.appStore.store('originalBtbSubmission', this.originalJson);
    }
    this.isDone = e.done;
    if (this.isDone) {
      this.updatePrice();
    }
    this.isCancelled = e.cancel;
    if (this.isCancelled) {
      this.resetPrice();
    }
  }

  priceEntry(data, offerPrice) {
    if (offerPrice != '') {
      this.appStore.store('isBtbModify', true);
      const response = this.btbService.priceEntry(data, offerPrice);
      if (response.status) {
        const newPrice = this.btbService.setOffPrice(response.data, offerPrice);
        newPrice.data.bid_rate = parseFloat(newPrice.data.bid_rate).toFixed(2);
        /* price update on click of Bid Update Button*/
        // this.initiateAutoSavePrice(newPrice.data, offerPrice, newPrice.offerPer);
        this.stonesActedOn = { source: 'bidToBuyPriceUpdated', data: newPrice.data };
        this.notify.notifyStoneStateUpdated({ b2bAction: 'b2bPriceMidUpdated', stoneList: [data.stone_id], stoneObj: [data] });
      } else {
        data = this.btbService.resetBtbValue(data, data);
        this.stonesActedOn = { source: 'bidToBuyPriceUpdated', data: data };
        this.refreshBtbTable();
      }
    } else {
      data = this.btbService.resetBtbValue(data, data);
      this.stonesActedOn = { source: 'bidToBuyPriceUpdated', data: data };
    }
  }
  refreshBtbTable() {
    if (this.btbSubmissionTableContainer) {
      // this.btbSubmissionTableContainer.instance.refresh();
    }
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


  onPriceKeyDown(ev) {
    ev = (ev) ? ev : window.event;
    const charCode = (ev.which) ? ev.which : ev.keyCode;
    if (charCode === 39 || charCode === 37) {
      ev.stopImmediatePropagation();
      return;
    }
  }

  updatePrice() {
    this.btbSubmissionTableEntry.table.forEach(stone => {
      // if (this.btbSubmissionTableEntry.selectedStones.indexOf(stone.stone_id) > -1) {
      if (stone.offer_per_disc) {
        let bidPercentage = stone.offer_per_disc;
        if (bidPercentage.indexOf('+') !== -1) {
          const bidPercentageValue = bidPercentage.split('+');
          bidPercentage = bidPercentageValue[1];
        }
        this.initiateAutoSavePrice(stone, stone.bid_rate, bidPercentage);
      }
      // }
    });
    const selectedstoneId = this.stoneDetailsService.createStoneIdList(this.btbSubmissionTableEntry.selectedStoneArray);
    const btbstonetable = this.stoneDetailsService.createStoneIdList(this.btbSubmissionTableEntry.table);
    const diffrenceStoneId = _.difference(btbstonetable, selectedstoneId);
    const unChangeStoneId = [];
    this.originalJson = this.appStore.getData('originalBtbSubmission') || JSON.parse(JSON.stringify(this.originalJson));
    diffrenceStoneId.forEach(index => {
      this.originalJson.forEach(element => {
        if (element.stone_id === index) {
          unChangeStoneId.push(element);
        }
      });
    });
    // this.btbSubmissionTableEntry.table.forEach(element => {
    //   unChangeStoneId.forEach(stoneid => {
    //     if (element.stone_id === stoneid.stone_id) {
    //       element = _.extend(element, stoneid);
    //       element['difference'] = stoneid.offer_per_disc_diff || stoneid.difference;
    //       delete element.offer_per_disc_diff;
    //       element['bid_percentage'] = stoneid.offer_per_disc || stoneid.bid_percentage;
    //       delete element.offer_per_disc;
    //     }
    //   });
    // });
    this.refreshBtbTable();
  }

  resetPrice() {
    if (this.originalJson) {
      this.btbSubmissionTableEntry.table = JSON.parse(JSON.stringify(this.originalJson));
    } else {
      this.btbSubmissionTableEntry.table = this.appStore.getData('originalBtbSubmission');
    }
    this.appStore.remove('originalBtbSubmission');
  }

  onPriceInput(data, priceRef: any) {
    const reg = /[^0-9\.\,]/ig;
    if (priceRef.value && reg.test(priceRef.value)) {
      let start = priceRef.selectionStart, end = priceRef.selectionEnd;
      let value = String(priceRef.value).replace(reg, '');
      priceRef.value = value;
      priceRef.setSelectionRange(start, end - 1);
    }
  }

  initiateAutoSavePrice(data, offerPrice, offerPer) {
    this.btbService.autoSavePriceChange(data.stone_id, offerPrice, offerPer, 'u').subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.B2B_BSS_200)) {
        this.stonesActedOn = { source: 'bidToBuyPriceUpdated', data: data };
        this.notify.notifyStoneStateUpdated({ b2bAction: 'b2bPriceUpdated', stoneList: [data.stone_id], stoneObj: [data] });
        this.messageService.showSuccessGrowlMessage('B2B_BID_SUBMIT_SUCCESS');
        if (this.daypGrid) {
          if (this.focusedElement && this.focusedElement.element) {
            this.daypGrid.focusTextBox(this.focusedElement.element, this.focusedElement.mouseClick);
          }
        }
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_TO_401)) {
        this.messageService.showErrorGrowlMessage(MessageCodes.SMS_B2B_TO_401);
      } else {
        this.messageService.showErrorGrowlMessage('FAILURE_ADDING_BID');
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.fixedHeader();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.onWindowScroll();
    this.adjustTableSize();
  }

  fixedHeader() {
    this.currentScroll = window.scrollY;
    const containerWidth = jQuery('#fixedPanel').outerWidth();
    if (jQuery('#fixedPanel').offset() && jQuery('#fixedPanel').offset().top) {
      this.menuDistanceFromTop = jQuery('#fixedPanel').offset().top > 0 ? jQuery('#fixedPanel').offset().top : 0;
      if ((this.currentScroll + 10) > this.menuDistanceFromTop) {
        // jQuery('#fixedBtbPanel').addClass('stuck').innerWidth(containerWidth).css('padding-bottom', '10px');
        jQuery('#packetTabResultId').css('display', 'none');
        jQuery('#packetBox').css('display', 'none');
      } else {
        // jQuery('#fixedBtbPanel').removeClass('stuck').innerWidth(containerWidth).css('padding-bottom', '0px');
        jQuery('#packetTabResultId').css('display', 'block');
        jQuery('#packetBox').css('display', 'block');
      }
      this.adjustTableSize();
    }
  }

  adjustTableSize() {
    this.btbHeight = window.innerHeight - 295;
    this.adjustTableBoxSize();
  }

  adjustTableBoxSize() {
    if (jQuery('#fixedBtbPanel')) {
      // jQuery('#fixedBtbPanel').css('height', window.innerHeight);
    }
  }

  toggleSelectedTable(e) {
    this.selectedTableToggle = e.status;
    this.adjustTableSize();
  }

  onResultLoading(event) {
    const container = this.btbSubmissionTableContainer;
    this.utilService.handleSort(event, container, 'stoneReqSortData', event);
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }

  setColorLegendFilterValue(event: any, filterValue: String): void {

    if (this.colorLegendFilterValue.includes(filterValue)) {

      this.colorLegendFilterValue = this.colorLegendFilterValue.filter(elm => { return elm !== filterValue; });

    } else {

      this.colorLegendFilterValue = [...this.colorLegendFilterValue, filterValue];

    }

  }

  storeLastFocusedElement(event) {
    this.focusedElement = event;
  }


  updateNotesForStones(res) {
    if (this.btbSubmissionTableEntry.table && this.btbSubmissionTableEntry.table.length > 0) {
      const toUpdateStoneArray = this.stoneDetailsService.findStoneObjUsingStoneIds(this.btbSubmissionTableEntry.table, res.stoneList);
      if (toUpdateStoneArray instanceof Array && toUpdateStoneArray.length > 0) {
        this.notesService.fetchStonesAsynchronously(toUpdateStoneArray)
          .then(result => {

            this.btbSubmissionTableEntry.table = this.stoneDetailsService.findAndUpdateStoneCommentFromList(this.btbSubmissionTableEntry.table, result);
            console.log("Rsult", result)
            // console.log('Triggerrring ',result);
            if (result && result instanceof Array && result.length > 0) {
              this.stonesActedOn = { 'source': 'noteAdded', stoneList: res.stoneList };
              this.updateSelectedStonesNote();
            }

          }).catch(error => {

            console.error('Failed with error ');
            console.error(error);

          });
      }
    }
  }

  deleteCommentsFromStones(res) {
    const stoneList = [];
    if (this.btbSubmissionTableEntry.table && this.btbSubmissionTableEntry.table.length > 0) {
      const commentsId = res.commentList;
      this.btbSubmissionTableEntry.table.forEach(stone => {
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
      this.updateSelectedStonesNote();
      if (_.uniq(stoneList) && _.uniq(stoneList).length > 0) {
        this.stonesActedOn = { 'source': 'noteAdded', stoneList: _.uniq(stoneList) };
      }
    }
  }

  updateSelectedStonesNote() {
    if (this.btbSubmissionTableEntry.selectedStoneArray && this.btbSubmissionTableEntry.selectedStoneArray.length > 0) {
      this.btbSubmissionTableEntry.selectedStoneArray =
        this.stoneDetailsService.updateNotesForSelectedPanel(this.btbSubmissionTableEntry.selectedStoneArray, this.btbSubmissionTableEntry.table);
    }
    this.appStore.store('btbSubmission', this.btbSubmissionTableEntry);
  }
}
