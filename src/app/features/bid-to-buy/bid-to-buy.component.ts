import { Component, OnInit, OnDestroy, ViewChild, AfterViewChecked } from '@angular/core';
import { BidToBuyService } from '@srk/shared';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { Observable, Observer } from 'rxjs/Rx';
import { NotifyService } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';
import { ApplicationStorageService } from '@srk/core';
import { SearchService } from '@srk/core';
import { MessageService, UserProfileService } from '@srk/core';
import { UtilService } from '@srk/shared';
import { ApplicationAuditService, SessionStorageService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import { ConfirmationService } from 'primeng/components/common/api';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'underscore';
@Component({
  selector: 'app-bid-to-buy',
  templateUrl: './bid-to-buy.component.html',
  // styleUrls: ['./bid-to-buy.component.scss']
})
export class BidToBuyComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('btbPanel') btbPanel;
  @ViewChild('btbAllStonesComponent') btbAllStonesComponent;
  public btbTabs: any[] = [];
  public btbTimer: any;
  public btbAllStones: any[];
  public btbHourTime: any;
  public btbMinuteTime: any;
  public btbSecondTime: any;
  public btbStartDate: any;
  public btbEndDate: any;
  public btbDay: any;
  public btbRemainingTime: any;
  public btbMessage;
  public isBTBActive = false;
  public stoneClickedForDetailViewSubscription: any;
  public currentTab: any;
  public isStoneDetailsTabAdded = false;
  public stoneForPacket: any;
  public visiblePacketPopup = false;
  public packetCount: any;
  public visiblePacketIcon = false;
  public packetSubscription: any;
  private showPacketSubscription: Subscription;
  public showPacktBtn = false;
  public showSelectedPacket = false;
  public btbActualStartTime: any;
  public btbActualEndTime: any;
  public isBtbTable = false;
  public isResultModified = false;
  public searchFilterConfig: any;
  public searchFiltersValue: any;
  public btbSearchStones: any[];
  public b2bSubscription: any;
  public isPageSearch = false;
  public nonEditable: boolean;
  public displayResult: boolean;
  public showPageSearch = true;
  public currentTabSelected: any;
  public lastCreatedTab: any;
  public display: boolean;
  public acceptLabel = 'Yes';
  public rejectLabel = 'No';
  public isLogoutEventOccur = false;
  public btbExitObservable: any;
  public isBtbAvailable = 0;
  public btbSearchEventObject: any;
  public isBtbValueChange: boolean = true;
  public packetStoneArray: any;
  public isClearStoneID: boolean = false;
  public isB2bRequestedFromPacket = false;
  constructor(
    private userProfileService: UserProfileService,
    private btbService: BidToBuyService,
    private notify: NotifyService,
    private stoneDetailsService: StoneDetailsService,
    private appStore: ApplicationStorageService,
    private customTranslateSvc: CustomTranslateService,
    private messageService: MessageService,
    private searchSvc: SearchService,
    private utilService: UtilService,
    private confirmationService: ConfirmationService,
    private auditService: ApplicationAuditService,
    public sessionStorageService: SessionStorageService,
    private router: Router,
    private location: Location,
    private translateService: TranslateService) { }

  ngOnInit() {
    this.searchSvc.getBtbVersionList().subscribe(res => {
      if (res && res.code && MessageCodesComparator.AreEqual(res.code, MessageCodes.B2B_GET_VERSION_200)) {
        this.isBtbAvailable = 1;
      } else {
        this.isBtbAvailable = 2;
      }
    }, err => { });
    this.initBtbCount();
    this.stoneClickedForDetailViewSubscription = this.notify.notifyViewRequestPageStoneDetailTabActionObservable$
      .subscribe((res) => {
        this.currentTab = this.btbPanel.selectedIndex;
        if (res.data && res.type === 'stoneDtl') {
          this.addStoneDetailTab(res.data);
        } else if (res.data && res.type === 'twinStoneDtl') {
          this.addTwinStoneInfoTab(res.data, this.btbTabs);
        }
      });
    this.btbTabs = [
      { name: 'BTB_DIAMOND_LIST', id: 0, count: -1 },
      { name: 'B2B_BASKET', id: 1, count: -1 },
      { name: 'MY_SUBMISSIONS', id: 2, count: -1 },
      { name: 'B2B_RESULT', id: 3, count: -1 }
    ];
    this.initializeActiveB2bTab();
    this.showPacketSubscription = this.notify.notifyShowPacketBtnOccuredObservable$.subscribe(res => {
      this.showPacktBtn = res.visible;
    });
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.packetStoneArray = res;
    });
    this.b2bSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      if (res.hasOwnProperty('b2bAction') || res.source === 'b2bRequested') {
        this.initBtbCount();
        if (res.source === 'b2bRequested') {
          if (this.appStore.getData('btbAllStockEntry')) {
            this.isB2bRequestedFromPacket = true;
            this.initBtbAllStones(this.appStore.getData('btbAllStockEntry').table);
          }
        }
      }
    });
    this.btbExitObservable = this.notify.notifyDaypBtbPageonLogoutObservable$.subscribe(res => {
      if (res.status === 1) {
        this.isLogoutEventOccur = true;
        this.showBtbLogoutPopup();
      } else if (res.status === 2) {
        this.isLogoutEventOccur = true;
      }
    });
    this.initializeBtbTab();

    const gridStateKey = this.appStore.getData('gridStateName') || [];
    const gridStateObject: any = {};
    gridStateObject.iconLegendExpanded = 0;
    gridStateKey.forEach(element => {
      this.sessionStorageService.setDataInSessionStorage(element, JSON.stringify(gridStateObject))
        .then(result => {
        })
        .catch(error => {

          console.error('Failed to save data to storage.');
          console.error(error);

        });
    });
  }

  initializeActiveB2bTab() {
    const url = this.location.path();
    if (url && (typeof url === 'string')) {
      const page = url.substring(url.lastIndexOf('=') + 1);
      switch (page) {
        case 'search': this.currentTabSelected = 'BTB_DIAMOND_LIST';
          break;
        case 'basket':
          this.currentTabSelected = 'B2B_BASKET';
          this.showPageSearch = false;
          break;
        default: this.currentTabSelected = 'BTB_DIAMOND_LIST';
          break;
      }
    }
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

  initializeBtbTab() {
    if (this.appStore.getData('B2B-Saved-Search')) {
      const savedSearchData = this.appStore.getData('B2B-Saved-Search');
      this.searchFilterConfig = savedSearchData.searchConfig;
      this.searchFiltersValue = savedSearchData.selectedSearchValue;
      this.createBtbSearchObject(savedSearchData.result.data.body);
    }
  }


  addTwinStoneInfoTab(pairId, tabs) {
    this.stoneDetailsService.getStoneDetailsByPairId(pairId).subscribe(resPairStones => {
      if (resPairStones && resPairStones.length === 2) {
        this.stoneDetailsService.addTwinStoneInfoTab(resPairStones, tabs);
        this.lastCreatedTab = pairId;
        this.isStoneDetailsTabAdded = true;
      }
    });
  }

  addStoneDetailTab(data) {
    this.btbTabs.forEach((element) => {
      if (element.stoneName === data.stone_id) {
        const i = this.btbTabs.indexOf(element);
        this.btbTabs.splice(i, 1);
      }
    });
    this.btbTabs.push({
      stoneName: data.stone_id,
      stoneInfo: data,
      CurrentSelectedTab: data.CurrentSelectedTab
    });
    this.lastCreatedTab = data.stone_id;
    this.isStoneDetailsTabAdded = true;
  }

  removeDetailedPacketTab(tabName) {
    this.btbTabs.forEach((element, index) => {
      let flag = 0;
      if (element.stoneName === tabName) {
        const i = this.btbTabs.indexOf(element);
        this.btbTabs.splice(i, 1);
        flag++;
      } else if (element.pairId === tabName) {
        const i = this.btbTabs.indexOf(element);
        this.btbTabs.splice(i, 1);
        flag++;
      }
      if (flag > 0) {
        if (this.btbTabs[index - 1] && this.btbTabs[index - 1].hasOwnProperty('name')) {
          this.currentTabSelected = this.btbTabs[index - 1].name;
        } else if (this.btbTabs[index - 1] && this.btbTabs[index - 1].hasOwnProperty('stoneName')) {
          this.currentTabSelected = this.btbTabs[index - 1].stoneName;
        } else if (this.btbTabs[index - 1] && this.btbTabs[index - 1].hasOwnProperty('pairId')) {
          this.currentTabSelected = this.btbTabs[index - 1].pairId;
        } else {
          this.currentTabSelected = this.btbTabs[0].name;
        }
      }
      if (element.CurrentSelectedTab === 'btbAllStone') {
        this.currentTabSelected = 'BTB_DIAMOND_LIST';
      } else if (element.CurrentSelectedTab === 'btbBasket') {
        this.currentTabSelected = 'B2B_BASKET';
      } else if (element.CurrentSelectedTab === 'btbSubmmit') {
        this.currentTabSelected = 'MY_SUBMISSIONS';
      } else if (element.CurrentSelectedTab === 'btbResult') {
        this.currentTabSelected = 'B2B_RESULT';
      }
    });
  }

  getSelectedTabName(param) {
    this.location.replaceState('web/bid-to-buy');
    if (param && param.hasOwnProperty('name')) {
      if (param.name === 'MY_SUBMISSIONS') {
        this.auditService.storeActivityAudit('BTBFinalSubmit');
      } else if (param.name === 'B2B_BASKET') {
        this.auditService.storeActivityAudit('BTBBasket');
      } else if (param.name === 'BTB_DIAMOND_LIST') {
        this.auditService.storeActivityAudit('BTBSearch');
        var ismodifyClick = this.appStore.getData('isBtbModify');
        if (this.isBtbValueChange && ismodifyClick) {
          if (this.appStore.getData('btbAllStockEntry')) {
            const array = this.appStore.getData('btbAllStockEntry')
            this.initBtbAllStones(array.table);
            // this.fetchB2bSearchResult(this.btbSearchEventObject);
          }
        }

      } else if (param.name === 'B2B_RESULT') {
        this.auditService.storeActivityAudit('BTBResult');
      }
      this.currentTabSelected = param.name;
    } else if (param.hasOwnProperty('stoneName')) {
      this.currentTabSelected = param.stoneName;
      this.isStoneDetailsTabAdded = true;
    } else if (param.hasOwnProperty('pairId')) {
      this.currentTabSelected = param.pairId;
      this.isStoneDetailsTabAdded = true;
    } else {
      this.isStoneDetailsTabAdded = false;
    }
    if (this.btbPanel && this.currentTabSelected === 'BTB_DIAMOND_LIST') {
      this.showPageSearch = true;
    } else {
      this.showPageSearch = false;
      this.utilService.resetPageSearchBoxStyle();
    }
  }

  resetSearchConfig(event) {
    this.searchFilterConfig = event.config;
    this.searchFiltersValue = event.searchFilters;
    this.isClearStoneID = true;
  }

  changeActiveTab(e) {
    if (e.itemData && e.itemData.name === 'BTB_DIAMOND_LIST') {
      this.auditService.storeActivityAudit('BTBSearch');
    }
    if (this.btbPanel && this.isStoneDetailsTabAdded) {
      this.btbPanel.selectedIndex = this.btbTabs.length - 1;
      this.isStoneDetailsTabAdded = false;
    }
  }

  togglePacketIcon(e) {
    this.visiblePacketIcon = e.visible;
  }

  togglePacketOverlay(event) {
    this.showSelectedPacket = true;
    this.visiblePacketPopup = event.visible;
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

  stoneFromSelectedStone(event) {
    this.showSelectedPacket = event.visible;
    this.stoneForPacket = event.object;
    this.visiblePacketPopup = true;
  }

  getBtbSearchResult(event) {
    const flag = this.searchSvc.isCaratSelected();
    this.searchFilterConfig = event.config;
    this.searchFiltersValue = this.searchSvc.getSelectedFiltersValue();
    if (flag && event.config) {
      this.btbSearchEventObject = event;
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.fetchB2bSearchResult(event);
    } else {
      if (!flag) {
        this.messageService.showErrorGrowlMessage('SELECT_CARAT');
      } else {
        this.messageService.showErrorGrowlMessage('ERR_SELECT_SEARCH_FILTER');
      }
    }
  }

  fetchB2bSearchResult(event) {
    this.searchSvc.specificSearch(event.config, 'B2B_SEARCH', 0, event.order_details).subscribe(response => {
      if (response !== undefined && response.data.body && response.data.body.length > 0) {
        this.handleSearchResult(response);
      } else {
        this.isBtbTable = false;
      }
    }, error => {
      this.notify.hideBlockUI();
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  handleSearchResult(response) {
    if (MessageCodesComparator.AreEqual(response.code, MessageCodes._LIMIT_EXCEED)) {
      if (response.data.body.length > 0) {
        this.createBtbSearchObject(response.data.body);
        this.isResultModified = false;
        this.appStore.store('isModify', this.isResultModified);
      }
      this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
    } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes._OVER_LIMIT)) {
      if (response.data.body.length > 0) {
        this.createBtbSearchObject(response.data.body);
        this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
      } else {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
      }
    } else if (response.code === 'ELS#200') {
      if (response.data.body.length > 0) {
        this.createBtbSearchObject(response.data.body);
      } else {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
      }
    }
  }

  createBtbSearchObject(array) {
    this.initBtbAllStones(array);
  }

  modifySearch(event) {
    this.isBtbTable = event.modify;
    this.isResultModified = true;
    this.isPageSearch = false;
    this.appStore.store('isModify', this.isResultModified);
  }

  cancelModifySearch(event, data) {
    this.isBtbTable = true;
    this.isResultModified = false;
    this.appStore.store('isModify', this.isResultModified);
  }

  initBtbAllStones(searchResult) {
    const stoneList = this.stoneDetailsService.createStoneIdList(searchResult);
    this.btbService.getBtbStoneInfo(stoneList).subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_B2B_ES_DF_200)) {
        let btbSearchedData = [];
        if (res.hasOwnProperty('data')) {
          btbSearchedData = res.data;
        }
        this.createAllSearchBtbEntry(btbSearchedData, searchResult);
      } else {
        this.isBtbTable = false;
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
      }
    }, error => {
      this.isBtbTable = false;
      this.notify.hideBlockUI();
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  createAllSearchBtbEntry(btbList, searchList) {
    this.btbSearchStones = [];
    this.btbSearchStones = JSON.parse(JSON.stringify(searchList));
    this.btbSearchStones.forEach(stoneObj => {
      const stoneId = stoneObj.stone_id;
      if (btbList.hasOwnProperty(stoneId)) {
        stoneObj['bid_rate'] = btbList[stoneId].bid_rate;
        stoneObj['bid_percentage'] = btbList[stoneId].bid_percentage;
        stoneObj['final_submit'] = btbList[stoneId].final_submit;
        stoneObj['difference'] = btbList[stoneId].difference;
        stoneObj['is_btb_running'] = btbList[stoneId].is_btb_running;
        stoneObj['is_disp_after'] = btbList[stoneId].is_disp_after;
      } else {
        stoneObj['bid_rate'] = stoneObj['bid_percentage'] = null;
        stoneObj['final_submit'] = false;
        stoneObj['difference'] = null;
      }
    });
    this.notify.hideBlockUI();
    this.isBtbTable = true;
    if (this.isB2bRequestedFromPacket) {
      if (this.btbAllStonesComponent && this.btbAllStonesComponent.btbAllStonesEntry) {
        let btbData = { ...this.btbAllStonesComponent.btbAllStonesEntry };
        const selectedStones = btbData['selectedStones'];
        btbData['table'] = JSON.parse(JSON.stringify(this.btbSearchStones));
        btbData['table'] = this.utilService.updateStonesForDecimal(btbData.table);
        btbData['selectedStones'] = JSON.parse(JSON.stringify(selectedStones));
        btbData = this.btbService.fetchSelectedStones(btbData);
        btbData = JSON.parse(JSON.stringify(btbData));
        btbData['totalOfferAmt'] = this.btbService.calculateOfferAmount(btbData);
        this.appStore.store('btbAllStockEntry', btbData);
        this.visiblePacketIcon = this.visiblePacketIcon; // This is done to executed Push event to component
      }
      this.isB2bRequestedFromPacket = false;
    } else if (this.btbAllStonesComponent && this.btbAllStonesComponent.btbAllStonesEntry) {
      const selectedStones = this.btbAllStonesComponent.btbAllStonesEntry['selectedStones'];
      this.btbAllStonesComponent.btbAllStonesEntry['table'] = JSON.parse(JSON.stringify(this.btbSearchStones));
      this.btbAllStonesComponent.btbAllStonesEntry['table'] = this.utilService.updateStonesForDecimal(this.btbAllStonesComponent.btbAllStonesEntry.table);
      this.btbAllStonesComponent.btbAllStonesEntry['selectedStones'] = JSON.parse(JSON.stringify(selectedStones));
      this.btbAllStonesComponent.btbAllStonesEntry = this.btbService.fetchSelectedStones(this.btbAllStonesComponent.btbAllStonesEntry);
      this.btbAllStonesComponent.btbAllStonesEntry = JSON.parse(JSON.stringify(this.btbAllStonesComponent.btbAllStonesEntry));
      this.btbAllStonesComponent.btbAllStonesEntry['totalOfferAmt'] = this.btbService.calculateOfferAmount(this.btbAllStonesComponent.btbAllStonesEntry);
      this.appStore.store('btbAllStockEntry', this.btbAllStonesComponent.btbAllStonesEntry);
    }
    this.storeTabValue('BTB_DIAMOND_LIST', this.btbSearchStones.length);
  }

  initBtbCount() {
    this.btbService.fetchBtbCount().subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.B2B_SCS_200)) {
        if (res.hasOwnProperty('data')) {
          this.storeTabValue('B2B_BASKET', res.data.basket_stone_count);
          this.storeTabValue('MY_SUBMISSIONS', res.data.submitted_stone_count);
        }
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  storeTabValue(tabName, count) {
    this.btbTabs.forEach(tab => {
      if (tabName === tab.name) {
        tab.count = count;
      }
    });
  }

  getPageSearchResult(event) {
    if (event.isResult) {
      this.isPageSearch = true;
      this.btbPanel.selectedIndex = 0;
      this.searchFilterConfig = {};
      this.searchFiltersValue = {};
      this.handleSearchResult(this.searchSvc.getSearchResultData());
    } else {
      this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
    }
  }

  ngOnDestroy() {
    if (this.stoneClickedForDetailViewSubscription) {
      this.stoneClickedForDetailViewSubscription.unsubscribe();
    }
    if (this.packetSubscription) {
      this.packetSubscription.unsubscribe();
    }
    this.showPacketSubscription.unsubscribe();
    if (this.b2bSubscription) {
      this.b2bSubscription.unsubscribe();
    }
    if (this.btbExitObservable) {
      this.btbExitObservable.unsubscribe();
    }
    this.appStore.remove('btbSubmission');
    this.appStore.remove('btbBasketEntry');
    this.appStore.remove('btbAllStockEntry');
    this.appStore.remove('btbResultEntry');
    this.appStore.remove('B2B-Saved-Search');
    this.searchSvc.resetSearchData();
    this.appStore.remove('editableSubmission');
    this.appStore.remove('editableSubmissionArray');
    this.appStore.remove('originalBtbSubmission');
  }

  canDeactivate(): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      if (this.btbTabs[1].count > 0 && !this.isLogoutEventOccur) {
        const params = { b2bBasketStoneCount: this.btbTabs[1].count };
        this.acceptLabel = this.customTranslateSvc.translateString('Leave Page');
        this.rejectLabel = this.customTranslateSvc.translateString("Don't Leave");
        const b2bPopupHeader = this.customTranslateSvc.translateString('B2B_POPUP_HEADER');
        const b2bPopupMessage = this.customTranslateSvc.translateString('Attention! You have <b>') + '"' +
          this.customTranslateSvc.translateString('Offers Saved') + '"' +
          this.customTranslateSvc.translateString('</b> for <b>') + this.btbTabs[1].count +
          this.customTranslateSvc.translateString('</b> Stones. You still want to leave the page or stay back!');
        this.confirmationService.confirm({
          message: b2bPopupMessage,
          header: b2bPopupHeader,
          accept: () => {
            observer.next(true);
            observer.complete();
            if (this.btbExitObservable) {
              this.btbExitObservable.unsubscribe();
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
        if (this.btbExitObservable) {
          this.btbExitObservable.unsubscribe();
        }
        this.isLogoutEventOccur = false;
        observer.next(true);
        observer.complete();
      }
    });
  }

  showBtbLogoutPopup() {
    if (this.btbTabs[1].count > 0) {
      const params = { b2bBasketStoneCount: this.btbTabs[1].count };
      this.acceptLabel = this.customTranslateSvc.translateString('Leave Page');
      this.rejectLabel = this.customTranslateSvc.translateString("Don't Leave");
      const b2bPopupHeader = this.customTranslateSvc.translateString('B2B_POPUP_HEADER');
      const b2bPopupMessage = this.customTranslateSvc.translateString('Attention! You have <b>') + '"' +
        this.customTranslateSvc.translateString('Offers Saved') + '"' +
        this.customTranslateSvc.translateString('</b> for <b>') + this.btbTabs[1].count +
        this.customTranslateSvc.translateString('</b> Stones. You still want to leave the page or stay back!');
      this.confirmationService.confirm({
        message: b2bPopupMessage,
        header: b2bPopupHeader,
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
          this.currentTabSelected = 'B2B_BASKET';
        }
      });
    } else {
      this.notify.notifyUserChooseLogout({ status: true });
    }
  }
}
