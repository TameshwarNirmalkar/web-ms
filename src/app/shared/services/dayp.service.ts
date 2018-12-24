import { Injectable } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';
import * as _ from 'underscore';
import {
  MessageService, 
  UserProfileService,
  ErrorHandlerService,
  ApplicationDataService,
  AuthService,
  SearchService
 } from '@srk/core';
import { AddNoteService } from './add-note.service';
import { StoneDetailsService } from './stone-details.service';


declare var $: any;

@Injectable()
export class DaypService {
  public isPreDaypActive;
  public isDaypActive = false;
  public daypValues: any;
  public remainingDaypTime: any;

  constructor(
    private userProfileService: UserProfileService,
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private applicationDataService: ApplicationDataService,
    private authService: AuthService,
    private stoneSvc: StoneDetailsService,
    private decimalPipe: DecimalPipe,
    private notesService: AddNoteService,
    private searchSvc: SearchService,
    private messageSvc: MessageService) {
    this.daypValues = this.userProfileService.getSelectedDaypValues();
  }

  checkPreDaypStatus(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/preDayp/isdaypon/' + this.applicationDataService.getEnvironment().DAYPApiVersion)
      .pipe(
        map((res) => {
          if (res['data']) {
            this.isPreDaypActive = res['data'].isDAYPEventOn;
          }
          return res;
        }),
        catchError(err => this.errorHandler.handleError('DaypService:checkPreDaypStatus', err))
      );
  }

  checkActiveDaypStatus(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/daypEvent/remainingHour/' + this.applicationDataService.getEnvironment().DAYPApiVersion)
      .pipe(
        map((res) => {
          const responseData = res;
          if (responseData['data'] && responseData['data'].remainingTime && responseData['data'].remainingTime['data']) {
            const remainedTime = responseData['data'].remainingTime.data;
            this.isDaypActive = remainedTime.isDAYPEventOn;
            this.remainingDaypTime = {
              days: remainedTime.days,
              hours: remainedTime.hours,
              minutes: remainedTime.minutes,
              seconds: remainedTime.seconds,
              start_date: remainedTime.start_date,
              end_date: remainedTime.end_date
            };
          }
          return responseData;
        }),
        catchError(err => this.errorHandler.handleError('DaypService:checkActiveDaypStatus', err))
      );
  }

