import { Component, OnInit, Input, OnChanges, OnDestroy, ViewChild, Output, EventEmitter, AfterViewInit, HostListener } from '@angular/core';
import { BidToBuyService } from '@srk/shared';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { UtilService } from '@srk/shared';
import { StoneDetailsService } from '@srk/shared';
import { AddNoteService } from '@srk/shared';
import { UserProfileService } from '@srk/core';
import * as _ from 'underscore';
import { MessageService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { DownloadStonesService } from '@srk/shared';
import { AuthService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-btb-basket',
  templateUrl: './btb-basket.component.html',
  styleUrls: ['./btb-basket.component.scss']
})
export class BtbBasketComponent implements OnInit, OnDestroy, AfterViewInit {
  gridRebind: any;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('btbBasketContainer') btbBasketContainer;
  @ViewChild('daypGrid') daypGrid: any;
  @Input() visiblePacketIcon = false;
  @Input() packetStoneArray: any;
  @Output() btbPacket = new EventEmitter();
  public btbBasketTableEntry: any;
  public isBtbBasketDataFetched = false;
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
  public isBtbBasketEmpty = false;
  public timer;
  public isColumnExpanded = false;
  public gridHeight: any;
  public stonesActedOn: any;
  public columnWidth = 130;
  public isIconVisible = false;
  public menuDistanceFromTop: any;
  public currentScroll: any;
  public btbHeight = window.innerHeight - 295;
  public selectedTableToggle = false;
  public allColumnWidth: any;
  public iconOverlayXPosition: Number;
  public iconOverlayYPosition: Number;
  public displayIconOverlay: Boolean = false;
  public iconDisplayStoneObject: any;
  public submitedStoneList: any;
  public colorLegendFilterValue: String[] = [];
  public initAutoPriceSubscripation: any;
  public packetIconDataForGrid: any[];
  public focusedElement: any;

  public addNoteSubscription: Subscription;
  public isB2bRequestedFromPacket = false;

