import { Component, OnInit, ViewChild, OnDestroy, QueryList, ViewChildren, HostListener } from '@angular/core';
import { HoldListService } from '../hold-list.service';
import { MessageService } from '@srk/core';
import { UserProfileService } from '@srk/core';
import { AuthService } from '@srk/core';
import { ApiService } from '@srk/shared';
import { LoggerService } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { NotifyService } from '@srk/core';
import { UtilService } from '@srk/shared';
import { AddNoteService } from '@srk/shared';
import { DownloadStonesService } from '@srk/shared';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

@Component({
  selector: 'app-hold-list-details',
  templateUrl: './hold-list-details.component.html',
  styleUrls: ['./hold-list-details.component.scss', './../hold-list.component.scss']
})
export class HoldListDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('holdListComponentTable') holdListComponentTable;
  @ViewChildren(DxDataGridComponent) dataGrids: QueryList<DxDataGridComponent>;
  public show = true;
  public holdList: any;
  public apiLink: any;
  public confirmedStoneCount: any;
  public notAvailableStoneCount: any;
  public toggleMultimediaPopup: boolean;
  public stoneMultimediaInfo: any;
  public noDataFound = false;
  public subscriptionInterval: Subscription;
  public stoneUpdateSubscription: Subscription;
  public selectedColumnList: any;
  public selectedDownloadType: any;
  public addnoteOverlayVisible = false;
  public allNotesForStone = [];
  public commentsOverlayVisible = false;
  public isAllStoneSelected = false;
  public selectedStones: any[] = [];
  public stoneButtonList: any;
  public selectedStoneObj: any;
  public downloadOptions: any[];
  public downloadPopOverVisible = false;
  public selectedStoneArray = [];
  public httpSubscription: Subscription;
  public isColumnExpanded = false;
  public columnWidth = 200;
  public isIconVisible: boolean = false;
  public timer: any;
  public holdSortingInfo: any;
  public allColumnWidth: any;
  public height = window.innerHeight - 348;
  constructor(
    private utilService: UtilService,
    private holdListService: HoldListService,
    public messageService: MessageService,
    private userProfileService: UserProfileService,
    private logger: LoggerService,
    private stoneDtlService: StoneDetailsService,
    private authService: AuthService,
    private apiService: ApiService,
    private notify: NotifyService,
    private appStore: ApplicationStorageService,
    public downloadSvc: DownloadStonesService,
    private notesService: AddNoteService, ) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.stoneButtonList = {
      release: true,
      confirmButton: true
    };
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_regular_btn');
    this.selectedStoneObj = {
      selectedStones: [],
      selectedStoneArray: [],
      panelData: {},
      isAllSelectedStoneSelected: false
    };
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    if (this.appStore.getData('hold-selected-stone-panel')) {
      const selectionObj = this.appStore.getData('hold-selected-stone-panel');
      this.selectedStones = selectionObj['selectedStones'];
      this.selectedStoneArray = selectionObj['selectedStoneArray'];
      this.updateSelectedStonePanel();
    }
    this.stoneUpdateSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      if (res.source) {
        this.updateTableData(res);
      }
    });
    this.subscriptionInterval = Observable.interval(60000).subscribe(x => {
      if (this.holdList) {
        this.holdList.forEach((stone) => {
          this.updateHoldStoneTime(stone);
        });
      }
    });
    if (this.appStore.getData('hold-list')) {
      this.holdList = this.appStore.getData('hold-list');
      this.getHoldPanelData();
    } else {
      this.getHoldList();
    }
  }

  updateHoldStoneTime(stone) {
    stone.pending_minutes--;
    if (stone.pending_minutes > 0) {
      stone.remained_hold_time = this.setTimer(stone.pending_minutes);
    } else {
      stone.remained_hold_time = 'NA';
    }
    this.appStore.store('hold-list', this.holdList);
  }

  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadPopOverVisible = true;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.height = window.innerHeight - 348;
  }

  downloadResult() {
    this.selectedStones = this.createDeepCopyArray(this.selectedStoneObj.selectedStones);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.downloadStoneDetails(this.holdList, this.selectedStones, this.selectedDownloadType);
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  sendExcelMail() {
    this.selectedStones = this.createDeepCopyArray(this.selectedStoneObj.selectedStones);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.mailStoneExcel(this.holdList, this.selectedStones, 'Specific Search Result List');
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  getHoldList() {
    this.holdListService.getMyHoldList().subscribe((response) => {
      if (!response.error_status) {
        if (response.data) {
          this.holdList = response.data;
          this.holdList = this.utilService.updateStonesForDecimal(this.holdList);
          this.holdList = this.stoneDtlService.fetchStoneAdditionalInfo(this.holdList);
          this.holdList = this.notesService.fetchStonesComment(this.holdList);
          this.getHoldPanelData();
        } else {
          this.noDataFound = true;
        }
      }
    }, error => {
      this.logger.logError('HoldListDetailsComponent', 'End:- Error in receiving hold list');
    });
  }

  getHoldPanelData() {
    this.confirmedStoneCount = 0;
    this.notAvailableStoneCount = 0;
    this.holdList.forEach((stone) => {
      if (stone.pending_minutes < 0) {
        this.notAvailableStoneCount++;
        stone.remained_hold_time = 'NA';
      } else {
        stone.remained_hold_time = this.setTimer(stone.pending_minutes);
      }
    });
    this.appStore.store('hold-list', this.holdList);
  }

  removeHold(): void {
    const stoneArray = '{"stone_ids":' + JSON.stringify(this.selectedStones) + ',"audit": {"action_id": 12, "activity_id": 1 }}';
    this.apiLink = this.authService.getApiLinkForKey('remove_hold_btn', '');
    if (this.selectedStones !== undefined) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.apiService.postCall('HoldListDetailsComponent: removeHold', this.apiLink, stoneArray).subscribe((response) => {
        this.notify.hideBlockUI();
        if (!response.error_status) {
          this.messageService.showSuccessGrowlMessage('Stone Removed Successfully');
          this.notify.notifyStoneStateUpdated({ source: 'releaseHold', stoneList: this.selectedStones });
        } else {
          this.messageService.showErrorGrowlMessage('Error While Removing Stones from My Hold List ');
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    } else {
      this.messageService.showErrorGrowlMessage('Please select some stones');
    }
    this.isAllStoneSelected = false;
  }

  removeHoldStatus() {
    this.selectedStones.forEach(selected => {
      this.holdList.forEach(stones => {
        if (stones.stone_id === selected) {
          const i = this.holdList.indexOf(stones);
          stones.pending_minutes = -1;
          stones.remained_hold_time = 'NA';
        }
      });
      this.holdListComponentTable.instance.refresh();
    });
    this.getHoldPanelData();
    this.checkSelectedStones();
  }

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp(stoneInfo);
    this.toggleMultimediaPopup = true;

  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  ngOnDestroy() {
    this.subscriptionInterval.unsubscribe();
    this.stoneUpdateSubscription.unsubscribe();
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
  }

  addTab(e) {
    if (e.data && e.type === 'stoneDtl') {
      this.addStoneDetailTab(e.data)
    } else if (e.data && e.type === 'twinStoneDtl') {
      this.addTwinStoneInfoTab(e.data)
    }
  }

  addStoneDetailTab(data) {
    this.notify.notifyHoldListPageForStoneClickedForDetail({ type: 'stoneDtl', 'data': data });
  }

  addTwinStoneInfoTab(pairId) {
    this.notify.notifyHoldListPageForStoneClickedForDetail({ type: 'twinStoneDtl', 'data': pairId });
  }

  refreshNotes() {
    this.holdList = this.notesService.fetchStonesComment(this.holdList);
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
      this.httpSubscription = this.stoneDtlService.getDiamondPriceInfo(this.selectedStoneObj.selectedStoneArray).subscribe(res => {
        this.selectedStoneObj['selectedStoneArray'] = res;
        this.selectedStoneObj['panelData'] = this.stoneDtlService.calculateSelectedStoneData(this.selectedStoneObj.selectedStoneArray);
      });
    } else {
      this.selectedStoneObj.isAllSelectedStoneSelected = false;
    }
    this.updateRowColor();
    this.appStore.store('hold-selected-stone-panel', this.selectedStoneObj);
  }

  fetchStoneDetails(stoneIdList) {
    this.selectedStoneArray = [];
    stoneIdList.forEach(stone => {
      this.holdList.forEach(element => {
        if (element.stone_id === stone) {
          this.selectedStoneArray.push(element);
        }
      });
    });
  }

  updateDDCStoneArray(e) {
    this.selectedStones = e.array.selectedStones;
    this.selectedStoneArray = e.array.selectedStoneArray;
    this.updateSelectedStonePanel();
  }

  removeSelectedStone(array, array2) {
    array.forEach((value) => {
      if (array2.indexOf(value) > -1) {
        const i = array2.indexOf(value);
        array2.splice(i, 1);
      }
    });
  }

  removeStoneFromSelectedTable(stoneList) {
    stoneList.forEach((value) => {
      this.selectedStoneObj.selectedStoneArray.forEach((stone) => {
        if (stone.stone_id === value) {
          const i = this.selectedStoneObj.selectedStoneArray.indexOf(stone);
          this.selectedStoneObj.selectedStoneArray.splice(i, 1);
        }
      });
    });
  }

  filterSelectedStones() {
    let availableStones = [];
    availableStones = this.fetchConfirmableStones();
    if (availableStones.length > 0) {
      this.isAllStoneSelected = this.stoneDtlService.isArrayMatch(this.selectedStones, availableStones);
    }
    this.fetchStoneDetails(this.selectedStones);
    this.updateSelectedStonePanel();
  }

  isAllCheckboxSelected() {
    if (this.isAllStoneSelected) {
      this.selectedStones = this.fetchConfirmableStones();
    } else {
      this.selectedStones = [];
    }
    this.fetchStoneDetails(this.selectedStones);
    this.updateSelectedStonePanel();
  }

  fetchConfirmableStones() {
    const confirmableStones = [];
    this.holdList.forEach(element => {
      if (element.pending_minutes < 0 && element.remained_hold_time === 'NA') {
        const inactiveStones = element.stone_id;
        const unactiveStone = this.selectedStones;
        const i = unactiveStone.indexOf(element.stone_id);
        if (i > -1) {
          unactiveStone.splice(i, 1);
        }
        this.selectedStones = unactiveStone;
      } else {
        confirmableStones.push(element.stone_id);
      }
    });
    return confirmableStones;
  }

  checkSelectedStones() {
    this.holdList.forEach(element => {
      if (element.pending_minutes < 0 && element.remained_hold_time === 'NA') {
        const activeStones = this.selectedStones;
        const i = activeStones.indexOf(element.stone_id);
        if (i > -1) {
          activeStones.splice(i, 1);
        }
        this.selectedStones = activeStones;
      }
    });
    this.fetchStoneDetails(this.selectedStones);
    this.updateSelectedStonePanel();
  }

  releaseSelectedStones(e) {
    if (e.stones.length > 0) {
      this.removeHold();
    } else {
      this.messageService.showErrorGrowlMessage('Please select some stones');
    }
  }

  updateHoldStoneArray(e) {
    this.selectedStones = e.array.selectedStones;
    this.selectedStoneArray = e.array.selectedStoneArray;
    this.updateSelectedStonePanel();
  }

  updateTableData(res) {
    const stoneList = res.stoneList;
    if (stoneList) {
      stoneList.forEach(stoneId => {
        this.holdList = this.updateStoneIconsInfo(this.holdList, stoneId, res);
        this.selectedStoneObj.selectedStoneArray = this.updateStoneIconsInfo(this.selectedStoneObj.selectedStoneArray, stoneId, res);
      });
      if (this.selectedStoneObj.selectedStoneArray.length == 0) {
        this.selectedStones.length = 0;
      }

      this.filterSelectedStones();
    }
    this.getHoldPanelData();
  }

  updateStoneIconsInfo(array, stoneId, response) {
    array.forEach((object, index) => {
      if (stoneId === object.stone_id) {
        if (response.source === 'onlineViewIncrement') {
          object['totalViewedByUser']++;
        } else if (response.source === 'confirmedStones' || response.source === 'releaseHold') {
          array.splice(index, 1);
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

  setTimer(time) {
    const minute = Math.floor(time % 60) > 9 ? Math.floor(time % 60) : '0' + Math.floor(time % 60);
    return Math.floor(time / 60) + ':' + minute;
  }

  scrollColumn() {
    this.isColumnExpanded = !this.isColumnExpanded;
    this.isIconVisible = !this.isIconVisible;
    this.stoneDtlService.handleSortingOrder(this.holdListComponentTable);
    const columns = JSON.parse(JSON.stringify(this.holdListComponentTable.columns));
    if (this.isColumnExpanded) {
      columns[1].width = 290;
    } else {
      columns[1].width = 200;
    }
    this.holdListComponentTable.columns = columns;
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneDtlService.scrollLeft(this.holdListComponentTable, '#holdListContainer');
    } else if (params === 'right') {
      this.stoneDtlService.scrollRight(this.holdListComponentTable, '#holdListContainer');
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

  onCellPrepared(e, array) {
    this.stoneDtlService.onCellPrepared(e, array);
  }

  updateRowColor() {
    if (this.holdListComponentTable) {
      this.holdList.forEach((element, index) => {
        this.stoneDtlService.showRowColorChanges(this.holdListComponentTable, this.selectedStones, element.stone_id, index);
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

  onResultLoading() {
    this.holdSortingInfo = {
      sortedColumn: '',
      sortedColumnOrder: ''
    };
    const container = this.holdListComponentTable;
    for (let i = 0; i < container.columns.length; i++) {
      if (Number.isInteger(container.instance.columnOption(i, 'sortIndex'))) {
        this.holdSortingInfo['sortedColumn'] = i;
        this.holdSortingInfo['sortedColumnOrder'] = container.instance.columnOption(i, 'sortOrder');
      }
    }
    this.appStore.store('HoldListArray', this.holdSortingInfo);
  }

  ngAfterViewInit() {
    const container = this.holdListComponentTable;
    this.holdSortingInfo = this.appStore.getData('HoldListArray');
    if (this.holdSortingInfo && this.holdSortingInfo.hasOwnProperty('sortedColumnOrder') && this.holdSortingInfo.hasOwnProperty('sortedColumn') && container) {
      container.instance.columnOption(this.holdSortingInfo.sortedColumn, 'sortOrder', this.holdSortingInfo.sortedColumnOrder);
    }
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }
}
