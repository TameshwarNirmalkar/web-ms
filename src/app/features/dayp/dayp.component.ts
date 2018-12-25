import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { DaypService } from '@srk/shared';
import { NotifyService, SessionStorageService } from '@srk/core';
import { SearchService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { MessageService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { Observable } from 'rxjs/Observable';
import { StoneDetailsService } from '@srk/shared';
import { Subscription } from 'rxjs/Subscription';
import { AddNoteService } from '@srk/shared';
// import { SearchType, SearchTypeComparator } from '@srk/core';
import { UtilService } from '@srk/shared';
import { AuthService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { ApplicationAuditService } from '@srk/core';
import { DownloadStonesService } from '@srk/shared';
import { Observer } from 'rxjs/Observer';
import { CustomTranslateService } from '@srk/core';
import * as _ from 'underscore';
import { ConfirmationService } from 'primeng/components/common/api';

@Component({
  selector: 'app-dayp',
  templateUrl: './dayp.component.html',
  styleUrls: ['./dayp.component.scss']
})
export class DaypComponent implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {

  @ViewChild('daypPanel') daypPanel;
  @ViewChild('predaypComponent') predaypComponent;
  @ViewChild('daypSearchComponent') daypSearchComponent;
  @ViewChild('daypBasketComponent') daypBasketComponent;
  @ViewChild('daypSubmitedComponent') daypSubmitedComponent;

  public timeSubScription: Subscription;
  public daypSubscription: Subscription;
  private stoneClickedForDetailViewSubscription: Subscription;
  private addStoneToPacketSubscription: Subscription;
  private packetStoneSubscription: Subscription;
  private showPacketSubscription: Subscription;

  public message: any;
  public daypTabs: any[];
  public isPreDaypActive = false;
  public isDaypActive = false;
  public showPreDaypTab = false;
  public isResultModified = false;
  public isDaypSearch = false;
  public daypSearchStones: any;
  public daypTimePeriod: any;
  public daypTime: any;
  public remainingDaypTime: any;
  public stoneDetailList: any[] = [];
  public isEditableMode = false;
  public isResultDeclared = false;

  public selectedFileName: any;
  public fileExtError: any;
  public fileSizeError: any;
  public fileLength: number;
  public isFileUploaded = false;
  public excelFileStoneData: any;

  public packetCount = 0;
  public showPacktBtn = false;
  public showCreatePacketBtn = true;
  public visiblePacketIcon = false;
  public visiblePacketPopup = false;
  public stoneForPacket: any;
  public tabIndex: any;
  public selectedTab = 0;
  public searchFilterConfig: any;
  public searchFiltersValue: any;
  public showSelectedPacket = true;
  public isPageSearch = false;
  public isStoneDetailsTabAdded = false;
  public showPageSearch = false;
  public showStockDownloadButton = false;
  public showUploadSelectionBtn = false;
  public currentTab: any;
  public isExcelUploaded = false;
  public packetStoneArray: any;
  public currentTabSelected = 'PRE_DAYP_SELECTION';
  public lastCreatedTab: any;
  public daypTimerCount: any;
  public acceptLabel = 'Yes';
  public rejectLabel = "No";
  public isLogoutEventOccur = false;
  public daypExitObservable: any;

  constructor(
    private router: Router,
    private location: Location,
    private daypSvc: DaypService,
    private notify: NotifyService,
    private searchSvc: SearchService,
    private utilService: UtilService,
    private messageService: MessageService,
    private applicationDataService: ApplicationDataService,
    private stoneSvc: StoneDetailsService,
    private notesService: AddNoteService,
    private authService: AuthService,
    private appStore: ApplicationStorageService,
    private auditService: ApplicationAuditService,
    public sessionStorageService: SessionStorageService,
    private downloadSvc: DownloadStonesService,
    private customTranslateSvc: CustomTranslateService,
    private confirmationService: ConfirmationService) { }

  ngOnInit() {
    this.message = 'Loading..';
    this.checkDaypStatus();
    this.stoneClickedForDetailViewSubscription = this.notify.notifyDaypPageStoneDetailTabActionObservable$.subscribe((res) => {
      if (res.data && res.type === 'stoneDtl') {
        this.addStoneDetailTab(res.data);
      } else if (res.data && res.type === 'twinStoneDtl') {
        this.addTwinStoneInfoTab(res.data, this.daypTabs);
      }
    });
    this.addStoneToPacketSubscription = this.notify.notifyDAypForPacketUpdateActionObservable$.subscribe((res) => {
      if (res) {
        this.addToPacket(res);
      }
    });
    this.showPacketSubscription = this.notify.notifyShowPacketBtnOccuredObservable$.subscribe(res => {
      this.showPacktBtn = res.visible;
    });
    this.daypSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      if (res.hasOwnProperty('daypAction')) {
        this.initDaypCount();
      }
    });
    this.packetStoneSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.packetStoneArray = res;
    });
    this.daypExitObservable = this.notify.notifyDaypBtbPageonLogoutObservable$.subscribe(res => {
      if (res.status === 1) {
        this.isLogoutEventOccur = true;
        this.showDaypLogoutPopup();
      } else if (res.status === 2) {
        this.isLogoutEventOccur = true;
      }
    });
    const gridStateKey = this.appStore.getData('gridStateName') || [];
    const gridStateObject: any = {};
    gridStateObject.iconLegendExpanded = 0;
    gridStateKey.forEach(element => {
      this.sessionStorageService.setDataInSessionStorage(element, JSON.stringify(gridStateObject) )
      .then( result => {
      })
      .catch(error => {

      console.error('Failed to save data to storage.');
      console.error(error);

        });
    });
  }

  ngAfterViewInit() {
    if ($('.container') && $('.page-in-search-box') && $('.container').position()) {
      $('.page-in-search-box').css('top', $('.container').position().top + 10);
    }
  }

  ngAfterViewChecked() {
    this.utilService.setSearchResultTabs(8);
    this.utilService.setSearchTabWidth();
  }

  scrollTabPanelRight() {
    this.utilService.scrollTabPanelRight();
  }

  scrollTabPanelLeft() {
    this.utilService.scrollTabPanelLeft();
  }

  checkDaypStatus() {
    this.daypSvc.checkActiveDaypStatus().subscribe(res => {
      if (!res.error_status && res.data && res.data.remainingTime && res.data.remainingTime.data) {
        this.checkActiveDaypStatus(res.data.remainingTime.data);
      }
      if (!res.error_status && res.data && res.data.permission) {
        this.checkDaypTabPermpission(res.data.permission);
      }
    }, error => {
      this.message = 'SERVER_ERROR_OCCURRED';
    });
  }

  checkActiveDaypStatus(responseData) {
    this.isDaypActive = responseData.isDAYPEventOn;
    if (this.isDaypActive) {
      this.daypTime = {
        days: responseData.days,
        hours: responseData.hours,
        minutes: responseData.minutes,
        seconds: responseData.seconds,
        start_date: responseData.start_date,
        end_date: responseData.end_date
      };
      const daypTotalSeconds = (this.daypTime.days * 24 * 60 * 60) + (this.daypTime.hours * 60 * 60) + (this.daypTime.minutes * 60) + this.daypTime.seconds;
      this.getDaypTimeCountDown(daypTotalSeconds);
      this.getDaypRemaingTime();
    } else {
      this.isEditableMode = responseData.is_disp_after;
      this.isResultDeclared = responseData.is_disp_result;
      this.remainingDaypTime = 'CLOSED';
      if (!this.isEditableMode) {
        this.checkPreDaypStatus();
      }
    }
  }

  checkDaypTabPermpission(responseData) {
    if (responseData && !responseData.error_status && MessageCodesComparator.AreEqual(responseData.code, MessageCodes.DAYP_EF_200)) {
      this.showPreDaypTab = responseData.data.showPreDAYPStones;
      this.showStockDownloadButton = responseData.data.isDownloadDaypStockAllowed;
      if (this.showStockDownloadButton || this.authService.hasElementPermission('excel_download_dayp_btn')) {
        this.showUploadSelectionBtn = true;
      }
    }
    if (!this.showPreDaypTab && !this.isDaypActive && !this.isEditableMode) {
      this.resetDaypcountdown();
    } else {
      this.initializeDaypTabs();
    }
  }

  checkPreDaypStatus() {
    this.daypSvc.checkPreDaypStatus().subscribe(res => {
      if (!res.error_status && MessageCodesComparator.AreEqual(res.code, MessageCodes.DAYP_EF_200)) {
        this.isPreDaypActive = res.data.isDAYPEventOn;
        if (this.isPreDaypActive && !this.showPreDaypTab) {
          this.message = 'ERR_NOT_ALLOWED_FOR_DAYP_TAB';
        }
      }
    });
  }

  initializeDaypTabs() {
    this.daypTabs = [];
    if (this.showPreDaypTab) {
      this.daypTabs.push({ name: 'PRE_DAYP_SELECTION', id: 0, count: -1 });
    }
    if (this.isDaypActive) {
      this.daypTabs.push(
        { name: 'DAYP_SEARCH', id: 1, count: -1 },
        { name: 'DAYP_BASKET', id: 2, count: -1 },
        { name: 'DAYP_MY_SUBMISSIONS', id: 3, count: -1 });
    }
    if (this.isEditableMode) {
      this.daypTabs.push(
        { name: 'DAYP_BASKET', id: 2, count: -1 },
        { name: 'DAYP_MY_SUBMISSIONS', id: 3, count: -1 });
    }
    if (!this.showPreDaypTab) {
      this.storeAuditData(this.daypTabs[0]);
    }
    this.initDaypCount();
    if (this.isDaypActive) {
      this.initializeActiveDaypTab();
      this.fetchPageSearchResultObject();
    } else {
      if (this.showPreDaypTab) {
        this.currentTabSelected = 'PRE_DAYP_SELECTION';
      } else {
        this.currentTabSelected = 'DAYP_BASKET';
      }
    }

  }

  initDaypCount() {
    this.daypSvc.getDaypStoneCount().subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_MSG_DAYP_COUNT_SUCCESS_200)) {
        if (res.hasOwnProperty('data')) {
          this.storeTabValue('DAYP_BASKET', res.data.basket_stone_count);
          this.storeTabValue('DAYP_MY_SUBMISSIONS', res.data.submitted_stone_count);
        }
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  storeTabValue(tabName, count) {
    if (this.daypTabs && this.daypTabs.length > 0) {
      this.daypTabs.forEach(tab => {
        if (tabName === tab.name) {
          tab.count = count;
        }
      });
    }
  }

  getDaypTimeCountDown(seconds) {
    this.daypTimerCount = seconds;
    this.timeSubScription = Observable.timer(0, 1000)
      .take(this.daypTimerCount)
      .subscribe(t => {
        if (this.daypTimerCount) {
          --this.daypTimerCount;
          if (this.daypTimerCount > 0) {
            this.daypTime.days = Math.floor(this.daypTimerCount / 86400);
            this.daypTime.hours = Math.floor((this.daypTimerCount % 86400) / 3600);
            this.daypTime.minutes = Math.floor(((this.daypTimerCount % 86400) % 3600) / 60);
            this.daypTime.seconds = ((this.daypTimerCount % 86400) % 3600) % 60;
            this.remainingDaypTime = this.daypTime.days.toString() + ' D/' + this.daypTime.hours.toString() + ' H/' +
              this.daypTime.minutes.toString() + ' M/' + this.daypTime.seconds.toString() + ' S Left';
          } else {
            this.resetDaypcountdown();
          }
        }
      });
  }

  getDaypRemaingTime() {
    let startDate = '';
    let endDate = '';
    startDate = this.daypTime.start_date.split(',');
    endDate = this.daypTime.end_date.split(',');
    const endTime = endDate[1].trim() ?
      (endDate[1].trim().substring(endDate[1].trim().lastIndexOf(':'), 0) ?
        endDate[1].trim().substring(endDate[1].trim().lastIndexOf(':'), 0) : '') : '';
    this.daypTimePeriod = {
      start_date: startDate[0],
      start_time: startDate[1],
      end_date: endDate[0],
      end_time: endTime,
      hoursFormat: this.daypTime.end_date.toUpperCase().indexOf('AM') > -1 ? 'AM ' : 'PM '
    };
  }

  resetDaypcountdown() {
    if (this.timeSubScription) {
      this.timeSubScription.unsubscribe();
    }
    this.message = 'DAYP_INACTIVE';
    this.isDaypActive = false;
    this.remainingDaypTime = 'CLOSED';
    this.daypTabs = [];
  }

  initializeActiveDaypTab() {
    const url = this.location.path();
    if (url && (typeof url === 'string')) {
      const page = url.substring(url.lastIndexOf('=') + 1);
      switch (page) {
        case 'search': this.currentTabSelected = 'DAYP_SEARCH';
          this.showPageSearch = true;
          break;
        case 'basket': this.currentTabSelected = 'DAYP_BASKET';
          break;
        default: this.currentTabSelected = 'DAYP_SEARCH';
          this.showPageSearch = true;
          break;
      }
    }
  }

  /********   ADD STONE DETAILS TAB  ********/
  addTwinStoneInfoTab(pairId, tabs) {
    this.stoneSvc.getStoneDetailsByPairId(pairId).subscribe(resPairStones => {
      if (resPairStones && resPairStones.length === 2) {
        this.stoneSvc.addTwinStoneInfoTab(resPairStones, tabs);
        this.lastCreatedTab = pairId;
        this.isStoneDetailsTabAdded = true;
      }
    });
  }

  addStoneDetailTab(data) {
    this.daypTabs.forEach((element) => {
      if (element.stoneName === data.stone_id) {
        this.removeDetailedPacketTab(element.stoneName);
      }
    });
    this.daypTabs.push({
      stoneName: data.stone_id,
      stoneInfo: data,
      CurrentSelectedTab: data.CurrentSelectedTab
    });
    this.lastCreatedTab = data.stone_id;
    this.isStoneDetailsTabAdded = true;
  }

  removeDetailedPacketTab(tabName) {
    this.daypTabs.forEach((element, index) => {
      if (element.stoneName === tabName || element.pairId === tabName) {
        const i = this.daypTabs.indexOf(element);
        this.daypTabs.splice(i, 1);
        if (this.daypTabs[index - 1] && this.daypTabs[index - 1].hasOwnProperty('name')) {
          this.currentTabSelected = this.daypTabs[index - 1].name;
        } else if (this.daypTabs[index - 1] && this.daypTabs[index - 1].hasOwnProperty('stoneName')) {
          this.currentTabSelected = this.daypTabs[index - 1].stoneName;
        } else if (this.daypTabs[index - 1] && this.daypTabs[index - 1].hasOwnProperty('pairId')) {
          this.currentTabSelected = this.daypTabs[index - 1].pairId;
        } else {
          this.currentTabSelected = this.daypTabs[0].name;
        }
      }
      if (element.CurrentSelectedTab === 'daypSearch') {
        this.currentTabSelected = 'DAYP_SEARCH';
      } else if (element.CurrentSelectedTab === 'daypBasket') {
        this.currentTabSelected = 'DAYP_BASKET';
      } else if (element.CurrentSelectedTab === 'daypSubmmit') {
        this.currentTabSelected = 'DAYP_MY_SUBMISSIONS';
      } else if (element.CurrentSelectedTab === 'preDaypSearch') {
        this.currentTabSelected = 'PRE_DAYP_SELECTION';
      }
    });
    // this.daypPanel.selectedIndex = this.currentTab;
  }

  /*********    DAYP SEARCH EVENTS   ***********/
  getPageSearchResult(event) {
    if (event.isResult) {
      this.isPageSearch = true;
      this.currentTabSelected = 'DAYP_SEARCH';
      this.searchFilterConfig = {};
      this.searchFiltersValue = {};
      this.handleSearchResult(this.searchSvc.getSearchResultData());
    } else {
      this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
    }
  }

  fetchPageSearchResultObject() {
    if (this.appStore.getData('DAYP-Saved-Search')) {
      this.currentTabSelected = 'DAYP_SEARCH';
      const savedSearchData = this.appStore.getData('DAYP-Saved-Search');
      this.searchFilterConfig = savedSearchData.searchConfig;
      this.searchFiltersValue = savedSearchData.selectedSearchValue;
      this.createDaypSearchStoneObject(savedSearchData.result.data.body);
    }
  }

  getDaypSearchResult(event) {
    const flag = this.searchSvc.isCaratSelected();
    this.searchFilterConfig = event.config;
    this.searchFiltersValue = this.searchSvc.getSelectedFiltersValue();
    if (flag && event.config) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.searchSvc.specificSearch(event.config, 'DAYP_SEARCH', event.eventCode, event.order_details).subscribe(response => {
        if (response !== undefined) {
          this.handleSearchResult(response);
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    } else {
      if (!flag) {
        this.messageService.showErrorGrowlMessage('SELECT_CARAT');
      } else {
        this.messageService.showErrorGrowlMessage('ERR_SELECT_SEARCH_FILTER');
      }
    }
  }

  handleSearchResult(response) {
    if (MessageCodesComparator.AreEqual(response.code, MessageCodes._LIMIT_EXCEED)) {
      if (response.data.body.length > 0) {
        this.createDaypSearchStoneObject(response.data.body);
      }
      this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
    } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes._OVER_LIMIT)) {
      if (response.data.body.length > 0) {
        this.createDaypSearchStoneObject(response.data.body);
        this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
      } else {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('NO_STONE_FOUND_DAYP');
      }
    } else if (response.code === 'ELS#200') {
      if (response.data.body.length > 0) {
        this.createDaypSearchStoneObject(response.data.body);
      } else {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('NO_STONE_FOUND_DAYP');
      }
    }
  }

  createDaypSearchStoneObject(array) {
    this.appStore.remove('daypSearchDetails')
    this.daypSearchStones = array;
    this.isResultModified = !this.isResultModified;
    this.isDaypSearch = true;
    this.notify.hideBlockUI();
  }

  modifySearch(event) {
    this.auditService.storeActivityAudit('DAYPSearch');
    this.isDaypSearch = event.modify;
    this.isPageSearch = false;
  }

  cancelModifySearch(event, data) {
    this.isDaypSearch = true;
  }

  resetSearchConfig(event){
    this.searchFilterConfig = event.config;
    this.searchFiltersValue = event.searchFilters;
  }

  /**************** upload dayp excel ******************/
  uploadDaypExcel(event) {
    const fileList: FileList = event.target.files || event.srcElement.files;
    this.fileLength = fileList.length;
    const file = fileList[0];
    this.selectedFileName = file.name;
    const ext = this.selectedFileName.substring(this.selectedFileName.lastIndexOf('.') + 1).toLowerCase();
    const extArray = ['xls', 'xlsx'];
    this.fileExtError = extArray.indexOf(ext) === -1 ? true : false;
    this.fileSizeError = fileList[0].size > 10000000 ? true : false;
    if (!this.fileExtError && !this.fileSizeError) {
      const fileFormData: FormData = new FormData();
      fileFormData.append('excel', file, this.selectedFileName);
      this.isExcelUploaded = true;
      this.daypSvc.uploadExcel(fileFormData).subscribe(response => {
        event.target.value = "";
        this.isExcelUploaded = false;
        if (response && !response.error_status && (MessageCodesComparator.AreEqual(response.code, MessageCodes.EMS_SEU_SUCCESS_200)
          || MessageCodesComparator.AreEqual(response.code, MessageCodes.EMS_SDU_SUCCESS_200))) {
          this.excelFileStoneData = response.data;
          if (response.data.autoSaveDaypStoneList.length === 0 && response.data.submittedDaypStoneList.length === 0) {
            this.messageService.showInfoGrowlMessage('STONE_NV_EXCEL_UPLOAD');
          } else {
            this.isFileUploaded = true;
            // if (response.data.submittedDaypStoneList && response.data.submittedDaypStoneList.length > 0) {
            //   const params = { submittedStones: response.data.submittedDaypStoneList.length };
            //   this.messageService.showDynamicSuccessGrowlMessage('DAYP_EXCEL_SUBMITTED', params);
            // }
            if (response.data.autoSaveDaypStoneList && response.data.autoSaveDaypStoneList.length > 0) {
              const params2 = { autoSavedStones: response.data.autoSaveDaypStoneList.length };
              this.messageService.showDynamicErrorGrowlMessage('DAYP_EXCEL_SUBMITTED_BASKET', params2);
            }
          }
        } else if (response && response.error_status) {
          this.messageService.showErrorGrowlMessage('ERR_UPLOAD_EXCEL_DAYP');
          this.isFileUploaded = false;
        }
      }, error => {
        event.target.value = "";
        this.isExcelUploaded = false;
        this.messageService.showErrorGrowlMessage('ERR_UPLOAD_EXCEL_DAYP');
      });
    }
  }

  updateDaypExcel(type) {
    const stoneConfig = this.daypSvc.getExcelUpdateData(this.excelFileStoneData);
    if (type === 'update') {
      stoneConfig.is_update = true;
    } else if (type === 'overwrite') {
      stoneConfig.is_over_write = true;
    }
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    this.daypSvc.saveDaypExcelStones(stoneConfig).subscribe(response => {
      this.isFileUploaded = false;
      if (response && !response.error_status && response.data.submit_response &&
        MessageCodesComparator.AreEqual(response.data.submit_response.code, MessageCodes.SMS_DAYP_FS_200)) {
        this.updateExcelStones(this.excelFileStoneData.submittedDaypStoneList, 'daypSubmission', type);
        const params = { submittedStones: this.excelFileStoneData.submittedDaypStoneList.length };
        this.messageService.showDynamicSuccessGrowlMessage('DAYP_EXCEL_SUBMITTED', params);
        // this.messageService.showSuccessGrowlMessage(MessageCodes[response.data.submit_response.code]);
      }
      if (response && !response.error_status && response.data.save_response &&
        MessageCodesComparator.AreEqual(response.data.save_response.code, MessageCodes.SMS_DAYP_ASDB_200)) {
        this.updateExcelStones(this.excelFileStoneData.autoSaveDaypStoneList, 'daypPriceInserted', type);
      this.messageService.showSuccessGrowlMessage(MessageCodes[response.data.save_response.code]);
        const params2 = { autoSavedStones: this.excelFileStoneData.autoSaveDaypStoneList.length };
        this.messageService.showDynamicInfoGrowlMessage('DAYP_EXCEL_SUBMITTED_BASKET', params2);
      }
      this.notify.hideBlockUI();
      if (response && response.error_status) {
        this.messageService.showErrorGrowlMessage('ERR_DAYP_SUBMIT_STONE');
      }

    }, error => {
      this.notify.hideBlockUI();
      this.messageService.showErrorGrowlMessage('ERR_DAYP_SUBMIT_STONE');
    });
  }

  updateExcelStones(array, type, excelType) {
    const stoneIDs = this.stoneSvc.createStoneIdList(array);
    this.daypSvc.getDAYPStoneDetails(stoneIDs).subscribe(stoneResponse => {
      if (stoneResponse && stoneResponse.length > 0) {
        this.stoneSvc.storeStoneAdditionalInfo(stoneResponse).subscribe(res => {
          res = this.utilService.updateStonesForDecimal(res);
          res = this.daypSvc.fetchStonesComment(res);
          res.forEach(stone => {
            if (type === 'daypPriceInserted') {
              stone.final_submit = false;
            } else {
              stone.final_submit = true;
            }
            stone.dayp_rate = stone.dayp_per = stone.difference = null;
            array.forEach(item => {
              if (stone.stone_id === item.stone_id) {
                stone.dayp_rate = item.offerPrice;
                stone.dayp_per = item.offerPer;
                stone.difference = ((Number(stone.price_srk) - Number(stone.dayp_rate)) / Number(stone.price_srk)) * -100;
                stone.difference = this.daypSvc.roundNumber(stone.difference, 2);
              }
            });
          });
          stoneResponse = JSON.parse(JSON.stringify(stoneResponse));
          this.notify.hideBlockUI();
          const stoneIDList = this.stoneSvc.createStoneIdList(stoneResponse);
          if (type === 'daypSubmission') {
            stoneResponse =
              this.daypSvc.addDaypFinalSubmitFlag('daypSubmission', JSON.parse(JSON.stringify(stoneResponse)), stoneIDList);
            this.notify.notifyStoneStateUpdated({
              daypAction: 'daypSubmitted',
              stoneList: stoneIDList, stoneObj: stoneResponse, status: excelType
            });
          } else {
            setTimeout(() => {
              this.notify.notifyStoneStateUpdated({ daypAction: 'daypPriceInserted', stoneList: stoneIDList, stoneObj: stoneResponse, status: '' });
            }, 1000);
          }
        }, err => {
          this.notify.hideBlockUI();
        });
      } else {
        this.notify.hideBlockUI();
      }
    }, err => {
      this.messageService.showErrorGrowlMessage('DAYP_GET_EXCEL_STONES_FAIL');
      this.notify.hideBlockUI();
    });
  }

  cancelDaypExcel() {
    this.isFileUploaded = false;
  }

  handleTabViewChange(param) {
    this.location.replaceState('web/dayp/dayp-stones');
    const currentActiveTab = param;
    this.storeAuditData(currentActiveTab);
    if (param.hasOwnProperty('stoneName')) {
      this.currentTabSelected = param.stoneName;
      this.isStoneDetailsTabAdded = true;
    } else if (param.hasOwnProperty('pairId')) {
      this.currentTabSelected = param.pairId;
      this.isStoneDetailsTabAdded = true;
    } else {
      this.currentTabSelected = param.name;
      this.isStoneDetailsTabAdded = false;
    }
    const tabIndex = param.id;
    if (tabIndex === 1) {
      this.showPageSearch = true;
    } else {
      this.showPageSearch = false;
      this.utilService.resetPageSearchBoxStyle();
      this.notify.notifyTabChange({ index: tabIndex });
    }
    this.initDaypCount();
  }

  storeAuditData(selectedTab) {
    if (selectedTab && selectedTab.hasOwnProperty('name')) {
      if (selectedTab.name === 'DAYP_BASKET') {
        this.auditService.storeActivityAudit('DAYPBasket');
      } else if (selectedTab.name === 'DAYP_MY_SUBMISSIONS') {
        this.auditService.storeActivityAudit('DAYPSubmit');
      } else if (selectedTab.name === 'DAYP_SEARCH') {
        if (this.isDaypSearch) {
          this.auditService.storeActivityAudit('DAYPResult');
        } else {
          this.auditService.storeActivityAudit('DAYPSearch');
        }
      }
    }
  }
  /********************************* Packets **********************************/

  togglePacketIcon(e) {
    this.visiblePacketIcon = e.visible;
  }

  togglePacketOverlay(event) {
    this.showSelectedPacket = true;
    this.visiblePacketPopup = event.visible;
  }

  addToPacket(res) {
    this.showSelectedPacket = res.visible;
    this.stoneForPacket = JSON.parse(JSON.stringify(res.object));
    this.visiblePacketPopup = true;
  }

  updatePacketIcon(event) {
    this.notify.notifyBasketPacketUpdate(event);
  }

  createPacket() {
    this.packetCount++;
    this.notify.notifyPacketCount({ packetCount: this.packetCount });
  }

  showPacket() {
    this.notify.notifyShowPacketEvent({ showPackets: true });
  }

  downloadDaypStock() {
    this.downloadSvc.downloadAvailableDaypStock();
  }

  ngOnDestroy() {
    if (this.timeSubScription) {
      this.timeSubScription.unsubscribe();
    }
    if (this.daypExitObservable) {
      this.daypExitObservable.unsubscribe();
    }
    this.showPacketSubscription.unsubscribe();
    this.packetStoneSubscription.unsubscribe();
    this.stoneClickedForDetailViewSubscription.unsubscribe();
    this.searchSvc.removeSavedSearchConfiguration();
    this.searchSvc.resetSearchData();
    this.appStore.remove('daypPreSelectionDetails');
    this.appStore.remove('daypBasketDetails');
    this.appStore.remove('daypSearchDetails');
    this.appStore.remove('daypMySubmissionDetails');
    this.appStore.remove('daypBasketPageRef');
    this.appStore.remove('daypSubmissionPageRef');
    this.appStore.remove('daypSearchPageRef');
    this.appStore.remove('preDaypPageRef');
    this.appStore.remove('DAYP-Saved-Search');
  }

  canDeactivate(): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      const tab = _.findWhere(this.daypTabs, { name: 'DAYP_BASKET' });
      if (tab && tab !== null && tab.count > 0 && this.isDaypActive && !this.isLogoutEventOccur) {
        const params = { daypBasketStoneCount: tab.count };
        this.acceptLabel = this.customTranslateSvc.translateString('Leave Page');
        this.rejectLabel = this.customTranslateSvc.translateString("Don't Leave");
        const daypPopupHeader = this.customTranslateSvc.translateString('DAYP_POPUP_HEADER');
        const daypPopupMessage = this.customTranslateSvc.translateString('Attention! You have <b>') + '"' +
          this.customTranslateSvc.translateString('Offers Saved') + '"' +
          this.customTranslateSvc.translateString('</b> for <b>') + tab.count +
          this.customTranslateSvc.translateString('</b> Stones. You still want to leave the page or stay back!');
        this.confirmationService.confirm({
          message: daypPopupMessage,
          header: daypPopupHeader,
          accept: () => {
            observer.next(true);
            observer.complete();
            if (this.daypExitObservable) {
              this.daypExitObservable.unsubscribe();
            }
          },
          reject: () => {
            this.acceptLabel = this.customTranslateSvc.translateString('YES');
            this.rejectLabel = this.customTranslateSvc.translateString('No');
            observer.next(false);
            observer.complete();
          }
        });
      } else {
        if (this.daypExitObservable) {
          this.daypExitObservable.unsubscribe();
        }
        this.isLogoutEventOccur = false;
        observer.next(true);
        observer.complete();
      }
    });
  }

  showDaypLogoutPopup() {
    const tab = _.findWhere(this.daypTabs, { name: 'DAYP_BASKET' });
    if (tab && tab !== null && tab.count > 0 && this.isDaypActive) {
      const params = { daypBasketStoneCount: tab.count };
      this.acceptLabel = this.customTranslateSvc.translateString('Leave Page');
      this.rejectLabel = this.customTranslateSvc.translateString("Don't Leave");
      const daypPopupHeader = this.customTranslateSvc.translateString('DAYP_POPUP_HEADER');
      const daypPopupMessage = this.customTranslateSvc.translateString('Attention! You have <b>') + '"' +
        this.customTranslateSvc.translateString('Offers Saved') + '"' +
        this.customTranslateSvc.translateString('</b> for <b>') + tab.count +
        this.customTranslateSvc.translateString('</b> Stones. You still want to leave the page or stay back!');
      this.confirmationService.confirm({
        message: daypPopupMessage,
        header: daypPopupHeader,
        accept: () => {
          if (this.isLogoutEventOccur) {
            this.isLogoutEventOccur = false;
            this.notify.notifyUserChooseLogout({ status: true });
          } else {
            this.isLogoutEventOccur = false;
          }
        },
        reject: () => {
          this.acceptLabel = this.customTranslateSvc.translateString('YES');
          this.rejectLabel = this.customTranslateSvc.translateString('No');
          this.isLogoutEventOccur = false;
          this.notify.notifyUserChooseLogout({ status: false });
          this.currentTabSelected = 'DAYP_BASKET';
        }
      });
    } else {
      this.notify.notifyUserChooseLogout({ status: true });
    }
  }

  resizeDaypPanel() {
    // const maxHeightShouldBe = window.innerHeight * 60/100;
    // jQuery('#daypPanel').css('height', maxHeightShouldBe);
  }
}

