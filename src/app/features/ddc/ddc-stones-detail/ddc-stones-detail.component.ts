import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, OnChanges, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { DdcService } from '@srk/shared';
import { NotifyService } from '@srk/core';
import { UserProfileService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';
import { Subscription } from 'rxjs/Subscription';
import { ThmConfirmOverlayComponent } from '@srk/shared';
import { AddNoteService } from '@srk/shared';
import { UtilService } from '@srk/shared';
import { MessageService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { Observable } from 'rxjs/Observable';
import { DownloadStonesService } from '@srk/shared';
import { AuthService } from '@srk/core';

@Component({
  selector: 'app-ddc-stones-detail',
  templateUrl: './ddc-stones-detail.component.html',
  styleUrls: ['./ddc-stones-detail.component.scss']
})
export class DdcStonesDetailComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('thmPacketPanel') thmPacketPanel;
  @ViewChild('ddcGridComponent') ddcGridComponent;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @ViewChild(ThmConfirmOverlayComponent) thmConfirmOverlayComponent;
  @Input() ddcStones: any[];
  @Input() visiblePacketIcon: boolean;

  @Output() displayStoneDetails = new EventEmitter();
  @Output() stoneToAddPakcet = new EventEmitter();
  @Output() removeDDCStone = new EventEmitter();

  public subscriptionInterval: Subscription;
  public stoneUpdateSubscription: Subscription;
  public totalStoneCount: number;
  public confirmedStoneCount: number;
  public notAvailableStoneCount: number;
  public inactiveStoneCount: number;
  public availableStoneCount: number;
  public selectedDownloadType: any;
  public selectedStones: any[] = [];
  public isAllStoneSelected = false;
  public message: string;
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;
  public ddcOverlayVisible = false;
  public definedDDCHour: any;
  public updateDDCStone: any[] = [];
  public tabName: any[] = [];
  public currentTabSelected: any;
  public selectedColumnList: any;
  public selectedPanelconfirmOverlayVisible = false;
  public commentsOverlayVisible = false;
  public allNotesForStone: any[] = [];
  public addnoteOverlayVisible = false;
  public stoneButtonList: any;
  public selectedStoneObj: any;
  public selectedStoneArray = [];
  public downloadOptions: any[];
  public downloadPopOverVisible = false;
  public httpSubscription: Subscription;
  public timer;
  public columnWidth = 230;
  public isIconVisible = false;
  public menuDistanceFromTop: any;
  public currentScroll: any;
  public height = window.innerHeight - 355;
  public selectedTableToggle = false;
  public ddcSortingInfo: any;
  public allColumnWidth: any;
  public isColumnExpanded = false;

  constructor(
    private utilService: UtilService,
    private ddcSvc: DdcService,
    private stoneSvc: StoneDetailsService,
    private messageSvc: MessageService,
    private notify: NotifyService,
    private userProfileService: UserProfileService,
    private notesService: AddNoteService,
    private messageService: MessageService,
    public downloadSvc: DownloadStonesService,
    private appStore: ApplicationStorageService,
    private authService: AuthService) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.stoneButtonList = {
      addNote: true,
      addToEvent: true,
      removeDDC: true,
      updateDDC: true,
      addToBasket: true,
      confirmButton: true,
      addToDayp: true
    };
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_regular_btn');
    this.selectedStoneObj = {
      selectedStones: [],
      selectedStoneArray: [],
      panelData: {},
      isAllSelectedStoneSelected: false
    };
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.httpSubscription = this.stoneSvc.getConfirmedExportMemo().subscribe(res => { }, error => { });
    this.stoneUpdateSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      if (res.source) {
        this.updateTableData(res);
      }
    });
    this.subscriptionInterval = Observable.interval(60000).subscribe(x => {
      if (this.ddcStones) {
        this.ddcStones.forEach((stone) => {
          this.updateDDCTime(stone);
        });
      }
    });
  }

  ngOnChanges() {
    if (this.ddcStones) {
      this.getDdcPanelData();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const container = this.ddcGridComponent;
      if (this.ddcStones.hasOwnProperty('sortedColumnOrder') && this.ddcStones.hasOwnProperty('sortedColumn') && container) {
        container.instance.columnOption(this.ddcStones['sortedColumn'], 'sortOrder', this.ddcStones['sortedColumnOrder']);
      }
      if (this.appStore.getData('pageRef')) {
        const scrollable = this.ddcGridComponent.instance.getScrollable('#ddcGridContainer');
        scrollable.scrollTo({ left: 0, top: this.appStore.getData('pageRef') });
      }
    }, 1000);
  }

  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadPopOverVisible = true;
  }

  downloadResult() {
    this.selectedStones = this.createDeepCopyArray(this.selectedStoneObj.selectedStones);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.downloadStoneDetails(this.ddcStones, this.selectedStones, this.selectedDownloadType);
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  sendExcelMail() {
    this.selectedStones = this.createDeepCopyArray(this.selectedStoneObj.selectedStones);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.mailStoneExcel(this.ddcStones, this.selectedStones, 'Specific Search Result List');
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  updateDDCTime(stone) {
    let minute, hour;
    if (stone.pending_minutes > 0) {
      minute = stone.pending_minutes % 60;
      hour = (stone.pending_minutes - minute) / 60;
      if (minute === 0) {
        if (hour > 0) {
          minute = 59;
          hour--;
          stone.pending_minutes = stone.pending_minutes - 1;
        } else if (hour === 0) {
          hour = 0;
          minute = 0;
        }
      } else {
        minute--;
        stone.pending_minutes = stone.pending_minutes - 1;
        if (stone.pending_minutes === 0) {
          this.notAvailableStoneCount++;
        }
      }
      stone.remained_ddc_time = hour.toString() + ':' + (minute < 10 ? '0' : '') + minute.toString();
    }
  }

  updateTableData(res) {
    const stoneList = res.stoneList;
    if (stoneList) {
      stoneList.forEach((stoneId, index) => {
        this.ddcStones = this.updateStoneIconsInfo(this.ddcStones, stoneId, res);
        this.selectedStoneObj.selectedStoneArray.forEach(object => {
          if (object.stone_id === stoneId) {
            if (res.source === 'confirmedStones') {
              stoneList.splice(index, 1);
              this.removeSelectedStone([stoneId], this.selectedStones);
            } else if (res.source === 'ddcRequested') {
              object['ddcStatus'] = res.status;
              object['ddcHour'] = res.hour;
              if (res.hour === 0) {
                this.removeSelectedStone([stoneId], this.selectedStones);
              }
            } else if (res.source === 'basketRequested') {
              object['isBasket'] = 1;
              object['basketStatus'] = '=';
            } else if (res.source === 'onlineViewIncrement') {
              object['totalViewedByUser']++;
            }
          }
        });
      });
    }
    if (res.source === 'confirmedStones' || (res.source === 'ddcRequested' && res.hour === 0)) {
      this.fetchStoneDetails(this.selectedStones);
      this.updateSelectedStonePanel();
    }
    this.getDdcPanelData();
  }

  initializeCounts() {
    this.totalStoneCount = 0;
    this.confirmedStoneCount = 0;
    this.notAvailableStoneCount = 0;
    this.inactiveStoneCount = 0;
    this.availableStoneCount = 0;
  }

  getDdcPanelData() {
    this.initializeCounts();
    this.ddcStones.forEach((stone) => {
      if (stone.ddc_status === 0) {
        this.totalStoneCount++;
      }
      if (stone.ddc_status === 1) {
        this.confirmedStoneCount++;
      }
      if (stone.ddc_status === 2) {
        if (stone.business_process) {
          this.inactiveStoneCount++;
        } else {
          this.availableStoneCount++;
        }
      }
      if (stone.ddc_status === 3) {
        this.notAvailableStoneCount++;
      } else {
        const m = stone.pending_minutes % 60;
        const h = (stone.pending_minutes - m) / 60;
        stone.remained_ddc_time = h.toString() + ':' + (m < 10 ? '0' : '') + m.toString();
      }
    });
  }

  filterSelectedStones() {
    let availableStones = [];
    availableStones = this.fetchConfirmableStones();
    if (availableStones.length > 0) {
      this.isAllStoneSelected = this.stoneSvc.isArrayMatch(this.selectedStones, availableStones);
    }
    this.fetchStoneDetails(this.selectedStones);
    this.updateSelectedStonePanel();
    this.updateRowColor();
  }

  fetchConfirmableStones() {
    const confirmableStones = [];
    this.ddcStones.forEach(element => {
      if (((element.stone_state === 6)
        || (element.stone_state === 0)
        || (element.stone_state === 3 && element.reason_code !== 1))) {
      } else {
        confirmableStones.push(element.stone_id);
      }
    });
    return confirmableStones;
  }

  isAllCheckboxSelected() {
    if (this.isAllStoneSelected) {
      this.selectedStones = [];
      this.ddcStones.forEach(element => {
        this.selectedStones = this.fetchConfirmableStones();
      });
    } else {
      this.selectedStones = [];
    }
    this.fetchStoneDetails(this.selectedStones);
    this.updateSelectedStonePanel();
    this.updateRowColor();
  }

  updateDDC(stoneData) {

    this.updateDDCStone = [];
    if (this.thmDdcOverlay && this.thmDdcOverlay.selectedDdcHour) {
      this.thmDdcOverlay.selectedDdcHour = 0;
    }
    this.definedDDCHour = 0;
    this.updateDDCStone.push(stoneData.stone_id);
    if (stoneData.ddcHour > 0) {
      this.definedDDCHour = stoneData.ddcHour;
    }
    this.ddcOverlayVisible = true;
  }

  toggleDdcOverlay(e) {
    this.ddcOverlayVisible = e.visible;
  }

  updateSelectedStoneDDC() {
    if (this.selectedStones.length > 0) {
      this.selectedStones = JSON.parse(JSON.stringify(this.selectedStones));
      this.updateDDcHours(this.selectedStones);
    } else {
      this.messageSvc.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  updateDDcHours(stoneList) {
    this.updateDDCStone = [];
    this.thmDdcOverlay.selectedDdcHour = 0;
    this.definedDDCHour = 0;
    stoneList.forEach(stone => {
      this.updateDDCStone.push(stone);
    });
    this.ddcOverlayVisible = true;
  }

  removeStoneFromTable(stoneList) {
    stoneList.forEach((value) => {
      this.ddcStones.forEach((stone) => {
        if (stone.stone_id === value) {
          const i = this.ddcStones.indexOf(stone);
          if (this.ddcGridComponent) {
            this.ddcGridComponent.instance.deselectRows(stone);
          }
          this.ddcStones.splice(i, 1);
        }
      });
      if (this.ddcStones.length === 0) {
        this.removeDDCStone.emit({ data: [] });
      }
    });
  }

  removeSelectedStone(array, array2) {
    array.forEach((value) => {
      if (array2.indexOf(value) > -1) {
        const i = array2.indexOf(value);
        array2.splice(i, 1);
      }
    });
  }

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp(stoneInfo);
    this.toggleMultimediaPopup = true;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  addTwinStoneInfoTab(pairId, tabs) {
    this.displayStoneDetails.emit({ type: 'twinStoneDtl', data: pairId });
  }

  addStoneDetailTab(data) {
    this.displayStoneDetails.emit({ type: 'stoneDtl', data: data });
  }

  addTab(res) {
    if (res.data && res.type === 'stoneDtl') {
      this.addStoneDetailTab(res.data)
    } else if (res.data && res.type === 'twinStoneDtl') {
      this.addTwinStoneInfoTab(res.data, this.tabName)
    }
  }

  removeDetailedPacketTab(tabName) {
    this.tabName.forEach((element) => {
      if (element.stoneName === tabName) {
        const i = this.tabName.indexOf(element);
        this.tabName.splice(i, 1);
      } else if (element.pairId === tabName) {
        const i = this.tabName.indexOf(element);
        this.tabName.splice(i, 1);
      }
    });
  }

  refreshNotes() {
    this.ddcStones = this.notesService.fetchStonesComment(this.ddcStones);
    this.selectedStoneObj.selectedStoneArray = this.notesService.fetchStonesComment(this.selectedStoneObj.selectedStoneArray);
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  updateSelectedStonePanel() {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    this.selectedStoneObj.selectedStones = this.selectedStones;
    this.selectedStoneObj.selectedStoneArray = JSON.parse(JSON.stringify(this.selectedStoneArray));
    this.selectedStoneObj.panelData = {};
    if (this.selectedStones.length > 0) {
      this.selectedStoneObj.isAllSelectedStoneSelected = true;
      this.httpSubscription = this.stoneSvc.getDiamondPriceInfo(this.selectedStoneObj.selectedStoneArray).subscribe(res => {
        this.selectedStoneObj['selectedStoneArray'] = res;
        this.selectedStoneObj['panelData'] = this.stoneSvc.calculateSelectedStoneData(this.selectedStoneObj.selectedStoneArray);
      });
    } else {
      this.selectedStoneObj.isAllSelectedStoneSelected = false;
    }
  }

  fetchStoneDetails(stoneIdList) {
    this.selectedStoneArray = [];
    stoneIdList.forEach(stone => {
      this.ddcStones.forEach(element => {
        if (element.stone_id === stone) {
          this.selectedStoneArray.push(element);
        }
      });
    });
  }

  updateDDCStoneArray(e) {
    this.selectedStones = e.array.selectedStones;
    this.selectedStoneArray = e.array.selectedStoneArray;
    if (this.selectedStones.length === 0) {
      this.selectedTableToggle = false;
    }
    this.updateRowColor();
    this.updateSelectedStonePanel();
  }

  updateStoneIconsInfo(array, stoneId, response) {
    array.forEach(object => {
      if (object.stone_id === stoneId) {
        if (response.source === 'confirmedStones') {
          object.ddc_status = 1;
          this.availableStoneCount--;
          this.confirmedStoneCount++;
          this.removeSelectedStone([stoneId], this.selectedStones);
        } else if (response.source === 'ddcRequested') {
          let ddcStatus = 2;
          if (response.status === 'ACTIVE') {
            ddcStatus = 0;
          }
          object['ddc_status'] = ddcStatus;
          object['ddcHour'] = response.hour;
          if (response.hour === 0) {
            this.removeStoneFromTable([stoneId]);
          }
          object['pending_minutes'] = (response.hour * 60);
        } else if (response.source === 'basketRequested') {
          object['isBasket'] = 1;
          object['basketStatus'] = '=';
        } else if (response.source === 'onlineViewIncrement') {
          object['totalViewedByUser']++;
        }
      }
    });
    return array;
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

  /********************************* Packets **********************************/
  addToPacket(data) {
    this.stoneToAddPakcet.emit({ visible: true, object: [data] });
  }

  stoneFromSelectedStone(event) {
    this.stoneToAddPakcet.emit({ visible: event.visible, object: event.object });
  }

  removeDDCFromStone(stoneList) {
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    this.ddcSvc.removeDDCFromStone([stoneList]).subscribe((response) => {
      if (response !== undefined) {
        this.notify.hideBlockUI();
        if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_RM_DDC_200)) {
          this.notify.notifyStoneStateUpdated({ source: 'ddcRequested', stoneList: [stoneList], status: 'Removed', hour: 0 });
          this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
        } else {
          this.messageService.showErrorGrowlMessage('ERR_REMOVE_STONE_DDC');
        }
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('ERR_REMOVE_STONE_DDC');
    });
  }

  getPageRef() {
    const scrollable = this.ddcGridComponent.instance.getScrollable('#ddcGridContainer');
    this.appStore.store('pageRef', scrollable.scrollTop());
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneSvc.scrollLeft(this.ddcGridComponent, '#ddcGridContainer');
    } else if (params === 'right') {
      this.stoneSvc.scrollRight(this.ddcGridComponent, '#ddcGridContainer');
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
    this.stoneSvc.handleSortingOrder(this.ddcGridComponent);
    const columns = JSON.parse(JSON.stringify(this.ddcGridComponent.columns));
    if (this.isColumnExpanded) {
      columns[1].width = 330;
    } else {
      columns[1].width = 230;
    }
    this.ddcGridComponent.columns = columns;
  }

  updateRowColor() {
    if (this.ddcGridComponent) {
      this.ddcStones.forEach((element, index) => {
        this.stoneSvc.showRowColorChanges(this.ddcGridComponent, this.selectedStones, element.stone_id, index);
      });
    }
  }

  onCellPrepared(e) {
    if (e.rowType === 'data') {
      this.selectedStones.forEach(stoneId => {
        if (e.key.stone_id === stoneId) {
          this.stoneSvc.changeRowColor(e.cellElement, true);
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
    const containerWidth = jQuery('#fixedDdcEmptyPanel').outerWidth();
    if (jQuery('#fixedDdcEmptyPanel').offset() && jQuery('#fixedDdcEmptyPanel').offset().top) {
      this.menuDistanceFromTop = jQuery('#fixedDdcEmptyPanel').offset().top > 0 ? jQuery('#fixedDdcEmptyPanel').offset().top : 0;
      if ((this.currentScroll + 10) > this.menuDistanceFromTop) {
        // jQuery('#fixedDdcTabs').addClass('stuck').innerWidth(containerWidth).css('padding-bottom', '10px');
        jQuery('#packetTabResultId').addClass('stuck').addClass('packet-struck');
        jQuery('#packetBox').css('display', 'none');
      } else {
        // jQuery('#fixedDdcTabs').removeClass('stuck').innerWidth(containerWidth).css('padding-bottom', '0px');
        jQuery('#packetTabResultId').removeClass('stuck').removeClass('packet-struck');
        jQuery('#packetBox').css('display', 'block');
      }
      this.adjustTableSize();
    }
  }

  adjustTableSize() {
    this.height = window.innerHeight - 355;
    this.adjustTableBoxSize();
  }

  adjustTableBoxSize() {
    if (jQuery('#fixedDdcTabs')) {
      jQuery('#fixedDdcTabs').css('height', window.innerHeight - 90);
    }
  }

  fetchMenuDistanceFromTop() {
    if (jQuery('#fixedDdcEmptyPanel').offset() && jQuery('#fixedDdcEmptyPanel').offset().top) {
      this.menuDistanceFromTop = jQuery('#fixedDdcEmptyPanel').offset().top > 0 ? jQuery('#fixedDdcEmptyPanel').offset().top : 0;
    }
  }

  toggleSelectedTable(e) {
    this.selectedTableToggle = e.status;
    this.adjustTableSize();
  }


  ngOnDestroy() {

    this.subscriptionInterval.unsubscribe();
    this.stoneUpdateSubscription.unsubscribe();
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    this.appStore.remove('pageRef');
    this.appStore.remove('ddcPageScroll');
  }

  onResultLoading(event) {
    const container = this.ddcGridComponent;
    this.utilService.handleSort(event, container, 'stoneReqSortData', event);
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }
}
