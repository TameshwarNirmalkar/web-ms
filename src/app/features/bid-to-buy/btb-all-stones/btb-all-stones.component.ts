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

declare var $: any;

@Component({
  selector: 'app-btb-all-stones',
  templateUrl: './btb-all-stones.component.html',
  styleUrls: ['./btb-all-stones.component.scss']
})
export class BtbAllStonesComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  public submitedStoneList: any;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('btbAllStonesContainer') btbAllStonesContainer;
  @ViewChild('daypGrid') daypGrid: any;
  @Input() visiblePacketIcon = false;
  @Input() isPageSearch: boolean;
  @Input() packetStoneArray: any;

  @Input() btbAllStones: any[];
  @Output() modifyResult = new EventEmitter();
  @Output() btbPacket = new EventEmitter();
  public btbAllStonesEntry: any;
  public isBtbAllStonesFetched = false;
  public errorMessage: any;
  public selectedColumnList: any;
  public stoneConfirmedSubscription: any;
  public toggleMultimediaPopup = false;
  public commentsOverlayVisible = false;
  public allNotesForStone: any;
  public addnoteOverlayVisible = false;
  public packetSubscription: any;
  public selectedStones = [];
  public selectedDownloadType: any;
  public downloadPopOverVisible = false;
  public isColumnExpanded = false;
  public downloadOptions: any;
  public timer;
  public columnWidth = 130;
  public isIconVisible = false;
  public menuDistanceFromTop: any;
  public currentScroll: any;
  public btbHeight = window.innerHeight - 295;
  public selectedTableToggle = false;
  public allColumnWidth: any;
  public colorLegendFilterValue: String[] = [];
  public initAutoPriceSubscripation: any;
  public focusedElement: any;

  // Variables for grid.
  public packetIconDataForGrid: any[];  // Used to update Packet icons in the Data Grid.
  public stonesActedOn: any;
  public iconOverlayXPosition: Number;
  public iconOverlayYPosition: Number;
  public displayIconOverlay: Boolean = false;
  public iconDisplayStoneObject: any;

  public addNoteSubscription: Subscription;

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
    private authService: AuthService) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      this.updateStoneStateDetails(res);
    });
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.btbService.handlekeyupEvent('allBtbStoneContainer');
    this.addNoteSubscription = this.notify.addNewNotesForIggridObservable$.subscribe(res => {
      if (res.isDeleteFlow) {
        this.deleteCommentsFromStones(res);
      } else {
        this.updateNotesForStones(res);
      }
    });
  }

  ngOnChanges() {
    if (this.btbAllStones) {
      // this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      //   const stoneList = res.stoneList;
      //   if (stoneList && this.btbAllStonesEntry) {
      //     if (res.hasOwnProperty('b2bAction')) {
      //       if (res.status && res.status !== 'search' && res.b2bAction === 'b2bPriceInserted') {
      //         this.btbAllStonesEntry.table = this.updateB2BStoneInfo(this.btbAllStonesEntry.table, stoneList, res);
      //       } else if (res.b2bAction !== 'b2bPriceInserted') {
      //         this.btbAllStonesEntry.table = this.updateB2BStoneInfo(this.btbAllStonesEntry.table, stoneList, res);
      //       }
      //     }
      //   }
      // });
      if (this.appStore.getData('btbAllStockEntry') && !this.appStore.getData('isModify')) {
        this.btbAllStonesEntry = this.appStore.getData('btbAllStockEntry');
        this.isBtbAllStonesFetched = true;
        this.btbAllStonesEntry = this.btbService.fetchStoneAdditionalInfo(this.btbAllStonesEntry);
        // this.btbAllStonesEntry = this.btbService.fetchStonesComment(this.btbAllStonesEntry);
        setTimeout(() => {
          this.stonesActedOn = { source: 'bidToBuyAllStoneUpdate', data: this.btbAllStonesEntry.table };
        }, 2000);
        this.appStore.store('btbAllStockEntry', this.btbAllStonesEntry);
      } else {
        this.btbAllStones.forEach(element => {
          element['is_btb_running'] = 1;
        });
        this.createBtbEntry(this.btbAllStones);
      }
      this.updateRowColor();
    }
  }


  createBtbEntry(btbAllStones) {
    const dataEntry = this.btbService.createDataEntry(this.btbAllStones);
    dataEntry['totalOfferAmt'] = this.btbService.calculateOfferAmount(dataEntry.selectedStoneArray);
    this.btbAllStonesEntry = dataEntry;
    this.isBtbAllStonesFetched = true;
    this.updatePacketDetails(this.packetStoneArray);
    this.appStore.store('btbAllStockEntry', this.btbAllStonesEntry);
  }

  isAllCheckboxSelected(array) {
    if (this.btbAllStonesEntry.isAllSelected) {
      array.selectedStoneArray = JSON.parse(JSON.stringify(array.table));
      array.filteredStone = this.stoneDetailsService.createStoneIdList(array.selectedStoneArray);
      array.selectedStones = this.stoneDetailsService.createStoneIdList(array.selectedStoneArray);
    } else {
      array.selectedStoneArray = [];
      array.selectedStone = [];
      array.filteredStone = [];
    }
    //array.isAllSelected = this.stoneDetailsService.isArrayMatch(array.selectedStone, array.filteredStone);
    //array = this.btbService.checkAllStoneSelected(array);

    this.appStore.store('btbAllStockEntry', this.btbAllStonesEntry);
    this.appStore.store('isModify', false);
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
            this.appStore.store('btbAllStockEntry', this.btbAllStonesEntry);
            this.appStore.store('isModify', false);
            this.updateRowColor();
            this.adjustTableSize();

          }

        });

      } else {

        this.btbAllStonesEntry.isAllSelected = false;
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
      this.appStore.store('btbAllStockEntry', this.btbAllStonesEntry);
      this.appStore.store('isModify', false);
      this.updateRowColor();
      this.adjustTableSize();


    }

  }

  priceEntry(data, offerPrice) {
    if (offerPrice != "") {
      this.appStore.store('isModify', false);
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
    if (this.btbAllStonesContainer) {
      this.btbAllStonesContainer.instance.refresh();
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

  submitedStone(eve) {
    // this.submitedStoneList = eve.gridRebind;
  }

  updatePriceInTab(res) {
    this.stonesActedOn = res;
  }

  initiateAutoSavePrice(data, offerPrice, offerPer) {
    this.initAutoPriceSubscripation = this.btbService.autoSavePriceChange(data.stone_id, offerPrice, offerPer, 'i').subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.B2B_BSS_200)) {
        this.notify.notifyStoneStateUpdated({ b2bAction: 'b2bPriceInserted', stoneList: [data.stone_id], stoneObj: [data], status: 'search' });
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

  onPriceInput(data, priceRef: any) {
    const reg = /[^0-9\.\,]/ig;
    if (priceRef.value && reg.test(priceRef.value)) {
      const start = priceRef.selectionStart, end = priceRef.selectionEnd;
      const value = String(priceRef.value).replace(reg, '');
      priceRef.value = value;
      priceRef.setSelectionRange(start, end - 1);
    }
  }

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    if (stoneList && this.btbAllStonesEntry) {
      if (res.hasOwnProperty('b2bAction')) {
        if (res.status && res.status !== 'search' && res.b2bAction === 'b2bPriceInserted') {
          this.btbAllStonesEntry.table = this.updateB2BStoneInfo(this.btbAllStonesEntry.table, stoneList, res);
          const newResponse = { ...res };
          newResponse['source'] = 'b2bPriceInserted';
          this.stonesActedOn = newResponse;
        } else if (res.b2bAction !== 'b2bPriceInserted') {
          this.btbAllStonesEntry.table = this.updateB2BStoneInfo(this.btbAllStonesEntry.table, stoneList, res);
          const newResponse = { ...res };
          newResponse['source'] = res.b2bAction;
          this.stonesActedOn = newResponse;
        }
      } else if (res.source === 'b2bRequested') {
        // Currently it is kept empty to avoid refresh of b2b
      } else {
        this.btbAllStonesEntry.table = this.btbService.updateTableStoneDetails(this.btbAllStonesEntry.table, stoneList, res);
        if (this.btbAllStonesEntry.selectedStoneArray && this.btbAllStonesEntry.selectedStoneArray.length > 0) {
          this.btbAllStonesEntry.selectedStoneArray =
            this.btbService.updateTableStoneDetails(this.btbAllStonesEntry.selectedStoneArray, stoneList, res);
        }
        this.stonesActedOn = res;
      }
    }
    this.appStore.store('btbAllStockEntry', this.btbAllStonesEntry);
    this.updateRowColor();
  }

  updateB2BStoneInfo(table, stoneList, res) {
    table = this.btbService.updateBTBStonePriceValue(JSON.parse(JSON.stringify(table)), res.stoneObj, false);
    return table;
  }

  addStoneDetailTab(data) {
    data = this.btbAllStonesEntry.table.find(elm => { return elm._id === data; });
    // const scrollable = this.btbAllStonesContainer.instance.getScrollable('#allBtbStoneContainer');
    // this.btbAllStonesEntry['pageRefId'] = scrollable.scrollTop();
    data['CurrentSelectedTab'] = 'btbAllStone';
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'stoneDtl', 'data': data });
    this.appStore.store('btbAllStockEntry', this.btbAllStonesEntry);
  }

  addTwinStoneInfoTab(pairId) {
    // pairId = this.btbAllStonesEntry.table.find(elm => { return elm.std_grp_no ===  pairId ; });
    // const scrollable = this.btbAllStonesContainer.instance.getScrollable('#allBtbStoneContainer');
    // this.btbAllStonesEntry['pageRefId'] = scrollable.scrollTop();
    // pairId['CurrentSelectedTab'] = 'btbAllStone';
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'twinStoneDtl', 'data': pairId });
    this.appStore.store('btbAllStockEntry', this.btbAllStonesEntry);
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
    if (this.btbAllStonesEntry) {
      if (this.btbAllStonesEntry.table) {
        this.btbAllStonesEntry.table = this.stoneDetailsService.setStonePacketCount(this.btbAllStonesEntry.table);
        this.btbAllStonesEntry.table = this.stoneDetailsService.updateStonePacketCount(event, this.btbAllStonesEntry.table);
        this.btbAllStonesEntry.selectedStoneArray = this.stoneDetailsService.setStonePacketCount(this.btbAllStonesEntry.selectedStoneArray);
        this.btbAllStonesEntry.selectedStoneArray = this.stoneDetailsService.updateStonePacketCount(event,
          this.btbAllStonesEntry.selectedStoneArray);
      }
    }
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  updateComments() {
    this.btbService.fetchStonesCommentAsync(this.btbAllStonesEntry)
      .then((response) => {
        this.btbAllStonesEntry.table = response;
        //  setTimeout(function() {
        // this.stonesActedOn = { 'source': 'noteAdded', data: this.btbAllStonesEntry.table };
        // this.stonesActedOn = this.stonesActedOn;
        // }, 1000);
        // this.stonesActedOn = { 'source': 'noteAdded' , data: this.btbAllStonesEntry.table };

      });
    if (this.btbAllStonesEntry.selectedStoneArray && this.btbAllStonesEntry.selectedStoneArray.length > 0) {
      this.btbAllStonesEntry.selectedStoneArray = this.notesService.fetchStonesComment(this.btbAllStonesEntry.selectedStoneArray);
    }
    this.appStore.store('btbAllStockEntry', this.btbAllStonesEntry);
  }

  toggleAddNoteOverlay(e) {
    if (e.forAddNote) {
      this.addnoteOverlayVisible = e.visible;
    } else {
      this.commentsOverlayVisible = e.visible;
    }
    if (e.noteDetil) {
      this.updateComments();
    }
  }

  modifySearch() {
    this.modifyResult.emit({ modify: false });
    this.appStore.store('resetScrollOnModify', 'true');
    this.appStore.store('isBtbModify', false);
  }

  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_btb_btn');
    this.downloadPopOverVisible = true;
  }

  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
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
    this.selectedStones = this.createDeepCopyArray(this.btbAllStonesEntry.selectedStones);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.mailStoneExcel(this.btbAllStonesEntry.selectedStoneArray, this.selectedStones, 'B2B List');
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
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
      const container = this.btbAllStonesContainer;
      if (this.btbAllStonesEntry && this.btbAllStonesEntry.hasOwnProperty('sortedColumnOrder')
        && this.btbAllStonesEntry.hasOwnProperty('sortedColumn') && container) {
        container.instance.columnOption(this.btbAllStonesEntry.sortedColumn, 'sortOrder', this.btbAllStonesEntry.sortedColumnOrder);
      }
      if (this.btbAllStonesEntry && this.btbAllStonesEntry.pageRefId) {
        const scrollable = this.btbAllStonesContainer.instance.getScrollable('#allBtbStoneContainer');
        scrollable.scrollTo({ left: 0, top: this.btbAllStonesEntry.pageRefId });
      }
      this.updateRowColor();
    }, 1000);
  }

  newSearch() {
    this.modifyResult.emit({ modify: false });
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneDetailsService.scrollLeft(this.btbAllStonesContainer, '#allBtbStoneContainer');
    } else if (params === 'right') {
      this.stoneDetailsService.scrollRight(this.btbAllStonesContainer, '#allBtbStoneContainer');
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

  scrollColumn() {
    this.isColumnExpanded = !this.isColumnExpanded;
    this.isIconVisible = !this.isIconVisible;
    this.stoneDetailsService.handleSortingOrder(this.btbAllStonesContainer);
    if (this.isColumnExpanded) {
      const columns = JSON.parse(JSON.stringify(this.btbAllStonesContainer.columns));
      columns[1].width = 275;
      this.btbAllStonesContainer.columns = columns;
    } else {
      const columns = JSON.parse(JSON.stringify(this.btbAllStonesContainer.columns));
      columns[1].width = 130;
      this.btbAllStonesContainer.columns = columns;
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

  updateRowColor() {
    this.btbService.updateRowColor(this.btbAllStonesContainer, this.btbAllStonesEntry);
  }

  onCellPrepared(e) {
    if (e.rowType === 'data') {
      this.btbAllStonesEntry.selectedStones.forEach(stoneId => {
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
    const container = this.btbAllStonesContainer;
    this.utilService.handleSort(event, container, 'btbAllStoneSort', event);
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
    if (this.btbAllStonesEntry.table && this.btbAllStonesEntry.table.length > 0) {
      const toUpdateStoneArray = this.stoneDetailsService.findStoneObjUsingStoneIds(this.btbAllStonesEntry.table, res.stoneList);
      if (toUpdateStoneArray instanceof Array && toUpdateStoneArray.length > 0) {
        this.notesService.fetchStonesAsynchronously(toUpdateStoneArray)
          .then(result => {

            this.btbAllStonesEntry.table = this.stoneDetailsService.findAndUpdateStoneCommentFromList(this.btbAllStonesEntry.table, result);
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
    if (this.btbAllStonesEntry.table && this.btbAllStonesEntry.table.length > 0) {
      const commentsId = res.commentList;
      this.btbAllStonesEntry.table.forEach(stone => {
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
    if (this.btbAllStonesEntry.selectedStoneArray && this.btbAllStonesEntry.selectedStoneArray.length > 0) {
      this.btbAllStonesEntry.selectedStoneArray =
        this.stoneDetailsService.updateNotesForSelectedPanel(this.btbAllStonesEntry.selectedStoneArray, this.btbAllStonesEntry.table);
    }
    this.appStore.store('btbAllStockEntry', this.btbAllStonesEntry);
  }

}
