import { Component, OnInit, OnDestroy, ViewChild, AfterViewChecked } from '@angular/core';
import { EventDetailsService } from '@srk/core';
import { Router } from '@angular/router';
import { StoneDetailsService } from '@srk/shared';
import { NotifyService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { MessageService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { SearchService } from '@srk/core';
import { UtilService } from '@srk/shared';
declare var jQuery: any;
import { ApplicationAuditService } from '@srk/core';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('eventTabPanel') eventTabPanel;
  @ViewChild('bookAppointment') bookAppointment;
  @ViewChild('eventVenueDetails') eventVenueDetails;
  public eventName: any;
  public routerSubscription: any;
  public eventCode: any;
  public appointmentList = [];
  public messageDisplay: any;
  public noAppointmentAvailable: boolean;
  public showAppointmentOverlay = false;
  public eventPageTabs = [];
  public stoneClickedForDetailViewSubscription: any;
  public isStoneDetailsTabAdded = false;
  public isEventSearch: any;
  public isResultModified = false;
  public searchFilterConfig: any;
  public searchFiltersValue: any;
  public allStockStones: any;
  public currentTab: any;
  public packetSubscription: any;
  public showPacktBtn = false;
  public packetCount: any;
  public visiblePacketPopup = false;
  public stoneForPacket: any;
  public visiblePacketIcon = false;
  public showButtonBars = false;
  public eventTabCheckCallSubscription: any;
  public showSelectedPacket = true;
  public isPageSearch = false;
  public showPageSearch = false;
  public currentTabSelected: any;
  public lastCreatedTab: any;

  constructor(
    private eventDetailsService: EventDetailsService,
    private router: Router,
    private stoneDetailsService: StoneDetailsService,
    private appStore: ApplicationStorageService,
    private notify: NotifyService,
    private searchSvc: SearchService,
    private messageService: MessageService,
    private utilService: UtilService,
    private auditService: ApplicationAuditService) { }

  ngOnInit() {
    this.initializeEvents(this.router.url);
    this.stoneClickedForDetailViewSubscription = this.notify.notifyViewRequestPageStoneDetailTabActionObservable$
      .subscribe((res) => {
        if (res.data && res.type === 'stoneDtl') {
          this.addStoneDetailTab(res.data);
        } else if (res.data && res.type === 'twinStoneDtl') {
          this.addTwinStoneInfoTab(res.data, this.eventPageTabs);
        }
      });
    this.packetSubscription = this.notify.notifyShowPacketBtnOccuredObservable$.subscribe(res => {
      this.showPacktBtn = res.visible;
    });
    this.routerSubscription = this.router.events.subscribe((val: any) => {
      if (val.urlAfterRedirects === window.location.pathname) {
        this.initializeEvents(val.urlAfterRedirects);
      }
    });
  }

  ngAfterViewChecked() {
    this.utilService.setSearchTabWidth();
  }

  scrollTabPanelRight() {
    this.utilService.scrollTabPanelRight();
  }

  scrollTabPanelLeft() {
    this.utilService.scrollTabPanelLeft();
  }

  initializeEvents(url) {
    jQuery('html, body').animate({ scrollTop: 0 }, 'slow');
    const eventList = this.eventDetailsService.getEventInfo();
    const currentEventPage = url.substr(url.lastIndexOf('/') + 1);
    eventList.forEach(element => {
      if (currentEventPage === element.country_code) {
        this.resetEventDetails();
        this.eventName = element.country_code + ' Event';
        this.eventCode = element.event_id;
        this.initializeEventDetails();
      }
    });
  }

  getTabIndex(param) {
    if (param) {
      if (param.id === 2) {
        this.showPageSearch = true;
      } else {
        this.showPageSearch = false;
        this.utilService.resetPageSearchBoxStyle();
      }
      if (param && param.hasOwnProperty('name')) {
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
      if (param.hasOwnProperty('name') && param.name === 'SHOW_STOCK') {
        if (this.isEventSearch) {
          this.auditService.storeActivityAudit('ShowResult');
        } else {
          this.auditService.storeActivityAudit('ShowSearch');
        }
      }
      if (param.name !== 'EVENT_DETAILS') {
        this.showButtonBars = true;
      } else {
        this.showButtonBars = false;
      }
      if (param.name === 'MY_APPOINTMENTS') {
        jQuery('html, body').animate({ scrollTop: this.appStore.getData('pageScrollMyAppt') }, 'slow');
      }
    }
    if (this.eventVenueDetails && this.currentTabSelected === 'EVENT_DETAILS') {
      this.eventVenueDetails.resetAppointment();
      this.eventVenueDetails.getEventHighlights();
    }
  }

  initializeEventDetails() {
    this.showButtonBars = false;
    this.eventPageTabs = [
      { name: 'EVENT_DETAILS', id: 1 },
      { name: 'MY_APPOINTMENTS', id: 3 },
      // { name: 'RECOMMENDED', id: 4 }
    ];
    this.appointmentList = [];
    this.currentTabSelected = 'EVENT_DETAILS';
    this.isSelectedStoneTabAvailable();
  }

  toggleAppointmentOverlay() {
    this.showAppointmentOverlay = true;
    this.bookAppointment.initializeAppointment();
  }

  resetBookAppointment() {
    this.bookAppointment.initializeAppointment();
  }

  closeAppointmentOveraly(e) {
    this.showAppointmentOverlay = e.status;
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
    this.eventPageTabs.forEach((element) => {
      if (element.stoneName === data.stone_id) {
        const i = this.eventPageTabs.indexOf(element);
        this.eventPageTabs.splice(i, 1);
      }
    });
    this.eventPageTabs.push({
      stoneName: data.stone_id,
      stoneInfo: data
    });
    this.lastCreatedTab = data.stone_id;
    this.isStoneDetailsTabAdded = true;
  }

  removeDetailedPacketTab(tabName) {
    this.eventPageTabs.forEach((element, index) => {
      let flag = 0;
      if (element.stoneName === tabName) {
        const i = this.eventPageTabs.indexOf(element);
        this.eventPageTabs.splice(i, 1);
        flag++;
      } else if (element.pairId === tabName) {
        const i = this.eventPageTabs.indexOf(element);
        this.eventPageTabs.splice(i, 1);
        flag++;
      }
      if (flag > 0) {
        if (this.eventPageTabs[index - 1] && this.eventPageTabs[index - 1].hasOwnProperty('name')) {
          this.currentTabSelected = this.eventPageTabs[index - 1].name;
        } else if (this.eventPageTabs[index - 1] && this.eventPageTabs[index - 1].hasOwnProperty('stoneName')) {
          this.currentTabSelected = this.eventPageTabs[index - 1].stoneName;
        } else if (this.eventPageTabs[index - 1] && this.eventPageTabs[index - 1].hasOwnProperty('pairId')) {
          this.currentTabSelected = this.eventPageTabs[index - 1].pairId;
        } else {
          this.currentTabSelected = this.eventPageTabs[0].name;
        }
      }
    });
  }

  modifySearch(event) {
    this.isEventSearch = event.modify;
    this.isResultModified = true;
    this.isPageSearch = false;
    this.appStore.store('isModify', this.isResultModified);
  }

  cancelModifySearch(event, data) {
    this.isEventSearch = true;
    this.isResultModified = false;
    this.appStore.store('isModify', this.isResultModified);
  }

  getEventSearchResult(event) {
    const flag = this.searchSvc.isCaratSelected();
    this.searchFilterConfig = event.config;
    this.searchFiltersValue = this.searchSvc.getSelectedFiltersValue();
    if (flag && event.config) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.searchSvc.specificSearch(event.config, 'EVENT_SEARCH', this.eventCode, event.order_details).subscribe(response => {
        if (response !== undefined) {
          this.notify.hideBlockUI();
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
        this.createEventSearchStoneObject(response.data.body);
        this.isResultModified = false;
        this.appStore.store('isModify', this.isResultModified);
      }
      this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
    } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes._OVER_LIMIT)) {
      if (response.data.body.length > 0) {
        this.createEventSearchStoneObject(response.data.body);
        this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
      } else {
        this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
      }
    } else if (response.code === 'ELS#200') {
      if (response.data.body.length > 0) {
        this.createEventSearchStoneObject(response.data.body);
      } else {
        this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
      }
    }
  }

  createEventSearchStoneObject(array) {
    this.isEventSearch = true;
    this.allStockStones = Object.assign([], array);
  }

  isSelectedStoneTabAvailable() {
    const tabRequested = this.eventDetailsService.getTabWhichToBeOpen() || '';
    this.eventTabCheckCallSubscription = this.eventDetailsService.checkPreEventSelectionPermission().subscribe(res => {
      if (!res.error_status) {
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_SEL_PFS_200)) {
          if (res.hasOwnProperty('data')) {
            res.data.forEach(element => {
              if (this.eventCode === element.event_id) {
                this.eventDetailsService.setBooleanForRemoveButton(element);
                if (element.tab_allowed > 0) {
                  this.eventPageTabs.push({ name: element.tab_name, id: 0 });
                  if (tabRequested === 'pre-selection') {
                    this.currentTabSelected = element.tab_name;
                  }
                }
                if (element.show_stock_tab_allowed > 0) {
                  this.eventPageTabs.push({ name: 'SHOW_STOCK', id: 2 });
                  if (tabRequested === 'show-stock') {
                    this.currentTabSelected = 'SHOW_STOCK';
                  }
                }
                this.eventDetailsService.setTabToBeOpen('');
                this.eventPageTabs = this.eventDetailsService.reorderEventDetails(this.eventPageTabs, 'id');
              }
            });
          }
        }
      }
    }, error => { });
  }

  togglePacketIcon(e) {
    this.visiblePacketIcon = e.visible;
  }

  togglePacketOverlay(event) {
    this.showSelectedPacket = true;
    this.visiblePacketPopup = event.visible;
  }

  addToPacket(res) {
    this.stoneForPacket = [res.object];
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

  stoneFromSelectedStone(event) {
    this.showSelectedPacket = event.visible;
    this.stoneForPacket = event.object;
    this.visiblePacketPopup = true;
  }

  resetEventDetails() {
    this.appStore.remove('mySelectionStockArray');
    this.appStore.remove('my-appointment-selected-stone-panel');
    this.appStore.remove('myAppointmentArray');
    this.appStore.remove('allStockStoneObjectArray');
    this.appStore.remove('pageScrollMyAppt');
    this.searchSvc.resetSearchData();
    if (this.stoneClickedForDetailViewSubscription) {
      this.stoneClickedForDetailViewSubscription.unsubscribe();
    }
    if (this.packetSubscription) {
      this.packetSubscription.unsubscribe();
    }
    if (this.eventTabCheckCallSubscription) {
      this.eventTabCheckCallSubscription.unsubscribe();
    }
  }

  getPageSearchResult(event) {
    if (event.isResult) {
      this.isPageSearch = true;
      this.searchFilterConfig = {};
      this.searchFiltersValue = {};
      this.handleSearchResult(this.searchSvc.getSearchResultData());
    } else {
      this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
    }
  }

  resetSearchConfig(event){
    this.searchFilterConfig = event.config;
    this.searchFiltersValue = event.searchFilters;
  }

  ngOnDestroy() {
    this.resetEventDetails();
    this.routerSubscription.unsubscribe();
    this.appStore.remove('isModify');
  }
}
