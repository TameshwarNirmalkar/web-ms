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

@Component({
  selector: 'app-btb-result',
  templateUrl: './btb-result.component.html',
  styleUrls: ['./btb-result.component.scss']
})
export class BtbResultComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('btbResultContainer') btbResultContainer;
  @Input() visiblePacketIcon = false;
  @Input() packetStoneArray: any;

  @Output() btbPacket = new EventEmitter();
  public btbResultTableEntry: any;
  public isBtbResultDataFetched = false;
  public errorMessage: any;
  public selectedColumnList: any;
  public toggleMultimediaPopup = false;
  public commentsOverlayVisible = false;
  public allNotesForStone: any;
  public addnoteOverlayVisible = false;
  public selectedDownloadType: any;
  public downloadPopOverVisible = false;
  public downloadOptions: any;
  public selectedStones = [];
  public isColumnExpanded = false;
  public isBtbBasketEmpty = false;
  public timer;
  public columnWidth = 130;
  public isIconVisible: boolean = false;
  public menuDistanceFromTop: any;
  public currentScroll: any;
  public btbHeight = window.innerHeight - 120;
  public selectedTableToggle = false;
  public allColumnWidth: any;
  public colorLegendFilterValue: String[] = [];
  public iconOverlayXPosition: Number;
  public iconOverlayYPosition: Number;
  public displayIconOverlay: Boolean = false;
  public iconDisplayStoneObject: any;

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
    this.initBtbResultStones();
    this.errorMessage = 'Loading..';
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.initBtbResultStones();
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.updateRowColor();
    this.btbService.handlekeyupEvent('btbResultContainer');
  }

  initBtbResultStones() {
    this.btbService.getBtbResultStones().subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_ES_DF_200)) {
        this.createBtbEntry(res.data);
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_NSB_200) ||
        MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_ES_DNF_200)) {
        this.errorMessage = 'BTB_EMPTY_RESULT';
        this.isBtbBasketEmpty = true;
        this.isBtbResultDataFetched = false;
      }
    }, error => {
      this.errorMessage = 'SERVER_ERROR_OCCURRED';
    });
  }

  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  createBtbEntry(entry) {
    const dataEntry = this.btbService.createDataEntry(entry);
    dataEntry['table'] = this.btbService.addFinalSubmitFlag('b2bBasket', dataEntry.table);
    dataEntry['totalOfferAmt'] = this.btbService.calculateOfferAmount(dataEntry.selectedStoneArray);
    this.btbResultTableEntry = dataEntry;
    this.isBtbResultDataFetched = true;
    this.btbResultTableEntry = this.btbService.fetchStoneAdditionalInfo(this.btbResultTableEntry);
    this.btbResultTableEntry = this.btbService.fetchStonesComment(this.btbResultTableEntry);
    this.appStore.store('btbResultEntry', this.btbResultTableEntry);
  }

  isAllCheckboxSelected(array) {
    array = this.btbService.checkAllStoneSelected(array);
    array.totalOfferAmt = this.btbService.calculateOfferAmount(array);
    this.appStore.store('btbResultEntry', this.btbResultTableEntry);
    this.updateRowColor();
    this.adjustTableSize();
  }

  filterSelectedStones(array) {
    array = this.btbService.fetchSelectedStones(array);
    array.totalOfferAmt = this.btbService.calculateOfferAmount(array);
    this.appStore.store('btbResultEntry', this.btbResultTableEntry);
    this.updateRowColor();
    this.adjustTableSize();
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

  addStoneDetailTab(data) {
    // const scrollable = this.btbResultContainer.instance.getScrollable('#btbResultContainer');
    // this.btbResultTableEntry['pageRefId'] = scrollable.scrollTop();
    data['CurrentSelectedTab'] = 'btbResult';
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'stoneDtl', 'data': data });
    this.appStore.store('btbResultEntry', this.btbResultTableEntry);
  }

  addTwinStoneInfoTab(pairId) {
    // const scrollable = this.btbResultContainer.instance.getScrollable('#btbResultContainer');
    // this.btbResultTableEntry['pageRefId'] = scrollable.scrollTop();
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'twinStoneDtl', 'data': pairId });
    this.appStore.store('btbResultEntry', this.btbResultTableEntry);
  }

  isListEmpty() {
    if (this.btbResultTableEntry.table.length === 0) {
      this.errorMessage = 'BTB_EMPTY_RESULT';
      this.isBtbResultDataFetched = false;
    }
  }

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp(stoneInfo);
    this.toggleMultimediaPopup = true;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  updateComments() {
    this.btbResultTableEntry = this.btbService.fetchStonesComment(this.btbResultTableEntry);
    if (this.btbResultTableEntry.selectedStoneArray && this.btbResultTableEntry.selectedStoneArray.length > 0) {
      this.btbResultTableEntry.selectedStoneArray = this.notesService.fetchStonesComment(this.btbResultTableEntry.selectedStoneArray);
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


  ngOnDestroy() { }

  ngAfterViewInit() {
    setTimeout(() => {
      const container = this.btbResultContainer;
      /* tslint:disable */
      if (this.btbResultTableEntry && this.btbResultTableEntry.hasOwnProperty('sortedColumnOrder') && this.btbResultTableEntry.hasOwnProperty('sortedColumn') && container) {
        container.instance.columnOption(this.btbResultTableEntry.sortedColumn, 'sortOrder', this.btbResultTableEntry.sortedColumnOrder);
      }
      if (this.btbResultTableEntry && this.btbResultTableEntry.pageRefId) {
        const scrollable = this.btbResultContainer.instance.getScrollable('#btbResultContainer');
        scrollable.scrollTo({ left: 0, top: this.btbResultTableEntry.pageRefId });
      }
      this.updateRowColor();
    }, 1000);
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneDetailsService.scrollLeft(this.btbResultContainer, '#btbResultContainer');
    } else if (params === 'right') {
      this.stoneDetailsService.scrollRight(this.btbResultContainer, '#btbResultContainer');
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
    this.stoneDetailsService.handleSortingOrder(this.btbResultContainer);
    if (this.isColumnExpanded) {
      const columns = JSON.parse(JSON.stringify(this.btbResultContainer.columns));
      columns[1].width = 275;
      this.btbResultContainer.columns = columns;
    } else {
      const columns = JSON.parse(JSON.stringify(this.btbResultContainer.columns));
      columns[1].width = 130;
      this.btbResultContainer.columns = columns;
    }
  }

  updateRowColor() {
    this.btbService.updateRowColor(this.btbResultContainer, this.btbResultTableEntry);
  }

  onCellPrepared(e) {
    if (e.rowType === 'data') {
      this.btbResultTableEntry.selectedStones.forEach(stoneId => {
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
    this.btbHeight = window.innerHeight - 120;
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
    const container = this.btbResultContainer;
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
}
