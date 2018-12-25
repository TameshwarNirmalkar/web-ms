import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef  } from '@angular/core';
import { Router } from '@angular/router';
import { NotifyService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';
import { ApplicationStorageService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import { SearchService } from '@srk/core';
@Component({
  selector: 'app-web-search',
  templateUrl: './web-search.component.html',
  styleUrls: ['./web-search.component.scss']
})
export class WebSearchComponent implements OnInit, OnDestroy {
  @ViewChild('resultTab') resultTab;

  private subscription: Subscription;
  private routeSubscription: Subscription;
  private globalSearchsubscription: Subscription;
  public displaySearchPage = true;
  public specificSearch = false;
  public savedSearch = false;
  public searchResult = false;
  public newSearch = false;
  public resultTabs: any;
  public searchTabs: any;
  public currentTabSelected: any;
  public apiTabs: any;

  constructor(
    private router: Router,
    private notify: NotifyService,
    private appStore: ApplicationStorageService,
    private customTranslateSvc: CustomTranslateService,
    private searchSvc: SearchService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.initializePage();
    this.routeSubscription = this.router.events.subscribe((val: any) => {
      if (val.url === '/web/search' || val.url === '/web/search/specific-search' || val.url === '/web/search/saved-search') {
        this.initializePage();
      }
    });

    this.globalSearchsubscription = this.notify.notifySearchResultPageObservable$.subscribe(response => {
      const count = this.appStore.getData('GENERAL_SEARCH:count');
      if (response.isResult && count) {
        this.setTabPanel();
      }
    });
    this.subscription = this.notify.notifySearchOccuredObservable$.subscribe(res => {
      this.navigateChange();
    });
    this.searchTabs = [
      { text: 'Specific Search' },
      { text: 'My Saved Search' }
    ];
    this.searchTabs = this.customTranslateSvc.translateColumns('text', this.searchTabs);
    this.cdr.detectChanges();
  }

  initializePage() {
    if ((window.location.href).indexOf('saved-search') > -1) {
      this.currentTabSelected = 1;
    } else {
      if (this.appStore.getData('GENERAL_SEARCH:count')) {
        this.isNavigateSearchResult();
      } else {
        this.initActiveTab();
      }
    }
  }

  initActiveTab() {
    let url = window.location.href;
    url = url.split('#').pop().split('?').pop();
    const page = url.substring(url.lastIndexOf('/') + 1);
    if (page === 'specific-search') {
      this.initializeSearchTabs();
    }
    this.currentPageTab(page);
    jQuery('#routeBox').removeClass('stuck');
  }

  initializeSearchTabs() {
    this.displaySearchPage = true;
  }

  currentPageTab(page) {
    switch (page) {
      case 'specific-search':
        this.currentTabSelected = 0;
        break;
      case 'saved-search':
        this.currentTabSelected = 1;
        break;
    }
  }

  isNavigateSearchResult() {
    const result = this.appStore.getData('GENERAL_SEARCH:resultArray');
    if (result && result.length > 1) {
      this.setTabPanel();
      this.navigateChange();
    }
  }

  navigateChange() {
    const link = ['/web/search/search-result'];
    this.setTabPanel();
    this.router.navigate(link);
  }

  setTabPanel() {
    this.displaySearchPage = false;
  }

  handleSearchTabs(index) {
    let link;
    switch (index) {
      case 0:
        link = ['/web/search/specific-search'];
        break;
      case 1:
        link = ['/web/search/saved-search'];
        break;
    }
    this.router.navigate(link);
  }

  handleResultTabs(index) {
    let link;
    switch (index) {
      case 0:
        link = ['/web/search/search-result'];
        break;
      case 1:
        link = ['/web/search/new-search'];
        break;
      case 2:
        link = ['/web/search/modify-search'];
        break;
    }
    this.router.navigate(link);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.globalSearchsubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
    this.appStore.remove('packetList');
    this.searchSvc.resetSearchData();
    jQuery('#fixedPanel').removeClass('stuck');
  }
}
