import { Component, OnInit, OnChanges, Input, ViewChild, Output, EventEmitter, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { StoneDetailsService } from '@srk/shared';
import { EventDetailsService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';
import { UserProfileService } from '@srk/core';
import { UtilService } from '@srk/shared';
import { AddNoteService } from '@srk/shared';
import { MessageService } from '@srk/core';
import { BidToBuyService } from '@srk/shared';
import { ApplicationStorageService } from '@srk/core';
import { DownloadStonesService } from '@srk/shared';
import { AuthService } from '@srk/core';

@Component({
  selector: 'app-show-all-stock',
  templateUrl: './show-all-stock.component.html',
  styleUrls: ['./show-all-stock.component.scss']
})
export class ShowAllStockComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @Input() stockStones: any;
  @Input() eventCode: any;
  @Input() isPageSearch: any;
  @Input() visiblePacketIcon: any;
  @Output() appointmentPacket = new EventEmitter;
  @Output() modifyResult = new EventEmitter();
  @ViewChild('allShowStockContainer') allShowStockContainer;
  public errorMessage: any;
  public selectedStones = [];
  public isAllSelected = false;
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;
  public httpSubscription: Subscription;
  public allStockStoneObject: any;
  public ddcStones = [];
  public definedDDCHour: any;
  public ddcOverlayVisible = false;
  public stoneStatusSubscription: any;
  public selectedColumnList: any;
  public commentsOverlayVisible = false;
  public allNotesForStone: any;
  public addnoteOverlayVisible = false;
  public btbSelectedStones = [];
  public isBTBDataLoaded = false;
  public isBTBClosed = false;
  public btbOverlayVisible = false;
  public packetSubscription: any;
  public selectedDownloadType: any;
  public downloadOptions: any[];
  public downloadPopOverVisible = false;
  public timer;
  public isColumnExpanded = false;
  public columnWidth = 130;
  public isIconVisible: boolean = false;
  public gridHeight: any;
  public selectedTableToggle = false;
  public allColumnWidth: any;
  constructor(
    private stoneDetailsService: StoneDetailsService,
    private eventDetailsService: EventDetailsService,
    private notify: NotifyService,
    private userProfileService: UserProfileService,
    private notesService: AddNoteService,
    private bidToBuyService: BidToBuyService,
    private messageService: MessageService,
    private appStore: ApplicationStorageService,
    private utilService: UtilService,
    private downloadSvc: DownloadStonesService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.gridHeight = window.innerHeight - 320;
    this.stoneStatusSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      if (res.source) {     
        this.updateStoneStateDetails(res);
      }
    });
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
  }

  ngOnChanges() {
    if (this.stockStones) {
      if (this.appStore.getData('allStockStoneObjectArray') && !this.appStore.getData('isModify')) {
        this.allStockStoneObject = this.appStore.getData('allStockStoneObjectArray');
        this.stoneDetailsService.storeStoneAdditionalInfo(this.allStockStoneObject.stockTable).subscribe(res => {
          this.allStockStoneObject['stockTable'] = res;
        });
      } else {
        this.allStockStoneObject = {
          stockTable: this.stockStones ? this.stockStones : [],
          selectedStoneTable: [],
          selectedStoneArray: [],
          isAllStoneSelected: false,
          filteredSelectedStoneArray: [],
          isAllSelectedStoneSelected: false,
          panelData: {},
          toggleTable: false
        };
        if (this.allStockStoneObject.stockTable.length > 0) {
          this.allStockStoneObject['stockTable'] = this.utilService.updateStonesForDecimal(this.allStockStoneObject.stockTable);
          this.stoneDetailsService.storeStoneAdditionalInfo(this.allStockStoneObject.stockTable).subscribe(res => {
            this.allStockStoneObject['stockTable'] = res;
            this.notesService.getCommentListforStoneIds(this.allStockStoneObject.stockTable).subscribe((response) => {
              this.allStockStoneObject.stockTable = response;
            });
          });
          this.appStore.store('allStockStoneObjectArray', this.allStockStoneObject);
        }
      }
    }
  }

  isAllCheckboxSelected(array) {
    if (array.isAllStoneSelected) {
      array.selectedStoneTable = JSON.parse(JSON.stringify(this.fetchConfirmableStones(array.stockTable)));
      array.filteredSelectedStoneArray = this.stoneDetailsService.createStoneIdList(array.selectedStoneTable);
      array.selectedStoneArray = array.filteredSelectedStoneArray;
      array.isAllSelectedStoneSelected = true;
    } else {
      array.selectedStoneArray = [];
      array.selectedStoneTable = [];
      array.filteredSelectedStoneArray = [];
      array.isAllSelectedStoneSelected = false;
    }
    this.appStore.store('isModify', false);
    this.updateStockStoneArray(array);
    this.updateRowColor();
  }

  filterSelectedStones(array, id) {
    array = this.eventDetailsService.handleTableSelection(array, id);
    this.appStore.store('isModify', false);
    this.updateStockStoneArray(array);
    this.updateRowColor();
  }

  fetchConfirmableStones(array) {
    const confirmableStones = [];
    array.forEach(element => {
      if (((element.stone_state === 6)
        || (element.stone_state === 0)
        || (element.stone_state === 3 && element.reason_code !== 1))) {
      } else {
        confirmableStones.push(element);
      }
    });
    return confirmableStones;
  }

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp();
    this.toggleMultimediaPopup = true;
    this.stoneMultimediaInfo = stoneInfo;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  updateStockStoneArray(array) {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    if (array.selectedStoneTable.length === 0) {
      this.selectedTableToggle = false;
    }
    const stoneIdList = this.stoneDetailsService.createStoneIdList(array.stockTable);
    this.allStockStoneObject.isAllStoneSelected = this.stoneDetailsService.isArrayMatch(array.selectedStoneArray, stoneIdList);
    this.allStockStoneObject.panelData = {};
    if (array.selectedStoneTable && array.selectedStoneTable.length > 0) {
      this.allStockStoneObject.selectedStoneArray = array.selectedStoneArray;
      this.httpSubscription = this.stoneDetailsService.getDiamondPriceInfo(array.selectedStoneTable).subscribe((response) => {
        this.allStockStoneObject.selectedStoneTable = response;
        this.allStockStoneObject.panelData = this.stoneDetailsService.calculateSelectedStoneData(array.selectedStoneTable);
        this.allStockStoneObject.toggleTable = array.toggleTable;
      });
    } else {
      this.allStockStoneObject.panelData = {};
    }
    this.updateRowColor();
    this.appStore.store('allStockStoneObjectArray', this.allStockStoneObject);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.gridHeight = window.innerHeight - 320;
  }

  toggleSelectedTable(e) {
    this.selectedTableToggle = e.status    
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

  updateStoneStateDetails(res) {
    this.eventDetailsService.updateIconsStatusInfo(this.allStockStoneObject.stockTable, res);
    if (res.source === 'confirmedStones') {
      res.stoneList.forEach(stone => {
        this.filterSelectedStones(this.allStockStoneObject, stone);
      });
    }
    this.eventDetailsService.updateIconsStatusInfo(this.allStockStoneObject.selectedStoneTable, res);
    this.appStore.store('allStockStoneObjectArray', this.allStockStoneObject);
  }

  refreshNotes() {
    this.allStockStoneObject.stockTable = this.notesService.fetchStonesComment(this.allStockStoneObject.stockTable);
    this.allStockStoneObject.selectedStoneTable = this.notesService.fetchStonesComment(this.allStockStoneObject.selectedStoneTable);
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
    if (e.noteDetil) {
      this.refreshNotes();
    }
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

  addStoneDetailTab(data) {
    this.getPageRef();
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'stoneDtl', 'data': data });
  }

  addTwinStoneInfoTab(pairId) {
    this.getPageRef();
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'twinStoneDtl', 'data': pairId });
  }

  modifySearch() {
    this.modifyResult.emit({ modify: false });
  }

  addToPacket(data) {
    this.appointmentPacket.emit({ visible: true, object: [data] });
  }

  stoneFromSelectedStone(event) {
    this.appointmentPacket.emit({ visible: event.visible, object: event.object });
  }

  updatePacketDetails(event) {
    if (this.allStockStoneObject.stockTable) {
      this.allStockStoneObject.stockTable = this.stoneDetailsService.setStonePacketCount(this.allStockStoneObject.stockTable);
      this.allStockStoneObject.stockTable = this.stoneDetailsService.updateStonePacketCount(event, this.allStockStoneObject.stockTable);
    }
  }

  /********************SHOWS OPTIONS ON CLICK OF DOWNLOAD ICON****************************/
  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_show_btn');
    this.downloadPopOverVisible = true;
  }

  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  downloadResult(array) {
    this.selectedStones = this.createDeepCopyArray(array.selectedStoneArray);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.downloadStoneDetails(array.selectedStoneTable, this.selectedStones, this.selectedDownloadType);
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  sendExcelMail() {
    const pageName = this.getPageName();
    this.selectedStones = this.createDeepCopyArray(this.allStockStoneObject.selectedStoneArray);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.mailStoneExcel(this.allStockStoneObject.selectedStoneTable, this.selectedStones, pageName);
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  getPageName() {
    const path = (window.location.pathname).split('/');
    let pageName = path[path.length - 1];
    return pageName;
  }

  ngOnDestroy() {
    this.stoneStatusSubscription.unsubscribe();
    if (this.packetSubscription) {
      this.packetSubscription.unsubscribe();
    }
  }

  getPageRef() {
    const scrollable = this.allShowStockContainer.instance.getScrollable();
    this.allStockStoneObject['pageRefId'] = scrollable.scrollTop();
    this.appStore.store('allStockStoneObjectArray', this.allStockStoneObject);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.allStockStoneObject && this.allStockStoneObject.pageRefId) {
        const scrollable = this.allShowStockContainer.instance.getScrollable();
        scrollable.scrollTo({ left: 0, top: this.allStockStoneObject.pageRefId });
      }
    }, 1000);
  }

  newSearch() {
    this.modifyResult.emit({ modify: false });
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneDetailsService.scrollLeft(this.allShowStockContainer, '#allStockStoneContainer');
    } else if (params === 'right') {
      this.stoneDetailsService.scrollRight(this.allShowStockContainer, '#allStockStoneContainer');
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
    this.stoneDetailsService.handleSortingOrder(this.allShowStockContainer);
    const columns = JSON.parse(JSON.stringify(this.allShowStockContainer.columns));
    if (this.isColumnExpanded) {
      columns[1].width = 275;
    } else {
      columns[1].width = 130;
    }
    this.allShowStockContainer.columns = columns;
    this.updateRowColor();
  }

  onCellPrepared(e) {
    if (e.rowType === 'data') {
      this.allStockStoneObject.selectedStoneArray.forEach(stoneId => {
        if (e.key.stone_id === stoneId) {
          this.stoneDetailsService.changeRowColor(e.cellElement, true);
        }
      });
    }
  }

  updateRowColor() {
    if (this.allShowStockContainer) {
      this.allStockStoneObject.stockTable.forEach((element, index) => {
        this.stoneDetailsService.showRowColorChanges(this.allShowStockContainer, this.allStockStoneObject.selectedStoneArray, element.stone_id, index);
      });
    }
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }
}
