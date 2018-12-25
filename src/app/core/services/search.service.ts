import { Injectable } from '@angular/core';
import { DiamondAttributes } from '../models/diamond-attributes';
import { UserProfileService } from './user-profile.service';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/publishReplay';
// import { Search } from './search';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';
import { ApplicationDataService } from './application-data.service';
import { ApplicationStorageService } from './application-storage.service';
import { TitleCasePipe } from '@angular/common';
import { SearchType, SearchTypeComparator } from '../enums/search-type';
import * as _ from 'underscore';
import { NotifyService } from './notify.service';
import { ApplicationAuditService } from './application-audit.service';
import { MessageCodes, MessageCodesComparator } from '../enums/message-codes.enum';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class SearchService {

  public searchConfig: any;
  public searchResultConfig: any;
  public resultFromUploadedCard: any = {};
  public selectedSearchData: any[] = [];
  private searchFilterParameters$: Observable<any> = null;
  private searchFilterStsticParameters$: Observable<any> = null;
  public btbVersionList: any[] = [];
  public btbVersion: any[] = [];

  constructor(
    private userProfileService: UserProfileService,
    private http: HttpClient,
    private appStore: ApplicationStorageService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private applicationDataService: ApplicationDataService,
    private notifyService: NotifyService,
    private auditService: ApplicationAuditService) { }

  getSearchFilterData(): Observable<any> {
    if (!this.searchFilterParameters$) {
      this.searchFilterParameters$ = this.http.get(`
        ${this.applicationDataService.getEnvironment().DashboardApi}
        /dashboard/stone/getSearchParameter/'
        ${this.applicationDataService.getEnvironment().DashboardVersion}`).pipe(
        map((res) => res),
        catchError(err => this.errorHandler.handleError('SearchService:getSearchFilterData', err))
      );
    }
    return this.searchFilterParameters$;
  }

  getSearchElement(): Observable<any> {
    if (!this.searchFilterStsticParameters$) {
      this.searchFilterStsticParameters$ = this.http.get('/assets/JSON/search-elements.json').pipe(
        map((res) => {
          return res;
        }),
        catchError(err => { 
          return this.errorHandler.handleError('SearchService:getSearchFilterData', err); 
        })
      );
    }
    return this.searchFilterStsticParameters$;
  }

  clearSearchFilterCache() {
    this.searchFilterParameters$ = null;
    this.searchFilterStsticParameters$ = null;
  }

  saveSearchComponentValue(data: any) {
    this.createSearchParams(data);
  }

  createSearchParams(data) {
    data.filterCriteria.forEach((object) => {
      this.selectedSearchData.forEach((element) => {
        if (object.key === element.key) {
          const i = this.selectedSearchData.indexOf(element);
          this.selectedSearchData.splice(i, 1);
        }
      });
      this.selectedSearchData.push(object);
    });
  }

  getSearchCriteriaErrorMessage(): string[] {
    const errorMessage = [];
    this.selectedSearchData.forEach((element) => {
      if (!element.valid && element.errorMessage) {
        errorMessage.push(element.errorMessage);
      }
    });
    return errorMessage;
  }

  createSearchCofigData(): any {
    const resultConfig = {
      'range': {},
      'values': {},
      'values_not': {}
    };
    this.selectedSearchData.forEach((element) => {
      if ((Array.isArray(element.value) && element.value.length > 0)
        || (!Array.isArray(element.value) && element.value instanceof Object)) {
        if (element.key.indexOf('#') === 0) {
          const key = element.key.replace('#', '');
          resultConfig.range[key] = element.value;
        } else if (element.key.indexOf('COLOR-') === 0) {
          resultConfig.values['color'] = resultConfig.values['color'] || {};
          if (element.key.indexOf('COLOR-FANCY-') === 0) {
            const key = element.key.replace('COLOR-FANCY-', '');
            resultConfig.values['color'][key] = element.value;
          } else {
            const key = element.key.replace('COLOR-', '');
            resultConfig.values['color'][key] = element.value;
          }
        } else if (element.key.indexOf('kts-') === 0 || element.key.indexOf('sgs-') === 0) {
          if (element.key.indexOf('kts-like') === 0) {
            const key = element.key.replace('kts-like', 'kts');
            resultConfig.values[key] = element.value;
          }
          if (element.key.indexOf('kts-dislike') === 0) {
            const key = element.key.replace('kts-dislike', 'kts');
            resultConfig.values_not[key] = element.value;
          }
          if (element.key.indexOf('sgs-like') === 0) {
            const key = element.key.replace('sgs-like', 'sgs');
            resultConfig.values[key] = element.value;
          }
          if (element.key.indexOf('sgs-dislike') === 0) {
            const key = element.key.replace('sgs-dislike', 'sgs');
            resultConfig.values_not[key] = element.value;
          }
        } else {
          resultConfig.values[element.key] = element.value;
        }
      }
    });
    return resultConfig;
  }

  specificSearch(object, searchString, id, order_details): Observable<any> {
    const event_id = id ? id : 0;
    this.searchConfig = {};
    this.searchResultConfig = {};
    let apiLink;
    let searchAuditType = 'normalSearch';
    if (!object) { return; }
    if ((SearchTypeComparator.AreEqual(searchString, SearchType.GENERAL_SEARCH)
      || SearchTypeComparator.AreEqual(searchString, SearchType.DAYP_SEARCH)
      || SearchTypeComparator.AreEqual(searchString, SearchType.TWIN_DIAMOND_SEARCH)
      || SearchTypeComparator.AreEqual(searchString, SearchType.B2B_SEARCH))
      && object.values.stone_id) {
      delete object.values.stone_id;
    }

    if (SearchTypeComparator.AreEqual(searchString, SearchType.GENERAL_SEARCH)
      || SearchTypeComparator.AreEqual(searchString, SearchType.TWIN_DIAMOND_SEARCH)) {
      object.values['btbv_code'] = this.fetchBtbVersionList();

      object.values.btbv_code.unshift(0);
      object.values.btbv_code = _.uniq(object.values.btbv_code);
    } else if (SearchTypeComparator.AreEqual(searchString, SearchType.B2B_SEARCH)) {
      object.values['btbv_code'] = this.fetchBtbVersionList();
    }

    apiLink = this.applicationDataService.getEnvironment().SearchApi + '/search/stone/' +
      this.applicationDataService.getEnvironment().SearchApiVersion;

    if (SearchTypeComparator.AreEqual(searchString, SearchType.DAYP_SEARCH)) {
      apiLink = this.applicationDataService.getEnvironment().SearchApi + '/search/stone/' +
        this.applicationDataService.getEnvironment().SearchApiVersion + '/dayp';
      searchAuditType = 'dayp';
    }

    if (SearchTypeComparator.AreEqual(searchString, SearchType.TWIN_DIAMOND_SEARCH)) {
      apiLink = this.applicationDataService.getEnvironment().SearchApi + '/search/twinStone/' +
        this.applicationDataService.getEnvironment().SearchApiVersion;
      searchAuditType = 'std';
    }

    if (SearchTypeComparator.AreEqual(searchString, SearchType.B2B_SEARCH)) {
      apiLink = this.applicationDataService.getEnvironment().SearchApi + '/search/stone/' +
        this.applicationDataService.getEnvironment().SearchApiVersion + '/b2b';
      searchAuditType = 'b2b';
    }
    let url = apiLink;
    const jsonBody = {
      'filter': JSON.stringify(object),
      'order_details': JSON.stringify(order_details)
    };

    if (SearchTypeComparator.AreEqual(searchString, SearchType.EVENT_SEARCH) && id !== 0) {
      apiLink = this.applicationDataService.getEnvironment().SearchApi + '/search/stone/' +
        this.applicationDataService.getEnvironment().SearchApiVersion + '/event';
      url = apiLink;
      searchAuditType = 'event';
      const jsonBody = {
        'filter': JSON.stringify(object),
        'event_id': event_id
      };
      return this.http.post(url, JSON.stringify(jsonBody)).pipe(
        map((res) => {
          const result = res;
          this.searchConfig = object;
          this.searchResultConfig = result;
          if (result['data'] && result['data'].body) {
            this.saveSearchStoneAudit(result['data'].body, this.searchConfig, searchAuditType);
          }
          return result;
        }),
        catchError(err => { 
          return this.errorHandler.handleError('SearchService:specificSearch', err); 
        })
      );
    }
    if (SearchTypeComparator.AreEqual(searchString, SearchType.GLOBAL_SEARCH)) {
      const str = object.values.stone_id.join();
      apiLink = this.applicationDataService.getEnvironment().SearchApi + '/search/stone/global/' +
        this.applicationDataService.getEnvironment().SearchApiVersion + '/all';
      url = apiLink;
      searchAuditType = 'globalSearch';
      const jsonBody = {
        'query': str,
        'refine': {
          'btbv_code': this.fetchBtbVersionList()
        }
      };
      jsonBody.refine.btbv_code.unshift(0);
      return this.http.post(url, JSON.stringify(jsonBody)).pipe(
        map((result) => {
          this.searchConfig = object;
          this.searchResultConfig = result;
          if (result['data'] && result['data'].body) {
            this.saveSearchStoneAudit(result['data'].body, this.searchConfig, searchAuditType);
          }
          return result;
        }),
        catchError(err => { 
          return this.errorHandler.handleError('SearchService:specificSearch', err); 
        })
      );
    } else {
      return this.http.post(url, JSON.stringify(jsonBody)).pipe(
        map((result) => {
          this.searchConfig = object;
          this.searchResultConfig = result;
          if (result['data'] && result['data'].body) {
            this.saveSearchStoneAudit(result['data'].body, this.searchConfig, searchAuditType);
          }
          return result;
        }),
        catchError(err => {
          return this.errorHandler.handleError('SearchService:specificSearch', err);
        })
      );
    }
  }

  fetchExclusiveStoneDetails(stoneIDList): Observable<any> {
    const config = {
      filter: {
        values: {
          stone_id: stoneIDList
        }
      }
    };
    return this.http.post(
      this.applicationDataService.getEnvironment().SearchApi + '/search/stone/' +
      this.applicationDataService.getEnvironment().SearchApiVersion + '/byQuery', JSON.stringify(config)).pipe(
        map((res) => {
          this.searchResultConfig = res;
          return res;
        }),
        catchError(err => this.errorHandler.handleError('SearchService:getStoneDetails', err))
      );
  }

  removeSavedSearchConfiguration() {
    this.selectedSearchData = [];
  }

  getSelectedFiltersValue() {
    return this.selectedSearchData;
  }

  setSelectedFiltersValue(selectedFilterData) {
    this.selectedSearchData = selectedFilterData;
  }

  getSearchConfigData() {
    return this.searchConfig;
  }

  getSearchResultData() {
    return this.searchResultConfig;
  }

  getValueList(array: any[]) {
    const listArray: any[] = [];
    array.forEach((element) => {
      const labelValue = new TitleCasePipe().transform(element.label);
      listArray.push({ label: labelValue, value: element.value });
    });
    return listArray;
  }

  getDetailedSavedSearchList(): Observable<any> {
    const body = {};
    return this.http.get(this.applicationDataService.getEnvironment().SearchApi + '/saved/search/' +
      this.applicationDataService.getEnvironment().SearchApiVersion + '/' + this.authService.getLoginName()).pipe(
      map((responseData) => {
        if (!responseData['error_status'] && responseData['data']) {
          return responseData['data'];
        }
      }),
      catchError(err => this.errorHandler.handleError('SearchService:getDetailedSavedSearchList', err))
      );
  }

  getSavedStonesList(name, criteria, btnType): Observable<any> {
    let type, searchType;
    switch (btnType) {
      case 'new': type = 'newArrival';
        searchType = 'normalSearch';
        break;
      case 'dayp': type = 'dayp';
        searchType = 'dayp';
        break;
      case 'b2b': type = 'b2b';
        searchType = 'b2b';
        break;
      default: type = 'all';
        searchType = 'normalSearch';
        break;
    }

    return this.http.get(this.applicationDataService.getEnvironment().SearchApi + '/search/stone/bySavedSearchName/' +
      this.applicationDataService.getEnvironment().SearchApiVersion + '/' + this.authService.getLoginName() + '/' + name + '/' + type).pipe(
        map((responseData) => {
          if (!responseData['error_status'] && responseData['data']) {
            this.searchResultConfig = responseData;
            this.getSavedSearchFilters(criteria);
            return responseData;
          }
        }),
        catchError(err => this.errorHandler.handleError('SearchService:getSavedStonesList', err))
      );
  }

  sortByDateTime(searchData) {
    searchData.sort(function (obj1, obj2) {
      if (obj1.created_on > obj2.created_on) {
        return -1;
      } else if (obj1.created_on < obj2.created_on) {
        return 1;
      } else {
        return 0;
      }
    });
    return searchData;
  }

  storeSavedSearch(saveSearchJson): Observable<any> {
    const savedSearchType = 'all';
    return this.http.put(this.applicationDataService.getEnvironment().SearchApi + '/saved/search/' +
      this.applicationDataService.getEnvironment().SearchApiVersion + '/'
      + this.authService.getLoginName() + '/' + savedSearchType, JSON.stringify(saveSearchJson)).pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('SearchService:storeSavedSearch', err))
      );
  }

  checkResultCount(data) {
    let count = 0;
    if (data) {
      data.forEach((result) => {
        if (result.name) {
          count++;
        }
      });
    }
    return count;
  }

  isSearchParamSelected() {
    let flag = false;
    let flagNot = false;
    const searchParam = this.createSearchCofigData();
    const keysOfValues = Object.keys(searchParam.values);
    const keysOfRange = Object.keys(searchParam.range);
    const keysOfValuesNot = Object.keys(searchParam.values_not);
    if ((keysOfValues.length > 0 || keysOfRange.length > 0 || keysOfValuesNot.length > 0)) {
      flag = true;
    }

    if (this.appStore.getData('modifyCount') !== undefined) {
      flag = true;
    }
    return flag;
  }

  resetSearchData() {
    this.searchConfig = {};
    this.selectedSearchData = [];
  }

  addTagsToStones(tags, stoneId): Observable<any> {
    let jsonBody = {};
    jsonBody['tags'] = tags;
    jsonBody = JSON.stringify(jsonBody);
    return this.http.post(this.applicationDataService.getEnvironment().SearchApi + '/stone/tags/add/' +
      this.applicationDataService.getEnvironment().SearchApiVersion + '/'
      + stoneId, jsonBody).pipe(
        map((res: Response) => {
          return res.json();
        }),
        catchError(err => this.errorHandler.handleError('SearchService:addTagsToStones', err))
      );
  }

  calculateFilteredStoneTable(tableData, filter) {
    const resultArray = [];
    if (filter.key.indexOf('#') === 0) {
      filter.key = filter.key.replace('#', '');
    }
    filter.value.forEach(val => {
      tableData.forEach(stone => {
        for (const key in stone) {
          if (key === filter.key) {
            if (stone[key].hasOwnProperty('id')) {
              if (stone[key].id === +val) {
                resultArray.push(stone);
              }
            }
          }
        }
      });
    });
    return resultArray;
  }

  isCaratSelected() {
    let flag = false;
    this.selectedSearchData.forEach(element => {
      if ((element.key === '#carat' || element.key === 'carat')
        && ( Array.isArray(element.value) && element.value.length > 0) ) {
        flag = true;
      }
    });
    return flag;
  }

  getNewUploadedStones(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().SearchApi + '/search/stone/upload24hours/' +
      this.applicationDataService.getEnvironment().SearchApiVersion).pipe(
      map((responseData) => {
        if (!responseData['error_status'] && responseData['data']) {
          this.searchResultConfig = responseData;
        }
        return responseData;
      }),
      catchError(err => this.errorHandler.handleError('SearchService:getNewUploadedStones', err))
      );
  }

  fetchSelectedStones(array, id) {
    let stoneAlreadySelected = false;
    if (array.selectedStoneTable && array.selectedStoneTable.length > 0) {
      array.selectedStoneTable.forEach((selectedStone) => {
        if (selectedStone.stone_id === id) {
          const i = array.selectedStoneTable.indexOf(selectedStone);
          array.selectedStoneTable.splice(i, 1);
          stoneAlreadySelected = true;
        }
      });
    } else {
      array.selectedStoneTable = [];
    }
    if (array.filteredStone && array.filteredStone.length > 0) {
      array.filteredStone.forEach((filterStone) => {
        if (filterStone === id) {
          const i = array.filteredStone.indexOf(filterStone);
          array.filteredStone.splice(i, 1);
        }
      });
    } else {
      array.filteredStone = [];
    }
    if (!stoneAlreadySelected) {
      array.diamondTable.forEach((stoneInfo) => {
        if (stoneInfo.stone_id === id) {
          stoneInfo = JSON.parse(JSON.stringify(stoneInfo));
          array.selectedStoneTable.push(stoneInfo);
          array.filteredStone.push(id);
        }
      });
    } else {
      array.isAllResultSelected = false;
    }
    array.isAllSelected = this.isArrayMatch(array.selectedStoneButton, array.filteredStone);
    if (array.selectedStoneTable.length === array.diamondTable.length) {
      array.isAllResultSelected = this.isArrayMatch(array.selectedStoneButton, array.filteredStone);
    }
    if (array.selectedStoneTable.length === 0) {
      array.toggleTableDisplay = false;
    }
    return array;
  }


  fetchPairDiamonds(stoneId, stones) {
    let pairStones = [];
    const selectedStonePair = stones.filter(diamond => {
      return stoneId === diamond.stone_id;
    });
    if (selectedStonePair) {
      pairStones = stones.filter(diamond => {
        return selectedStonePair[0].std_grp_no === diamond.std_grp_no;
      });
    }
    return pairStones;
  }

  isArrayMatch(array, array2) {
    let flag = false;
    if (array.length === array2.length) {
      flag = true;
      array.forEach(function (value) {
        if (flag && array2.indexOf(value) > -1) {
          flag = true;
        } else {
          flag = false;
        }
      });
    }
    return flag;
  }

  fetchSearchFootnote(object, searchFor, searchString, code): Observable<any> {
    if (object.hasOwnProperty('values') && object.values) {
      if (SearchTypeComparator.AreEqual(searchString, SearchType.GENERAL_SEARCH)
        || SearchTypeComparator.AreEqual(searchString, SearchType.TWIN_DIAMOND_SEARCH)) {
        object.values['btbv_code'] = this.fetchBtbVersionList();
        object.values.btbv_code.unshift(0);
      }
      if (SearchTypeComparator.AreEqual(searchString, SearchType.B2B_SEARCH)) {
        object.values['btbv_code'] = this.fetchBtbVersionList();
        if (object.values['btbv_code'].length === 0) {
          object.values['btbv_code'] = [0];
        }
      }
      object.values['btbv_code'] = _.uniq(object.values['btbv_code']);
    }
    let url;
    if (code) {
      url = this.applicationDataService.getEnvironment().SearchApi + '/count/stone/footnote/' +
        this.applicationDataService.getEnvironment().SearchApiVersion + '/' + searchFor + '?filter=' + JSON.stringify(object)
        + '&event_id=' + code;
    } else {
      url = this.applicationDataService.getEnvironment().SearchApi + '/count/stone/footnote/' +
        this.applicationDataService.getEnvironment().SearchApiVersion + '/' + searchFor + '?filter=' + JSON.stringify(object);
    }
    return this.http.get(url).pipe(
      map(res => res),
      catchError(err => this.errorHandler.handleError('SearchService:fetchSearchFootnote', err))
    );
  }

  createSearchParamObject(config) {
    const searchParamObj = [];
    if (config.hasOwnProperty('range')) {
      for (const obj in config.range) {
        if (config.range.hasOwnProperty(obj)) {
          const searchObj = {
            'key': '#' + obj,
            'value': config.range[obj]
          };
          searchParamObj.push(searchObj);
        }
      }
    }
    if (config.hasOwnProperty('values_not')) {
      for (const obj in config.values_not) {
        if (config.values_not.hasOwnProperty(obj)) {
          const searchObj = {
            'key': obj + '-dislike',
            'value': config.values_not[obj]
          };
          searchParamObj.push(searchObj);
        }
      }
    }
    if (config.hasOwnProperty('values')) {
      for (const obj in config.values) {
        if (config.values.hasOwnProperty(obj)) {
          let searchObj = {};
          if (obj === 'color') {
            for (const colorObj in config.values[obj]) {
              if (config.values[obj].hasOwnProperty(colorObj)) {
                const colorKeyName = colorObj.hasOwnProperty('fancy_color') ? 'COLOR-FANCY-' : 'COLOR-';
                searchObj = {
                  'key': colorKeyName + colorObj,
                  'value': config.values[obj][colorObj]
                };
                searchParamObj.push(searchObj);
              }
            }
          } else if (obj === 'kts' || obj === 'sgs') {
            searchObj = {
              'key': obj + '-like',
              'value': config.values[obj]
            };
            searchParamObj.push(searchObj);
          } else {
            searchObj = {
              'key': obj,
              'value': config.values[obj]
            };
            searchParamObj.push(searchObj);
          }
        }
      }
    }
    return searchParamObj;
  }

  deleteSavedSearch(savedSearchIds): Observable<any> {
    const deleteObj = {
      saved_search_ids: [savedSearchIds]
    };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(deleteObj)
    };
    return this.http.delete(this.applicationDataService.getEnvironment().SearchApi + '/saved/search/' +
      this.applicationDataService.getEnvironment().SearchApiVersion + '/' + this.authService.getLoginName(), httpOptions
      ).pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('SearchService:deleteSavedSearch', err))
      );
  }

  editSavedSearch(savedSearchData, isRenamed): Observable<any> {
    let apiLink;
    if (isRenamed) {
      apiLink = this.applicationDataService.getEnvironment().SearchApi + '/saved/search/edit/' +
        this.applicationDataService.getEnvironment().SearchApiVersion + '/' + this.authService.getLoginName();
      // + '?isRename=' + isRenamed;
    } else {
      apiLink = this.applicationDataService.getEnvironment().SearchApi + '/saved/search/edit/' +
        this.applicationDataService.getEnvironment().SearchApiVersion + '/' + this.authService.getLoginName();
    }
    return this.http.put(apiLink, JSON.stringify(savedSearchData)).pipe(
      map(res => res),
      catchError(err => this.errorHandler.handleError('SearchService:editSavedSearch', err))
    );
  }

  getSavedSearchFilters(criteria) {
    if (criteria) {
      const filterObj = JSON.parse(criteria);
      if (filterObj.hasOwnProperty('filter')) {
        this.searchConfig = filterObj.filter;
        this.selectedSearchData = this.createSearchParamObject(this.searchConfig);
      }
    }
  }

  initializeSearchValues(value) {
    value = value.trim();
    let array = [];
    if ((value).indexOf(',') > -1) {
      array = (value).split(' ').join('').split(',');
    } else {
      array = (value).split(' ');
    }
    return array;
  }

  getSearchInPage(searchValues, searchType, event_id): Observable<any> {
    let type, apiLink, searchAuditType;
    switch (searchType) {
      case 'TWIN_DIAMOND_SEARCH': type = 'std';
        searchAuditType = 'std';
        break;
      case 'DAYP_SEARCH': type = 'dayp';
        searchAuditType = 'dayp';
        break;
      case 'EVENT_SEARCH': type = 'event';
        searchAuditType = 'event';
        break;
      case 'B2B_SEARCH': type = 'b2b';
        searchAuditType = 'b2b';
        break;
      default: type = 'all';
        searchAuditType = 'globalSearch';
        break;
    }
    const str = searchValues.join();
    let jsonBody;
    if (searchType === 'EVENT_SEARCH') {
      apiLink = this.applicationDataService.getEnvironment().SearchApi + '/search/stone/global/' +
        this.applicationDataService.getEnvironment().SearchApiVersion + '/' + type;
      jsonBody = {
        'query': str,
        'is_page_search': true,
        'event_id': event_id
      };
    } else {
      apiLink = this.applicationDataService.getEnvironment().SearchApi + '/search/stone/global/' +
        this.applicationDataService.getEnvironment().SearchApiVersion + '/' + type;
      jsonBody = {
        'query': str,
        'is_page_search': true
      };
      if (SearchTypeComparator.AreEqual(searchType, SearchType.GENERAL_SEARCH)
        || SearchTypeComparator.AreEqual(searchType, SearchType.TWIN_DIAMOND_SEARCH) || SearchTypeComparator.AreEqual(searchType, SearchType.DAYP_SEARCH)) {
        jsonBody['refine'] = {};
        jsonBody['refine']['btbv_code'] = this.fetchBtbVersionList();
        jsonBody.refine.btbv_code.unshift(0);
      } else if (SearchTypeComparator.AreEqual(searchType, SearchType.B2B_SEARCH)) {
        jsonBody['refine'] = {};
        jsonBody['refine']['btbv_code'] = this.fetchBtbVersionList();
        if (jsonBody['refine']['btbv_code'].length === 0) {
          jsonBody.refine.btbv_code.unshift(0);
        }
      }
      jsonBody['refine']['btbv_code'] = _.uniq(jsonBody['refine']['btbv_code']);
    }
    const url = apiLink;
    return this.http.post(url, JSON.stringify(jsonBody)).pipe(
        map((result) => {
          this.searchResultConfig = result;
          return result;
        }),
        catchError(err => this.errorHandler.handleError('PageSearchService:getSearchInPage', err))
    );
  }

  fetchRecommendedStones(cardParam): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().StoneManagementApi + '/stonemgt/' + this.authService.getLoginName() +
      '/recommendation/stone/' + this.applicationDataService.getEnvironment().SearchApiVersion +
      '?recommendation_type=' + cardParam).pipe(
        map((responseData) => {
          if (!responseData['error_status'] && responseData['data']) {
            const newBody = {};
            newBody['data'] = {};
            newBody['data']['body'] = responseData['data'];
            this.searchResultConfig = newBody;
          }
          return responseData;
        }),
        catchError(err => this.errorHandler.handleError('SearchService:fetchRecommendedStones', err))
      );
  }

  removeTagsToStones(tags, stoneId): Observable<any> {
    let jsonBody = {};
    jsonBody['tags'] = tags;
    jsonBody = JSON.stringify(jsonBody);
    return this.http.post(this.applicationDataService.getEnvironment().SearchApi + '/stone/tags/delete/' +
      this.applicationDataService.getEnvironment().SearchApiVersion + '/'
      + stoneId, jsonBody).pipe(
        map((res) => {
          return res;
        }),
        catchError(err => this.errorHandler.handleError('SearchService:removeTagsToStones', err))
      );
  }

  sendSavedSearchEmail(jsonObject): Observable<any> {
    const obj = {
      'saved_search_list': jsonObject
    };
    return this.http.post(this.applicationDataService.getEnvironment().ExcelManagementApi + '/excelmgnt/sendExcelInMail/savedSearch/' +
      this.applicationDataService.getEnvironment().ExcelManagementApiVersion, JSON.stringify(obj)).pipe(
        map((res) => {
          return res;
        }),
        catchError(err => this.errorHandler.handleError('SearchService:sendSavedSearchEmail', err))
      );
  }

  operateMail(jsonObject): Observable<any> {
    return this.http.post(this.applicationDataService.getEnvironment().SearchApi + '/saved/search/sentMail/' +
      this.applicationDataService.getEnvironment().SearchApiVersion, JSON.stringify(jsonObject)).pipe(
      map((res) => {
        return res;
      }),
      catchError(err => this.errorHandler.handleError('SavedSearch:operateMail', err))
      );
  }

  notifyFooterButtons(config) {
    const finishingValues = config.values;
    if (this.isVgSelection(finishingValues)) {
      this.notifyService.notifyFinishingValueChange({ vgFlag: true });
    } else {
      this.notifyService.notifyFinishingValueChange({ vgFlag: false });
    }
    if (this.isExSelection(finishingValues)) {
      this.notifyService.notifyFinishingValueChange({ exFlag: true });
    } else {
      this.notifyService.notifyFinishingValueChange({ exFlag: false });
    }
    if (this.isNoBgmSelection(finishingValues.luster, finishingValues.shade)) {
      this.notifyService.notifyBGMChange({ bgmFlag: true });
    } else {
      this.notifyService.notifyBGMChange({ bgmFlag: false });
    }
  }

  isVgSelection(values) {
    return values.cut
      && values.cut.length === 2
      && values.cut.indexOf(1) !== -1
      && values.cut.indexOf(2) !== -1
      && values.polish
      && values.polish.length === 2
      && values.polish.indexOf(1) !== -1
      && values.polish.indexOf(2) !== -1
      && values.symmetry
      && values.symmetry.length === 2
      && values.symmetry.indexOf(1) !== -1
      && values.symmetry.indexOf(2) !== -1;
  }

  isExSelection(values): boolean {
    return values.cut
      && values.cut.length === 1
      && values.cut[0] === 1
      && values.polish
      && values.polish.length === 1
      && values.polish[0] === 1
      && values.symmetry
      && values.symmetry.length === 1
      && values.symmetry[0] === 1;
  }

  isNoBgmSelection(luster, shade): boolean {
    return luster
      && luster.length === 1
      && luster[0] === 1
      && shade
      && shade.length === 1
      && shade[0] === 1;
  }

  saveSearchStoneAudit(array, config, type) {
    if (array && array.length > 0) {
      const stoneIdList = [];
      array.forEach((stone) => {
        if (stone.stone_id) {
          stoneIdList.push(stone.stone_id);
        }
      });
      this.auditService.saveSearchedStoneAudit(stoneIdList, config, type).subscribe(res => { });
    }
  }

  setCardFlag(object) {
    this.resultFromUploadedCard = object;
  }

  getCardFlag() {
    return this.resultFromUploadedCard;
  }

  getBtbVersionList(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().B2BApi + '/btob/' +
      this.authService.getLoginName() + '/permission/getBTBVersion/' +
      this.applicationDataService.getEnvironment().SearchApiVersion).pipe(
      map((responseData) => {
        if (responseData && responseData['code'] &&
          MessageCodesComparator.AreEqual(responseData['code'], MessageCodes.B2B_GET_VERSION_200)) {
          this.setBtbVersionsList(responseData);
        }
        return responseData;
      }),
      catchError(err => this.errorHandler.handleError('SearchService:getBtbVersionList', err))
    );
  }

  setBtbVersionsList(obj) {
    if (obj.hasOwnProperty('data') && obj.data) {
      this.btbVersionList = obj.data;
    }
  }

  fetchBtbVersionList() {
    return this.btbVersionList;
  }
}
