import {
  Component, OnInit, Input, HostListener, Inject, OnDestroy, ViewEncapsulation,
  DoCheck, EventEmitter, Output, ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { MessageService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { SearchType, SearchTypeComparator } from '@srk/core';
import { ShapeComponent } from './search-elements/shape/shape.component';
import { TagsComponent } from './search-elements/tags/tags.component';
import { CaratComponent } from './search-elements/carat/carat.component';
import { ClarityComponent } from './search-elements/clarity/clarity.component';
import { ColorComponent } from './search-elements/colour/colour.component';
import { FancyColorComponent } from './search-elements/fancy-color/fancy-color.component';
import { FinishingComponent } from './search-elements/finishing/finishing.component';
import { PriceComponent } from './search-elements/price/price.component';
import { CommentsComponent } from './search-elements/comments/comments.component';
import { EligibilityComponent } from './search-elements/eligibility/eligibility.component';
import { ParametersComponent } from './search-elements/parameters/parameters.component';
import { InclusionsComponent } from './search-elements/inclusions/inclusions.component';
import { CertificateComponent } from './search-elements/certificate/certificate.component';
import { FluorescenceComponent } from './search-elements/fluorescence/fluorescence.component';
import { LusterComponent } from './search-elements/luster/luster.component';
import { HAComponent } from './search-elements/ha/ha.component';
import { OpenInclusionComponent } from './search-elements/open-inclusion/open-inclusion.component';
import { ExtraFacetComponent } from './search-elements/extra-facet/extra-facet.component';
import { DateComponent } from './search-elements/date/date.component';
import { UserProfileService } from '@srk/core';
import { OrderByPipe } from './order-by.pipe';
import { Search } from '../search';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'underscore';
import 'jquery';
import { ApplicationAuditService } from '@srk/core';

declare var jQuery: any;
declare var Waypoint: any;

@Component({
  selector: 'app-specific-search',
  templateUrl: './specific-search.component.html',
  styleUrls: ['./specific-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SpecificSearchComponent implements OnInit, OnDestroy, DoCheck {
  @ViewChild('searchComponent') searchComponent;
  @Input() visiblePacketIcon = false;
  @Input() searchBtnLabel: any;
  @Input() searchType: any;
  @Input() modifiySearchData: any;
  @Input() searchFiltersValue: any;
  @Input() showCancelBtn: boolean;
  @Input() showSaveBtn = true;
  @Input() eventCode: any;

  @Output() modify = new EventEmitter();
  @Output() cancelSearch = new EventEmitter();
  @Output() returnSearchConfig = new EventEmitter();
  @Output() editSearch = new EventEmitter();
  @Output() newSearch = new EventEmitter();
  @Output() resetSearchEvent = new EventEmitter();

  private searchFilterSubscription: Subscription;
  public searchViewComponents: Search[];
  public defaultSearchComponents: Search[];
  public allSearchComponents: Search[];
  public menuIsFixed = false;
  public viewAllComponent = false;
  public selectedFilters: any[];
  public isDynamic = true;
  public parentRef = {};
  public activeFilter: string;
  public previousFilter: string;
  public nextFilter: string;
  public lastScrollTop: number;
  public isAllowScrollEvent = true;
  public timer: any;
  public oldSelectedSearchData: any[] = [];
  public searchConfig: any;
  public savedSearchPopup = false;
  public errorMessage: any;
  public savedSearchText: any;
  public footNoteSubscription: any;
  public footNoteText = '';
  public footNoteSymbol = '';
  public stoneSearchCount: any;
  public stickyElementZIndex = 0;
  public isRequestMade: boolean;
  public isSaveRequestMade: boolean;
  public noBgmFlag = false;
  public vgSelectionFlag = false;
  public exSlectionFlag = false;
  public searchActionType = 'SEARCH';
  private finishingSubscription: Subscription;
  private bgmSubscription: Subscription;
  public windowWidth: any;
  public isSearchResultPage = false;
  public order_details = [];
  public unSelectedFilterList = [];
  public selectedComponentList: any;
  public allMenuTabs: any[] = [];
  public showSearchButton: boolean = false;
  constructor(
    private searchSvc: SearchService,
    private notify: NotifyService,
    private appStore: ApplicationStorageService,
    private userProfileService: UserProfileService,
    private router: Router,
    private messageService: MessageService,
    private appDataSvc: ApplicationDataService,
    private auditService: ApplicationAuditService) { }

  ngOnInit() {

    this.finishingSubscription = this.notify.notifyFinishingValueChangeActionObservable$.subscribe(res => {
      if (res.hasOwnProperty('vgFlag')) {
        this.vgSelectionFlag = res.vgFlag;
      }
      if (res.hasOwnProperty('exFlag')) {
        this.exSlectionFlag = res.exFlag;
      }
      if (this.vgSelectionFlag) {
        this.exSlectionFlag = false;
      }
      if (this.exSlectionFlag) {
        this.vgSelectionFlag = false;
      }
    });
    this.bgmSubscription = this.notify.notifyBGMChangeActionObservable$.subscribe(res => {
      if (res.hasOwnProperty('bgmFlag')) {
        this.noBgmFlag = res.bgmFlag;
      }
    });
    this.initPageView();
    this.oldSelectedSearchData = this.searchSvc.getSelectedFiltersValue();
    this.searchSvc.setSelectedFiltersValue(this.oldSelectedSearchData);

    if (this.appStore.getData(this.searchType + ':count') === undefined) {
      this.appStore.store(this.searchType + ':count', 0);
    }
    if (this.modifiySearchData !== undefined) {
      this.parentRef = Object.assign({}, this.modifiySearchData);
    }
    if (!_.isEmpty(this.searchFiltersValue)) {
      this.oldSelectedSearchData = this.searchFiltersValue.map(a => Object.assign({}, a));
      this.searchSvc.setSelectedFiltersValue(this.oldSelectedSearchData);
      this.getSearchConfigData();
      this.getSearchFootNote();
    }
    this.getSearchComponentsList();
    this.subscribeSearchElementChangeEvent();
    this.isSearchResultPage = window.location.href.indexOf('search-result') > -1
      || window.location.href.indexOf('twin-diamonds-result') > -1
      || window.location.href.indexOf('bid-to-buy') > -1
      || window.location.href.indexOf('dayp-stones') > -1;
    setTimeout(() => {
      const percentageToAssign = this.fetchPageSizeBasedOnPage();
      jQuery('.struck-page').css('max-height', (window.innerHeight * percentageToAssign) / 100);
    }, 1000);
  }

  ngDoCheck() {
    this.windowWidth = window.screen.width;
    this.handleElementIndexForNgDropDown();
  }

  handleElementIndexForNgDropDown() {
    let dropDownHighestZIndex = 0;
    $(".ui-multiselect-panel").each(function () {
      const current = parseInt($(this).css("z-index"), 10);
      if (current && dropDownHighestZIndex < current) dropDownHighestZIndex = current;
    });
    if (dropDownHighestZIndex !== 0 && this.stickyElementZIndex <= dropDownHighestZIndex) {
      $(".ui-multiselect-panel").each(function () {
        const current = parseInt($(this).css("z-index"), 10);
        if (current && dropDownHighestZIndex === current) {
          $(this).css('z-index', (current - 1));
        }
      });
      this.stickyElementZIndex = dropDownHighestZIndex;
      $('.fixed').css('z-index', this.stickyElementZIndex);
      $('.fixed').css('z-index', this.stickyElementZIndex);
      $('.search-tab').css('z-index', this.stickyElementZIndex);
      $('.search-footer').css('z-index', this.stickyElementZIndex);
    }
  }

  initPageView() {
    if (this.searchType) {
      if (SearchTypeComparator.AreEqual(this.searchType, SearchType.TWIN_DIAMOND_SEARCH)) {
        this.searchBtnLabel = 'Twin Diamonds Search';
        this.showSaveBtn = false;
        this.searchActionType = 'STD SEARCH';
      } else if (SearchTypeComparator.AreEqual(this.searchType, SearchType.DAYP_SEARCH)) {
        this.showSaveBtn = false;
        this.searchActionType = 'DAYP SEARCH';
      } else if (SearchTypeComparator.AreEqual(this.searchType, SearchType.EVENT_SEARCH)) {
        this.showSaveBtn = false;
        this.searchActionType = 'SHOW SEARCH';
      } else if (SearchTypeComparator.AreEqual(this.searchType, SearchType.B2B_SEARCH)) {
        this.showSaveBtn = false;
        this.searchActionType = 'BTB SEARCH';
      }
    } else if (this.searchType === undefined) {
      if (this.router.url.indexOf('/twin-diamonds/') !== -1) {
        this.searchType = SearchType.TWIN_DIAMOND_SEARCH;
        this.searchBtnLabel = 'Twin Diamonds Search';
        this.showSaveBtn = false;
        this.searchActionType = 'STD SEARCH';
      } else if (this.router.url.indexOf('/search/') !== -1) {
        this.searchType = SearchType.GENERAL_SEARCH;
        this.searchBtnLabel = 'Search';
        this.searchActionType = 'SEARCH';
      }
    }
    if (SearchTypeComparator.AreEqual(this.searchType, SearchType.GENERAL_SEARCH)
      || SearchTypeComparator.AreEqual(this.searchType, SearchType.TWIN_DIAMOND_SEARCH)
      || SearchTypeComparator.AreEqual(this.searchType, SearchType.B2B_SEARCH)) {
      this.searchSvc.getBtbVersionList().subscribe(res => { }, err => { });
    }
    if (!this.searchBtnLabel) {
      this.searchBtnLabel = 'Search';
    }
  }

  getSearchComponentsList() {
    this.allSearchComponents = [];
    this.allMenuTabs = [];
    this.searchViewComponents = [];
    this.allSearchComponents = this.getSearchComponents();
    const filterList = this.userProfileService.getAllSearchFilterList();
    this.setSelectedFilters(filterList);
  }

  setSelectedFilters(filterList) {
    this.selectedFilters = [];
    for (const name in filterList) {
      if (filterList.hasOwnProperty(name)) {
        const filterData = filterList[name];
        this.allSearchComponents.forEach((searchName, i) => {
          if (name === searchName.name) {
            if (filterData.entity_value) {
              this.allSearchComponents[i].data['isVisible'] = true;
              this.selectedFilters.push(this.allSearchComponents[i]);
              this.allMenuTabs.push(this.allSearchComponents[i]);
            } else {
              this.unSelectedFilterList.push(this.allSearchComponents[i]);
            }
          }
        });
      }
    }
    this.defaultSearchComponents = this.getDefaultSearchComponents(this.allSearchComponents, this.allSearchComponents.length + 1);
    this.allMenuTabs = this.getDefaultSearchComponents(this.allMenuTabs, this.allMenuTabs.length + 1);
    this.searchViewComponents = this.defaultSearchComponents;
  }

  subscribeSearchElementChangeEvent() {
    var selectionlist = [];
    this.searchFilterSubscription = this.notify.notifySearchElementTouchedObservable$.subscribe((res) => {
      if (res.hasOwnProperty('searchComponent')) {
        for (let k = 0; k < res.filterCriteria.length; k++) {
          const List = _.pluck(selectionlist, 'key')
          if (List.indexOf(res.filterCriteria[k].key) === -1) {
            selectionlist.push({ key: res.filterCriteria[k].key, value: res.filterCriteria[k].value });
          }
        }
        for (let i = 0; i < res.filterCriteria.length; i++) {
          var keyname = res.filterCriteria[i].key;
          for (let j = 0; j < selectionlist.length; j++) {
            if (keyname === selectionlist[j].key) {
              selectionlist[j].value = res.filterCriteria[i].value;
            }
          }
        }
        this.order_details = _.filter(selectionlist, function (item) { return item.value.length != 0 });
        this.searchSvc.saveSearchComponentValue(res);
        this.searchSvc.isCaratSelected();
        this.getSearchConfigData();
        if (this.footNoteSubscription) {
          this.footNoteSubscription.unsubscribe();
        }
        this.getSearchFootNote();
      }
    });
    // return JSON.stringify(this.order_details);
  }

  search() {
    this.auditService.storeActionAudit(this.searchActionType);
    if (this.isSearchCriteriaValid()) {
      const flag = this.searchSvc.isCaratSelected();
      const searchSelectedStatus = this.searchSvc.isSearchParamSelected();
      const searchCount = this.searchSvc.checkResultCount(this.appStore.getData(this.searchType + ':resultArray'));
      let tabExceedCheckPass = true;

      if (searchCount < this.appDataSvc.getSearchResultLimit()) {
        tabExceedCheckPass = true;
      } else {
        tabExceedCheckPass = false;
      }
      if (this.appStore.getData(this.searchType + ':modifyCount') !== undefined) {
        tabExceedCheckPass = true;
      }
      if (flag && searchSelectedStatus && tabExceedCheckPass
        && SearchTypeComparator.AreEqual(this.searchType.toString(), SearchType.GENERAL_SEARCH)) {
        this.getSearchConfigData();
        if (this.searchConfig.range && this.searchConfig.range.upload_date) {
          const dateArray = (this.searchConfig.range.upload_date[0]).split('-');
          if (dateArray.length < 1 || dateArray[0] === 'null' || dateArray[1] === 'null') {

            if (dateArray[0] === 'null' && dateArray[1] === 'null') {

              this.searchConfig.range.upload_date = null;
              this.getSpecificSearch();

            } else {
              this.messageService.showErrorGrowlMessage('SELECT_CORRECT_DATE_RANGE');
            }

          } else {
            this.getSpecificSearch();
          }
        } else {
          this.getSpecificSearch();
        }
      } else if (flag && searchSelectedStatus && tabExceedCheckPass
        && SearchTypeComparator.AreEqual(this.searchType, SearchType.TWIN_DIAMOND_SEARCH)) {
        this.getSearchConfigData();
        this.getTwinDiamondSearch();
      } else if (flag && searchSelectedStatus && SearchTypeComparator.AreEqual(this.searchType, SearchType.DAYP_SEARCH)) {
        this.getSearchConfigData();
        this.returnSearchConfig.emit({ config: this.searchConfig, eventCode: this.eventCode, order_details: this.order_details });
      } else if (flag && searchSelectedStatus && SearchTypeComparator.AreEqual(this.searchType, SearchType.EVENT_SEARCH)) {
        this.getSearchConfigData();
        this.returnSearchConfig.emit({ config: this.searchConfig, eventCode: this.eventCode, order_details: this.order_details });
      } else if (flag && searchSelectedStatus && SearchTypeComparator.AreEqual(this.searchType, SearchType.B2B_SEARCH)) {
        this.getSearchConfigData();
        this.returnSearchConfig.emit({ config: this.searchConfig, eventCode: this.eventCode, order_details: this.order_details });
      } else {
        if (!searchSelectedStatus) {
          this.messageService.showErrorGrowlMessage('ERR_SELECT_SEARCH_FILTER');
        } else if (!flag) {
          this.messageService.showErrorGrowlMessage('SELECT_CARAT');
        } else {
          this.messageService.showErrorGrowlMessage('ERR_REACHED_SEARCH_TAB_LIMIT');
        }
      }
    }
  }

  getSpecificSearch() {
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });

    this.searchSvc.specificSearch(this.searchConfig, SearchType.GENERAL_SEARCH, this.eventCode, this.order_details).subscribe((response) => {

      this.notify.hideBlockUI();
      if (response !== undefined) {
        if (MessageCodesComparator.AreEqual(response.code, MessageCodes._LIMIT_EXCEED)) {
          if (response.data.body.length > 0) {
            this.navigateToSearchResult();
          }
          this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
        } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes._OVER_LIMIT)) {
          if (response.data.body.length > 0) {
            this.navigateToSearchResult();
            this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
          } else {
            this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
          }
        } else if (response.code === 'ELS#200') {
          if (response.data.body.length > 0) {
            this.navigateToSearchResult();
          } else {
            this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
          }
        }
      }
    }, error => {
      this.notify.hideBlockUI();
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  getTwinDiamondSearch() {
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    this.searchSvc.specificSearch(this.searchConfig, SearchType.TWIN_DIAMOND_SEARCH, this.eventCode, this.order_details).subscribe((response) => {
      this.notify.hideBlockUI();
      if (response !== undefined) {
        if (MessageCodesComparator.AreEqual(response.code, MessageCodes._LIMIT_EXCEED)) {
          if (response.data.body.length > 0) {
            this.navigateToSearchResult();
          }
          this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
        } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes._OVER_LIMIT)) {
          if (response.data.body.length > 0) {
            this.navigateToSearchResult();
            this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
          } else {
            this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
          }
        } else if (response.code === 'ELS#200') {
          if (response.data.body.length > 0) {
            this.navigateToSearchResult();
          } else {
            this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
          }
        }
      }
    }, error => {
      this.notify.hideBlockUI();
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  getSearchConfigData() {
    this.searchConfig = this.searchSvc.createSearchCofigData();
    this.searchSvc.notifyFooterButtons(this.searchConfig);
  }

  isSearchCriteriaValid(): boolean {
    let errorMessages = this.searchSvc.getSearchCriteriaErrorMessage();
    if (errorMessages.length > 0) {
      errorMessages = errorMessages.filter((msg, index) => {
        return errorMessages.indexOf(msg) === index;
      });
      this.messageService.showErrorGrowlMessage(errorMessages.join(','));
    }
    return errorMessages.length > 0 ? false : true;
  }

  getCurrentPage() {
    let url = window.location.href;
    url = url.split('#').pop().split('?').pop();
    const page = url.substring(url.lastIndexOf('/') + 1);
    return page;
  }

  navigateToSearchResult() {
    if (this.appStore.getData(this.searchType + ':modifyCount') !== undefined) {
      const data = this.searchSvc.getSearchResultData();
      const filterValues = this.searchSvc.getSelectedFiltersValue();
      if (SearchTypeComparator.AreEqual(this.searchType, SearchType.DAYP_SEARCH)) {
        this.returnSearchConfig.emit({ config: this.searchConfig });
      } else {
        this.modify.emit({ config: this.searchConfig, result: data, searchFilters: filterValues });
      }
    } else {
      let count: number = this.appStore.getData(this.searchType + ':count');
      count++;
      this.appStore.remove(this.searchType + ':count');
      this.appStore.store(this.searchType + ':count', count);
      if (this.getCurrentPage() === 'search-result' || this.getCurrentPage() === 'twin-diamonds-result') {
        this.newSearch.emit({ newSearch: true });
      } else {
        this.notify.notifySearch({ count: count });
      }
    }
  }

  cancelSpecificSearch() {
    this.cancelSearch.emit(true);
  }

  ngOnDestroy() {
    this.searchConfig = {};
    this.footNoteText = '';
    this.appStore.remove(this.searchType + ':modifyCount');
    this.appStore.remove('modifyResultName');
    this.searchFilterSubscription.unsubscribe();
    if (this.footNoteSubscription) {
      this.footNoteSubscription.unsubscribe();
    }
    this.finishingSubscription.unsubscribe();
    this.bgmSubscription.unsubscribe();
  }

  getDefaultSearchComponents(searchArray: Search[], initialCount) {
    const resultArray: any[] = [];
    let count = 1;
    searchArray = this.reorderSearchArray(searchArray);
    searchArray.forEach((element) => {
      if (count < initialCount) {
        resultArray.push(element);
      }
      count++;
    });
    return resultArray;
  }

  reorderSearchArray(array) {
    array.sort(function (obj1, obj2) {
      if (obj1.data.order < obj2.data.order) {
        return -1;
      } else if (obj1.data.order > obj2.data.order) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }

  getSearchComponents() {
    return [
      // new Search('TAGS_ID', 'Tags', TagsComponent,
      //   { render: true, order: 2, parentRef: '', isObserved: true, isEmitEvent: false }),
      new Search('SHAPE_ID', 'Shape', ShapeComponent,
        { render: true, order: 1, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('CERTIFICATE_ID', 'Certificate', CertificateComponent,
        { render: true, order: 9, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('CARAT_ID', 'Carat', CaratComponent,
        { render: true, order: 3, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('CLARITY_ID', 'Clarity', ClarityComponent,
        { render: true, order: 4, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('COLOUR_ID', 'Colour', ColorComponent,
        { render: true, order: 5, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('FANCY_COLOR_ID', 'Fancy Color', FancyColorComponent,
        { render: true, order: 6, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('FINISHING_ID', 'Finishing', FinishingComponent,
        { render: true, order: 7, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('FLUORESCENCE_ID', 'Fluorescence', FluorescenceComponent,
        { render: true, order: 8, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('LUSTER_ID', 'Luster & Shades', LusterComponent,
        { render: true, order: 10, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('H_A_ID', 'H&A', HAComponent,
        { render: true, order: 12, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('PRICE_ID', 'Price', PriceComponent,
        { render: true, order: 13, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('COMMENTS_ID', 'Comments', CommentsComponent,
        { render: true, order: 14, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('ELIGIBILITY_ID', 'Eligibility', EligibilityComponent,
        { render: true, order: 15, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('PARAMETERS_ID', 'Parameters', ParametersComponent,
        { render: true, order: 18, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('INCLUSIONS_ID', 'Inclusions', InclusionsComponent,
        { render: true, order: 17, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('OPEN_INCLUSIONS_ID', 'Open Inclusions', OpenInclusionComponent,
        { render: true, order: 19, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('DATE_ID', 'Date', DateComponent,
        { render: true, order: 16, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false }),
      new Search('EXTRA_FACET_ID', 'Extra Facet', ExtraFacetComponent,
        { render: true, order: 20, parentRef: '', isObserved: true, isEmitEvent: false, isVisible: false })
    ];
  }

  viewMore() {
    this.viewAllComponent = !this.viewAllComponent;
    this.unSelectedFilterList = this.getDefaultSearchComponents(this.unSelectedFilterList, this.unSelectedFilterList.length + 1)
    this.selectedFilters = this.reorderSearchArray(this.selectedFilters);
    this.selectedComponentList = this.selectedFilters.concat(this.unSelectedFilterList);
    this.searchViewComponents = this.selectedComponentList;
    this.allMenuTabs = JSON.parse(JSON.stringify([]));
    this.searchViewComponents.forEach((element, i) => {
      this.searchViewComponents[i].data['isVisible'] = true;
      this.allMenuTabs.push(this.searchViewComponents[i]);
    });
    setTimeout(() => {
      this.onWindowScroll();
    }, 300);
  }

  viewLess() {
    this.allMenuTabs = [];
    const currentlySelected = jQuery('.active-filter')[0].id ? jQuery('.active-filter')[0].id.replace('_Link', '') : '';
    this.viewAllComponent = !this.viewAllComponent;
    this.unSelectedFilterList.forEach(unselected => {
      this.searchViewComponents.forEach((element, i) => {
        if (unselected.id === element.id) {
          this.searchViewComponents[i].data['isVisible'] = false;
        }
      });
    });
    let i = -1;
    let flag = false;
    this.searchViewComponents.forEach((searchElement, index) => {
      if (!flag) {
        if (currentlySelected === searchElement.id) {
          i = index;
          flag = true;
        }
      }
      if (this.searchViewComponents[index].data['isVisible']) {
        this.allMenuTabs.push(this.searchViewComponents[index]);
      }
    });
    setTimeout(() => {
      this.onWindowScroll();
    }, 300);
    i > -1 ? this.filterSelected(this.searchViewComponents[i].id)
      : this.filterSelected(this.searchViewComponents[this.searchViewComponents.length - 1].id);
  }

  filterSelected(filter) {
    this.isAllowScrollEvent = false;
    jQuery('.filter-components').removeClass('active-filter');
    jQuery('#' + filter + '_Link').addClass('active-filter');
    let filterItem;
    if (this.isSearchResultPage) {
      filterItem = jQuery('#' + filter).offset().top - jQuery('#searchElement').offset().top + 3;
      jQuery('#searchElementsBox').animate({
        scrollTop: (filterItem)
      }, 800);
    } else {
      filterItem = jQuery('#' + filter).offset().top;
      const searchElementTopValue = jQuery('#searchElement').offset().top - 107;
      jQuery('html, body').animate({
        scrollTop: (filterItem - 30 - searchElementTopValue)
      }, 800);
    }
  }
  // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isAllowScrollEvent) {
      this.findActiveFilter();
      this.findNextAndPreviousFilters();
      this.selectNextPreviousFilterOnScroll();
      this.rotateCarouselForActiveFilter();
    }
    this.setFilterMenuPositionOnPage();
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.isAllowScrollEvent = true;
      const windowTopScroll: any = jQuery(window).scrollTop();
      this.lastScrollTop = windowTopScroll;
    }, 800);
    if (jQuery(window) && jQuery(window).scrollTop() === 0) {
      this.resetScrollerToShape();
    }
    this.checkNavigatorPosition();
  }

  checkNavigatorPosition() {
    setTimeout(() => {
      this.setFilterMenuPositionOnPage();
    }, 800)
  }

  rotateCarouselForActiveFilter() {
    const activeFilterElm = jQuery('.active-filter')[0];
    const activeFilterParent = $(activeFilterElm).parent();
    const windowTopScroll: any = jQuery(window).scrollTop();
    if (windowTopScroll > this.lastScrollTop) {
      if (!activeFilterParent.hasClass('active')) {
        jQuery('.owl-carousel').trigger('next.owl.carousel');
      }
    } else {
      if (!activeFilterParent.hasClass('active')) {
        jQuery('.owl-carousel').trigger('prev.owl.carousel');
      }
    }
    this.lastScrollTop = windowTopScroll;
  }

  setFilterMenuPositionOnPage() {
    const isStuck: boolean = jQuery('#searchFilterMenuId').hasClass('stuck');
    if (isStuck) {
      jQuery('.owl-nav').removeClass('position-absolute');
      jQuery('.owl-nav').addClass('position-fixed');
    } else {
      jQuery('.owl-nav').addClass('position-absolute');
      jQuery('.owl-nav').removeClass('position-fixed');
    }
  }

  selectNextPreviousFilterOnScroll() {
    const scrollTopValue: any = jQuery(window).scrollTop();
    if (this.nextFilter !== undefined) {
      const nextfilterItem = jQuery('#' + this.nextFilter).offset();
      if (nextfilterItem !== undefined) {
        const nextFilterEffectiveTopOffset = nextfilterItem.top - scrollTopValue;
        if (nextFilterEffectiveTopOffset < 30) {
          jQuery('.filter-components').removeClass('active-filter');
          jQuery('#' + this.nextFilter + '_Link').addClass('active-filter');
        }
      }
    }

    if (this.previousFilter !== undefined) {
      const previousfilterItem = jQuery('#' + this.previousFilter).offset();
      if (previousfilterItem !== undefined) {
        const previousFilterEffectiveTopOffset = previousfilterItem.top - scrollTopValue;
        if (previousFilterEffectiveTopOffset > 30) {
          jQuery('.filter-components').removeClass('active-filter');
          jQuery('#' + this.previousFilter + '_Link').addClass('active-filter');
        }
      }
    }
  }

  findActiveFilter() {
    const activeFilterElm = jQuery('.active-filter')[0];
    if (activeFilterElm !== undefined) {
      const id = activeFilterElm.id;
      this.activeFilter = id.replace('_Link', '');
    }
  }

  findNextAndPreviousFilters() {
    const activeFilterOrder = this.findActiveFilterOrder(this.activeFilter);
    this.allMenuTabs.forEach((element, index) => {
      if (element.data.order === activeFilterOrder) {
        if (index !== 0 && this.allMenuTabs[index - 1] !== undefined) {
          this.previousFilter = this.allMenuTabs[index - 1].id;
        }
        if (this.allMenuTabs.length - 1 !== activeFilterOrder && this.allMenuTabs[index + 1] !== undefined) {
          this.nextFilter = this.allMenuTabs[index + 1].id;
        }
      }
    });
  }
  // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  findActiveFilterOrder(filterId: string) {
    let activeFilterOrder: number;
    this.searchViewComponents.forEach((element, index) => {
      if (element.id === filterId) {
        activeFilterOrder = element.data.order;
      }
    });
    return activeFilterOrder;
  }

  toggleSaveSearchPopUp() {
    if (this.searchType === 'SAVED_SEARCH') {
      const saveSearchJson = {};
      saveSearchJson['filter'] = this.searchSvc.createSearchCofigData();
      this.editSearch.emit(saveSearchJson);
    } else {
      const flag = this.searchSvc.isCaratSelected();
      const searchParamValidation = this.searchSvc.isSearchParamSelected();
      if (searchParamValidation && flag) {
        this.savedSearchPopup = !this.savedSearchPopup;
        this.errorMessage = '';
        this.savedSearchText = '';
      } else {
        if (!searchParamValidation) {
          this.messageService.showErrorGrowlMessage('Please select some filter');
        } else {
          this.messageService.showErrorGrowlMessage('SELECT_CARAT');
        }
      }
    }
  }

  saveNewSearch(text) {
    this.isSaveRequestMade = true;
    this.errorMessage = '';
    if (text) {
      const saveSearchJson = {};
      saveSearchJson['saved_search_name'] = text;
      saveSearchJson['filter'] = this.searchSvc.createSearchCofigData();
      if (saveSearchJson['filter'].hasOwnProperty('values') && saveSearchJson['filter'].values) {
        saveSearchJson['filter'].values['btbv_code'] = this.searchSvc.fetchBtbVersionList();
        saveSearchJson['filter'].values['btbv_code'].unshift(0);
        saveSearchJson['filter'].values['btbv_code'] = _.uniq(saveSearchJson['filter'].values['btbv_code']);
      }
      this.searchSvc.storeSavedSearch(saveSearchJson).subscribe(response => {
        this.isSaveRequestMade = false;
        this.showSearchButton = false;
        if (!response.error_status) {
          this.toggleSaveSearchPopUp();
          this.messageService.showSuccessGrowlMessage('SEARCH_SAVED');
          this.auditService.savedSearchAudit('SAVE SEARCH', text);
        } else {
          this.errorMessage = response.message;
        }
      }, error => {
        this.showSearchButton = false;
        this.isSaveRequestMade = false;
        this.errorMessage = 'errorSavingSearch';
      });
    } else {
      this.errorMessage = 'enterName';
    }
  }

  resetSearch() {
    jQuery('#globalStoneSearchFieldId').get(0).reset();
    this.vgSelectionFlag = this.exSlectionFlag = this.noBgmFlag = false;
    this.searchConfig = {};
    this.searchFiltersValue = [];
    this.modifiySearchData = [];
    this.parentRef = {};
    this.searchSvc.resetSearchData();
    this.footNoteSymbol = '';
    this.footNoteText = '';
    this.oldSelectedSearchData = [];
    this.resetSearchEvent.emit({ config: this.searchConfig, searchFilters: this.searchFiltersValue });
    this.getSearchComponentsList();
    if (this.viewAllComponent === true) {
      this.searchViewComponents = this.selectedFilters;
      window.scrollTo(0, 0);
    }
  }

  getSearchFootNote() {
    const searchFootNoteParam = this.fetchCurrentPage();
    if (this.searchSvc.isSearchParamSelected()) {
      this.isRequestMade = true;
      this.footNoteSubscription = this.searchSvc.fetchSearchFootnote(this.searchConfig, searchFootNoteParam, this.searchType, this.eventCode)
        .subscribe(response => {
          this.isRequestMade = false;
          if (!response.error_status) {
            if (response.data) {
              if (MessageCodesComparator.AreEqual(response.code, MessageCodes._LIMIT_EXCEED)) {
                this.footNoteText = 'KAM_EXCEED_MESSAGE';
                this.stoneSearchCount = 0;
              } else if (response.data.hasOwnProperty('count_details')) {
                this.stoneSearchCount = response.data.count_details.count;
                this.footNoteSymbol = response.data.count_details.comparison_symbol === '>' ? 'More' : 'Less';
                if (this.footNoteSymbol === 'More') {
                  this.footNoteText = response.data.count_details.comparison_symbol + ' ' + response.data.count_details.total_count
                    + ' stones found. Please narrow your search criteria.';
                } else {
                  if (this.stoneSearchCount > 0) {
                    this.footNoteText = response.data.count_details.comparison_symbol + ' ' + response.data.count_details.total_count
                      + ' stones matching your criteria found.';
                  } else {
                    this.footNoteText = '0 Stone found.';
                  }
                }
              }
            }
          }
        }, error => {
          this.isRequestMade = false;
          this.footNoteSymbol = '';
          this.footNoteText = '';
        });
    } else {
      this.footNoteSymbol = '';
      this.footNoteText = '';
    }
  }

  fetchCurrentPage() {
    let footNoteParam;
    if (window.location.href.indexOf('twin-diamonds') !== -1) {
      footNoteParam = 'std';
    } else if (window.location.href.indexOf('dayp-stones') !== -1) {
      footNoteParam = 'dayp';
    } else if (window.location.href.indexOf('event') !== -1) {
      footNoteParam = 'event';
    } else if (window.location.href.indexOf('bid-to-buy') !== -1) {
      footNoteParam = 'b2b';
    } else {
      footNoteParam = 'all';
    }
    return footNoteParam;
  }

  selectNoBgm() {
    this.notify.notifyBGMClick({ flag: this.noBgmFlag });
  }

  selectAllExcellent() {
    this.notify.notifyEXFinishingClick({ flag: this.exSlectionFlag });
  }

  selectAllVeryGood() {
    this.notify.notifyVGFinishingClick({ flag: this.vgSelectionFlag });
  }

  @HostListener('window:resize')
  onWindowResize() {
    setTimeout(() => {
      const percentageToAssign = this.fetchPageSizeBasedOnPage();
      jQuery('.struck-page').css('max-height', window.innerHeight * percentageToAssign / 100);
    }, 1000);
  }

  fetchPageSizeBasedOnPage() {
    let maxHeightPercentAssign = 80;
    if (window.location.href.indexOf('bid-to-buy') > -1) {
      maxHeightPercentAssign = 70;
    } else if (window.location.href.indexOf('dayp') > -1) {
      maxHeightPercentAssign = 66;
    } else {
      maxHeightPercentAssign = 80;
    }
    return maxHeightPercentAssign;
  }

  /*
  ** This method will executed when scroll is within div like modify search result,
  ** B2B search page, DAYP search page, event search
  */
  onDivScroll(e) {
    this.findActiveFilter();  // This will find out active filter
    this.findNextAndPreviousFilters(); // This will find out filter before and after current active filter

    // ************* This will check whether scroll moves to next filter********************//
    const currentFilterItem = jQuery('#' + this.activeFilter).offset().top - jQuery('#searchElement').offset().top;
    if (this.nextFilter !== undefined) {
      const nextfilterItem = jQuery('#' + this.nextFilter).offset().top - jQuery('#searchElement').offset().top;
      if (nextfilterItem !== undefined) {
        if (e.target.scrollTop >= nextfilterItem) {
          jQuery('.filter-components').removeClass('active-filter');
          jQuery('#' + this.nextFilter + '_Link').addClass('active-filter');
        }
      }
    }
    // ************************************************************************************//
    // ************* This will check whether scroll moves to previous filter********************//
    if (this.previousFilter !== undefined) {
      const previousfilterItem = jQuery('#' + this.previousFilter).offset().top - jQuery('#searchElement').offset().top;
      if (previousfilterItem !== undefined) {
        if ((e.target.scrollTop >= previousfilterItem) && (e.target.scrollTop < currentFilterItem)) {
          jQuery('.filter-components').removeClass('active-filter');
          jQuery('#' + this.previousFilter + '_Link').addClass('active-filter');
        }
      }
    }
    // ************************************************************************************//

    // ************* This will check whether scroll reached to 0 scroll********************//
    if (e.target.scrollTop === 0) {
      this.resetScrollerToShape();
    }
    // ************************************************************************************//

    // ************This is used to automatically trigger left or right button click of caraousel***************//
    if (this.isSearchResultPage) {
      const activeFilterElm = jQuery('.active-filter')[0];
      const activeFilterParent = $(activeFilterElm).parent();
      const windowTopScroll: any = currentFilterItem;
      if (windowTopScroll > this.lastScrollTop) {
        if (!activeFilterParent.hasClass('active')) {
          jQuery('.owl-carousel').trigger('next.owl.carousel');
        }
      } else {
        if (!activeFilterParent.hasClass('active')) {
          jQuery('.owl-carousel').trigger('prev.owl.carousel');
        }
      }
      this.lastScrollTop = currentFilterItem;
    }
    // ************************************************************************************//
  }

  resetScrollerToShape() {
    jQuery('.filter-components').removeClass('active-filter');
    jQuery('#' + 'SHAPE_ID' + '_Link').addClass('active-filter');
    this.findActiveFilter();
  }

}