  getDaypEventDetails(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/daypEvent/getEventDetails/' + this.applicationDataService.getEnvironment().DAYPApiVersion)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('DaypService:finalDaypSubmit', err))
      );
  }

  checkDaypTabStatus(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/preDaypTab/showPreDAYPStones/' + this.applicationDataService.getEnvironment().DAYPApiVersion)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('DaypService:getDaypTabStatus', err))
      );
  }

  getDaypStoneCount(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/count/' + this.applicationDataService.getEnvironment().DAYPApiVersion)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('DaypService:getDaypStoneCount', err))
      );
  }

  getPreSubmittedDaypStones(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/myselection/list/' + this.applicationDataService.getEnvironment().DAYPApiVersion + '?activity_id=0')
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('DaypService:getPreSubmittedDaypStones', err))
      );
  }

  getActiveDaypStoneList(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/daypSelected/getDAYPStones/' + this.applicationDataService.getEnvironment().DAYPApiVersion + '?activity_id=0')
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('DaypService:getDaypStoneList', err))
      );
  }

  getDaypBasketStones(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/daypBasket/list/' + this.applicationDataService.getEnvironment().DAYPApiVersion + '?activity_id=0')
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('DaypService:getDaypBasketStones', err))
      );
  }

  getDaypFinalSubmiitedStones(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/daypSubmitted/list/' + this.applicationDataService.getEnvironment().DAYPApiVersion + '?activity_id=0')
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('DaypService:getDaypFinalSubmiitedStones', err))
      );
  }

  autoSavePriceChange(stoneList): Observable<any> {
    const config = {
      'stones': stoneList,
      'data': {
        'audit': {
          'action_id': 14,
          'activity_id': 14
        }
      }
    };
    const body = JSON.stringify(config);
    return this.http.post(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/offers/save/' + this.applicationDataService.getEnvironment().DAYPApiVersion, body)
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('DaypService:autoSavePriceChange', err))
      );
  }

  finalDaypOfferSubmit(stoneList): Observable<any> {
    const config = {
      'stones': stoneList,
      'data': {
        'audit': {
          'action_id': 14,
          'activity_id': 14
        }
      }
    };
    return this.http.post(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/daypOffer/submit/' + this.applicationDataService.getEnvironment().DAYPApiVersion, JSON.stringify(config))
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('DaypService:finalDaypSubmit', err))
      );
  }

  deleteDaypBaketStones(stoneList): Observable<any> {
    const config = {
      'stone_ids': stoneList,
      'data': {
        'audit': {
          'action_id': 15,
          'activity_id': 15
        }
      }
    };

    return this.http.post(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/daypStone/basktRemove/' + this.applicationDataService.getEnvironment().DAYPApiVersion, JSON.stringify(config))
      .pipe(
        map((res) => {
          const responseData = res;
          if (!responseData['error_status']) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('DaypService:deleteDaypBaketStones', err))
      );
  }

  deleteDaypSubmittedStones(stoneList): Observable<any> {
    const config = {
      'stone_ids': stoneList,
      'data': {
        'audit': {
          'action_id': 14,
          'activity_id': 14
        }
      }
    };

    return this.http.post(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/daypStone/remove/' + this.applicationDataService.getEnvironment().DAYPApiVersion, JSON.stringify(config))
      .pipe(
        map((res) => {
          const responseData = res;
          if (!responseData['error_status']) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('DaypService:deleteDaypSubmittedStones', err))
      );
  }

  downloadDAYPExcel(data): Observable<any> {
    const config = {
      'stones': data
    };
    const body = JSON.stringify(config);
    return this.http.post(this.applicationDataService.getEnvironment().ExcelManagementApi + '/excelmgnt/download/dayp/' +
      this.applicationDataService.getEnvironment().ExcelManagementApiVersion, body)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('DaypService:downloadDAYPExcel', err))
      );
  }

  createExcelUploadObject(array) {
    const stoneList = [];
    if (array.length > 0) {
      array.forEach(item => {
        const config = {
          'stone_id': item.stone_id,
          'offer_price': item.offerPrice !== null && item.offerPrice !== undefined ? item.offerPrice.toString() : '0',
          'offer_percentage': item.offerPer !== null && item.offerPer !== undefined ? item.offerPer.toString() : '0'
        };
        stoneList.push(config);
      });
    }
    return stoneList;
  }

  getExcelUpdateData(object) {
    let autoSavedStones = [];
    let finalSubmitStone = [];
    if (object.autoSaveDaypStoneList.length > 0) {
      autoSavedStones = this.createExcelUploadObject(object.autoSaveDaypStoneList);
    }
    if (object.submittedDaypStoneList.length > 0) {
      finalSubmitStone = this.createExcelUploadObject(object.submittedDaypStoneList);
    }
    const stoneConfig = {
      'stones': {
        'submit_stones': finalSubmitStone,
        'save_stones': autoSavedStones
      },
      'is_update': false,
      'is_over_write': false,
      'data': {
        'audit': {
          'action_id': 14,
          'activity_id': 14
        }
      }
    };
    return stoneConfig;
  }

  uploadExcel(formData): Observable<any> {
    const headerData = new HttpHeaders();
    headerData.append('Accept', 'application/json');
    headerData.append('calling_entity', 'UI');
    headerData.append('token', this.authService.getToken());
    return this.http.post(this.applicationDataService.getEnvironment().ExcelManagementApi +
      '/excelmgnt/upload/dayp/' + this.applicationDataService.getEnvironment().ExcelManagementApiVersion,
      formData, { headers: headerData })
      .pipe(
        map( response => response),
        catchError(err => this.errorHandler.handleError('AuthService:uploadExcel', err))
      );
  }

  saveDaypExcelStones(config): Observable<any> {
    return this.http.post(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/daypExcel/excelStoneSubmit/' + this.applicationDataService.getEnvironment().DAYPApiVersion, JSON.stringify(config))
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('DaypService:saveDaypExcelStones', err))
      );
  }

  getDaypSearchStones(stoneList): Observable<any> {
    const config = {
      'stone_ids': stoneList
    };
    return this.http.post(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/stones/' + this.applicationDataService.getEnvironment().DAYPApiVersion, JSON.stringify(config))
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('DaypService:getDaypSearchStones', err))
      );
  }

  initializeStoneListObject(data) {
    const stoneListObject = {
      diamondTable: data,
      selectedStoneTable: [],
      filteredStone: [],
      selectedStoneButton: [],
      isAllSelected: false,
      toggleTableDisplay: false,
      isAllResultSelected: false,
      selectedStonesCarat: 0,
      totalOfferAmount: 0
    };
    stoneListObject.diamondTable = this.updateOfferValues(stoneListObject.diamondTable);
    stoneListObject.selectedStoneTable = this.updateOfferValues(stoneListObject.selectedStoneTable);
    stoneListObject.diamondTable = this.calculateDaypRateDifference(stoneListObject.diamondTable);
    stoneListObject.selectedStoneTable = this.calculateDaypRateDifference(stoneListObject.selectedStoneTable);
    return stoneListObject;
  }

  calculateDaypRateDifference(array) {
    if (array.length > 0) {
      array.forEach(stone => {
        if (stone.hasOwnProperty('dayp_rate') && (Number(stone.dayp_rate) !== 0
          && stone.dayp_rate !== null && stone.dayp_rate !== undefined)) {
          const offerDifference = ((Number(stone.price_srk) - Number(stone.dayp_rate)) / Number(stone.price_srk)) * -100;
          stone['difference'] = this.roundNumber(offerDifference, 2);
          stone['dayp_amount'] = parseFloat(String(stone.dayp_rate * stone.carat)).toFixed(2);
        } else {
          stone.dayp_rate = stone.dayp_per = stone['difference'] = null;
        }
      });
    }
    return array;
  }

  calculateDAYPOfferAndOfferPer(array, diffPer, selectedtab) {
    if (array.length > 0) {
      array.forEach(stone => {
        if (stone.hasOwnProperty('final_submit') && stone.final_submit && selectedtab !== 4) {
        } else {
          if (stone.hasOwnProperty('difference') && stone.difference) {
            stone.oldDifferencePercentage = JSON.parse(JSON.stringify(stone.difference));
          }
          const offerPrice = Number(stone.price_srk) - (Number(diffPer) * Number(stone.price_srk) / 100);
          stone['difference'] = -Number(diffPer);
          stone['dayp_rate'] = offerPrice.toFixed(2);
          stone['dayp_amount'] = parseFloat(String(stone.dayp_rate * stone.carat)).toFixed(2);
          if (Number(stone.price_srk) === Number(stone.price_rap)) {
            stone['dayp_per'] = 0;
          } else if (Number(stone.price_srk) > Number(stone.price_rap)) {
            stone['dayp_per'] = ((stone['dayp_rate'] - stone.price_rap) * 100) / stone.price_rap;
          } else {
            stone['dayp_per'] = ((stone.price_rap - stone['dayp_rate']) * 100) / stone.price_rap;
          }
          stone['dayp_per'] = stone['dayp_per'].toFixed(2);
        }
      });
    }
    return array;
  }

  updateOfferValues(stoneTable) {
    if (stoneTable && stoneTable.length > 0) {
      stoneTable.forEach(stoneObj => {
        stoneObj.offerSign = undefined;
        if (stoneObj.dayp_per) {
          if (stoneObj.dayp_per < 0) {
            stoneObj.offerSign = 'minus';
          }
          if (Number(stoneObj.price_rap) < Number(stoneObj.price_srk) && stoneObj.dayp_per > 0) {
            stoneObj.offerSign = 'plus';
          }
          stoneObj.dayp_per = Math.abs(stoneObj.dayp_per);
        } else if (stoneObj.rap_off) {
          if (Number(stoneObj.price_rap) < Number(stoneObj.price_srk) && stoneObj.rap_off > 0) {
            stoneObj.offerSign = 'plus';
          }
        }
      });
    }
    return stoneTable;
  }

  fetchStoneAdditionalInfo(array) {
    this.stoneSvc.storeStoneAdditionalInfo(array).subscribe(res => {
      array = res;
    });
    return array;
  }

  fetchStonesComment(array) {
    this.notesService.getCommentListforStoneIds(array).subscribe((commentRes) => {
      array = commentRes;
    });
    return array;
  }

  addOfferPriceForStone(data, offerprice) {
    const object = JSON.parse(JSON.stringify(data));
    let flag = true;
    if (offerprice !== '' && offerprice !== '0') {
      offerprice = offerprice.replace(',', '');
      offerprice = Number(offerprice);
      if (offerprice === 0) {
        flag = false;
      } else {
        if (Number(data.price_srk) < offerprice) {
          flag = false;
          this.messageSvc.showErrorGrowlMessage('ERR_DAYP_RATE_INPUT');
        } else {
          object['dayp_rate'] = offerprice;
          if (Number(object.price_srk) === Number(object.price_rap)) {
            object['dayp_per'] = 0;
          } else if (Number(object.price_srk) > Number(object.price_rap)) {
            object['dayp_per'] = ((offerprice - object.price_rap) * 100) / object.price_rap;
          } else {
            object['dayp_per'] = ((object.price_rap - offerprice) * 100) / object.price_rap;
          }
          if (Number(object.price_srk) === offerprice) {
            object['difference'] = 0;
          } else {
            if (object.hasOwnProperty('difference') && object.difference) {
              object.oldDifferencePercentage = JSON.parse(JSON.stringify(object.difference));
            }
            object['difference'] = ((Number(object.price_srk) - Number(offerprice)) / Number(object.price_srk)) * -100;
            object['difference'] = this.roundNumber(object['difference'], 2);
          }
        }
      }
    } else {
      flag = false;
    }
    const response = {
      'status': flag,
      'data': object
    };
    return response;
  }

  addOfferPercentageForStone(data, offerPercentage, sign) {
    const object = JSON.parse(JSON.stringify(data));
    let flag = true;
    let symbol: any;
    if (object.offerSign && sign === 'plus') {
      symbol = '+';
    } else if (object.offerSign && sign === 'minus') {
      symbol = '-';
    }
    object.offerSign = sign;
    if (offerPercentage && offerPercentage !== '') {
      offerPercentage = Number(offerPercentage);
      let validationFlag = false;
      if (Number(object.price_srk) > Number(object.price_rap)) {
        if (symbol === '+') {
          const rapOff = object.rap_off.replace('+', '');
          // if (Number(rapOff) < Number(offerPercentage) || Number(offerPercentage) >= 100) {
          if (Number(rapOff) < Number(offerPercentage)) {
            flag = false;
            validationFlag = true;
            this.messageSvc.showErrorGrowlMessage('ERR_DAYP_OFFER_INPUT_LESS');
          } else {
            validationFlag = false;
          }
        }
        if (symbol === '-') {
          const rapOff = offerPercentage * (-1);
          if ((-0.01) > Number(rapOff) && Number(rapOff) < (-99)) {
            flag = false;
            validationFlag = true;
            this.messageSvc.showErrorGrowlMessage('ERR_DAYP_OFFER_INPUT_RANGE');
          } else {
            validationFlag = false;
          }
        }
      } else {
        if (Number(object.rap_off) > Number(offerPercentage) || Number(offerPercentage) >= 100) {
          flag = false;
          validationFlag = true;
          this.messageSvc.showErrorGrowlMessage('ERR_DAYP_OFFER_INPUT');
        }
      }
      if (!validationFlag) {
        let offerRate: any;
        if (symbol) {
          if (symbol === '-') {
            offerPercentage = offerPercentage * (-1);
          }
          offerRate = Number(object.price_rap) + ((offerPercentage * Number(object.price_rap)) / 100);
        } else {
          offerRate = Number(object.price_rap) - ((offerPercentage * Number(object.price_rap)) / 100);
        }
        object['dayp_rate'] = this.roundNumber(offerRate, 2);
        if (Number(object.rap_off) === offerPercentage) {
          object['difference'] = '0';
        } else {
          if (object.hasOwnProperty('difference') && object.difference) {
            object.oldDifferencePercentage = JSON.parse(JSON.stringify(object.difference));
          }
          const offerDifferent = ((Number(object.price_srk) - Number(offerRate)) / Number(object.price_srk)) * -100;
          object['difference'] = this.roundNumber(offerDifferent, 2);
        }
        object['dayp_per'] = offerPercentage;
      }
    } else {
      flag = false;
    }
    const response = {
      'status': flag,
      'offerPer': offerPercentage,
      'data': object
    };
    return response;
  }

  setOffPrice(data, offerprice) {
    if (offerprice) {
      offerprice = offerprice.replace(',', '');
    }
    const priceDiff = Number(data.price_rap) - Number(offerprice);
    const offerPer = (priceDiff * 100) / Number(data.price_rap);
    data['dayp_per'] = offerPer.toFixed(2);
    data['dayp_rate'] = offerprice;
    const response = {
      data: data,
      offerPer: offerPer
    };
    return response;
  }

  updateTableStoneDetails(table, stoneList, res) {
    stoneList.forEach(confirmStoneId => {
      table.forEach(tableStone => {
        if (tableStone.stone_id === confirmStoneId) {
          if (res.source === 'basketRequested') {
            tableStone['isBasket'] = 1;
            tableStone['basketStatus'] = '=';
          } else if (res.source === 'viewRequested') {
            if (tableStone.viewRequestStatus !== 2) {
              tableStone['totalViewRequest']++;
            }
          } else if (res.source === 'onlineViewIncrement') {
            tableStone['totalViewedByUser']++;
          } else if (res.source === 'ddcRequested') {
            tableStone['ddcStatus'] = res.status;
            tableStone['ddcHour'] = res.hour;
          } else if (res.source === 'confirmedStones') {
            const i = table.indexOf(tableStone);
            table.splice(i, 1);
          }
        }
      });
    });
    return table;
  }

  removeStoneFromTable(originalTable, updatedTable) {
    if (updatedTable && updatedTable.length > 0 && originalTable && originalTable.length > 0) {
      updatedTable.forEach(updatedStone => {
        originalTable.forEach(originalStone => {
          if (updatedStone === originalStone.stone_id) {
            const stoneIndex = originalTable.indexOf(originalStone);
            originalTable.splice(stoneIndex, 1);
          }
        });
      });
      return JSON.parse(JSON.stringify(originalTable));
    } else {
      return originalTable;
    }
  }

  updateDAYPStonePriceValue(originalTable, updatedTable, isPushAllowed) {
    const existingEntry = [];
    updatedTable.forEach(updatedStone => {
      originalTable.forEach(originalStone => {
        if (updatedStone.stone_id === originalStone.stone_id) {
          originalStone['oldDifferencePercentage'] = updatedStone.oldDifferencePercentage;
          originalStone['difference'] = updatedStone.difference;
          if (updatedStone.dayp_per && updatedStone.dayp_per < 0) {
            updatedStone.dayp_per = updatedStone.dayp_per * (-1);
          }
          originalStone['dayp_per'] = updatedStone.dayp_per;
          originalStone['dayp_rate'] = updatedStone.dayp_rate;
          originalStone['final_submit'] = updatedStone.final_submit;
          originalStone['offerSign'] = updatedStone.offerSign;
          originalStone['daypOfferCount'] = updatedStone.daypOfferCount;
          originalStone['dayp_amount'] = parseFloat(String(updatedStone.dayp_rate * updatedStone.carat)).toFixed(2);
          if (originalStone.hasOwnProperty('dayp_rate') && originalStone.dayp_rate === 0) {
            originalStone.dayp_rate = originalStone.dayp_per = originalStone.difference = null;
          }
          existingEntry.push([updatedStone.stone_id]);
        }
      });
    });
    if (isPushAllowed) {
      const allUpdatedEntry = this.stoneSvc.createStoneIdList(updatedTable);
      const differenceStones = _.difference(allUpdatedEntry, existingEntry);
      differenceStones.forEach(stone => {
        updatedTable.forEach(stoneObj => {
          if (stone === stoneObj.stone_id) {
            originalTable.push(JSON.parse(JSON.stringify(stoneObj)));
          }
        });
      });
    }
    originalTable = this.stoneSvc.removeDuplicatesFromObject(originalTable, 'stone_id');
    // originalTable = this.updateOfferValues(originalTable);
    originalTable = this.calculateDaypRateDifference(originalTable);
    return originalTable;
  }

  addDaypFinalSubmitFlag(params, table, stones) {
    let flag = false;
    if (params === 'daypSubmission') {
      flag = true;
    }
    stones.forEach((id, index) => {
      table.forEach(stone => {
        if (stone.stone_id === id) {
          stone['final_submit'] = flag;
        }
      });
    });
    return table;
  }

  resetDaypValue(stone, data) {
    if (data) {
      stone.dayp_rate = data.dayp_rate;
      stone.dayp_per = data.dayp_per;
      stone.difference = data.difference;
    } else {
      stone.dayp_rate = stone.dayp_per = stone.difference = null;
    }
    return stone;
  }

  roundNumber(num, dec) {
    const result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
  }

  getValidStonesFromSelection(array) {
    const list = JSON.parse(JSON.stringify(array));
    const object = {
      selectedStones: [],
      stoneList: [],
      notValidStones: [],
      submittedStones: []
    };
    list.selectedStoneTable.forEach(stone => {
      if (stone.dayp_rate && stone.dayp_rate !== null && stone.dayp_rate !== 0) {
        if (stone.offerSign === 'minus') {
          stone.dayp_per = stone.dayp_per * (-1);
        }
        const config = {
          'stone_id': stone.stone_id,
          'offer_price': stone.dayp_rate.toString(),
          'offer_percentage': stone.dayp_per.toString()
        };
        if (stone.final_submit) {
          object.submittedStones.push(config);
        } else {
          object.selectedStones.push(config);
        }
        object.stoneList.push(stone);
      } else {
        stone.dayp_rate = stone.dayp_per = 0;
        object.notValidStones.push(stone.stone_id);
      }
    });
    return object;
  }

  setDaypSearchData(array, resultList) {
    const tempArray = [];
    const list = [];
    for (const key in resultList) {
      resultList[key]['stone_id'] = key;
      tempArray.push(resultList[key]);
    }
    if (tempArray.length > 0) {
      array.forEach(element => {
        let updateFlag = 0;
        tempArray.forEach(item => {
          if (element.stone_id === item.stone_id) {
            element['final_submit'] = item['final_submit'];
            element['dayp_per'] = item['offer_percentage'];
            element['dayp_rate'] = item['offer_rate'];
            element['offerSign'] = item['offerSign'];
            const offerDifference = ((Number(element.price_srk) - Number(element.dayp_rate)) / Number(element.price_srk)) * -100;
            element['difference'] = this.roundNumber(offerDifference, 2);
          } else {
            updateFlag++;
          }
        });
        if (updateFlag === tempArray.length) {
          list.push(element);
        }
      });
    }
    if (list.length > 0) {
      list.forEach(stone => {
        stone.final_submit = null;
        stone.dayp_rate = stone.dayp_per = stone.difference = null;
      });
    }
    return array;
  }

  checkSelectedStones(daypObject, savedObject) {
    if (savedObject) {
      daypObject.filteredStone = savedObject.filteredStone;
      daypObject.isAllResultSelected = savedObject.isAllResultSelected;
      daypObject.isAllSelected = savedObject.isAllSelected;
      daypObject.selectedStoneButton = savedObject.selectedStoneButton;
      daypObject.selectedStonesCarat = savedObject.selectedStonesCarat;
      if (savedObject.filteredStone && savedObject.filteredStone.length > 0) {
        savedObject.filteredStone.forEach(element => {
          daypObject.diamondTable.forEach(stone => {
            if (stone.stone_id === element) {
              daypObject.selectedStoneTable.push(stone);
            }
          });
        });
        if (daypObject.selectedStoneTable.length > 0) {
          daypObject.selectedStoneTable = _.uniq(daypObject.selectedStoneTable, 'stone_id');
        }
      }
    }
    return daypObject;
  }

  updateRemovedDaypStoneState(array, stoneList) {
    if (array && array.length > 0) {
      stoneList.forEach(id => {
        array.forEach(stone => {
          if (stone.stone_id === id) {
            stone.final_submit = null;
            stone.dayp_rate = stone.dayp_per = stone.difference = null;
          }
        });
      });
    }
    return array;
  }

  /******* PRE-DAYP ADD/REMOVE STONES *******/
  addToPreDAYPSelection(stones): Observable<any> {
    const serviceData = {
      stone_ids: stones
    };
    return this.http.post(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/myselection/add/' + this.applicationDataService.getEnvironment().DAYPApiVersion, JSON.stringify(serviceData))
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('DaypService:addToPreDAYPSelection', err))
      );
  }

  removeFromPreDAYPSelection(stones): Observable<any> {
    const servicedata = {
      'stone_ids': stones,
      'data': {
        'audit': {
          'action_id': 15,
          'activity_id': 15
        }
      }
    };
    return this.http.post(this.applicationDataService.getEnvironment().DAYPApi + '/dayp/' + this.authService.getLoginName() +
      '/preDaypSelection/preDAYPRemove/' + this.applicationDataService.getEnvironment().DAYPApiVersion, JSON.stringify(servicedata))
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('DaypService:removeFromPreDAYPSelection', err))
      );
  }

  updateRowColor(container, array) {
    if (container) {
      array.diamondTable.forEach((stoneObj, index) => {
        this.stoneSvc.showRowColorChanges(container, array.selectedStoneButton, stoneObj.stone_id, index);
      });
    }
  }

  onCellPrepared(e, array) {
    if (e.rowType === 'data' && array) {
      array.forEach(stoneId => {
        if (e.key.stone_id === stoneId) {
          this.stoneSvc.changeRowColor(e.cellElement, true);
        }
      });
    }
  }

  getDAYPStoneDetails(stoneIDList): Observable<any> {
    const config = {
      'filter': {
        'values': {
          'stone_id': stoneIDList
        }
      }
    };
    return this.http.post(
      this.applicationDataService.getEnvironment().SearchApi + '/search/stone/' +
      this.applicationDataService.getEnvironment().SearchApiVersion + '/dayp', JSON.stringify(config))
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
        catchError(err => this.errorHandler.handleError('DaypService:getDAYPStoneDetails', err))
      );
  }

  resetOffers(table, object) {
    if (table && table.length > 0) {
      table.forEach(stone => {
        if (object) {
          stone.dayp_rate = object.dayp_rate;
          stone.dayp_per = object.dayp_per;
          stone.difference = object.difference;
        } else {
          stone.dayp_rate = stone.dayp_per = stone.difference = null;
        }
      });
    }
    return table;
  }

  updateDaypObjectData(daypObject, stoneList) {
    stoneList.forEach(ID => {
      daypObject.filteredStone.forEach(item => {
        if (ID === item) {
          const stoneIndex = daypObject.filteredStone.indexOf(item);
          daypObject.filteredStone.splice(stoneIndex, 1);
        }
      });
      daypObject.selectedStoneButton.forEach(item => {
        if (ID === item) {
          const stoneIndex = daypObject.selectedStoneButton.indexOf(item);
          daypObject.selectedStoneButton.splice(stoneIndex, 1);
        }
      });
    });
    daypObject.toggleTableDisplay = false;
    daypObject.isAllResultSelected = false;
    daypObject.isAllSelected = false;
    return daypObject;
  }

  resetDaypOffers(table, array) {
    table = JSON.parse(JSON.stringify(table));
    array.forEach(item => {
      table.forEach(stone => {
        if (item.stone_id === stone.stone_id) {
          if (item.dayp_rate) {
            stone.dayp_rate = item.dayp_rate;
            stone.dayp_per = item.dayp_per;
            stone.difference = item.difference;
          } else {
            stone.dayp_rate = stone.dayp_per = stone.difference = null;
          }
        }
      });
    });
    return table;
  }

  adjustTableHeight(array) {
    let daypHeight = array && array.selectedStoneTable
      && array.selectedStoneTable.length > 0 ? window.innerHeight * (75 / 100) : window.innerHeight * (90 / 100);
    if (array && array.toggleTableDisplay) {
      daypHeight = window.innerHeight * (33 / 100);
    }
    return daypHeight;
  }

  handlekeyupEvent(id) {
    const inputs = $(document).on('keyup', '#' + id + ' .price-input:input', function (e) {
      if (e.which === 40) {
        e.preventDefault();
        const tabcls = $(e.currentTarget).attr('class');
        const newTabIndex = (~~(tabcls.split(' ')[1]).substring(3, tabcls.split(' ')[1].length)) + 1;
        $('#' + id + ' .tab' + newTabIndex).focus();
        $('#' + id + ' .tab' + newTabIndex).select();
        this.tabIndex = newTabIndex;
      }
      if (e.which === 38) {
        e.preventDefault();
        const tabcls = $(e.currentTarget).attr('class');
        const newTabIndex = (~~(tabcls.split(' ')[1]).substring(3, tabcls.split(' ')[1].length)) - 1;
        $('#' + id + ' .tab' + newTabIndex).focus();
        $('#' + id + ' .tab' + newTabIndex).select();
        this.tabindex = newTabIndex;
      }
      if (e.which === 13) {
        e.preventDefault();
        const tabcls = $(e.currentTarget).attr('class');
        const newTabIndex = (~~(tabcls.split(' ')[1]).substring(3, tabcls.split(' ')[1].length)) + 1;
        $('#' + id + ' .tab' + newTabIndex).focus();
        $('#' + id + ' .tab' + newTabIndex).select();
        this.tabindex = newTabIndex;
        setTimeout(() => {
          $('#' + id + ' .tab' + newTabIndex).focus();
          $('#' + id + ' .tab' + newTabIndex).select();
          this.tabindex = newTabIndex;
        }, 250);
      }
    });
  }

  getSortedTable(container, object) {
    for (let i = 0; i < container.columns.length; i++) {
      if (Number.isInteger(container.instance.columnOption(i, 'sortIndex'))) {
        object['soretedColumn'] = i;
        object['sortedColumnOrder'] = container.instance.columnOption(i, 'sortOrder');
      }
    }
    return object;
  }

  setSortedColumnIndex(container, object) {
    setTimeout(() => {
      if (object && object.hasOwnProperty('sortedColumnOrder') &&
        object.hasOwnProperty('soretedColumn') && container) {
        container.instance.columnOption(object.soretedColumn, 'sortOrder', object.sortedColumnOrder);
      }
    }, 2000);
  }

  updateSortedObject(newObj, sortedObj) {
    if (sortedObj && newObj) {
      if (sortedObj.hasOwnProperty('sortedColumnOrder') && sortedObj.hasOwnProperty('soretedColumn')) {
        newObj['sortedColumnOrder'] = sortedObj.sortedColumnOrder;
        newObj['soretedColumn'] = sortedObj.soretedColumn;
      }
    }
    return newObj;
  }
  setFilters(minValue: any, maxValue: any, column: any, interval: number): any[] {
    const filterArray: any = [];
    for (var min = minValue; min < maxValue;) {
      var nextmin = min + interval;
      filterArray.push(
        {
          text: min + ' -  ' + nextmin, value: [
            [column, '>=', min],
            [column, '<=', nextmin]
          ]
        }
      );
      min = nextmin;
    }
    return filterArray;
  }
  setdiffFilters(minValue: any, maxValue: any, column: any, interval: number): any[] {
    const filter: any = [];
    filter.push(
      {
        text: 'Eligible', value: [
          [column, '>=', -7],
          [column, '<=', -0.01]
        ]
      },
      {
        text: 'Ineligible', value: [
          // [column, '>=', 1],
          [column, '<', -7]
        ]
      }
    );
    for (var min = minValue; min < maxValue;) {
      var nextmin = min + interval;
      filter.push(
        {
          text: '(' + min + ')' + ' -  ' + '(' + nextmin + ')', value: [
            [column, '>=', min],
            [column, '<=', nextmin]
          ]
        }
      );
      min = nextmin;
    }
    return filter;
  }

  fetchStoneDetails(selectedStones, stoneArray) {
    const selectedStonesArray = [];
    selectedStones.forEach(stone => {
      stoneArray.forEach(tableStone => {
        if (tableStone.stone_id === stone) {
          selectedStonesArray.push(tableStone);
        }
      });
    });
    return this.stoneSvc.removeDuplicatesFromObject(selectedStonesArray, 'stone_id');
  }

  isAllFilterStoneSelected(filterDataSource, selectedStoneButton) {
    const availableStones = this.stoneSvc.createStoneIdList(filterDataSource);
    const uniqueStones = _.intersection(availableStones, selectedStoneButton);
    if (uniqueStones.length === availableStones.length) {
      return true;
    } else {
      return false;
    }
  }

  selectFilterStones(filterDataSource, isFilterAllSelected, daypSearchData) {
    const availableStones = this.stoneSvc.createStoneIdList(filterDataSource);
    if (isFilterAllSelected) {
      let mergedArray = [];
      if (daypSearchData.selectedStoneButton.length > 0) {
        mergedArray = _.union(daypSearchData.selectedStoneButton, availableStones);
      } else {
        mergedArray = availableStones;
      }
      daypSearchData.selectedStoneButton = mergedArray;
      daypSearchData.filteredStone = mergedArray;
    } else {
      daypSearchData.selectedStoneButton = _.uniq(_.difference(daypSearchData.selectedStoneButton, availableStones));
      daypSearchData.filteredStone = _.uniq(_.difference(daypSearchData.filteredStone, availableStones));
    }
    daypSearchData.selectedStoneTable = this.fetchStoneDetails(daypSearchData.filteredStone, daypSearchData.diamondTable);
    daypSearchData.isAllSelected = this.searchSvc.isArrayMatch(daypSearchData.selectedStoneButton,
      daypSearchData.filteredStone);
    return daypSearchData;
  }

  getActiveDaypStatus() {
    return this.isDaypActive;
  }

  getPreDaypStatus() {
    return this.isPreDaypActive;
  }
}
