import { Injectable } from '@angular/core';
import { ErrorHandlerService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { AuthService } from '@srk/core';
import { HttpClient } from '@angular/common/http';
import { StoneDetailsService } from './stone-details.service';
import { MessageService } from '@srk/core';
import { AddNoteService } from './add-note.service';
import * as _ from 'underscore';
import { UtilService } from './util.service';
import { CustomDatePipe } from '../pipes/custom-date.pipe';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class BidToBuyService {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private applicationDataService: ApplicationDataService,
    private authService: AuthService,
    private stoneDetailsService: StoneDetailsService,
    private messageSvc: MessageService,
    private notesService: AddNoteService,
    private utilService: UtilService,
    private datePipe: CustomDatePipe
  ) { }

  getBTBPopuStone(stoneid): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().B2BApi
      + '/btob/' + this.authService.getLoginName() + '/stone/list/' +
      this.applicationDataService.getEnvironment().B2BApiVersion + '?stone_ids=["' + stoneid + '"]')
      .pipe(
        map( res => res ),
        catchError(err => this.errorHandler.handleError('BidToBuyService:getBTBPopuStone', err))
      );
  }

  getBTBBasketStoneList(): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().B2BApi
      + '/btob/' + this.authService.getLoginName() + '/basketList/' +
      this.applicationDataService.getEnvironment().B2BApiVersion + '?activity_id=0')
      .pipe(
        map( res => res ),
        catchError(err => this.errorHandler.handleError('BidToBuyService:getBTBBasketStoneList', err))
      );
  }

  getBTBSubmittedStoneList(): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().B2BApi
      + '/btob/' + this.authService.getLoginName() + '/mySubmissionList/' +
      this.applicationDataService.getEnvironment().B2BApiVersion + '?activity_id=1')
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('BidToBuyService:getBTBSubmittedStoneList', err))
      );
  }

  autoSavePriceChange(stone_id, bid_rate, bid_per, action): Observable<any> {
    if (bid_rate) {
      bid_rate = bid_rate.replace(',', '');
    }
    const config = {
      'stones': [
        {
          'stone_id': stone_id,
          'action': action,
          'bid_rate': bid_rate.toString(),
          'bid_per': bid_per.toString()
        }
      ],
      'audit': {
        'activity_id': 1,
        'action_id': 2
      }
    };
    const body = JSON.stringify(config);

    return this.http.post(
      this.applicationDataService.getEnvironment().B2BApi
      + '/btob/' + this.authService.getLoginName() + '/offers/crud/' +
      this.applicationDataService.getEnvironment().B2BApiVersion, body)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('BidToBuyService:autoSavePriceChange', err))
      );
  }

  finalSavePriceChange(stone_id): Observable<any> {
    const config = {
      'stone_ids': stone_id,
      'audit': {
        'activity_id': 1,
        'action_id': 2
      }
    };
    return this.http.post(
      this.applicationDataService.getEnvironment().B2BApi
      + '/btob/' + this.authService.getLoginName() + '/offers/submit/' +
      this.applicationDataService.getEnvironment().B2BApiVersion, JSON.stringify(config))
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('BidToBuyService:finalSavePriceChange', err))
      );
  }

  deleteBTBFinalSubmitted(stone_id): Observable<any> {
    const config = {
      'stones': [
        {
          'stone_ids': stone_id,
          'action': 'd'
        }
      ],
      'audit': {
        'activity_id': 1,
        'action_id': 2
      }
    };
    return this.http.post(
      this.applicationDataService.getEnvironment().B2BApi
      + '/btob/' + this.authService.getLoginName() + '/offers/crud/' +
      this.applicationDataService.getEnvironment().B2BApiVersion, JSON.stringify(config))
      .pipe(
        map((res) => {
          if (!res['error_status']) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('BidToBuyService:deleteBTBFinalSubmitted', err))
      );
  }

  fetchSelectedStones(array) {
    let availableStones = [];
    if (array && array.table) {
      availableStones = this.stoneDetailsService.createStoneIdList(array.table);
      if (availableStones.length > 0) {
        array.isAllSelected = this.stoneDetailsService.isArrayMatch(array.selectedStones, availableStones);
      }
    }
    array = this.fetchSelectedStoneDetails(array);
    array.totalCarat = this.calculateCarat(array);
    array.totalOfferAmt = this.calculateOfferAmount(array);
    return array;
  }

  checkAllStoneSelected(array) {
    if (array.isAllSelected) {
      array.selectedStoneArray = [];
      array.table.forEach(stone => {
        if (stone.is_btb_running) {
          array.selectedStoneArray.push(JSON.parse(JSON.stringify(stone)));
        }
      });
      // array.selectedStoneArray = JSON.parse(JSON.stringify(array.table));
      array.selectedStones = this.stoneDetailsService.createStoneIdList(array.selectedStoneArray);
    } else {
      array.selectedStoneArray = [];
      array.selectedStones = [];
    }
    array.totalCarat = this.calculateCarat(array);
    array.totalOfferAmt = this.calculateOfferAmount(array);
    return array;
  }

  fetchSelectedStoneDetails(array) {
    const selectedStonesArray = [];
    array.selectedStones.forEach(stone => {
      array.table.forEach(tableObj => {
        if (stone === tableObj.stone_id) {
          selectedStonesArray.push(JSON.parse(JSON.stringify(tableObj)));
        }
      });
    });
    array.selectedStoneArray = this.stoneDetailsService.removeDuplicatesFromObject(selectedStonesArray, 'stone_id');
    return array;
  }

  calculateCarat(array) {
    let carat = 0;
    array.selectedStoneArray.forEach(stoneObj => {
      carat = carat + Number(stoneObj.carat);
    });
    return carat;
  }

  calculateOfferAmount(array) {
    let offerAmt = 0;
    if (array.selectedStoneArray && array.selectedStoneArray.length > 0) {
      array.selectedStoneArray.forEach(stoneObj => {
        offerAmt = (offerAmt) + Number(Number(stoneObj.bid_rate) * Number(stoneObj.carat));
      });
    }
    return offerAmt;
  }

  addFinalSubmitFlag(params, table) {
    let flag = 0;
    if (params === 'b2bSubmission') {
      flag = 1;
    }
    table.forEach(stone => {
      stone['final_submit'] = flag;
    });
    return table;
  }

  priceEntry(data, offerprice) {
    let flag = true;
    if (offerprice) {
      offerprice = offerprice.replace(',', '');
    }
    if (offerprice !== '' && offerprice !== 0) {
      if (Number(offerprice) < Number(data.price_srk)) {
        data['offer_per_disc_diff'] = 0;
        data['offer_per_disc'] = 0;
        data.price = 0;
        flag = false;
        this.messageSvc.showErrorGrowlMessage('BTB_OFFER_ISLOWER');
      } else if ((Number(offerprice) - Number(data.price_srk)) < 1) {
        data['offer_per_disc_diff'] = 0;
        data['offer_per_disc'] = 0;
        data.price = 0;
        flag = false;
        this.messageSvc.showErrorGrowlMessage('BTB_OFFER_GREATERTHAN_ONEDOLLER');
      }
      let maxPriceSrk = (Number(data.price_srk) * 20) / 100;
      maxPriceSrk = Number(data.price_srk) + Number(maxPriceSrk);
      if (Number(offerprice) > Number(maxPriceSrk)) {
        data['offer_per_disc_diff'] = 0;
        data['offer_per_disc'] = 0;
        data.price = 0;
        flag = false;
        this.messageSvc.showErrorGrowlMessage('BTB_OFFER_ISHIGH');
      }
    } else {
      flag = false;
    }
    const response = {
      'status': flag,
      'data': data
    };
    return response;
  }

  roundNumber(num, dec) {
    const result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
  }


  resetBtbValue(stone, data) {
    if (!_.isEmpty(data)) {
      stone.bid_rate = data.bid_rate;
      stone.bid_per = data.bid_per;
      stone.difference = data.difference;
    } else {
      stone.bid_rate = stone.bid_per = stone.difference = stone.offer_per_disc_diff = stone.offer_per_disc = stone.bid_percentage = null;
      stone.final_submit = 0;
    }
    return stone;
  }
  setOffPrice(data, offerprice) {
    if (offerprice) {
      offerprice = offerprice.replace(',', '');
    }
    let priceDiff;
    if (data.rap_off.toString().indexOf('+') !== 0) {
      priceDiff = Number(data.price_rap) - Number(offerprice);
    } else {
      priceDiff = Number(offerprice) - Number(data.price_rap);
    }
    let offerPer = (priceDiff * 100) / Number(data.price_rap);
    offerPer = this.roundNumber(offerPer, 2);
    // const offerPerDiff = Number(data.rap_off) - Math.abs(offerPer);
    const offerPerDiff = (( Math.abs(Number(offerprice) - Number(data.price_srk))) / Number(data.price_srk)) * 100;
    data['offer_per_disc_diff'] = offerPerDiff.toFixed(2);
    data['offer_per_disc'] = offerPer.toFixed(2);
    data['bid_rate'] = offerprice;
    const response = {
      data: data,
      offerPer: offerPer
    };
    return response;
  }

  fetchStoneAdditionalInfo(array) {
    this.stoneDetailsService.storeStoneAdditionalInfo(array.table).subscribe(res => {
      array['table'] = res;
    });
    return array;
  }

  fetchStonesComment(array) {
    this.notesService.getCommentListforStoneIds(array.table).subscribe((commentRes) => {
      array['table'] = commentRes;
    });
    return array;
  }

  fetchStonesCommentAsync(array): Promise<any[]> {
    return this.notesService.getCommentListforStoneIds(array.table).toPromise();
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
          }
        }
      });
    });
    return table;
  }

  resetBTBPriceValue(table) {
    table.forEach(stone => {
      stone['offer_per_disc_diff'] = null;
      stone['offer_per_disc'] = null;
      stone['final_submit'] = 0;
      delete stone['bid_rate'];
      delete stone['bid_percentage'];
      delete stone['difference'];
      delete stone['price'];
    });
    return table;
  }

  updateBTBStonePriceValue(originalTable, updatedTable, isPushAllowed) {
    const existingEntry = [];
    updatedTable.forEach(updatedStone => {
      originalTable.forEach(originalStone => {
        if (updatedStone.stone_id === originalStone.stone_id) {
          originalStone['offer_per_disc_diff'] = updatedStone.offer_per_disc_diff;
          originalStone['offer_per_disc'] = updatedStone.offer_per_disc;
          originalStone['final_submit'] = updatedStone.final_submit;
          originalStone['bid_rate'] = updatedStone.bid_rate;
          originalStone['bid_percentage'] = updatedStone.bid_percentage;
          originalStone['difference'] = updatedStone.difference;
          existingEntry.push([updatedStone.stone_id]);
        }
      });
    });
    if (isPushAllowed) {
      const allUpdatedEntry = this.stoneDetailsService.createStoneIdList(updatedTable);
      const differenceStones = _.difference(allUpdatedEntry, existingEntry);
      differenceStones.forEach(stone => {
        updatedTable.forEach(stoneObj => {
          if (stone === stoneObj.stone_id) {
            originalTable.push(JSON.parse(JSON.stringify(stoneObj)));
          }
        });
      });
    }
    originalTable = this.stoneDetailsService.removeDuplicatesFromObject(originalTable, 'stone_id');
    return originalTable;
  }

  removeBtbEntry(tableObj, stoneList) {
    stoneList.forEach(stone => {
      tableObj.table.forEach(stoneObj => {
        if (stone === stoneObj.stone_id) {
          const i = tableObj.table.indexOf(stoneObj);
          const differenceStones = _.difference(tableObj.selectedStones, [stone]);
          tableObj.selectedStones = differenceStones;
          tableObj.selectedStoneArray = [];
          tableObj.table.splice(i, 1);
        }
      });
    });
    return tableObj;
  }

  fetchBTBTime(): Observable<any> {
    return this.http.get(
      `${this.applicationDataService.getEnvironment().B2BApi}
      /btob/${this.authService.getLoginName()}/remainingTime/${this.applicationDataService.getEnvironment().B2BApiVersion}`)
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('BidToBuyService:fetchBTBTime', err))
      );
  }

  createDataEntry(entry) {
    const dataEntry = {
      table: entry,
      toggleTable: false,
      isAllSelected: false,
      selectedStoneArray: [],
      totalCarat: 0
    };
    dataEntry['selectedStones'] = [];
    dataEntry['table'] = this.utilService.updateStonesForDecimal(dataEntry.table);
    return dataEntry;
  }

  fetchBtbCount(): Observable<any> {
    return this.http.get(
      `${this.applicationDataService.getEnvironment().B2BApi}
      /btob/${this.authService.getLoginName()}/getStoneCount/${this.applicationDataService.getEnvironment().B2BApiVersion}`)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('BidToBuyService:fetchBtbCount', err))
      );
  }

  getBtbStoneInfo(stone): Observable<any> {
    const jsonObj = {
      stone_ids: stone
    };
    return this.http.post(
      `${this.applicationDataService.getEnvironment().B2BApi}
      /btob/${this.authService.getLoginName()}/stones/
      ${this.applicationDataService.getEnvironment().B2BApiVersion}`, JSON.stringify(jsonObj))
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('BidToBuyService:getBTBStoneList', err))
      );
  }

  updateRowColor(container, array) {
    if (container) {
      array.table.forEach((stoneObj, index) => {
        // this.stoneDetailsService.showRowColorChanges(container, array.selectedStones, stoneObj.stone_id, index);
      });
    }
  }

  adjustTableHeight(array, toggleTable) {
    let btbHeight = array && array.selectedStoneArray
      && array.selectedStoneArray.length > 0 ? window.innerHeight * (75 / 100) : window.innerHeight * (90 / 100);
    if (toggleTable) {
      btbHeight = window.innerHeight * (33 / 100);
    }
    return btbHeight;
  }

  handlekeyupEvent(id) {
    const inputs = $(document).on('keyup', '#' + id + ' .price-input:input', function (e) {
      if (e.which === 13 || e.which === 40) {
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
    });
  }

  getBtbResultStones(): Observable<any> {
    return this.http.get(
      `${this.applicationDataService.getEnvironment().B2BApi}/btob/
      ${this.authService.getLoginName()}/resultDisplay/${this.applicationDataService.getEnvironment().B2BApiVersion}`)
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('BidToBuyService:getBtbResultStones', err))
      );
  }

}
