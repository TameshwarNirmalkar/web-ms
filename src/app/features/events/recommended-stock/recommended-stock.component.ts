import { Component, OnInit, OnChanges, Input, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
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
@Component({
  selector: 'app-recommended-stock',
  templateUrl: './recommended-stock.component.html',
  styleUrls: ['./recommended-stock.component.scss']
})
export class RecommendedStockComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @Input() recommedStones: any;
  @Input() eventCode: any;
  @Output() mySelectionAddedStone = new EventEmitter;
  public ddcOverlayVisible = false;
  public errorMessage: any;
  public selectedStones = [];
  public isAllSelected = false;
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;
  public httpSubscription: Subscription;
  public recommendedStoneObject: any;
  public selectedColumnList: any;
  public addnoteOverlayVisible = false;
  public commentsOverlayVisible = false;
  public allNotesForStone: any;
  public ddcStones = [];
  public definedDDCHour: any;
  public dataFetched = false;
  public btbSelectedStones = [];
  public isBTBDataLoaded = false;
  public isBTBClosed = false;
  public btbOverlayVisible = false;
  public stoneStatusSubscription: any;
  public isColumnExpanded = false;
  public columnWidth = 130;
  public isIconVisible: boolean = false;
  constructor(
    private stoneDetailsService: StoneDetailsService,
    private eventDetailsService: EventDetailsService,
    private userProfileService: UserProfileService,
    private notesService: AddNoteService,
    private messageService: MessageService,
    private bidToBuyService: BidToBuyService,
    private utilService: UtilService,
    private appStore: ApplicationStorageService,
    private notify: NotifyService
  ) { }

  ngOnInit() {
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.errorMessage = 'NO_RECOMMENDED_STONE_FOUND';
    this.stoneStatusSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      if (res.source) {
        this.updateStoneStateDetails(res);
      }
    });
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
  }

  ngOnChanges() {
    // if (this.eventCode) {
    //   this.eventDetailsService.fetchPreSelectedEventStones(this.eventCode).subscribe(res => {
    //     if (!res.error_status && MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_SELLIST_FOUND_200)) {
    //       this.createPreSelectedStoneObject(res.data);
    //     } else {
    //       this.errorMessage = 'NO_RECOMMENDED_STONE_FOUND';
    //     }
    //   }, error => {
    //     this.errorMessage = 'SERVER_ERROR_OCCURRED';
    //   });
    // }
  }

  createPreSelectedStoneObject(stoneObj) {
    this.dataFetched = true;
    this.recommendedStoneObject = {
      stockTable: stoneObj,
      selectedStoneTable: [],
      selectedStoneArray: [],
      isAllStoneSelected: false,
      filteredSelectedStoneArray: [],
      isAllSelectedStoneSelected: false,
      panelData: {},
      toggleTable: false
    };
    this.recommendedStoneObject['stockTable'] = this.utilService.updateStonesForDecimal(this.recommendedStoneObject['stockTable']);
    this.stoneDetailsService.storeStoneAdditionalInfo(this.recommendedStoneObject.stockTable).subscribe(res => {
      this.recommendedStoneObject['stockTable'] = res;
      this.notesService.getCommentListforStoneIds(this.recommendedStoneObject.stockTable).subscribe((res) => {
        this.recommendedStoneObject.stockTable = res;
      });
    }, error => {
    });
  }

  isAllCheckboxSelected(array) {
    if (array.isAllStoneSelected) {
      array.selectedStoneArray = this.stoneDetailsService.createStoneIdList(array.stockTable);
      array.filteredSelectedStoneArray = array.selectedStoneArray;
      array.selectedStoneTable = JSON.parse(JSON.stringify(array.stockTable));
      array.isAllSelectedStoneSelected = true;
    } else {
      array.selectedStoneArray = [];
      array.selectedStoneTable = [];
      array.filteredSelectedStoneArray = [];
      array.isAllSelectedStoneSelected = false;
    }
    this.updateStockStoneArray(array);
  }

  filterSelectedStones(array, id) {
    array = this.eventDetailsService.handleTableSelection(array, id);
    this.updateStockStoneArray(array);
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
    this.recommendedStoneObject.isAllStoneSelected = this.stoneDetailsService.isArrayMatch(array.selectedStoneArray, stoneIdList);
    this.recommendedStoneObject.panelData = {};
    if (array.selectedStoneTable && array.selectedStoneTable.length > 0) {
      this.recommendedStoneObject.selectedStoneArray = array.selectedStoneArray;
      this.httpSubscription = this.stoneDetailsService.getDiamondPriceInfo(array.selectedStoneTable).subscribe((response) => {
        this.recommendedStoneObject.selectedStoneTable = response;
        this.recommendedStoneObject.panelData = this.stoneDetailsService.calculateSelectedStoneData(array.selectedStoneTable);
        this.recommendedStoneObject.toggleTable = array.toggleTable;
      });
    } else {
      this.recommendedStoneObject.panelData = {};
    }
  }

  updateMySelection(e) {
    this.mySelectionAddedStone.emit({ mySelectionStone: e });
  }

  refreshNotes() {
    this.recommendedStoneObject.stockTable = this.notesService.fetchStonesComment(this.recommendedStoneObject.stockTable);
    this.recommendedStoneObject.selectedStoneTable = this.notesService.fetchStonesComment(this.recommendedStoneObject.selectedStoneTable);
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
          if(response.data){
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
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'stoneDtl', 'data': data });
  }

  addTwinStoneInfoTab(pairId) {
    this.notify.notifyViewRequestPageForStoneClickedForDetail({ 'type': 'twinStoneDtl', 'data': pairId });
  }

  updateStoneStateDetails(res) {
    this.eventDetailsService.updateIconsStatusInfo(this.recommendedStoneObject.stockTable, res);
    if (res.source === 'confirmedStones') {
      res.stoneList.forEach(stone => {
        this.filterSelectedStones(this.recommendedStoneObject, stone);
      });
    }
    this.eventDetailsService.updateIconsStatusInfo(this.recommendedStoneObject.selectedStoneTable, res);
  }

  ngOnDestroy() {
    this.stoneStatusSubscription.unsubscribe();
  }

  // scrollColumn() {
  //   this.isColumnExpanded = !this.isColumnExpanded
  //   this.isIconVisible = !this.isIconVisible
  //   if (this.isColumnExpanded) {
  //     const columns = JSON.parse(JSON.stringify(this.ddcGridComponent.columns));
  //     columns[1].width = 275;
  //     this.ddcGridComponent.columns = columns;
  //   } else {
  //     const columns = JSON.parse(JSON.stringify(this.ddcGridComponent.columns));
  //     columns[1].width = 130;
  //     this.ddcGridComponent.columns = columns;
  //   }
  // }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }
}
