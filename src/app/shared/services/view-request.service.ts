import { Injectable } from '@angular/core';
import { ErrorHandlerService } from '@srk/core';
import { HttpClient } from '@angular/common/http';
import { ApplicationDataService } from '@srk/core';
import { AuthService } from '@srk/core';
import { StoneDetailsService } from './stone-details.service';
import { ApplicationStorageService } from '@srk/core';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ViewRequestService {

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private applicationDataService: ApplicationDataService,
    private stoneDetailsService: StoneDetailsService,
    private authService: AuthService
  ) { }

  saveViewRequestStone(data, url): Observable<any> {
    data = JSON.stringify(data);
    return this.http.post(url, data)
      .pipe(
        map((res) => {
          if (!res['error_status']) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('ViewRequestService:saveViewRequestStone', err))
      );
  }

  hasTodayVisit(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/viewRequest/todaysViewRequestExists/'
      + this.applicationDataService.getEnvironment().StoneManagementApiVersion)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('ViewRequestService:hasTodayVisit', err))
      );
  }

  getUpcomingDataList(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/28/viewRequest/getList/' + this.applicationDataService.getEnvironment().StoneManagementApiVersion + '/upcoming')
      // return this.http.get('../../../../assets/JSON/upcoming.json')
      .pipe(
        map(res => {
          if (!res['error_status']) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('ViewRequestService:getUpcomingDataList', err))
      );
  }

  getPastDataList(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/viewRequest/getList/'
      + this.applicationDataService.getEnvironment().StoneManagementApiVersion + '/past')
      // return this.http.get('../../../../assets/JSON/past.json')
      .pipe(
        map(res => {
          if (!res['error_status']) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('ViewRequestService:getPastDataList', err))
      );
  }

  getTodayRequestList(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/viewRequest/getList/'
      + this.applicationDataService.getEnvironment().StoneManagementApiVersion + '/today')
      // return this.http.get('../../../../assets/JSON/past.json')
      .pipe(
        map(res => {
          if (!res['error_status']) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('ViewRequestService:getTodayRequestList', err))
      );
  }

  cancelVisit(date): Observable<any> {
    date = JSON.stringify(date);
    return this.http.post(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/viewRequest/deleteViewRequest/'
      + this.applicationDataService.getEnvironment().StoneManagementApiVersion, date)
      .pipe(
        map(res => {
          if (!res['error_status']) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('ViewRequestService:cancelVisit', err))
      );
  }

  removeViewRequestStone(value): Observable<any> {
    value = JSON.stringify(value);
    return this.http.post(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/viewRequest/removeStone/'
      + this.applicationDataService.getEnvironment().StoneManagementApiVersion, value)
      .pipe(
        map(res => {
          if (!res['error_status']) {
            return res;
            }
        }),
        catchError(err => this.errorHandler.handleError('ViewRequestService:removeViewRequestStone', err))
      );
  }

  requestPickup(value, url): Observable<any> {
    value = JSON.stringify(value);
    return this.http.post(url, value)
      .pipe(
        map(res => {
          if (!res['error_status']) {
            return res;
            }
        }),
        catchError(err => this.errorHandler.handleError('ViewRequestService:requestPickup', err))
      );
  }

  getPickUpDetails(pickUpId): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/viewRequest/getPickupDetails/'
      + this.applicationDataService.getEnvironment().StoneManagementApiVersion + '/' + pickUpId)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('ViewRequestService:getPickUpDetails', err))
      );
  }

  addNewComments(comment, date): Observable<any> {
    const commentData = {
      view_date_time: date,
      comment: comment
    };
    return this.http.post(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/viewRequest/addComment/'
      + this.applicationDataService.getEnvironment().StoneManagementApiVersion,
      JSON.stringify(commentData))
      .pipe(
        map(res => {
          if (!res['error_status']) {
            return res;
            }
        }),
        catchError(err => this.errorHandler.handleError('ViewRequestService:addNewComments', err))
      );
  }

  updateNewTime(dateTimeJson): Observable<any> {
    return this.http.post(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/viewRequest/editDate/'
      + this.applicationDataService.getEnvironment().StoneManagementApiVersion,
      JSON.stringify(dateTimeJson))
      .pipe(
        map(res => {
          if (!res['error_status']) {
            return res;
            }
        }),
        catchError(err => this.errorHandler.handleError('ViewRequestService:updateNewTime', err))
      );
  }

  sortByDateTime(requestData, boolean) {
    requestData.sort(function (obj1, obj2) {
      if (obj1.view_date_time < obj2.view_date_time) {
        return -1;
      } else if (obj1.view_date_time > obj2.view_date_time) {
        return 1;
      } else {
        return 0;
      }
    });
    if (boolean) {
      requestData.reverse();
    }
    return requestData;
  }

  fetchConfirmableStones(array) {
    const confirmableStones = [];
    if (array.table && array.table.length > 0) {
      array.table.forEach(element => {
        if (((element.stone_state !== 6)
          || (element.stone_state !== 0)
          || (element.stone_state !== 3 && element.reason_code === 1))) {
            confirmableStones.push(element.stone_id);
        }
      });
    }
    return confirmableStones;
  }

  removeUnselectedStones(array, stones) {
    array.table.forEach(data => {
      const allSelectedStoneArray = JSON.parse(JSON.stringify(array.selectedStones));
      stones.forEach(stone_id => {
        const i = allSelectedStoneArray.indexOf(stone_id);
        if (i !== -1) {
          allSelectedStoneArray.splice(i, 1);
        }
      });
      data.selectedStones = allSelectedStoneArray;
      data = this.filterFetchedSelectedStones(array);
    });
    return array;
  }

  filterFetchedSelectedStones(array) {
    let availableStones = [];
    if (array) {
      availableStones = this.fetchConfirmableStones(array);
      if (availableStones.length > 0) {
        array.isAllSelected = this.stoneDetailsService.isArrayMatch(array.selectedStones, availableStones);
      }
    }
    return array;
  }

  fetchSelectedStoneDetails(selectedStones, array) {
    const selectedStonesArray = [];
    selectedStones.forEach(stone => {
      // array.forEach(data => {
      //   if (data.table && data.table.length > 0) {
          array.forEach(tableStone => {
            if (tableStone.stone_id === stone) {
              selectedStonesArray.push(tableStone);
            }
          });
      //   }
      // });
    });
    return this.stoneDetailsService.removeDuplicatesFromObject(selectedStonesArray, 'stone_id');
    // return selectedStonesArray;
  }

  isAllStoneSelected(array) {
    if (array.isAllSelected) {
      array.selectedStones = [];
      array.selectedStones = this.fetchConfirmableStones(array);
    } else {
      array.selectedStones = [];
    }
    return array;
  }

  fetchAllSelectedStones(array) {
    const allSelectedStones = [];
    // array.forEach(element => {
      array.selectedStones.forEach(stones => {
        allSelectedStones.push(stones);
      });
    // });
    return this.stoneDetailsService.removeDuplicateItemFromArray(allSelectedStones);
  }

  updateTableStoneDetails(requestedEntry, stoneList, res) {
    let stonesActedOn = false;
    stoneList.forEach((confirmStoneId, index) => {
      requestedEntry.table.forEach((tableStone, idx) => {
        if (tableStone.stone_id === confirmStoneId) {
          if (res.source === 'confirmedStones') {
            tableStone.stone_state = 6;
            // data.not_available_stones++;
            requestedEntry.table.splice(idx, 1);
            this.removeConfirmedStone([confirmStoneId], requestedEntry.selectedStones);
            requestedEntry = this.filterFetchedSelectedStones(requestedEntry);
            stonesActedOn = true;
          } else if (res.source === 'ddcRequested') {
            tableStone['ddcStatus'] = res.status;
            tableStone['ddcHour'] = res.hour;
            stonesActedOn = true;
          } else if (res.source === 'basketRequested') {
            tableStone['isBasket'] = 1;
            tableStone['basketStatus'] = '=';
            stonesActedOn = true;
          } else if (res.source === 'holdRequested') {
            this.removeHoldStones(confirmStoneId, requestedEntry);
            this.removeConfirmedStone([confirmStoneId], requestedEntry.selectedStones);
            requestedEntry = this.filterFetchedSelectedStones(requestedEntry);
            stonesActedOn = true;
          } else if (res.source === 'viewRequested') {
            if (tableStone.viewRequestStatus !== 2) {
              tableStone['totalViewRequest']++;
              stonesActedOn = true;
            }
          } else if (res.source === 'b2bRequested') {
            tableStone['isBtbUpdated'] = res.status;
            stonesActedOn = true;
          } else if (res.source === 'onlineViewIncrement') {
            tableStone['totalViewedByUser']++;
            stonesActedOn = true;
          }
        }
      });
    });
    this.removeEmptyEntry(requestedEntry);
    return [requestedEntry,stonesActedOn];
  }

  removeConfirmedStone(array, array2) {
    array.forEach((value) => {
      if (array2.indexOf(value) > -1) {
        const i = array2.indexOf(value);
        array2.splice(i, 1);
      }
    });
  }

  removeHoldStones(id, requestedEntry) {
    requestedEntry.forEach(data => {
      data.table.forEach(tableObj => {
        if (id === tableObj.stone_id) {
          const i = data.table.indexOf(tableObj);
          if (i > -1) {
            data.table.splice(i, 1);
          }
        }
      });
    });
  }

  removeEmptyEntry(requestedEntry) {
    // requestedEntry.forEach(data => {
    //   if (data.table.length === 0) {
    //     const i = requestedEntry.indexOf(data);
    //     if (i > -1) {
    //       requestedEntry.splice(i, 1);
    //     }
    //   }
    // });
  }

  removeStoneFromList(requestedEntry, time, id) {
    requestedEntry.forEach(data => {
      if (time === data.data.view_date_time) {
        data.table.forEach(stones => {
          if (id === stones.stone_id) {
            const i = data.table.indexOf(stones);
            if (i > -1) {
              data.data.not_available_stones--;
              data.table.splice(i, 1);
            }
          }
        });
      }
    });
    this.removeEmptyEntry(requestedEntry);
    return requestedEntry;
  }

  fetchStoneAdditionalInfo(array) {
    this.stoneDetailsService.storeStoneAdditionalInfo(array).subscribe(res => {
      array['table'] = res;
    });
    return array;
  }


  updateRowColor(container, array, selectedStones) {
    if (container) {
      const dataSrc = container.instance.getDataSource();
      if (dataSrc && dataSrc.hasOwnProperty('_items') && dataSrc._items.length > 0) {
        array = dataSrc._items;
        array.forEach((element, index) => {
          this.stoneDetailsService.showRowColorChanges(container, selectedStones, element.stone_id, index);
        });
      }
    }
  }
}
