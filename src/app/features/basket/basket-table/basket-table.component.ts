import { Component, OnInit, Input, ViewChild, AfterViewInit, Output, EventEmitter, OnChanges, ViewChildren, QueryList, HostListener } from '@angular/core';
import { UserProfileService } from '@srk/core';
import { StoneDetailsService, UtilService } from '@srk/shared';
import { BidToBuyService } from '@srk/shared';
import { AddNoteService } from '@srk/shared';
import { AuthService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import { ConfirmationService } from 'primeng/components/common/api';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageService } from '@srk/core';
import { ApiService } from '@srk/shared';
import * as _ from 'underscore';
import { BasketService } from '../basket.service';
import { ApplicationStorageService } from '@srk/core';
import { DownloadStonesService } from '@srk/shared';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

@Component({
  selector: 'app-basket-table',
  templateUrl: './basket-table.component.html',
  styleUrls: ['./basket-table.component.scss']
})
export class BasketTableComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('basketGridComponent') basketGridComponent: any;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @ViewChildren(DxDataGridComponent) dataGrids: QueryList<DxDataGridComponent>;
  @Input() myStonesObj: any;
  @Output() stoneObject = new EventEmitter();
  @Output() countObject = new EventEmitter();
  @Output() basketPacket = new EventEmitter();
  @Input() updateSelectionObj: any;
  @Input() visiblePacketIcon: boolean;
  @Input() basketHeight: any;
  @Input() selectedTab: any;
  public isAllBasketStonesSelected = false;
  public selectedColumnList: any;
  public btbSelectedStones: any[];
  public btbOverlayVisible: boolean;
  public isBTBDataLoaded: boolean;
  public isBTBClosed: boolean;
  public ddcStones = [];
  public definedDDCHour: any;
  public ddcOverlayVisible = false;
  public toggleMultimediaPopup = false;
  public timer: any;
  public screenName = 'BasketScreen';
  public addnoteOverlayVisible = false;
  public commentsOverlayVisible = false;
  public allNotesForStone: any[] = [];
  public clientName: any;
  public addNoteSubscription: any;
  public stoneConfirmedSubscription: any;
  public packetSubscription: any;
  public isIconVisible = false;
  public isColumnExpanded = false;
  public columnWidth = 130;
  public selectedStones = [];
  public downloadType: any;
  public selectedDownloadType: any;
  public downloadOptions: any;
  public downloadPopOverVisible = false;
  public basketSortInfo: any;
  public basketSortData: any;
  public allColumnWidth: any;
  public gridHeight: any;
  constructor(
    private userProfileService: UserProfileService,
    private stoneDetailsService: StoneDetailsService,
    private bidToBuyService: BidToBuyService,
    private notesService: AddNoteService,
    private authService: AuthService,
    private customTranslateSvc: CustomTranslateService,
    private confirmationService: ConfirmationService,
    private notify: NotifyService,
    private messageService: MessageService,
    private apiService: ApiService,
    private basketService: BasketService,
    private appStore: ApplicationStorageService,
    public downloadSvc: DownloadStonesService,
    private utilService: UtilService
  ) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.gridHeight = window.innerHeight - 341;
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      if (res.source) {
        this.updateStoneStateDetails(res);
      }
    });
    this.addNoteSubscription = this.notify.notifyAddNewCommentActionObservable$.subscribe((res) => {
      this.getNotesForAllStones();
    });
    this.clientName = this.authService.getUserDetail().person_name;
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
    [this.isColumnExpanded,this.isIconVisible] = this.utilService.getExpandedColumnValue();
  }


  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.gridHeight = window.innerHeight - 341;
  }

  isAllStoneSelected() {
    if (this.myStonesObj.isAllBasketStonesSelected) {
      this.myStonesObj.selectedStones = this.fetchConfirmableStones(this.myStonesObj.diamondTable);
    } else {
      this.myStonesObj.selectedStones = [];
    }
    this.fetchStoneDetails();
    this.notify.notifyStoneStateUpdated({
      source: 'stoneCheckBoxStatus', stoneList: this.fetchConfirmableStones(this.myStonesObj.diamondTable),
      status: this.myStonesObj.isAllBasketStonesSelected
    });
  }

  fetchStoneDetails() {
    this.myStonesObj.selectedStoneArray = [];
    this.myStonesObj = this.basketService.fetchStoneDetails(this.myStonesObj);
    // if (this.myStonesObj.isAllBasketStonesSelected) {
    //   this.stoneObject.emit({ obj: this.myStonesObj });
    // }
  }

  basketSelectedStoneChanges(stoneId, event) {
    this.notify.notifyStoneStateUpdated({ source: 'stoneCheckBoxStatus', stoneList: [stoneId], status: event });
    let availableStones = [];
    availableStones = this.fetchConfirmableStones(this.myStonesObj.diamondTable);
    if (availableStones.length > 0) {
      this.myStonesObj.isAllBasketStonesSelected = this.stoneDetailsService.isArrayMatch(this.myStonesObj.selectedStones, availableStones);
      this.fetchStoneDetails();
    }
    this.updateRowColor();
  }

  fetchConfirmableStones(array) {
    const confirmableStones = [];
    array.forEach(element => {
      if (((element.stone_state === 6)
        || (element.stone_state === 0)
        || (element.stone_state === 3 && element.reason_code !== 1))) {
      } else {
        confirmableStones.push(element.stone_id);
      }
    });
    return confirmableStones;
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

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp(stoneInfo);
    this.toggleMultimediaPopup = true;

  }

  toggleCloseMultimediaPopUp(e) {

    this.toggleMultimediaPopup = e.status;
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

  ngAfterViewInit() {
    setTimeout(() => {
      this.basketSortData = this.appStore.getData(this.selectedTab + 'BasketGridContainer');
      const container = this.basketGridComponent;
      if (this.basketSortData && this.basketSortData.hasOwnProperty('sortedColumnOrder') && this.basketSortData.hasOwnProperty('sortedColumn') && container) {
        container.instance.columnOption(this.basketSortData.sortedColumn, 'sortOrder', this.basketSortData.sortedColumnOrder);
      }
      if (this.myStonesObj && this.appStore.getData(this.myStonesObj.name + 'pageScrollUpcoming')) {
        const gridIdName = '#' + this.myStonesObj.name + 'BasketGridContainer';
        const scrollable = this.basketGridComponent.instance.getScrollable(gridIdName);
        scrollable.scrollTo({ left: 0, top: this.appStore.getData(this.myStonesObj.name + 'pageScrollUpcoming') });
      }
    }, 2000);
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneDetailsService.scrollLeft(this.basketGridComponent, '#BasketGridContainer');
    } else if (params === 'right') {
      this.stoneDetailsService.scrollRight(this.basketGridComponent, '#BasketGridContainer');
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

  toggleAddNoteOverlay(e) {
    if (e.forAddNote) {
      this.addnoteOverlayVisible = e.visible;
    } else {
      this.commentsOverlayVisible = e.visible;
    }
  }

  getNotesForAllStones(): void {
    if (this.myStonesObj.diamondTable && this.myStonesObj.diamondTable.length > 0) {
      this.myStonesObj.diamondTable = this.notesService.fetchStonesComment(this.myStonesObj.diamondTable);
    }
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }
  removeConfirmedBasketStone(id) {
    const removeStoneMessage = this.customTranslateSvc.translateString('Are you sure, you want to remove this stone ?');
    const removeStoneHeader = this.customTranslateSvc.translateString('Remove stone');
    this.confirmationService.confirm({
      message: removeStoneMessage,
      header: removeStoneHeader,
      accept: () => {
        this.initiateRemoveConfirmedStones(id);
      }
    });
  }

  initiateRemoveConfirmedStones(id) {
    const stoneArray = {
      stone_ids: [id]
    };
    const apiLink = this.authService.getApiLinkForKey('remove_basket_btn', '');
    this.apiService.postCall('BasketDetailsComponent: removeBasket', apiLink, JSON.stringify(stoneArray)).subscribe((response) => {
      if (!response.error_status) {
        this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
        this.notify.notifyStoneStateUpdated({ source: 'stoneRemovedBasket', stoneList: [id] });
      } else {
        this.messageService.showErrorGrowlMessage('Error While Removing Stones from My Basket ');
      }
    });
  }

  addStoneDetailTab(data) {
    const windowTopScroll: any = jQuery(window).scrollTop();
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'stoneDtl', 'data': data });
  }

  addTwinStoneInfoTab(pairId) {
    const windowTopScroll: any = jQuery(window).scrollTop();
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'twinStoneDtl', 'data': pairId });
  }

  addToPacket(data) {
    this.basketPacket.emit({ visible: true, object: [data] });
  }

  updatePacketDetails(event) {
    if (this.myStonesObj.diamondTable.length > 0) {
      this.myStonesObj.diamondTable = this.stoneDetailsService.setStonePacketCount(this.myStonesObj.diamondTable);
      this.myStonesObj.diamondTable = this.stoneDetailsService.updateStonePacketCount(event, this.myStonesObj.diamondTable);
    }
  }

  getPageRef(obj) {
    const gridIdName = '#' + obj.name + 'BasketGridContainer';
    const scrollable = this.basketGridComponent.instance.getScrollable(gridIdName);
    this.appStore.store(obj.name + 'pageScrollUpcoming', scrollable.scrollTop());
  }

  ngOnChanges() {
    this.updateRowColor();
  }

  scrollColumn() {
    this.isColumnExpanded = !this.isColumnExpanded;
    this.isIconVisible = !this.isIconVisible;
    this.stoneDetailsService.handleSortingOrder(this.basketGridComponent);
    if (this.isColumnExpanded) {
      const columns = JSON.parse(JSON.stringify(this.basketGridComponent.columns));
      columns[1].width = 275;
      this.basketGridComponent.columns = columns;
    } else {
      const columns = JSON.parse(JSON.stringify(this.basketGridComponent.columns));
      columns[1].width = 130;
      this.basketGridComponent.columns = columns;
    }
  }

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    if (stoneList && this.myStonesObj.diamondTable.length > 0) {
      const allDiamondStones = this.stoneDetailsService.createStoneIdList(this.myStonesObj.diamondTable);
      const commonStones = _.intersection(allDiamondStones, stoneList);
      commonStones.forEach(stoneObj => {
        if (res.source === 'stoneCheckBoxStatus') {
          if (res.status) {
            this.myStonesObj.selectedStones = _.uniq(_.union(this.myStonesObj.selectedStones, [stoneObj]));
          } else {
            this.myStonesObj.selectedStones = _.difference(this.myStonesObj.selectedStones, [stoneObj]);
          }
        }
      });
      this.myStonesObj = this.basketService.isAllStoneSelected(this.myStonesObj);
      this.myStonesObj = this.basketService.fetchStoneDetails(this.myStonesObj);
      this.updateRowColor();
      this.stoneObject.emit({ obj: this.myStonesObj });
    }
  }

  updateRowColor() {
    if (this.basketGridComponent) {
      this.myStonesObj.diamondTable.forEach((element, index) => {
        this.stoneDetailsService.showRowColorChanges(this.basketGridComponent, this.myStonesObj.selectedStones, element.stone_id, index);
      });
    }
  }

  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_regular_btn');
    this.downloadPopOverVisible = true;
  }

  downloadResult(array) {
    this.selectedStones = this.createDeepCopyArray(array.selectedStones);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.downloadStoneDetails(array.selectedStoneArray, this.selectedStones, this.selectedDownloadType);
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  sendExcelMail() {
    this.selectedStones = this.createDeepCopyArray(this.myStonesObj.selectedStones);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.mailStoneExcel(this.myStonesObj.selectedStoneArray, this.selectedStones, 'basket-page');
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  onCellPrepared(e) {
    if (e.rowType === 'data') {
      e.cellElement.css('height', 35);
      this.myStonesObj.selectedStones.forEach(stoneId => {
        if (e.key.stone_id === stoneId) {
          this.stoneDetailsService.changeRowColor(e.cellElement, true);
        }
      });
    }
  }

  getDataGridContainer(gridId) {
    let container;
    if (this.dataGrids && this.dataGrids.hasOwnProperty('_results')) {
      const dataGrids = this.dataGrids['_results'];
      dataGrids.forEach(dataGrid => {
        if (dataGrid.element.hasOwnProperty('nativeElement')) {
          if (gridId === dataGrid.element['nativeElement'].id) {
            container = dataGrid;
          }
        }
      });
    }
    return container;
  }
  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }
}
