
import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { ApplicationDataService } from '@srk/core';
import { AuthService } from '@srk/core';
import { ErrorHandlerService } from '@srk/core';
import { AddNoteService } from '@srk/shared';
import { StoneDetailsService } from '@srk/shared';
import * as _ from 'underscore';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class BasketService {

  constructor(
    private http: HttpClient,
    private applicationDataService: ApplicationDataService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService,
    private notesService: AddNoteService,
    private stoneDetailsService: StoneDetailsService
  ) { }

  getMyBasketList(): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().StoneManagementApi +
      '/stonemgt/' + this.authService.getLoginName() + '/basket/getList/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('BasketService:getMyBasketList', err))
      );
  }

  updateStoneDetails(tableData, res) {
    const stoneList = res.stoneList;
    if (stoneList && tableData) {
      stoneList.forEach(confirmStoneId => {
        tableData.diamondTable.forEach((basketStone, index) => {
          if (confirmStoneId === basketStone.stone_id) {
            if (res.source === 'confirmedStones' || res.source === 'holdRequested' || res.source === 'stoneRemovedBasket') {
              tableData.diamondTable.splice(index, 1);
              if (tableData.selectedStones.length > 0) {
                const i = tableData.selectedStones.indexOf(confirmStoneId);
                if (i > -1) {
                  tableData.selectedStones.splice(i, 1);
                }
              }
            } else if (res.source === 'viewRequested') {
              if (basketStone.viewRequestStatus !== 2) {
                basketStone['totalViewRequest']++;
              }
            } else if (res.source === 'ddcRequested') {
              basketStone['ddcStatus'] = res.status;
              basketStone['ddcHour'] = res.hour;
            } else if (res.source === 'b2bRequested') {
              basketStone['isBtbUpdated'] = res.status;
            } else if (res.source === 'onlineViewIncrement') {
              basketStone['totalViewedByUser']++;
            }
          }
        });
      });
    }
    return tableData;
  }

  updateExtraStoneInfo(tableData) {
    if (tableData.length > 0) {
      tableData = this.stoneDetailsService.fetchStoneAdditionalInfo(tableData);
      tableData = this.notesService.fetchStonesComment(tableData);
    }
  }

  fetchStoneDetails(stoneObj) {
    stoneObj.selectedStoneArray = [];
    stoneObj.selectedStones.forEach(stoneId => {
      stoneObj.diamondTable.forEach(stone => {
        if (stoneId === stone.stone_id) {
          stoneObj.selectedStoneArray.push(stone);
        }
      });
    });
    return stoneObj;
  }

  isAllStoneSelected(tableObj) {
    let availableStones = [];
    availableStones = this.fetchConfirmableStones(tableObj.diamondTable);
    if (availableStones.length > 0) {
      tableObj.isAllBasketStonesSelected = this.stoneDetailsService.isArrayMatch(tableObj.selectedStones, availableStones);
    }
    return tableObj;
  }


  fetchConfirmableStones(array) {
    const confirmableStones = [];
    array.forEach(element => {
      if (((element.stone_state === 6)
        || (element.stone_state === 0)
        || (element.stone_state === 3 && element.reason_code !== 1))) {
      } else {
        confirmableStones.push(element.stone_id);
      }
    });
    return confirmableStones;
  }

}
