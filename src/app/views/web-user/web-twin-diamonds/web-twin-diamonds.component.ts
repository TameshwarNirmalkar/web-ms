import { Component, OnInit, OnDestroy, ViewChild , ChangeDetectorRef  } from '@angular/core';
import { Router } from '@angular/router';
import { NotifyService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';
import { ApplicationStorageService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import { MessageService } from '@srk/core';
import { SearchType, SearchTypeComparator } from '@srk/core';
import { SearchService } from '@srk/core';
@Component({
  selector: 'app-web-twin-diamonds',
  templateUrl: './web-twin-diamonds.component.html',
  styleUrls: ['./web-twin-diamonds.component.scss']
})
export class WebTwinDiamondsComponent implements OnInit, OnDestroy {

  @ViewChild('resultTab') resultTab;

  private subscription: Subscription;
  private routeSubscription: Subscription;
  private packetSubscription: Subscription;
  public displaySearchPage = true;
  public specificSearch = false;
  public twinSearch = false;
  public savedSearch = false;
  public searchResult = false;
  public newSearch = false;
  public searchTabs: any;
  public currentTabSelected: any;
  public apiTabs: any;
  public packetCount = 0;
  public showCreatePacketBtn = false;
  public showPacktBtn = false;

  constructor(
    private router: Router,
    private notify: NotifyService,
    private appStore: ApplicationStorageService,
    public messageSvc: MessageService,
    private customTranslateSvc: CustomTranslateService,
    private searchSvc: SearchService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.initializePage();
    this.subscription = this.notify.notifySearchOccuredObservable$.subscribe(res => {
      this.navigateChange();
    });

    this.packetSubscription = this.notify.notifyShowPacketBtnOccuredObservable$.subscribe(res => {
      this.showPacktBtn = res.visible;
    });

    this.routeSubscription = this.router.events.subscribe((val: any) => {
      if (val.url === '/web/twin-diamonds' || val.url === '/web/twin-diamonds/twin-diamonds-search') {
        this.initializePage();
      }
    });
    this.cdr.detectChanges();
  }

  initPageTabs() {
    this.searchTabs = [
      { text: 'Twin Diamond Search' },
      { text: 'Recommended Twin Diamonds' },
      { text: 'You May Like' },
      { text: 'Your Marked As Twin' }
    ];
    this.searchTabs = this.customTranslateSvc.translateColumns('text', this.searchTabs);
  }

  initializePage() {
    if (this.appStore.getData('TWIN_DIAMOND_SEARCH:count')) {
      this.isNavigateSearchResult();
    } else {
      this.initPageTabs();
      this.initActiveTab(this.router.url);
    }
  }

  initActiveTab(url) {
    if (url && (typeof url === 'string')) {
      const page = url.substring(url.lastIndexOf('/') + 1);
      if (page === 'twin-diamonds-search') {
        this.initializeSearchTabs();
      }
      this.currentPageTab(page);
    }
    jQuery('#routeBox').removeClass('stuck');
  }

  initializeSearchTabs() {
    this.showPacktBtn = false;
    this.showCreatePacketBtn = false;
    this.displaySearchPage = true;
  }

  currentPageTab(page) {
    switch (page) {
      case 'twin-diamonds-search':
        this.currentTabSelected = 0;
        break;
      case 'recommended-twin-diamonds':
        this.currentTabSelected = 1;
        break;
      case 'you-may-like-twin-diamonds':
        this.currentTabSelected = 2;
        break;
      case 'your-marked-as-twin-diamonds':
        this.currentTabSelected = 3;
        break;
    }
  }

  navigateChange() {
    const link = ['/web/twin-diamonds/twin-diamonds-result'];
    this.setTabPanel();
    this.router.navigate(link);
  }

  setTabPanel() {
    this.displaySearchPage = false;
    this.showCreatePacketBtn = true;
    if (this.resultTab !== undefined) {
      this.resultTab.selectedIndex = 0;
    }
  }

  handleSearchTabs(index) {
    let link;
    switch (index) {
      case 0:
        link = ['/web/twin-diamonds/twin-diamonds-search'];
        break;
      case 1:
        link = ['/web/twin-diamonds/recommended-twin-diamonds'];
        break;
      case 2:
        link = ['/web/twin-diamonds/you-may-like-twin-diamonds'];
        break;
      case 3:
        link = ['/web/twin-diamonds/your-marked-as-twin-diamonds'];
        break;
    }
    this.router.navigate(link);
  }

  handleResultTabs(index) {
    let link;
    switch (index) {
      case 0:
        link = ['/web/twin-diamonds/twin-diamonds-result'];
        this.showCreatePacketBtn = true;
        break;
      case 1:
        link = ['/web/twin-diamonds/new-search'];
        this.showCreatePacketBtn = false;
        this.showPacktBtn = false;
        break;
      case 2:
        link = ['/web/twin-diamonds/modify-search'];
        this.showCreatePacketBtn = false;
        this.showPacktBtn = false;
        break;
    }
    this.router.navigate(link);
  }

  isNavigateSearchResult() {
    if (this.appStore.getData('TWIN_DIAMOND_SEARCH:count') > 0) {
      this.navigateChange();
    }
  }

  createPacket() {
    this.packetCount++;
    this.notify.notifyPacketCount({ packetCount: this.packetCount });
  }

  showPacket() {
    this.notify.notifyShowPacketEvent({ showPackets: true });
  }

  getSearchResult(event) {
    if (event.isResult) {
      let count: number = this.appStore.getData('TWIN_DIAMOND_SEARCH:count');
      if (count === undefined) {
        count = 0;
      }
      count++;
      this.appStore.remove('TWIN_DIAMOND_SEARCH:count');
      this.appStore.store('TWIN_DIAMOND_SEARCH:count', count);
      let url = window.location.href;
      url = url.split('#').pop().split('?').pop();
      const page = url.substring(url.lastIndexOf('/') + 1);
      if (page === 'twin-diamonds-result') {
        this.notify.notifyGlobalSearch({ isGlobalSearch: true, type: SearchType.TWIN_DIAMOND_SEARCH });
      } else {
        const link = ['/web/twin-diamonds/twin-diamonds-result'];
        this.router.navigate(link);
      }
      this.navigateChange();
    } else {
      this.messageSvc.showErrorGrowlMessage('NO_DATA_FOUND');
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.packetSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
    this.appStore.remove('packetList');
    this.searchSvc.resetSearchData();
    jQuery('#fixedPanel').removeClass('stuck');
  }
}
