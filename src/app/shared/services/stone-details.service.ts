import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { AuthService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import * as _ from 'underscore';
import { Subject, Observable } from '../../../../node_modules/rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class StoneDetailsService {
  private discountColumnsFlag: any[] = [];
  private priceInfo: any;
  private priceInfoObservable = new Subject<any>();
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private appStore: ApplicationStorageService,
    private applicationDataService: ApplicationDataService,
    private authService: AuthService) { }

  getStoneDetails(stoneIDList): Observable<any> {
    const config = {
      filter: {
        values: {
          stone_id: stoneIDList
        }
      }
    };
    return this.http.post(
      this.applicationDataService.getEnvironment().SearchApi + '/search/stone/' +
      this.applicationDataService.getEnvironment().SearchApiVersion + '/byQuery', JSON.stringify(config))
      .pipe(
        map((res) => {
          const responseData = res;
          if (!responseData['error_status']) {
            if (responseData['data'].body.length > 0) {
              const stoneInfo = responseData['data'].body;
              return stoneInfo;
            }
          }
        }),
        catchError(err => this.errorHandler.handleError('StoneDetailsService:getStoneDetails', err))
      );
  }

  getStoneDetailsByPairId(pairId): Observable<any> {
    const config = {
      filter: {
        values: {
          std_grp_no: pairId
        }
      }
    };
    return this.http.post(
      this.applicationDataService.getEnvironment().SearchApi + '/search/stone/' +
      this.applicationDataService.getEnvironment().SearchApiVersion + '/byQuery', JSON.stringify(config))
      .pipe(
        map((res) => {
          const responseData = res;
          if (!responseData['error_status']) {
            if (responseData['data'].body.length > 0) {
              const stoneInfo = responseData['data'].body;
              return stoneInfo;
            }
          }
        }),
        catchError(err => this.errorHandler.handleError('StoneDetailsService:getStoneDetails', err))
      );
  }

  checkDuplicateStones(array: any[], IDs: any[]) {
    if (IDs && IDs.length > 0) {
      array.forEach((stone) => {
        IDs.forEach(id => {
          if (stone.stone_id === id) {
            const i = IDs.indexOf(id);
            IDs.splice(i, 1);
          }
        });
      });
    }
    return IDs;
  }

  removeDuplicatesFromObject(array, name) {
    const output = [];
    const keys = [];
    array.forEach((item) => {
      const key = item[name];
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        output.push(item);
      }
    });
    return output;
  }

  removeDuplicateItemFromArray(array) {
    const a = [];
    for (let i = 0; i < array.length; i++) {
      const current = array[i];
      if (a.indexOf(current) < 0) { a.push(current); }
    }
    array.length = 0;
    for (let i = 0; i < a.length; i++) {
      array.push(a[i]);
    }
    return array;
  }

  storeStoneAdditionalInfo(stoneArray): Observable<any> {
    const stoneJson = {};
    stoneJson['stone_ids'] = this.createStoneIdList(stoneArray);
    return this.http.post(this.applicationDataService.getEnvironment().DashboardApi
      + '/dashboard/card/stoneDetail/' + this.applicationDataService.getEnvironment().DashboardVersion, JSON.stringify(stoneJson))
      .pipe(
        map((res) => {
          const response = res;
          if (!response['error_status']) {
            stoneArray = this.addStoneAdditionalInfo(stoneArray, response['data']);
          }
          return stoneArray;
        }),
        catchError(err => this.errorHandler.handleError('StoneDetailsService:storeStoneAdditionalInfo', err))
      );
  }

  storeStoneAdditionalInfoForGrid(stoneArray): Observable<any> {
    const stoneJson = {};
    stoneJson['stone_ids'] = this.createStoneIdList(stoneArray);
    return this.http.post(this.applicationDataService.getEnvironment().DashboardApi
      + '/dashboard/card/stoneDetail/' + this.applicationDataService.getEnvironment().DashboardVersion, JSON.stringify(stoneJson))
      .map((res: Response) => {
        const response = res.json();
        return response;
      })
      .catch(err => {
        return this.errorHandler.handleError('StoneDetailsService:storeStoneAdditionalInfoForGrid', err);
      });
  }

  createStoneIdList(stoneArray) {
    const stoneIdList = [];
    if (stoneArray && stoneArray.length > 0) {
      stoneArray.forEach((stone) => {
        if (stone.stone_id) {
          stoneIdList.push(stone.stone_id);
        }
      });
    }
    return stoneIdList;
  }

  addStoneAdditionalInfo(stoneArray, stoneInfo) {
    stoneArray.forEach((stone) => {
      const stoneId = stone.stone_id;
      if (stoneInfo.hasOwnProperty(stoneId)) {
        let viewRequestCount;
        stone['viewRequestStatus'] = stoneInfo[stoneId].is_stone_viewed_status;
        if (stone.viewRequestStatus && stone.viewRequestStatus === 2) {
          viewRequestCount = stoneInfo[stoneId].count_of_stone_viewed_request_by_me
            ? stoneInfo[stoneId].count_of_stone_viewed_request_by_me : 0;
        } else {
          viewRequestCount = stoneInfo[stoneId].count_of_stone_view_request_by_me
            ? stoneInfo[stoneId].count_of_stone_view_request_by_me : 0;
        }
        stone['totalViewed'] = stoneInfo[stoneId].count_of_stone_viewed_by_others ? stoneInfo[stoneId].count_of_stone_viewed_by_others : 0;
        stone['totalViewedByUser'] = stoneInfo[stoneId].count_of_stone_viewed_by_party
          ? stoneInfo[stoneId].count_of_stone_viewed_by_party : 0;
        stone['totalViewRequest'] = viewRequestCount;
        stone['viewRequestParty'] = stoneInfo[stoneId].count_of_stone_viewed_request_by_party;
        stone['isRecommended'] = stoneInfo[stoneId].is_recommended_available;
        stone['isBasket'] = stoneInfo[stoneId].is_basket_available;
        stone['basketStatus'] = stoneInfo[stoneId].status_basket;
        stone['isTwin'] = stoneInfo[stoneId].is_std_stone;
        stone['btbStatus'] = stoneInfo[stoneId].btb_stone_status;
        stone['isDDC'] = stoneInfo[stoneId].is_ddc_active;
        stone['ddcHour'] = stoneInfo[stoneId].ddch_code;
        stone['ddcStatus'] = stoneInfo[stoneId].ddc_status;
        stone['isDayP'] = stoneInfo[stoneId].dayp_stone_status;
        stone['isBtbUpdated'] = stoneInfo[stoneId].is_stone_in_b2b_submit;
        stone['daypOfferCount'] = stoneInfo[stoneId].dayp_offer_count ? stoneInfo[stoneId].dayp_offer_count : 0;
        stone['countryCode'] = stoneInfo[stoneId].country_code ? '/assets/img/' + stoneInfo[stoneId].country_code + '.png' : null;
        stone['tooltipMessage'] = stoneInfo[stoneId].tooltip_message;
        stone['showHoldIcon'] = stoneInfo[stoneId].show_hold_icon;
      }
    });
    return stoneArray;
  }

  calculateSelectedStoneData(stoneData) {
    const resultObject = {
      'avg_rate': 0.0,
      'total_carat': 0.0,
      'avg_rap_rate': 0.0,
      'avg_rap_off': 0.0,
      'final_payable': 0.0,
      'wvd_off': 0.0,
      'online_off': 0.0,
      'term_off': 0.0,
      'f_off': 0.0,
      'total_fCt': 0.0,
      'coop_off': 0.0,
      'event_off': 0.0,
      'total_stone_count': 0,
      'total_amount': 0.0
    };
    if (stoneData && stoneData.length > 0) {
      stoneData.forEach((stone) => {
        resultObject.avg_rate += Number(stone.price_srk) * Number(stone.carat);
        resultObject.total_carat += Number(stone.carat);
        resultObject.avg_rap_rate += Number(stone.price_rap) * Number(stone.carat);
        resultObject.wvd_off += Number(stone.wvdPercent);
        resultObject.coop_off += Number(stone.coopPercent);
        resultObject.event_off += stone.eventPercent;
        resultObject.term_off += Number(stone.termPercent);
        resultObject.total_fCt += stone.fDollarCaratAmount * stone.carat;
        resultObject.final_payable += stone.fAmount;
        if (stone.blindDiscount && stone.blindDiscount !== null) {
          resultObject.online_off = (this.getDecimalNumber(stone.blindDiscount));
        }
      });
      resultObject.avg_rate = resultObject.avg_rate / resultObject.total_carat;
      resultObject.avg_rap_rate = resultObject.avg_rap_rate / resultObject.total_carat;
      resultObject.coop_off = resultObject.coop_off / stoneData.length;
      resultObject.event_off = resultObject.event_off / stoneData.length;
      resultObject.avg_rap_off = ((resultObject.avg_rap_rate - resultObject.avg_rate) / (resultObject.avg_rap_rate)) * 100;
      resultObject.wvd_off = resultObject.wvd_off / stoneData.length;
      resultObject.term_off = resultObject.term_off / stoneData.length;
      resultObject.total_fCt = resultObject.total_fCt / resultObject.total_carat;
      resultObject.f_off = ((resultObject.avg_rap_rate - resultObject.total_fCt) / (resultObject.avg_rap_rate)) * 100;
      resultObject.total_stone_count = stoneData.length;
      resultObject.total_amount = (resultObject.avg_rate * resultObject.total_carat);
    }
    return resultObject;
  }

  getDecimalNumber(value) {
    const with4Decimals = Number((Math.round(value * 10000) / 10000).toString().match(/^-?\d+(?:\.\d{0,4})?/)[0]);
    return with4Decimals;
  }

  getDiamondPriceInfo(stoneArray): Observable<any> {
    const stoneJson = {};
    stoneJson['stone_ids'] = this.createPriceInfoJson(stoneArray);
    const jsonObject = _.extend(this.getPriceExportValue(), stoneJson);
    delete jsonObject.conversion_rate;
    delete jsonObject.dayp_conversion_rate;
    // delete jsonObject.is_event_discount_active;
    // delete jsonObject.is_blind_discount_active;
    // delete jsonObject.is_wvd_active;
    return this.http.post(this.applicationDataService.getEnvironment().StoneManagementApi + '/stonemgt/' + this.authService.getLoginName() +
      '/stone/discount/' + this.applicationDataService.getEnvironment().StoneManagementApiVersion, JSON.stringify(jsonObject))
      .pipe(
        map((res) => {
          const response = res;
          if (!response['error_status']) {
            if (response['data'] && response['data'].hasOwnProperty('average_blind_discount')) {
              stoneArray =
              this.addPriceAdditionalInfo(stoneArray, response['data'], response['data'].average_blind_discount.avg_blind_percentage);
            }
          }
          return stoneArray;
        }),
        catchError(err => this.errorHandler.handleError('StoneDetailsService:getDiamondPriceInfo', err))
      );
  }

  addPriceAdditionalInfo(stoneArray, stoneInfo, blindDiscount) {
    if (stoneArray && stoneArray.length > 0) {
      stoneArray.forEach((stone) => {
        const stoneId = stone.stone_id;
        if (stoneInfo.hasOwnProperty(stoneId)) {
          stone['oAmount'] = Number(stoneInfo[stoneId].amount).toFixed(2);
          stone['onlinePercent'] = stoneInfo[stoneId].blindDiscount;
          stone['termPercent'] = stoneInfo[stoneId].termDiscount;
          stone['wvdPercent'] = stoneInfo[stoneId].wvdDiscount;
          stone['coopPercent'] = stoneInfo[stoneId].coOpDiscount;
          stone['eventPercent'] = stoneInfo[stoneId].eventDiscount;
          stone['fOffPercent'] = stoneInfo[stoneId].rap_off;
          stone['fAmount'] = stoneInfo[stoneId].finalAmount;
          stone['fDollarCaratAmount'] = Number(stoneInfo[stoneId].final$Ct).toFixed(2);
          stone['blindDiscount'] = blindDiscount;
        }
      });
    }
    return stoneArray;
  }

  updateDataTable(table, response, stoneId) {
    table.forEach(stoneObject => {
      if (stoneObject.stone_id === stoneId) {
        const i = table.indexOf(stoneObject);
        if (response.source === 'confirmedStones') {
          table.splice(i, 1);
        } else if (response.source === 'viewRequested') {
          if (table[i].viewRequestStatus !== 2) {
            table[i]['totalViewRequest']++;
          }
        } else if (response.source === 'ddcRequested') {
          table[i]['ddcStatus'] = response.status;
          table[i]['ddcHour'] = response.hour;
        } else if (response.source === 'basketRequested') {
          table[i]['isBasket'] = 1;
          table[i]['basketStatus'] = '=';
        } else if (response.source === 'holdRequested') {
          table[i]['isOnHold'] = 6;
          table.splice(i, 1);
        } else if (response.source === 'b2bRequested') {
          table[i]['isBtbUpdated'] = response.status;
        } else if (response.source === 'onlineViewIncrement') {
          table[i]['totalViewedByUser']++;
        }
      }
    });
    return table;
  }

  removeElement(array, element) {
    const i = array.indexOf(element);
    array.splice(i, 1);
  }

  incrementStoneView(stoneId): Observable<any> {
    return this.http.post(this.applicationDataService.getEnvironment().DashboardApi
      + '/dashboard/card/auditStone/'
      + this.applicationDataService.getEnvironment().DashboardVersion + '?stoneId=' + stoneId, {})
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('StoneDetailsService:incrementStoneView', err))
      );
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

  getColumnsVisibleFlag() {
    return this.priceInfo;
  }

  addTwinStoneInfoTab(resPairStones, tabs) {
    this.removeIfSameTwinStoneInfoTabIsPresent(resPairStones[0].std_grp_no, tabs);
    this.createNewTwinStoneInfoTab(resPairStones[0].std_grp_no, resPairStones, tabs);
  }

  removeIfSameTwinStoneInfoTabIsPresent(pairId, tabs) {
    tabs.forEach((element) => {
      if (element.pairId === pairId) {
        this.removeTwinDiamondTab(element.pairId, tabs);
      }
    });
  }

  createNewTwinStoneInfoTab(std_grp_no, twinStones, tabs) {
    tabs.push({
      pairId: std_grp_no,
      twinStones: twinStones,
      order: 3
    });
  }

  removeTwinDiamondTab(name, tabs) {
    tabs.forEach((element) => {
      if (element.pairId === name) {
        this.removeElement(tabs, element);
      }
    });
  }

  setStonePacketCount(array) {
    if (array && array.length > 0) {
      array.forEach(stone => {
        stone.packet_count = 0;
      });
    }
    return array;
  }

  updateStonePacketCount(event, array) {
    if (array && array.length > 0 && event && event.array && event.array.length > 0) {
      event.array.forEach(object => {
        object.stones.forEach(id => {
          array.forEach(stone => {
            if (stone.stone_id === id) {
              if (stone.packet_count >= 1) {
                stone.packet_count++;
              } else {
                stone.packet_count = 1;
              }
            }
          });
        });
      });
    }
    return array;
  }

  updatePacketName(config, array) {
    if (array && array.length > 0 && config && config.length > 0) {
      array.forEach(stone => {
        let packetNameList = [];
        config.forEach(object => {
          object.stones.forEach(id => {
            if (stone.stone_id === id) {
              packetNameList.push(object.packet_name);
              packetNameList = this.removeDuplicateItemFromArray(packetNameList);
              stone['stone_packet'] = packetNameList.toString();
            }
          });
        });
      });
    }
    return array;
  }

  scrollLeft(container, id) {
    const scrollable = container.instance.getScrollable(id);
    scrollable.scrollBy({ left: -40, top: 0 });
  }

  scrollRight(container, id) {
    const scrollable = container.instance.getScrollable(id);
    scrollable.scrollBy({ left: 40, top: 0 });
  }

  getTagDetails(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/tag/' + this.applicationDataService.getEnvironment().StoneManagementApiVersion)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('StoneDetailsService:getTagDetails', err))
      );
  }

  getTagVoteMapping(stoneId): Observable<any> {
    const stoneJson = {};
    stoneJson['stone_id'] = stoneId;
    return this.http.post(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/tag/stoneWiseTags/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion,
      JSON.stringify(stoneJson))
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('StoneDetailsService:getTagVoteMapping', err))
      );
  }

  storeUserActionOnTag(stoneId, tagId, actionType): Observable<any> {
    const stoneJson = {};
    stoneJson['stone_id'] = stoneId;
    stoneJson['tag_id'] = tagId;
    stoneJson['action_type'] = actionType;

    return this.http.post(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/tag/storeAction/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion,
      JSON.stringify(stoneJson))
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('StoneDetailsService:storeUserActionOnTag', err))
      );
  }

  attachTagToStones(stoneId, tagId, tagName): Observable<any> {
    const stoneJson = {};
    stoneJson['stone_id'] = stoneId;
    stoneJson['tag_id'] = +tagId;
    stoneJson['tag_name'] = tagName;
    return this.http.post(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/tag/attach/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion,
      JSON.stringify(stoneJson))
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('StoneDetailsService:attachTagToStones', err))
      );
  }

  changeRowColor(array, status) {
    if (array) {
      const color = status ? '#d9edf7' : '#fff';
      array.css('background', color);
    }
  }

  onCellPrepared(e, array) {
    if (e.rowType === 'data') {
      array.forEach(stoneId => {
        if (e.key.stone_id === stoneId) {
          this.changeRowColor(e.cellElement, true);
        }
      });
    }
  }

  createPriceInfoJson(stoneDetails) {
    const object = {};
    if (stoneDetails && stoneDetails.length > 0) {
      stoneDetails.forEach(stone => {
        const stoneObj = {
          'price_srk': Number(stone.price_srk),
          'rap_off': (stone.rap_off),
          'amount': Number(stone.price_srk * stone.carat),
          'i_carat': Number(stone.carat),
          'price_rap': Number(stone.price_rap),
          'is_blind_allowed': stone.viewRequestStatus === 2 ? 0 : 1
        };
        object[stone.stone_id] = stoneObj;
      });
    }
    return object;
  }

  getConfirmedExportMemo(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().StoneManagementApi + '/stonemgt/' + this.authService.getLoginName()
      + '/confirmedExportedAmount/' + this.applicationDataService.getEnvironment().StoneManagementApiVersion)
      .pipe(
        map((response) => {
          if ( MessageCodesComparator.AreEqual(response['code'], MessageCodes.SMS_MSG_WVD_SUCCSS_CONFIRMED_EXPORTED_MEMO_AMOUNT_200) ) {
            this.priceInfoObservable.next(response['data']);
            this.priceInfo = response['data'];
          }
          return response;
        }),
        catchError(err => this.errorHandler.handleError('WebUserService:getConfirmedExportMemo', err))
      );
  }

  getPriceExportValue() {
    delete this.priceInfo.week_number;
    return this.priceInfo;
  }

  showRowColorChanges(container, selectedStones, stoneId, index) {
    let status = false;
    if(selectedStones.indexOf(stoneId) > -1) {
      status = true;
    }
    const data = container.instance.getRowElement(index);
    this.changeRowColorElement(data, status);
  }

  changeRowColorElement(data, status) {
    if (data) {
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].cells.length; j++) {
          data[i].cells[j].style.backgroundColor = status ? '#d9edf7' : '#fff';
        }
      }
    }
  }

  getTwoDecimalNumber(value) {
    const with2Decimals = Number((Math.round(value * 10000) / 10000).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]);
    return with2Decimals;
  }

  getB2BPopupData(APIResponse, data) {
    if (APIResponse.stone_id === data['stone_id']) {
      // const calDiff = this.getTwoDecimalNumber((data['rap_off']) - (APIResponse.bid_percentage));
      const calDiff = this.getTwoDecimalNumber(((Number(APIResponse.bid_rate) - Number(data.price_srk)) / Number(data.price_srk)) * 100);
      data['bid_rate'] = APIResponse.bid_rate;
      data['offer_per_disc'] = APIResponse.bid_percentage;
      data['offer_per_disc_diff'] = calDiff;
      data['difference'] = calDiff;
      data['final_submit'] = APIResponse.final_submit;
    }
  }

  handleSortingOrder(gridContainer) {
    let soretedColumn;
    let sortedOrder;
    const selectedFilter = [];

    for (let i = 0; i < gridContainer.columns.length; i++) {
      if (Number.isInteger(gridContainer.instance.columnOption(i, 'sortIndex'))) {
        soretedColumn = i;
        sortedOrder = gridContainer.instance.columnOption(i, 'sortOrder');
        setTimeout(() => {
          gridContainer.instance.columnOption(soretedColumn, 'sortOrder', sortedOrder);
        }, 500);
      }
    }
    for (let i = 0; i < gridContainer.columns.length; i++) {
      if (gridContainer.instance.columnOption(i)['filterValues'] != null) {
        selectedFilter.push(i, gridContainer.instance.columnOption(i, 'filterValues'));
      }
    }
    setTimeout(() => {
      for (let columnindex = 0; columnindex < selectedFilter.length;) {
        gridContainer.instance.columnOption(selectedFilter[columnindex], 'filterValues', selectedFilter[columnindex + 1]);
        columnindex = columnindex + 2;
      }
    }, 500);
  }

  fetchStoneAdditionalInfo(array) {
    this.storeStoneAdditionalInfo(array).subscribe(res => {
      array = res;
    });
    return array;
  }

  getPriceInfoObservable(): Observable<any> {
    return this.priceInfoObservable.asObservable();
  }

  showFinalPayableAndFinalOff() {
    return this.authService.hasElementPermission('terms_discount') ||
      this.authService.hasElementPermission('blind_discount') ||
      this.authService.hasElementPermission('weekly_volume_discount') ||
      this.authService.hasElementPermission('co_op_discount') ||
      this.authService.hasElementPermission('event_discount');
  }

  returnPositionOfOverlay(event) {
    let targetElementOffset;
    let newTargetElementOffset;
    for (let i = 0; i < jQuery('[data-id=' + String(event.stoneId.stone_id) + ']')[0].childNodes.length; i++) {
      if (jQuery('[data-id=' + String(event.stoneId.stone_id) + ']')[0].childNodes[i] &&
        jQuery('[data-id=' + String(event.stoneId.stone_id) + ']')[0].childNodes[i].firstChild['className']
        && jQuery('[data-id=' + String(event.stoneId.stone_id) + ']')[0].childNodes[i].firstChild['className'].indexOf('grid-icon icon-media') > -1) {
        newTargetElementOffset = jQuery('[data-id=' + String(event.stoneId.stone_id) + ']')[0].childNodes[i];
        targetElementOffset = jQuery(newTargetElementOffset).offset();
        break;
      }
    }
    // var width = 25 - 3;//25 is width of continer 3 is the value to decrease to show little left towards inside
    // var height = 38 - 6;//36 is width of continer 6 is the value to decrease to show little up towards inside
    let top: any;
    let left: any;
    if (targetElementOffset) {
      const width = (jQuery(newTargetElementOffset) && jQuery(newTargetElementOffset).outerWidth(true) ?
        jQuery(newTargetElementOffset).outerWidth(true) : 25) - 3;
      const height = (jQuery(newTargetElementOffset) && jQuery(newTargetElementOffset).outerHeight(true) ?
        jQuery(newTargetElementOffset).outerHeight(true) - 4 : 38 - 6);
      top = Number(targetElementOffset.top) + height;
      left = Number(targetElementOffset.left) + width;
    } else {
      left = event.eventObject.pageX;
      top = event.eventObject.pageY;
    }
    return { left: left, top: top };
  }
}
