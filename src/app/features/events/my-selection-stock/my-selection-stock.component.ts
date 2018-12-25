import { Component, OnInit, OnChanges, Input, ViewChild, OnDestroy, Output, EventEmitter, AfterViewInit, HostListener } from '@angular/core';
import { StoneDetailsService } from '@srk/shared';
import { EventDetailsService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';
import { UtilService } from '@srk/shared';
import { UserProfileService } from '@srk/core';
import { AddNoteService } from '@srk/shared';
import { MessageService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { BidToBuyService } from '@srk/shared';
import { NotifyService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { ConfirmationService } from 'primeng/components/common/api';
import { CustomTranslateService } from '@srk/core';
import { DownloadStonesService } from '@srk/shared';
import { AuthService } from '@srk/core';

@Component({
  selector: 'app-my-selection-stock',
  templateUrl: './my-selection-stock.component.html',
  styleUrls: ['./my-selection-stock.component.scss']
})
export class MySelectionStockComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @Input() eventCode: any;
  @Input() mySelectionStones: any;
  @Input() visiblePacketIcon: boolean;
  @Output() appointmentPacket = new EventEmitter();
  @ViewChild('preSelectionContainer') preSelectionContainer;
  public errorMessage: any;
  public selectedStones = [];
  public isAllSelected = false;
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;
  public httpSubscription: Subscription;
  public selectionListObject: any;
  public selectedColumnList: any;
  public addnoteOverlayVisible = false;
  public commentsOverlayVisible = false;
  public allNotesForStone: any;
  public selectedDownloadType: any;
  public downloadPopOverVisible = false;
  public downloadOptions: any;
  public ddcStones = [];
  public definedDDCHour: any;
  public ddcOverlayVisible = false;
  public dataFetched = false;
  public btbSelectedStones = [];
  public isBTBDataLoaded = false;
  public isBTBClosed = false;
  public btbOverlayVisible = false;
  public stoneStatusSubscription: any;
  public packetSubscription: any;
  public timer;
  public columnWidth = 130;
  public isIconVisible: boolean = false;
  public gridHeight: any;
  public selectedTableToggle = false;
  public allColumnWidth: any;
  public isColumnExpanded = false;

  constructor(
    private stoneDetailsService: StoneDetailsService,
    private eventDetailsService: EventDetailsService,
    private userProfileService: UserProfileService,
    private notesService: AddNoteService,
    private notify: NotifyService,
    private bidToBuyService: BidToBuyService,
    private messageService: MessageService,
    private appStore: ApplicationStorageService,
    private utilService: UtilService,
    private customTranslateSvc: CustomTranslateService,
    private confirmationService: ConfirmationService,
    private downloadSvc: DownloadStonesService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.gridHeight = window.innerHeight - 320;
    this.errorMessage = 'Loading..';
    this.stoneStatusSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      if (res.source) {        
        this.updateStoneStateDetails(res);
      }
    });
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_show_btn');
  }

  ngOnChanges() {
    if (this.eventCode) {
      if (this.appStore.getData('mySelectionStockArray')) {
        this.selectionListObject = this.appStore.getData('mySelectionStockArray');
        this.dataFetched = true;       
        this.updateStockStoneArray(this.selectionListObject);
        this.stoneDetailsService.storeStoneAdditionalInfo(this.selectionListObject.stockTable).subscribe(res => {
        this.selectionListObject['stockTable'] = res;
        })
        
      } else {
        this.initializeSelectionStock();
      }
    }
  }

  toggleSelectedTable(e) {
    this.selectedTableToggle = e.status;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.gridHeight = window.innerHeight - 320;
  }

  initializeSelectionStock() {
    this.eventDetailsService.fetchPreSelectedEventStones(this.eventCode).subscribe(res => {
      if (!res.error_status && MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_SELLIST_FOUND_200)) {
        if (res.data.length > 0) {
          this.createPreSelectedStoneObject(res.data);
        } else {
          this.errorMessage = 'NO_PRESELECTED_STONE_ADDED';
        }
      } else if (!res.error_status && MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_SEL_DNF_200)) {
        this.errorMessage = 'NO_PRESELECTED_STONE_ADDED';
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_SEL_ENF_200)) {
        this.errorMessage = 'SELECTION_EVENT_ENDED';
      } else {
        this.errorMessage = 'NO_PRESELECTED_STONE_ADDED';
      }
    }, error => {
      this.errorMessage = 'SERVER_ERROR_OCCURRED';
    });
  }

  createPreSelectedStoneObject(stoneObj) {
    this.dataFetched = true;
    this.selectionListObject = {
      stockTable: this.eventDetailsService.arrangePreSelectedStones(stoneObj),
      selectedStoneTable: [],
      selectedStoneArray: [],
      isAllStoneSelected: false,
      filteredSelectedStoneArray: [],
      isAllSelectedStoneSelected: false,
      panelData: {},
      toggleTable: false
    };
    this.selectionListObject['stockTable'] = this.utilService.updateStonesForDecimal(this.selectionListObject['stockTable']);
    this.stoneDetailsService.storeStoneAdditionalInfo(this.selectionListObject.stockTable).subscribe(res => {
      
      this.selectionListObject['stockTable'] = res;
      
      this.selectionListObject.stockTable = this.notesService.fetchStonesComment(this.selectionListObject.stockTable);
      
    }, error => { });
    this.appStore.store('mySelectionStockArray', this.selectionListObject);
  }
  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadPopOverVisible = true;
  }

  downloadResult() {
    this.selectedStones = this.createDeepCopyArray(this.selectionListObject.selectedStoneArray);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.downloadStoneDetails(this.selectionListObject.stockTable, this.selectedStones, this.selectedDownloadType);
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  sendExcelMail() {
    this.selectedStones = this.createDeepCopyArray(this.selectionListObject.selectedStoneArray);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.mailStoneExcel(this.selectionListObject.stockTable, this.selectedStones, 'Specific Search Result List');
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
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
    this.updateRowColor();
    this.updateStockStoneArray(array);
  }

  filterSelectedStones(array, id) {
    array = this.eventDetailsService.handleTableSelection(array, id);
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
    const stoneIdList = this.stoneDetailsService.createStoneIdList(array.stockTable);
    
    this.selectionListObject.isAllStoneSelected = this.stoneDetailsService.isArrayMatch(array.selectedStoneArray, stoneIdList);
    this.selectionListObject.panelData = {};
    if (array.selectedStoneTable && array.selectedStoneTable.length > 0) {
      this.selectionListObject.selectedStoneArray = array.selectedStoneArray;
      this.httpSubscription = this.stoneDetailsService.getDiamondPriceInfo(array.selectedStoneTable).subscribe((response) => {
        this.selectionListObject.selectedStoneTable = response;
        this.selectionListObject.panelData = this.stoneDetailsService.calculateSelectedStoneData(array.selectedStoneTable);
        this.selectionListObject.toggleTable = array.toggleTable;
      });
    } else {
      this.selectionListObject.panelData = {};
    }
    this.updateRowColor();
    this.appStore.store('mySelectionStockArray', this.selectionListObject);
  }


  refreshNotes() {
    this.selectionListObject.stockTable = this.notesService.fetchStonesComment(this.selectionListObject.stockTable);
    this.selectionListObject.selectedStoneTable = this.notesService.fetchStonesComment(this.selectionListObject.selectedStoneTable);
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

  removePreSelectedStones(stones, flag) {
    this.eventDetailsService.removePreSelectedStones(this.eventCode, stones).subscribe(res => {
      if (!res.error_status) {
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_SEL_DL_200)) {
          stones.forEach(stoneId => {
            if (flag) {
              this.filterSelectedStones(this.selectionListObject, stoneId);
            }
            this.removeStonesFromObject(stoneId);
          });
          this.messageService.showSuccessGrowlMessage(MessageCodes.EVENT_SEL_DL_200);
        }
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURED');
    });
  }

  removeStonesFromObject(stoneId) {
    this.selectionListObject.stockTable.forEach(tableObj => {
      if (stoneId === tableObj.stone_id) {
        const i = this.selectionListObject.stockTable.indexOf(tableObj);
        if (i > -1) {
          this.selectionListObject.stockTable.splice(i, 1);
        }
      }
    });
    if (this.selectionListObject.stockTable.length === 0) {
      this.errorMessage = 'NO_PRESELECTED_STONE_ADDED';
      this.dataFetched = false;
    }
    this.appStore.store('mySelectionStockArray', this.selectionListObject);
  }

  addStoneDetailTab(data) {
    this.getPageRef();
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'stoneDtl', 'data': data });
  }

  addTwinStoneInfoTab(pairId) {
    this.getPageRef();
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'twinStoneDtl', 'data': pairId });
  }

  updateStoneStateDetails(res) {
    if (res.source === 'confirmedStones') {
      res.stoneList.forEach(stone => {
        const tempIndex = this.selectionListObject.stockTable.findIndex((stockStone) => {
          return stockStone.stone_id === stone;
        });
        this.selectionListObject.stockTable.splice(tempIndex, 1);
        this.filterSelectedStones(this.selectionListObject, stone);
      });
    }
    this.eventDetailsService.updateIconsStatusInfo(this.selectionListObject.stockTable, res);
    this.eventDetailsService.updateIconsStatusInfo(this.selectionListObject.selectedStoneTable, res);
    this.appStore.store('mySelectionStockArray', this.selectionListObject);
  }

  addToPacket(data) {
    this.appointmentPacket.emit({ visible: true, object: [data] });
  }

  stoneFromSelectedStone(event) {
    this.appointmentPacket.emit({ visible: event.visible, object: event.object });
  }

  updatePacketDetails(event) {
    if (this.selectionListObject.stockTable) {
      this.selectionListObject.stockTable = this.stoneDetailsService.setStonePacketCount(this.selectionListObject.stockTable);
      this.selectionListObject.stockTable = this.stoneDetailsService.updateStonePacketCount(event, this.selectionListObject.stockTable);
    }
  }

  ngOnDestroy() {
    this.packetSubscription.unsubscribe();
    this.stoneStatusSubscription.unsubscribe();
  }

  removeConfirmedEventStones(stoneId) {
    const removeStoneMessage = this.customTranslateSvc.translateString('Are you sure, you want to remove this stone ?');
    const removeStoneHeader = this.customTranslateSvc.translateString('Remove stone');
    this.confirmationService.confirm({
      message: removeStoneMessage,
      header: removeStoneHeader,
      accept: () => {
        this.removePreSelectedStones(stoneId, false);
      }
    });
  }

  getPageRef() {
    const scrollable = this.preSelectionContainer.instance.getScrollable('#mySelectionContainer');
    this.selectionListObject['pageRefId'] = scrollable.scrollTop();
    this.appStore.store('mySelectionStockArray', this.selectionListObject);
  }

  ngAfterViewInit() {
    if (this.selectionListObject && this.selectionListObject.pageRefId) {
      setTimeout(() => {
        const scrollable = this.preSelectionContainer.instance.getScrollable('#mySelectionContainer');
        scrollable.scrollTo({ left: 0, top: this.selectionListObject.pageRefId });
      }, 1000);
    }
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneDetailsService.scrollLeft(this.preSelectionContainer, '#mySelectionContainer');
    } else if (params === 'right') {
      this.stoneDetailsService.scrollRight(this.preSelectionContainer, '#mySelectionContainer');
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
    this.stoneDetailsService.handleSortingOrder(this.preSelectionContainer);
    const columns = JSON.parse(JSON.stringify(this.preSelectionContainer.columns));
    if (this.isColumnExpanded) {
      columns[1].width = 275;
    } else {
      columns[1].width = 130;
    }
    this.preSelectionContainer.columns = columns;
    this.updateRowColor();
  }

  onCellPrepared(e) {
    if (e.rowType === 'data') {
      this.selectionListObject.selectedStoneArray.forEach(stoneId => {
        if (e.key.stone_id === stoneId) {
          this.stoneDetailsService.changeRowColor(e.cellElement, true);
        }
      });
    }
  }

  updateRowColor() {
    if (this.preSelectionContainer) {
      this.selectionListObject.stockTable.forEach((element, index) => {
        this.stoneDetailsService.showRowColorChanges(this.preSelectionContainer, this.selectionListObject.selectedStoneArray, element.stone_id, index);
      });
    }
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }
}
