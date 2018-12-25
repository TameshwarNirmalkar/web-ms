import {
  Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, AfterViewInit,
  ViewChildren, QueryList, HostListener, AfterViewChecked, Output, EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable, Observer } from 'rxjs/Rx';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { ConfirmationService } from 'primeng/components/common/api';
import { SelectItem, OverlayPanel } from 'primeng/primeng';
import {
  DiamondAttributes, SearchService, CustomTranslateService, ApplicationStorageService,
  NotifyService, MessageService, AuthService, LoggerService, UserProfileService,
  ApplicationDataService, MessageCodes, MessageCodesComparator, SearchType, SearchTypeComparator,
  SessionStorageService
} from '@srk/core';
import {
  StoneDetailsService, ThmConfirmOverlayComponent, ApiService, BidToBuyService, AddNoteService,
  DownloadStonesService, UtilService
} from '@srk/shared';
import { Packets } from '@srk/features/packets';
import * as _ from 'underscore';
import data from 'devextreme/bundles/dx.all';

declare const jQuery;


@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class SearchResultComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  @ViewChild('tabPanel') tabPanel;

  @ViewChild(ThmConfirmOverlayComponent) thmConfirmOverlayComponent;
  @ViewChild('searchResultGridComponent') searchResultGridComponent;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @ViewChild('selectedStonesPanel') selectedStonesPanel;
  @ViewChild('thmPacketPanel') thmPacketPanel;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChildren(DxDataGridComponent) dataGrids: QueryList<DxDataGridComponent>;

  private globalSearchSubscription: Subscription;
  private stoneConfirmedSubscription: Subscription;
  private showPacketSubscription: Subscription;
  private selectedStoneOnClickSubscription: Subscription;
  public diamonds: DiamondAttributes[];
  public isDataAvailable = false;
  public diamondNewList: any;
  public hideButton: any[] = [];
  public searchResults: any[] = [];
  public searchConfig: any;
  public viewRequestStoneArray: any[];
  public selectedStones: any[];
  public popupVisible = false;
  public confirmOverlayVisible = false;
  public ddcOverlayVisible = false;
  public definedDDCHour: any;
  public ddcStones: any[] = [];
  public confirmResponse: any = {};
  public apiLink: any;
  public selectedColumnList: any;
  public btbOverlayVisible = false;
  public btbSelectedStones: any[];
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;
  public httpSubscription: Subscription;
  public visiblePacketIcon = false;
  public visiblePacketPopup = false;
  public packetCount = 0;
  public stoneForPacket: any;
  public isFilteredtable = false;
  public isBTBDataLoaded = false;
  public isBTBClosed = false;
  public commentsOverlayVisible = false;
  public addnoteOverlayVisible = false;
  public allNotesForStone: any[] = [];
  public searchType: any = SearchType.GENERAL_SEARCH;
  public display = true;
  public downloadPopOverVisible = false;
  public downloadOptions: any[];
  public selectedDownloadType: any;
  public addNoteSubscription: Subscription;
  public showSelectedPacket = true;
  public timer;
  public columnWidth = 130;
  public visibleShowPacktBtn = false;
  public isResultDefined = false;
  public searchResultLimit: any;
  public searchResultCount = 0;
  public visibleNewSearchTab = true;
  public menuDistanceFromTop: any;
  public currentScroll: any;
  public currentTabSelected: any;
  public lastCreatedTab: any;
  public visibleResultStorePopup: any;
  public tabOrder = 3;
  public selectedSaveSearchPreference: any;
  public profileSavedStatus: any[];
  public allColumnWidth: any;
  public gridHeight: any;
  public tableData: any[];
  public columnWidths: any;
  public logoutObservable: Subscription;
  public packetIconDataForGrid: any[];  //Used to update Packet icons in the Data Grid.
  public stonesActedOn: any;
  public iconOverlayXPosition: Number;
  public iconOverlayYPosition: Number;
  public displayIconOverlay: Boolean = false;
  public isColumnExpanded = false;
  public isIconVisible: boolean = false;
  public iconDisplayStoneObject: any;
  public colorLegendFilterValue: String[] = [];
  private previouslyClickedColorLegendElement: HTMLLabelElement;

  constructor(
    private utilService: UtilService,
    private router: Router,
    private searchService: SearchService,
    private stoneSvc: StoneDetailsService,
    private customTranslateSvc: CustomTranslateService,
    private notify: NotifyService,
    private appStore: ApplicationStorageService,
    private messageService: MessageService,
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private apiService: ApiService,
    private logger: LoggerService,
    private confirmationService: ConfirmationService,
    public bidToBuyService: BidToBuyService,
    private appDataSvc: ApplicationDataService,
    private notesService: AddNoteService,
    public downloadSvc: DownloadStonesService,
    private sessionStorageService: SessionStorageService
  ) { }

  ngOnInit() {

    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.gridHeight = window.innerHeight - 285;
    this.searchResults = [
      {
        newSearch: 'New search',
        order: 2
      }
    ];
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_regular_btn');
    if (this.router.url.indexOf('twin-diamonds') > 0) {
      this.searchType = SearchType.TWIN_DIAMOND_SEARCH;
    } else if (this.router.url.indexOf('search') > 0) {
      this.searchType = SearchType.GENERAL_SEARCH;
    }
    this.searchResultLimit = this.appDataSvc.getSearchResultLimit();
    this.notify.notifySearchResultPage({ isResult: true });
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.selectedSaveSearchPreference = this.userProfileService.getSelectedSaveSearchPreference();
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.defineSearchResult();
    this.globalSearchSubscription = this.notify.notifyGlobalSearchObservable$.subscribe(response => {
      this.searchType = response.type;
      this.defineSearchResult();
      this.updateExtraStoneInfo();
      this.notify.notifySearchResultPage({ isResult: true });
    });
    this.showPacketSubscription = this.notify.notifyShowPacketBtnOccuredObservable$.subscribe(res => {
      this.visibleShowPacktBtn = res.visible;
    });
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      this.updateStoneStateDetails(res);

    });
    this.selectedStoneOnClickSubscription = this.notify.notifySearchResultFromSelectedstonePageActionObservable$.subscribe(response => {
      if (response.data && response.type === 'stoneDtl') {
        this.addStoneInfoTab(response.data, response.result);
      } else if (response.data && response.type === 'twinStoneDtl') {
        this.addTwinStoneInfoTab(response.data, this.searchResults, response.result);
      }
    });
    // this.addNoteSubscription = this.notify.notifyAddNewCommentActionObservable$.subscribe((res) => {
    //   // console.log('Add note subscription changed');
    //   // console.log(res);
    //   this.getNotesForAllStones();
    // });

    this.addNoteSubscription = this.notify.addNewNotesForIggridObservable$.subscribe(res => {
      if (res.isDeleteFlow) {
        this.deleteCommentsFromStones(res);
      } else {
        this.updateNotesForStones(res);
      }
    });

    this.fetchMenuDistanceFromTop();

    this.logoutObservable = this.notify.notifyDaypBtbPageonLogoutObservable$.subscribe(res => {
      if (res.status) {
        this.isDataAvailable = false;
      }
    });

  }
  ngAfterViewChecked() {

    this.utilService.setSearchResultTabs(-2);
    this.utilService.setSearchTabWidth();
  }

  scrollTabPanelRight() {
    this.utilService.scrollTabPanelRight();
  }

  scrollTabPanelLeft() {
    this.utilService.scrollTabPanelLeft();
  }

  defineSearchResult() {
    if (this.appStore.getData(this.searchType + ':count') !== undefined) {
      this.initializeSearchResult();
      this.isSearchResultData();
      this.isDataAvailable = true;
    }
  }

  initializeSearchResult() {
    const count = parseInt(this.appStore.getData(this.searchType + ':count'), 10);
    if (count === 1 && this.appStore.getData(this.searchType + ':currentCount') === undefined) {
      this.appStore.store(this.searchType + ':resultArray', this.searchResults);
      this.appStore.store(this.searchType + ':currentCount', 0);
    } else {
      this.searchResults = this.appStore.getData(this.searchType + ':resultArray');
      if (this.searchResults && this.searchResults.length > 0) {
        this.searchResults.forEach(result => {
          if (result.hasOwnProperty('isActive')) {
            result.isActive = false;
          }
        });
        this.searchResults[0].isActive = true;
        this.currentTabSelected = this.searchResults[0].name;
      }
      this.updateTabIndex();
    }
    this.isSearchTabActive();
  }

  getStoneDetailForModifiedSearch() {
    if (this.appStore.getData(this.searchType + ':count') !== undefined) {
      this.isSearchResultData();
      this.isDataAvailable = true;
    }
  }

  stoneSelected(array, data) {

    if (Array.isArray(data) === true) {

      // console.log('yes ');

      array.selectedStoneButton = [];
      array.filteredStone = [];
      array.selectedStoneTable = [];

      if (data.length === 0) {

        this.updateSearchResultArray(array);

      } else {

        data.forEach((elm, index) => {

          array.selectedStoneButton.push(elm._id);
          array.filteredStone.push(elm._id);
          array.selectedStoneTable.push(

            array.diamondTable.find(elem => { return elm._id === elem._id; })

          );

          if (index === data.length - 1) {

            this.updateSearchResultArray(array);

          }

        });

      }

    } else {

      // Single Stone is selected.

      if (data.added) {

        if (this.searchType === SearchType.TWIN_DIAMOND_SEARCH) {

        } else {

          array.selectedStoneButton = array.selectedStoneButton.concat([data.stoneId]);

        }


      } else {

        array.selectedStoneButton = array.selectedStoneButton.filter(elm => {
          return elm !== data.stoneId;
        });

      }


      if (this.searchType === SearchType.TWIN_DIAMOND_SEARCH) {
        this.updateSearchResultArrayForTwinStones(array, data.stoneId);
      } else {
        array = this.searchService.fetchSelectedStones(array, data.stoneId);
        this.updateSearchResultArray(array);
      }

    }


  }

  updateSearchResultArrayForTwinStones(array, id) {
    const pairStones = this.searchService.fetchPairDiamonds(id, array.diamondTable);
    const stoneSelectedByUser = array.selectedStoneButton.filter(stoneId => {
      return stoneId === id;
    });
    pairStones.forEach(stoneDtl => {
      if (stoneSelectedByUser && stoneSelectedByUser.length > 0
        && !(_.contains(array.selectedStoneButton, stoneDtl.stone_id))) {
        array.selectedStoneButton.push(stoneDtl.stone_id);
      } else if (stoneSelectedByUser.length === 0 && _.contains(array.selectedStoneButton, stoneDtl.stone_id)) {
        array.selectedStoneButton = _.without(array.selectedStoneButton, stoneDtl.stone_id);
      }
      array = this.searchService.fetchSelectedStones(array, stoneDtl.stone_id);
      this.updateSearchResultArray(array);
    });
  }

  updateStoneResultArray(e) {

    // console.log('This is happening ');
    // console.log(e);
    this.updateSearchResultArray(e.array);
  }

  isSearchResultData() {
    const count = parseInt(this.appStore.getData(this.searchType + ':count'), 10);
    if (this.appStore.getData(this.searchType + ':count') > this.appStore.getData(this.searchType + ':currentCount')) {
      this.searchConfig = this.searchService.getSearchConfigData();
      const selectedSearchData = this.searchService.getSelectedFiltersValue();
      const searchedResultData = this.searchService.getSearchResultData();
      if (searchedResultData && searchedResultData.data && searchedResultData.data.body.length > 0) {
        this.diamondNewList = searchedResultData.data;
        this.createResultArray(count, this.searchConfig, selectedSearchData);
        this.appStore.store(this.searchType + ':resultArray', this.searchResults);
        this.appStore.store(this.searchType + ':currentCount', count);
        this.searchService.resetSearchData();
      };
    }
  }

  ngAfterViewInit() {
    this.scrollToTab();
    this.onWindowScroll();
    this.adjustTableBoxSize();
  }

  checkIsUploadedStoneExist(paramName) {
    let flag = false;
    this.searchResults.forEach((result, index) => {
      if (result.name && result.name.indexOf(paramName) > -1 && !flag) {
        this.searchResults.splice(index, 1);
        flag = true;
      }
    });
    return flag;
  }

  createResultArray(count, config, selectedSearchData) {
    this.searchResults.forEach(result => {
      if (result.hasOwnProperty('isModified')) {
        result.isModified = false;
      }
    });
    let name: any;
    let shortName: any;
    const isFromUploadedCard = this.searchService.getCardFlag();
    if (!_.isEmpty(isFromUploadedCard)) {
      const flag = this.checkIsUploadedStoneExist(isFromUploadedCard.fullName);
      name = 'Result ' + isFromUploadedCard.fullName;
      shortName = isFromUploadedCard.smallName;
      this.searchService.setCardFlag({});
    } else {
      name = 'Result ' + count;
      shortName = count;
    }
    const newResultEntry = {
      name: name,
      diamondTable: this.diamondNewList.body,
      selectedStoneTable: [],
      selectedStoneButton: [],
      filteredStone: [],
      isAllSelected: false,
      toggleTableDisplay: false,
      isModified: false,
      searchFilterConfig: config,
      searchFiltersValue: selectedSearchData,
      panelData: this.stoneSvc.calculateSelectedStoneData([]),
      modifiedDate: Date.now(),
      isEditable: true,
      filteredStones: [],
      isAllResultSelected: false,
      order: 1,
      shortName: shortName,
      isActive: true,
      isColumnExpanded: false,
      isIconVisible: false,
      id: count + 'SelectedStonesId',
      height: window.innerHeight * (90 / 100)
    };
    if (this.appStore.getData('globalSearch') || !_.isEmpty(isFromUploadedCard)) {
      newResultEntry.isEditable = false;
      this.appStore.remove('globalSearch');
    }
    this.searchResults.push(newResultEntry);
    this.updateExtraResultInfo(newResultEntry);
    this.updateTabIndex();
    this.isResultDefined = true;
    this.currentTabSelected = newResultEntry.name;
    this.isSearchTabActive();
    this.appStore.store('isStoneDetailsTabAdded', true);
    this.scrollToTab();

    this.tableData = newResultEntry.diamondTable;

    // console.log('This is the result');
    // console.log(newResultEntry);

  }

  /**/
  updateExtraResultInfo(result) {
    result.diamondTable = this.utilService.updateStonesForDecimal(result.diamondTable);
    // result.diamondTable = this.stoneSvc.fetchStoneAdditionalInfo(result.diamondTable);
    // result.diamondTable = this.notesService.fetchStonesComment(result.diamondTable);
    // this.refreshDataTable('');

    // this.notesService.fetchStonesAsynchronously(result.diamondTable)
    //   .then(response => {

    //     // console.log('Triggering 1 ');
    //     result.diamondTable = response;
    //     this.refreshDataTable('');
    //     this.stonesActedOn = { 'source': 'noteAdded' };

    //   })
    //   .catch(err => {

    //     console.error('Failed while triggering 1 ');
    //     console.error(err);
    //     this.refreshDataTable('');
    //     this.stonesActedOn = { 'source': 'noteAdded' };

    //   });      

  }

  updateExtraStoneInfo() {
    this.searchResults.forEach((element) => {
      if (element.name) {
        element.diamondTable = JSON.parse(JSON.stringify(this.utilService.updateStonesForDecimal(element.diamondTable)));
        // element.diamondTable = this.stoneSvc.fetchStoneAdditionalInfo(element.diamondTable);
        // element.diamondTable = this.notesService.fetchStonesComment(element.diamondTable);
        // this.refreshDataTable('');

        // this.notesService.fetchStonesAsynchronously(element.diamondTable)
        //   .then(response => {

        //     // console.log('Triggering 2 ');
        //     element.diamondTable = response;
        //     this.refreshDataTable('');
        //     this.stonesActedOn = { 'source': 'noteAdded' };

        //   })
        //   .catch(err => {

        //     // console.log('Failed while triggering 2 ');
        //     console.error(err);
        //     this.refreshDataTable('');
        //     this.stonesActedOn = { 'source': 'noteAdded' };

        //   });

      }

    });

    this.appStore.store(this.searchType + ':resultArray', this.searchResults);
  }

  createModifiedSearchResult(modifiedData) {
    const count = parseInt(this.appStore.getData(this.searchType + ':count'), 10);
    if (modifiedData.result) {
      const resultName = this.appStore.getData(this.searchType + ':modifyResultName');
      this.searchResults.forEach((element) => {
        if (element.name === resultName) {
          element.diamondTable = this.utilService.updateStonesForDecimal(modifiedData.result.data.body);
          element.isModified = false;
          element.searchFilterConfig = modifiedData.config;
          element.searchFiltersValue = modifiedData.searchFilters;
          element.modifiedDate = Date.now();
          element.filteredStone = [];
          element.isAllResultSelected = false;
          element.isAllSelected = false;
          element.panelData = this.stoneSvc.calculateSelectedStoneData([]);
          element.selectedStoneTable = [];
          element.selectedStoneButton = [];
          element.pageRefPosition = 0;
          element.height = window.innerHeight * (90 / 100);
          this.updateExtraResultInfo(element);
          element['isActive'] = true;
          this.currentTabSelected = element.name;
        }
      });
      this.appStore.store(this.searchType + ':resultArray', this.searchResults);
      this.searchService.resetSearchData();
    }
    this.getStoneDetailForModifiedSearch();
  }

  toggleSearchResultPanel(e) {
    this.searchResults.forEach((element) => {
      if (element.name === e.array['name']) {
        this.updateSearchResultArray(e.array);
      }
    });

  }

  openStoneInNewTabTrigger(evt, resultSet: any[]) {

    let temp = resultSet.find(elm => {

      return elm._id === evt;

    });

    this.addStoneInfoTab(temp, null);

    temp = null;

  }

  addStoneInfoTab(data, result) {
    this.searchResults.forEach((element) => {
      if (element.stoneName === data.stone_id) {
        if (element.stoneName === data.stone_id || element.name === data.stone_id || element.pairId === data.stone_id) {
          this.stoneSvc.removeElement(this.searchResults, element);
        }
      }
    });
    this.searchResults.push({
      stoneName: data.stone_id,
      stoneInfo: data,
      order: this.tabOrder++
    });
    this.lastCreatedTab = data.stone_id;
    this.appStore.store(this.searchType + ':resultArray', this.searchResults);
    this.appStore.store('isStoneDetailsTabAdded', true);
    this.isResultDefined = false;
    this.tabPanel = true;
    this.updateTabIndex();
    this.handlePageRef();
  }

  addTwinStoneInfoTab(pairId, tabs, result) {
    this.stoneSvc.getStoneDetailsByPairId(pairId).subscribe(resPairStones => {
      if (resPairStones && resPairStones.length === 2) {
        this.stoneSvc.addTwinStoneInfoTab(resPairStones, tabs);
        this.lastCreatedTab = pairId;
        this.searchResults.forEach((element) => {
          if (element.pairId === pairId) {
            element.order = this.tabOrder++;
          }
        });
        this.appStore.store(this.searchType + ':resultArray', tabs);
        this.appStore.store('isStoneDetailsTabAdded', true);
        this.isResultDefined = false;
        this.updateTabIndex();
      }
    });
    this.handlePageRef();
  }

  removeSearchTab(name, flag) {
    this.searchResults.forEach((element, index) => {
      if (element.stoneName === name || element.name === name || element.pairId === name) {
        this.stoneSvc.removeElement(this.searchResults, element);
        if (this.searchResults[index - 1] && this.searchResults[index - 1].hasOwnProperty('newSearch')) {
          this.currentTabSelected = this.searchResults[0].name;
        } else {
          if (this.searchResults[index - 1] && this.searchResults[index - 1].hasOwnProperty('name')) {
            this.currentTabSelected = this.searchResults[index - 1].name;
          } else if (this.searchResults[index - 1] && this.searchResults[index - 1].hasOwnProperty('stoneName')) {
            this.currentTabSelected = this.searchResults[index - 1].stoneName;
          } else if (this.searchResults[index - 1] && this.searchResults[index - 1].hasOwnProperty('pairId')) {
            this.currentTabSelected = this.searchResults[index - 1].pairId;
          } else {
            this.currentTabSelected = this.searchResults[0].name;
          }
        }
      }
    });
    if (this.searchResults.length === 1) {
      this.isDataAvailable = false;
    } else {
      this.getSearchResultCount();
    }
    this.handlePageRef();
    this.adjustTableSize();
    this.isSearchTabActive();
    this.updateRowColor();
  }

  updateSearchResultArray(array) {

    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    this.searchResults.forEach((element, index) => {
      if (array.name === element.name) {
        const i = this.searchResults.indexOf(element);
        if (array.selectedStoneTable.length > 0 && array.isAllSelected) {

          this.searchResults[i].selectedStoneButton = array.selectedStoneButton;
          this.searchResults[i].panelData = this.stoneSvc.calculateSelectedStoneData(array.selectedStoneTable);
          if (this.searchResults[i].selectedStoneButton.length > 0) {
            this.searchResults[i].height = window.innerHeight * (71 / 100);
          }
          this.searchResults[i].toggleTableDisplay = array.toggleTableDisplay;
          if (this.searchResults[i].toggleTableDisplay) {
            this.searchResults[i].height = window.innerHeight * (43 / 100);
          }
          this.httpSubscription = this.stoneSvc.getDiamondPriceInfo(array.selectedStoneTable).subscribe((response) => {
            this.searchResults[i].selectedStoneTable = response;
            this.searchResults[i].panelData = this.stoneSvc.calculateSelectedStoneData(array.selectedStoneTable);
            // this.searchResults[i].toggleTableDisplay = array.toggleTableDisplay;
            this.refreshDataTable('selected-table');
          });
        } else {

          this.searchResults[i].panelData = this.stoneSvc.calculateSelectedStoneData(array.selectedStoneTable);
          this.searchResults[i].height = window.innerHeight * (90 / 100);
          this.searchResults[i].toggleTableDisplay = false;
          this.refreshDataTable('');
          this.refreshDataTable('selected-table');
        }
      }
    });
    if (this.searchType !== 'TWIN_DIAMOND_SEARCH') {
      this.updateRowColor();
    } else {
      this.updateTwinDiamondRowColor();
    }
    this.appStore.store(this.searchType + ':resultArray', this.searchResults);
  }

  modifySearch(name) {
    this.appStore.store('resetScrollOnModify', 'true');
    this.searchResults.forEach((element) => {
      if (element.name === name) {
        element.isModified = true;
        if (this.appStore.getData(this.searchType + ':modifyCount') === undefined) {
          this.appStore.store(this.searchType + ':modifyCount', 0);
          this.appStore.store(this.searchType + ':modifyResultName', name);
        }
      }
    });
  }

  cancelModifySearch(e, result) {
    this.searchResults.forEach((object) => {
      if (object.name === result.name) {
        if (e === true) {
          result.isModified = !result.isModified;
        }
      }
    });
    this.appStore.store(this.searchType + ':resultArray', this.searchResults);
  }

  toggleConfirmOverlay(e) {
    this.confirmOverlayVisible = e.visible;
  }

  toggleOverlay(e) {
    this.popupVisible = e.visible;
  }

  /******************* DDC *******************************/
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

  /******************* packets *******************************/
  togglePacketIcon(e) {
    this.visiblePacketIcon = e.visible;
  }

  stoneToOperateInPacket(data) {
    this.showSelectedPacket = true;
    this.stoneForPacket = [data];
    this.visiblePacketPopup = true;
    this.fetchMenuDistanceFromTop();
  }

  togglePacketOverlay(event) {
    this.showSelectedPacket = true;
    this.visiblePacketPopup = event.visible;
    this.fetchMenuDistanceFromTop();
  }

  stoneFromSelectedStone(event) {

    // console.log('This is added to packet ');
    // console.log(event);

    this.showSelectedPacket = event.visible;
    this.stoneForPacket = event.object;
    this.visiblePacketPopup = true;
    this.fetchMenuDistanceFromTop();
  }

  updatePacketIcon(event) {

    this.packetIconDataForGrid = event.array.map(elm => { return elm.stones.toString(); }).toString();

    this.searchResults.forEach(resultTab => {
      resultTab.diamondTable = this.stoneSvc.setStonePacketCount(resultTab.diamondTable);
      resultTab.diamondTable = this.stoneSvc.updateStonePacketCount(event, resultTab.diamondTable);
      if (resultTab.selectedStoneTable && resultTab.selectedStoneTable.length > 0) {
        resultTab.selectedStoneTable = this.stoneSvc.setStonePacketCount(resultTab.selectedStoneTable);
        resultTab.selectedStoneTable = this.stoneSvc.updateStonePacketCount(event, resultTab.selectedStoneTable);
      }
    });
  }

  updateStoneStateDetails(res) {

    // console.log('stone state iwll be updated ');

    let stoneList = res.stoneList;
    if (this.searchType === SearchType.TWIN_DIAMOND_SEARCH) {
      const cannotConfirmStones = res.cannotConfirmStones;
      if (cannotConfirmStones) {
        stoneList = stoneList.concat(cannotConfirmStones);
      }
    }
    if (stoneList) {
      stoneList.forEach((stoneId, idx) => {

        if (res.source === 'confirmedStones' || res.source === 'holdRequested') {

          this.searchResults.forEach((searchResultTab) => {
            if (searchResultTab.name) {

              searchResultTab.selectedStoneButton.forEach(value => {
                if (value === stoneId) {
                  this.stoneSvc.removeElement(searchResultTab.selectedStoneButton, value);
                }
              });
              searchResultTab.filteredStone.forEach(value => {


                if (value === stoneId) {
                  this.stoneSvc.removeElement(searchResultTab.filteredStone, value);
                }
              });
              searchResultTab.selectedStoneTable.forEach(stone => {


                if (stone.stone_id === stoneId) {
                  this.stoneSvc.removeElement(searchResultTab.selectedStoneTable, stone);
                }
              });
              searchResultTab.diamondTable.forEach(stone => {


                if (stone.stone_id === stoneId) {
                  this.stoneSvc.removeElement(searchResultTab.diamondTable, stone);
                }
              });


              searchResultTab.panelData = this.stoneSvc.calculateSelectedStoneData(searchResultTab.selectedStoneTable);
              this.updateSearchResultArray(searchResultTab);
            }
          });

          if (idx === stoneList.length - 1) {


            // console.log('Also calling this 2 ? ');
            this.stonesActedOn = res;

          }

        } else {

          this.searchResults.forEach((searchResultTab, index) => {
            if (searchResultTab.diamondTable !== undefined) {
              searchResultTab.diamondTable = this.stoneSvc.updateDataTable(searchResultTab.diamondTable, res, stoneId);
            }
            if (searchResultTab.selectedStoneTable) {
              searchResultTab.selectedStoneTable = this.stoneSvc.updateDataTable(searchResultTab.selectedStoneTable, res, stoneId);
            }

          });
          this.appStore.store(this.searchType + ':resultArray', this.searchResults);

          if (idx === this.searchResults.length) {

            setTimeout(() => {
              // console.log('Calling this');
              const newResponce = { ...res }
              if (res.source === 'b2bRequested') {
                newResponce['source'] = 'b2bGridRequested';
              }
              this.stonesActedOn = newResponce;

            }, 1000);

          }

          if (idx === stoneList.length - 1) {
            // console.log('Also calling this ');
            const newResponce = { ...res }
            if (res.source === 'b2bRequested') {
              newResponce['source'] = 'b2bGridRequested';
            }
            this.stonesActedOn = newResponce;


          }

        }
        this.refreshDataTable('');


      });
    }
    this.adjustTableSize();
  }

  refreshDataTable(tableName) {
    let isSearchTable = false;
    let isSelectedTable = false;
    switch (tableName) {
      case 'selected-table':
        isSelectedTable = true;
        break;
      case 'search-result':
        isSearchTable = true;
        break;
      default:
        isSearchTable = true;
        isSelectedTable = true;
        break;
    }
    if (this.searchResultGridComponent && isSearchTable) {
      this.searchResultGridComponent.instance.refresh();
    }
    if (this.selectedStonesPanel && isSelectedTable && this.selectedStonesPanel.hasOwnProperty('selectedStoneComponent')) {
      if (this.selectedStonesPanel.selectedStoneComponent) {
        this.selectedStonesPanel.selectedStoneComponent.instance.refresh();
      }
    }

    // console.log('Data table refresh called');
    // this.stonesActedOn = {source: 'refreshMethod', value: new Date().valueOf() };

  }

  openBTB(data) {
    this.btbSelectedStones = [];
    this.isBTBDataLoaded = false;
    this.isBTBClosed = false;
    this.bidToBuyService.getBTBPopuStone(data.stone_id).subscribe((response) => {
      data.bid_rate = null;
      data.offer_per_stdisc = null;
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
              this.stoneSvc.getB2BPopupData(element, this.btbSelectedStones);
            });
          } else {
            this.btbSelectedStones['final_submit'] = null;
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

  showFilter(event, overlaypanel: OverlayPanel) {
    overlaypanel.show(event);
    event.stopPropagation();
  }

  filterColumns(filterCriteria, overlaypanel: OverlayPanel, result) {
    if (filterCriteria) {
      const filterConfig = {
        'key': filterCriteria[0].key,
        'value': filterCriteria[0].value
      };
      this.searchResults.forEach(searchResultTab => {
        if (searchResultTab.name === result.name) {
          searchResultTab.filteredStones = this.searchService.calculateFilteredStoneTable(searchResultTab.diamondTable, filterConfig);
          this.isFilteredtable = true;
        }
      });
      overlaypanel.visible = false;
    } else {
      this.isFilteredtable = false;
      this.messageService.showErrorGrowlMessage('select one filter value');
    }
  }

  toggleSearchFilter(event, overlaypanel: OverlayPanel) {
    this.isFilteredtable = false;
    overlaypanel.visible = event.visible;
  }

  getNotesForAllStones() {
    ;

    this.searchResults.forEach((element, index) => {

      if (element.diamondTable && element.diamondTable.length > 0) {

        this.notesService.fetchStonesAsynchronously(element.diamondTable)
          .then(result => {

            element.diamondTable = result;
            // console.log('Triggerrring ',result);
            this.stonesActedOn = { 'source': 'noteAdded' };

          }).catch(error => {

            console.error('Failed with error ');
            console.error(error);

          });

      }

      /*if (index === this.searchResults.length - 1) {

        setTimeout(() => {

          console.log('Triggerrring ');
          this.stonesActedOn = {'source': 'noteAdded'};

        }, 200);

      }*/

    });

  }


  updateNotesForStones(res) {
    this.searchResults.forEach((element, index) => {

      if (element.diamondTable && element.diamondTable.length > 0) {
        const toUpdateStoneArray = this.stoneSvc.findStoneObjUsingStoneIds(element.diamondTable, res.stoneList);
        if (toUpdateStoneArray instanceof Array && toUpdateStoneArray.length > 0) {
          this.notesService.fetchStonesAsynchronously(toUpdateStoneArray)
            .then(result => {

              element.diamondTable = this.stoneSvc.findAndUpdateStoneCommentFromList(element.diamondTable, result);
              if (result && result instanceof Array && result.length > 0) {
                this.updateSelectedStonesNote(element);
                this.stonesActedOn = { 'source': 'noteAdded', stoneList: res.stoneList };
              }

            }).catch(error => {

              console.error('Failed with error ');
              console.error(error);

            });
        }
      }
    });
  }

  deleteCommentsFromStones(res) {
    this.searchResults.forEach((element, index) => {
      const stoneList = [];
      if (element.diamondTable && element.diamondTable.length > 0) {
        const commentsId = res.commentList;
        element.diamondTable.forEach(stone => {
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
        this.updateSelectedStonesNote(element);
        if (_.uniq(stoneList) && _.uniq(stoneList).length > 0) {
          this.stonesActedOn = { 'source': 'noteAdded', stoneList: _.uniq(stoneList) };
        }
      }
    });
  }

  updateSelectedStonesNote(object) {
    if (object.selectedStoneTable && object.selectedStoneTable.length > 0) {
      object.selectedStoneTable =
        this.stoneSvc.updateNotesForSelectedPanel(object.selectedStoneTable, object.diamondTable);
    }
    return object;
  }

  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadPopOverVisible = true;
  }
  /*********** download result ***************/
  downloadResult(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.downloadStoneDetails(array.diamondTable, this.selectedStones, this.selectedDownloadType);
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  sendExcelMail(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones.length > 0) {
      this.downloadSvc.mailStoneExcel(array.diamondTable, this.selectedStones, 'Specific Search Result List');
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  isAllStoneSelected(array, isAllSelected) {

    isAllSelected ? array.isAllResultSelected = true : array.isAllResultSelected = false;

    if (array.isAllResultSelected) {
      array.selectedStoneButton = this.stoneSvc.createStoneIdList(array.diamondTable);
      array.filteredStone = this.stoneSvc.createStoneIdList(array.diamondTable);
      array.selectedStoneTable = JSON.parse(JSON.stringify(array.diamondTable));
    } else {
      array.selectedStoneButton = [];
      array.selectedStoneTable = [];
      array.filteredStone = [];
      array.toggleTableDisplay = false;
    }
    array.isAllSelected = this.stoneSvc.isArrayMatch(array.selectedStoneButton, array.filteredStone);
    this.updateSearchResultArray(array);
  }

  toggleAddNoteOverlay(e) {
    this.commentsOverlayVisible = e.visible;
  }

  getPageRef(result) {
    const gridIdName = '#' + result.name + 'GridContainer';
    const scrollable = this.searchResultGridComponent.instance.getScrollable(gridIdName);
    result['pageRefPosition'] = scrollable.scrollTop();
    this.appStore.store(this.searchType + ':resultArray', this.searchResults);
  }

  handlePageRef() {
    setTimeout(() => {
      this.searchResults.forEach(result => {
        const gridId = result.name + 'GridContainer';
        const container = this.getDataGridContainer(gridId);
        if (result.hasOwnProperty('sortedColumnOrder') && result.hasOwnProperty('soretedColumn') && container) {
          container.instance.columnOption(result.soretedColumn, 'sortOrder', result.sortedColumnOrder);
        }
        if (result.pageRefPosition && this.searchResultGridComponent) {
          if (container) {
            const scrollable = container.instance.getScrollable('#' + gridId);
            if (scrollable) {
              scrollable.scrollTo({ left: 0, top: result.pageRefPosition });
            }
          }
        }
      });
    }, 1000);
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
    if (container === undefined || container === null) {
      container = this.searchResultGridComponent;
    }
    return container;
  }

  scrollTable(params, name) {
    const gridId = name + 'GridContainer';
    const container = jQuery('#grid').igGrid('scrollContainer');
    if (params === 'left') {
      container.scrollLeft(40);
      // this.stoneSvc.scrollLeft(container, '#' + gridId);
    } else if (params === 'right') {
      container.scrollLeft(-40);
      // this.stoneSvc.scrollRight(container, '#' + gridId);
    }
  }

  startTableScroll(direction: string): void {

    const container = jQuery('#grid').igGrid('scrollContainer');

    if (direction === 'left') {

      jQuery('#grid').scrollLeft(150);

    } else {

      jQuery('#grid').scrollLeft(-150);

    }

  }

  stopTableScroll(direction: string): void {

    // console.log('Mouse was lifted');

  }

  scrollTableInInterval(params, name) {
    this.timer = setInterval(() => {
      const gridId = name + 'GridContainer';
      const container = this.getDataGridContainer(gridId);
      if (params === 'left') {
        this.stoneSvc.scrollLeft(container, '#' + gridId);
      } else if (params === 'right') {
        this.stoneSvc.scrollRight(container, '#' + gridId);
      }
    }, 1);
  }

  stopScrolling() {
    clearInterval(this.timer);
  }

  updateTabIndex() {
    this.searchResults = this.sortTabIndex(this.searchResults);
    this.getSearchResultCount();
  }

  getSearchResultCount() {
    this.searchResultCount = 0;
    this.searchResults.forEach((result) => {
      if (result.name) {
        this.searchResultCount++;
      }
    });
    if (this.searchResultCount < this.searchResultLimit) {
      this.visibleNewSearchTab = true;
    } else {
      this.visibleNewSearchTab = false;
    }
    this.updateNewSearchTab();
  }

  updateNewSearchTab() {
    if (!this.visibleNewSearchTab) {
      this.searchResults.forEach((result, index) => {
        if (result.newSearch) {
          this.searchResults.splice(index, 1);
        }
      });
    } else {
      let flag = false;
      this.searchResults.forEach((result) => {
        if (result.newSearch) {
          flag = true;
        }
      });
      if (!flag) {
        this.searchResults.push({ newSearch: 'New search', order: 2 });
      }
    }
  }

  sortTabIndex(requestData) {
    requestData.sort(function (obj1, obj2) {
      if (obj1.order < obj2.order) {
        return -1;
      } else if (obj1.order > obj2.order) {
        return 1;
      } else {
        return 0;
      }
    });
    return requestData;
  }

  scrollColumn(name, data) {
    const gridId = name + 'GridContainer';
    this.isColumnExpanded = !this.isColumnExpanded;
    this.isIconVisible = !this.isIconVisible;
    const gridContainer = this.getDataGridContainer(gridId);
    this.stoneSvc.handleSortingOrder(gridContainer);
    const columns = JSON.parse(JSON.stringify(gridContainer.columns));
    if (this.isColumnExpanded) {
      columns[1].width = 275;
    } else {
      columns[1].width = 130;
    }
    gridContainer.columns = columns;
    this.appStore.store(this.searchType + ':resultArray', this.searchResults);
  }

  createNewSearchResult(event) {
    if (event.newSearch) {
      this.defineSearchResult();
    }
  }

  createPacket() {
    this.packetCount++;
    this.notify.notifyPacketCount({ packetCount: this.packetCount });
  }

  showPacket() {
    this.notify.notifyShowPacketEvent({ showPackets: true });
  }

  onCellPrepared(e, array) {
    this.stoneSvc.onCellPrepared(e, array.selectedStoneButton);
  }

  updateRowColor() {
    this.searchResults.forEach(array => {
      const gridId = array.name + 'GridContainer';
      const container = this.getDataGridContainer(gridId);
      if (container && array.name && array.isActive) {
        array.diamondTable.forEach((element, index) => {
          this.stoneSvc.showRowColorChanges(container, array.selectedStoneButton, element.stone_id, index);
        });
      }
    });
  }

  updateTwinDiamondRowColor() {
    this.searchResults.forEach(array => {
      const gridId = array.name + 'GridContainer';
      const container = this.getDataGridContainer(gridId);
      if (container && array.name) {
        container.instance.refresh();
      }
    });
  }

  isSearchTabActive() {
    const activeTabName = this.currentTabSelected;
    this.searchResults.forEach((result, index) => {
      if (result.name) {
        result.isActive = (activeTabName === result.name) ? true : false;
        this.updateRowColor();
      }
    });
  }

  scrollToTab() {
    let count = 0;
    this.searchResults.forEach(tab => {
      if (tab.name) {
        count++;
      }
      if (tab.stoneName || tab.pairId) {
        count++;
      }
    });
    if (jQuery('#searchTabResultId') && jQuery('#searchTabResultId')[0]) {
      const rect = jQuery('#searchTabResultId')[0].getBoundingClientRect();
      let pos = rect.top + window.pageYOffset - document.documentElement.clientTop;
      if (count === 1) {
        pos = 0;
      }
      // jQuery('html, body').animate({ scrollTop: pos }, 'slow');
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if ((window.location.href.indexOf('search-result') > -1 || window.location.href.indexOf('twin-diamonds-result') > -1)
      && this.searchResults && this.searchResults.length > 1) {
      this.fixedHeader();
    }
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
        // jQuery('#searchTabResultId').addClass('stuck').innerWidth(containerWidth).css('padding-bottom', '10px');
        jQuery('#packetTabResultId').addClass('stuck').addClass('packet-struck');
        jQuery('#packetBox').css('display', 'none');
        jQuery('.struck-page').css('max-height', (window.innerHeight * 80) / 100);
      } else {
        // jQuery('#searchTabResultId').removeClass('stuck').innerWidth(containerWidth).css('padding-bottom', '0px');
        jQuery('#packetTabResultId').removeClass('stuck').removeClass('packet-struck');
        jQuery('#packetBox').css('display', 'block');
        jQuery('.struck-page').css('max-height', '135vh');
      }
    }
  }

  adjustTableSize() {
    this.searchResults.forEach(element => {
      if (element.name) {
        if (element.selectedStoneButton.length > 0) {
          element.height = window.innerHeight * (71 / 100);
        } else {
          element.height = window.innerHeight * (90 / 100);
        }
        if (element.toggleTableDisplay) {
          element.height = window.innerHeight * (43 / 100);
        }
      }
      this.gridHeight = window.innerHeight - 265;
    });
    this.adjustTableBoxSize();
    this.appStore.store(this.searchType + ':resultArray', this.searchResults);
  }

  adjustTableBoxSize() {

    // console.log('Adjust tbale box size is called ');

    if (jQuery('#searchTabResultId')) {
      jQuery('#searchTabResultId').css({
        'height': window.innerHeight - 63,
        'overflow': 'hidden'
      });
    }
  }

  fetchMenuDistanceFromTop() {
    if (jQuery('#fixedPanel').offset() && jQuery('#fixedPanel').offset().top) {
      this.menuDistanceFromTop = jQuery('#fixedPanel').offset().top > 0 ? jQuery('#fixedPanel').offset().top : 0;
    }
  }

  tabChanges(param) {
    if (param.name) {
      this.currentTabSelected = param.name;
    } else if (param.newSearch) {
      this.currentTabSelected = param.newSearch;
      setTimeout(() => {
        jQuery('.struck-page').css('max-height', (window.innerHeight * 80) / 100);
      }, 1000);
    } else if (param.stoneName) {
      this.currentTabSelected = param.stoneName;
      this.appStore.store('isStoneDetailsTabAdded', true);
    } else if (param.pairId) {
      this.currentTabSelected = param.pairId;
      this.appStore.store('isStoneDetailsTabAdded', true);
    } else {
      this.appStore.store('isStoneDetailsTabAdded', false);
    }
    this.searchResults.forEach(result => {
      if (result.hasOwnProperty('isModified')) {
        result.isModified = false;
      }
    });
    this.handlePageRef();
  }

  toggleStoreResultPopup(event) {
    this.visibleResultStorePopup = event.visible;
  }

  ngOnDestroy() {
    this.searchResults.forEach(result => {
      if (result.hasOwnProperty('isModified')) {
        result.isModified = false;
      }
    });
    this.saveTempSearch();
    if (this.logoutObservable) {
      this.logoutObservable.unsubscribe();
    }
    this.globalSearchSubscription.unsubscribe();
    this.stoneConfirmedSubscription.unsubscribe();
    this.showPacketSubscription.unsubscribe();
    this.selectedStoneOnClickSubscription.unsubscribe();
    this.addNoteSubscription.unsubscribe();
    jQuery('.struck-page').css('max-height', '135vh');

    this.sessionStorageService.clearSessionStorage();

  }

  saveTempSearch() {
    if (this.selectedSaveSearchPreference.enable_temp_save_search && this.selectedSaveSearchPreference.enable_temp_save_search.entity_value) {
      if (this.isDataAvailable && this.searchResults && this.searchResults.length > 1) {
        let saveSearchMessage = 'SAVE_SEARCH_POPUP_MSG';
        let saveSearchHeader = 'Alert!!!';
        saveSearchMessage = this.customTranslateSvc.translateString(saveSearchMessage);
        saveSearchHeader = this.customTranslateSvc.translateString(saveSearchHeader);
        const popup = this.userProfileService.getPopUpVisible();
        if (popup === true) {
          this.confirmationService.confirm({
            message: saveSearchMessage,
            header: saveSearchHeader,
            accept: () => {
              this.userProfileService.setPopUpVisible();
              this.searchResults.forEach(result => {
                if (result.hasOwnProperty('isModified')) {
                  result['isModified'] = false;
                }
              });
              this.appStore.store(this.searchType + ':resultArray', this.searchResults);
            },
            reject: () => {
              // this.userProfileService.setPopUpVisible();
              this.appStore.remove(this.searchType + ':resultArray');
              this.appStore.remove(this.searchType + ':count');
              this.appStore.remove(this.searchType + ':currentCount');
              // const updateSaveSearchResultPreference = this.updateSelectedList([], this.userProfileService.getSelectedSaveSearchPreference());
            }
          });
        }
      }
    } else {
      this.appStore.remove(this.searchType + ':resultArray');
      this.appStore.remove(this.searchType + ':count');
      this.appStore.remove(this.searchType + ':currentCount');
    }
  }

  createJsonResponse(name, array) {
    const jsonResponse = {};
    jsonResponse['login_name'] = this.authService.getLoginName();
    jsonResponse['config_name'] = name;
    jsonResponse['config_type'] = 'USER_SPECIFIC';
    jsonResponse['version'] = 1;
    jsonResponse['config_values'] = array;
    return jsonResponse;
  }

  updateSelectedList(selectedList, originalObjectList) {
    for (const i in originalObjectList) {
      if (originalObjectList.hasOwnProperty(i)) {
        const index = selectedList.indexOf(i);
        if (index > -1 && originalObjectList[i].is_updatable) {
          originalObjectList[i].entity_value = true;
        } else if (originalObjectList[i].is_updatable) {
          originalObjectList[i].entity_value = false;
        }
      }
    }
    return originalObjectList;
  }

  onResultLoading(event) {
    const gridId = event.name + 'GridContainer';
    const container = this.getDataGridContainer(gridId);
    for (let i = 0; i < container.columns.length; i++) {
      if (Number.isInteger(container.instance.columnOption(i, 'sortIndex'))) {
        event['soretedColumn'] = i;
        event['sortedColumnOrder'] = container.instance.columnOption(i, 'sortOrder');
      }
    }
    this.appStore.store(this.searchType + ':resultArray', this.searchResults);
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {

    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
    // console.log('The paramenter of this funtion are ');

  }

  stoneMediaIconPanel(event) {
    const data = this.stoneSvc.returnPositionOfOverlay(event);
    this.iconOverlayXPosition = data.left;
    this.iconOverlayYPosition = data.top;
    this.iconDisplayStoneObject = event.stoneId;
    this.displayIconOverlay = true;

  };

  closeGridIconOverlay(data) {

    this.displayIconOverlay = false;

  }

  triggerStoneActionEvent(stoneObject) {

    this.stonesActedOn = stoneObject;

  }

  handleBasketEventForGrid(response) {

    this.stonesActedOn = { 'source': 'basketRequested' };

  }

  setColorLegendFilterValue(event: any, filterValue: String): void {

    if (this.colorLegendFilterValue.includes(filterValue)) {

      this.colorLegendFilterValue = this.colorLegendFilterValue.filter(elm => { return elm !== filterValue; });

    } else {

      this.colorLegendFilterValue = [...this.colorLegendFilterValue, filterValue];

    }

  }

}