  constructor(
    private btbService: BidToBuyService,
    private utilService: UtilService,
    private stoneDetailsService: StoneDetailsService,
    private notesService: AddNoteService,
    private userProfileService: UserProfileService,
    private messageService: MessageService,
    private notify: NotifyService,
    private appStore: ApplicationStorageService,
    private downloadSvc: DownloadStonesService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.validateAndUpdatedBtbBasket({});
    this.gridHeight = window.innerHeight - 285;
    this.errorMessage = 'Loading..';
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      this.updateStoneStateDetails(res);
    });
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
    this.updateRowColor();
    this.btbService.handlekeyupEvent('btbBasketContainer');
    this.addNoteSubscription = this.notify.addNewNotesForIggridObservable$.subscribe(res => {
      if (res.isDeleteFlow) {
        this.deleteCommentsFromStones(res);
      } else {
        this.updateNotesForStones(res);
      }
    });
  }

  validateAndUpdatedBtbBasket(stoneResponse) {
    if (this.appStore.getData('btbBasketEntry')) {
      this.btbBasketTableEntry = this.appStore.getData('btbBasketEntry');
      // this.isBtbSubmissionDataFetched = true;
      this.btbService.getBTBBasketStoneList().subscribe(res => {
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_ES_DF_200)) {
          const allStoneID = this.stoneDetailsService.createStoneIdList(res.data);
          const selectedStones = _.intersection(allStoneID, this.btbBasketTableEntry['selectedStones']);
          this.btbBasketTableEntry['table'] = res.data;
          this.btbBasketTableEntry['table'] = this.btbService.addFinalSubmitFlag('btbBasketEntry', this.btbBasketTableEntry.table);
          this.btbBasketTableEntry['table'] = this.utilService.updateStonesForDecimal(this.btbBasketTableEntry.table);
          this.btbBasketTableEntry['selectedStones'] = JSON.parse(JSON.stringify(selectedStones));
          this.stoneDetailsService.storeStoneAdditionalInfo(this.btbBasketTableEntry.table).subscribe(data => {
            this.btbBasketTableEntry['table'] = data;
            this.btbBasketTableEntry = this.btbService.fetchSelectedStones(this.btbBasketTableEntry);
            this.btbBasketTableEntry['totalOfferAmt'] = this.btbService.calculateOfferAmount(this.btbBasketTableEntry);
            this.notesService.fetchStonesAsynchronously(this.btbBasketTableEntry.table).then(response => {

              this.btbBasketTableEntry.table = response;
              setTimeout(() => {
                this.updateSelectedStonesNote();
                this.stonesActedOn = {
                  'source': 'noteAdded',
                  stoneList: this.stoneDetailsService.createStoneIdList(this.btbBasketTableEntry.table)
                };
              }, 1000);

            }).catch(err => {

              console.error(err);
              // this.stonesActedOn = { 'source': 'noteAdded' };

            });
          });
          if (this.isB2bRequestedFromPacket && !_.isEmpty(stoneResponse)) {
            const newResponse = { ...stoneResponse };
            newResponse['stoneObj'] = this.btbBasketTableEntry['table'];
            this.stonesActedOn = newResponse;
            this.isB2bRequestedFromPacket = false;
          }
          this.isBtbBasketDataFetched = true;
          this.updatePacketDetails(this.packetStoneArray);
          this.appStore.store('btbBasketEntry', this.btbBasketTableEntry);
          this.updateRowColor();
        } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_NSB_200) ||
          MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_ES_DNF_200)) {
          if (this.isB2bRequestedFromPacket && !_.isEmpty(stoneResponse)) {
            this.appStore.remove('btbBasketEntry');
            this.btbBasketTableEntry = null;
            this.initBtbBasketStones();
            this.isB2bRequestedFromPacket = false;
          }
          this.isBtbBasketDataFetched = false;
          this.errorMessage = 'BTB_EMPTY_BASKET';
          this.isBtbBasketEmpty = true;
        }
      }, error => {
        this.isB2bRequestedFromPacket = false;
        this.errorMessage = 'SERVER_ERROR_OCCURRED';
      });
    } else {
      this.initBtbBasketStones();
      this.isB2bRequestedFromPacket = false;
    }
  }

  initBtbBasketStones() {
    this.btbService.getBTBBasketStoneList().subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_ES_DF_200)) {
        this.createBtbEntry(res.data);
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_NSB_200) ||
        MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_ES_DNF_200)) {
        this.errorMessage = 'BTB_EMPTY_BASKET';
        this.isBtbBasketEmpty = true;
        this.isBtbBasketDataFetched = false;
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
    this.selectedStones = this.createDeepCopyArray(this.btbBasketTableEntry.selectedStones);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.mailStoneExcel(this.btbBasketTableEntry.selectedStoneArray, this.selectedStones, 'B2B List');
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  submitedStone(eve) {
    // this.submitedStoneList = eve.gridRebind;
  }
  gridRefresh(eve) {
    // this.gridRebind = eve.gridRebind;
  }

  updatePriceInTab(res) {
    this.stonesActedOn = res;
  }

  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  createBtbEntry(entry) {
    const dataEntry = this.btbService.createDataEntry(entry);
    dataEntry['table'] = this.btbService.addFinalSubmitFlag('b2bBasket', dataEntry.table);
    dataEntry['totalOfferAmt'] = this.btbService.calculateOfferAmount(dataEntry.selectedStoneArray);
    this.btbBasketTableEntry = dataEntry;
    this.isBtbBasketDataFetched = true;
    this.updatePacketDetails(this.packetStoneArray);
    this.appStore.store('btbBasketEntry', this.btbBasketTableEntry);
  }

  isAllCheckboxSelected(array) {
    // isAllSelected ? array.isAllResultSelected = true : array.isAllResultSelected = false;
    if (this.btbBasketTableEntry.isAllSelected) {
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
    array.totalCarat = this.btbService.calculateCarat(array);
    this.appStore.store('btbBasketEntry', this.btbBasketTableEntry);
    this.updateRowColor();
    this.adjustTableSize();
  }

  filterSelectedStones(array, data) {

    if (Array.isArray(data)) {

      array.selectedStoneButton = [];
      array.filteredStone = [];
      array.selectedStoneTable = [];
      array.selectedStones = [];
      array.selectedStoneArray = [];
      array.selectedStone = [];

      if (data.length > 0) {

        data.forEach((elm, index) => {

          array.selectedStoneButton.push(elm._id);
          array.filteredStone.push(elm._id);
          array.selectedStones.push(elm._id);
          array.selectedStoneTable.push(

            array.table.find(elem => { return elm._id === elem._id; })

          );

          if (index === data.length - 1) {

            array = this.btbService.fetchSelectedStones(array);
            this.appStore.store('btbBasketEntry', this.btbBasketTableEntry);
            this.appStore.store('isModify', false);
            this.updateRowColor();
            this.adjustTableSize();

          }

        });

      } else {

        this.btbBasketTableEntry.isAllSelected = false;
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
      array.totalOfferAmt = this.btbService.calculateOfferAmount(array);
      this.appStore.store('btbBasketEntry', this.btbBasketTableEntry);
      this.updateRowColor();
      this.adjustTableSize();


    }

  }


  priceEntry(data, offerPrice) {
    if (offerPrice != "") {
      this.appStore.store('isBtbModify', true);
      const response = this.btbService.priceEntry(data, offerPrice);
      if (response.status) {
        const newPrice = this.btbService.setOffPrice(response.data, offerPrice);
        newPrice.data.bid_rate = parseFloat(newPrice.data.bid_rate).toFixed(2);
        this.stonesActedOn = { source: 'bidToBuyPriceUpdated', data: newPrice.data };
        this.initiateAutoSavePrice(newPrice.data, offerPrice, newPrice.offerPer);

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
    if (this.btbBasketContainer) {
      this.btbBasketContainer.instance.refresh();
    }
  }

  onPriceKeyDown(ev) {
    ev = (ev) ? ev : window.event;
    const charCode = (ev.which) ? ev.which : ev.keyCode;
    if (charCode === 39 || charCode === 37) {
      ev.stopImmediatePropagation();
      return;
    }
  }


  initiateAutoSavePrice(data, offerPrice, offerPer) {
    this.initAutoPriceSubscripation = this.btbService.autoSavePriceChange(data.stone_id, offerPrice, offerPer, 'u').subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.B2B_BSS_200)) {
        this.notify.notifyStoneStateUpdated({ b2bAction: 'b2bPriceInserted', stoneList: [data.stone_id], stoneObj: [data], status: 'basket' });
        this.messageService.showSuccessGrowlMessage(MessageCodes.B2B_BSS_200);
        $('body').css('overflow-y', 'auto');
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

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    if (stoneList) {
      if (!this.btbBasketTableEntry) {
        this.createBtbEntry(res.stoneObj);
      }
      if (this.btbBasketTableEntry) {
        const initialCount = this.btbBasketTableEntry.table.length;
        if (res.hasOwnProperty('b2bAction')) {
          this.isBtbBasketDataFetched = true;
          this.btbBasketTableEntry = this.updateB2BStoneInfo((this.btbBasketTableEntry), stoneList, res);
          if (res.b2bAction === 'b2bPriceInserted' && res.status && res.status !== 'basket') {
          } else {
            const newResponse = { ...res };
            newResponse['source'] = res.b2bAction;
            this.stonesActedOn = newResponse;
          }
        } else if (res.source === 'b2bRequested') {
          this.isB2bRequestedFromPacket = true;
          this.validateAndUpdatedBtbBasket(res);
        } else {
          this.btbBasketTableEntry.table = this.btbService.updateTableStoneDetails(this.btbBasketTableEntry.table, stoneList, res);
          if (this.btbBasketTableEntry.selectedStoneArray && this.btbBasketTableEntry.selectedStoneArray.length > 0) {
            this.btbBasketTableEntry.selectedStoneArray =
              this.btbService.updateTableStoneDetails(this.btbBasketTableEntry.selectedStoneArray, stoneList, res);
          }
          this.stonesActedOn = res;
        }
        if (initialCount !== this.btbBasketTableEntry.table.length) {
          this.btbBasketTableEntry.isAllSelected = false;
        }
        this.isListEmpty();
        this.appStore.store('btbBasketEntry', this.btbBasketTableEntry);
        this.updateRowColor();
      }
    }
  }

  updateB2BStoneInfo(tableObj, stoneList, res) {
    if (res.b2bAction === 'b2bPriceInserted' && res.status && res.status !== 'basket') {
      tableObj.table = this.btbService.updateBTBStonePriceValue(JSON.parse(JSON.stringify(tableObj.table)), res.stoneObj, true);
    } else if (res.b2bAction === 'b2bSubmitted') {
      tableObj = this.btbService.removeBtbEntry(tableObj, res.stoneList);
    } else if (res.b2bAction === 'b2bPriceUpdated') {
      tableObj.table = this.btbService.updateBTBStonePriceValue(tableObj.table, res.stoneObj, false);
    }
    return tableObj;
  }

  onPriceInput(data, priceRef: any) {
    const reg = /[^0-9\.\,]/ig;
    if (priceRef.value && reg.test(priceRef.value)) {
      const start = priceRef.selectionStart, end = priceRef.selectionEnd;
      const value = String(priceRef.value).replace(reg, '');
      priceRef.value = value;
      priceRef.setSelectionRange(start, end - 1);
    }
  }


  addStoneDetailTab(data) {
    data = this.btbBasketTableEntry.table.find(elm => { return elm._id === data; });

    // const scrollable = this.btbBasketContainer.instance.getScrollable('#btbBasketContainer');
    // this.btbBasketTableEntry['pageRefId'] = scrollable.scrollTop();
    data['CurrentSelectedTab'] = 'btbBasket';
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'stoneDtl', 'data': data });
    this.appStore.store('btbBasketEntry', this.btbBasketTableEntry);
  }

  addTwinStoneInfoTab(pairId) {
    // const scrollable = this.btbBasketContainer.instance.getScrollable('#btbBasketContainer');
    // this.btbBasketTableEntry['pageRefId'] = scrollable.scrollTop();
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'twinStoneDtl', 'data': pairId });
    this.appStore.store('btbBasketEntry', this.btbBasketTableEntry);
  }

  isListEmpty() {
    if (this.btbBasketTableEntry.table.length === 0) {
      this.errorMessage = 'BTB_EMPTY_BASKET';
      this.isBtbBasketDataFetched = false;
    }
  }

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp(stoneInfo);
    this.toggleMultimediaPopup = true;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  togglePacketOverlay(data) {
    this.btbPacket.emit({ visible: true, object: [data] });
  }

  stoneFromSelectedStone(event) {
    this.btbPacket.emit({ visible: event.visible, object: event.object });
  }

  updatePacketDetails(event) {
    if (event && event.array && event.array.length > 0) {
      this.packetIconDataForGrid = event.array.map(elm => { return elm.stones.toString(); }).toString();
    }
    if (this.btbBasketTableEntry) {
      if (this.btbBasketTableEntry.table) {
        this.btbBasketTableEntry.table = this.stoneDetailsService.setStonePacketCount(this.btbBasketTableEntry.table);
        this.btbBasketTableEntry.table = this.stoneDetailsService.updateStonePacketCount(event, this.btbBasketTableEntry.table);
        this.btbBasketTableEntry.selectedStoneArray = this.stoneDetailsService.setStonePacketCount(this.btbBasketTableEntry.selectedStoneArray);
        this.btbBasketTableEntry.selectedStoneArray = this.stoneDetailsService.updateStonePacketCount(event, this.btbBasketTableEntry.selectedStoneArray);
      }
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

  updateComments() {
    this.btbService.fetchStonesCommentAsync(this.btbBasketTableEntry)
      .then((response) => {
        this.btbBasketTableEntry.table = response;
        setTimeout(() => {
          this.stonesActedOn = { 'source': 'noteAdded', data: this.btbBasketTableEntry.table };
        }, 1000);
      });
    if (this.btbBasketTableEntry.selectedStoneArray && this.btbBasketTableEntry.selectedStoneArray.length > 0) {
      this.btbBasketTableEntry.selectedStoneArray = this.notesService.fetchStonesComment(this.btbBasketTableEntry.selectedStoneArray);
    }
    this.appStore.store('btbBasketEntry', this.btbBasketTableEntry);
  }

  ngOnDestroy() {
    if (this.stoneConfirmedSubscription) {
      this.stoneConfirmedSubscription.unsubscribe();
    }
    if (this.packetSubscription) {
      this.packetSubscription.unsubscribe();
    }
    if (this.initAutoPriceSubscripation) {
      this.initAutoPriceSubscripation.unsubscribe();
    }
    if (this.addNoteSubscription) {
      this.addNoteSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const container = this.btbBasketContainer;
      /* tslint:disable */
      if (this.btbBasketTableEntry && this.btbBasketTableEntry.hasOwnProperty('sortedColumnOrder') && this.btbBasketTableEntry.hasOwnProperty('sortedColumn') && container) {
        container.instance.columnOption(this.btbBasketTableEntry.sortedColumn, 'sortOrder', this.btbBasketTableEntry.sortedColumnOrder);
      }
      if (this.btbBasketTableEntry && this.btbBasketTableEntry.pageRefId) {
        const scrollable = this.btbBasketContainer.instance.getScrollable('#btbBasketContainer');
        scrollable.scrollTo({ left: 0, top: this.btbBasketTableEntry.pageRefId });
      }
      this.updateRowColor();
    }, 1000);
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneDetailsService.scrollLeft(this.btbBasketContainer, '#btbBasketContainer');
    } else if (params === 'right') {
      this.stoneDetailsService.scrollRight(this.btbBasketContainer, '#btbBasketContainer');
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
    this.stoneDetailsService.handleSortingOrder(this.btbBasketContainer);
    if (this.isColumnExpanded) {
      const columns = JSON.parse(JSON.stringify(this.btbBasketContainer.columns));
      columns[1].width = 275;
      this.btbBasketContainer.columns = columns;
    } else {
      const columns = JSON.parse(JSON.stringify(this.btbBasketContainer.columns));
      columns[1].width = 130;
      this.btbBasketContainer.columns = columns;
    }
  }

  updateRowColor() {
    this.btbService.updateRowColor(this.btbBasketContainer, this.btbBasketTableEntry);
  }

  onCellPrepared(e) {
    if (e.rowType === 'data') {
      this.btbBasketTableEntry.selectedStones.forEach(stoneId => {
        if (e.key.stone_id === stoneId) {
          this.stoneDetailsService.changeRowColor(e.cellElement, true);
        }
      });
    }
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
    const container = this.btbBasketContainer;
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
    if (this.btbBasketTableEntry.table && this.btbBasketTableEntry.table.length > 0) {
      const toUpdateStoneArray = this.stoneDetailsService.findStoneObjUsingStoneIds(this.btbBasketTableEntry.table, res.stoneList);
      if (toUpdateStoneArray instanceof Array && toUpdateStoneArray.length > 0) {
        this.notesService.fetchStonesAsynchronously(toUpdateStoneArray)
          .then(result => {

            this.btbBasketTableEntry.table = this.stoneDetailsService.findAndUpdateStoneCommentFromList(this.btbBasketTableEntry.table, result);
            console.log("Rsult", result)
            // console.log('Triggerrring ',result);
            if (result && result instanceof Array && result.length > 0) {
              this.updateSelectedStonesNote();
              this.stonesActedOn = { 'source': 'noteAdded', stoneList: res.stoneList };
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
    if (this.btbBasketTableEntry.table && this.btbBasketTableEntry.table.length > 0) {
      const commentsId = res.commentList;
      this.btbBasketTableEntry.table.forEach(stone => {
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
    if (this.btbBasketTableEntry.selectedStoneArray && this.btbBasketTableEntry.selectedStoneArray.length > 0) {
      this.btbBasketTableEntry.selectedStoneArray =
        this.stoneDetailsService.updateNotesForSelectedPanel(this.btbBasketTableEntry.selectedStoneArray, this.btbBasketTableEntry.table);
    }
    this.appStore.store('btbBasketEntry', this.btbBasketTableEntry);
  }

}
