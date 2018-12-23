import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';
import { ApplicationDataService } from './application-data.service';
import { LoggerService } from './logger.service';
import { MessageCodes, MessageCodesComparator } from '../enums/message-codes.enum';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';
import { empty } from 'rxjs';
@Injectable()
export class EventDetailsService {
  public eventInfo: any[] = [];
  public isRemoveVisible: any;
  public tabToRedirect: any;
  constructor(private translateService: TranslateService,
    private errorHandler: ErrorHandlerService,
    private applicationDataService: ApplicationDataService,
    private logger: LoggerService,
    private authService: AuthService,
    private http: HttpClient) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.getEventDetailsInfo();
  }

  getEventDetailsInfo() {
    return this.http.get(this.applicationDataService.getEnvironment().EventApi
      + '/event/running/' + this.applicationDataService.getEnvironment().EventApiVersion).pipe(
      map(res => {
        if (!res['error_status'] &&
          MessageCodesComparator.AreEqual(res['code'], MessageCodes.EVENT_REF_200)) {
          this.eventInfo = res['data'];
        } else if (!res['error_status'] &&
          MessageCodesComparator.AreEqual(res['code'], MessageCodes.EVENT_NRS_200)) {
          this.eventInfo = [];
        } else {
          this.eventInfo = [];
        }
      }),
      catchError(err => {
        this.eventInfo = [];
        this.errorHandler.handleError('EventDetailsService:getEventDetailsInfo', err);
        return empty();
      })
      );
  }

  getEventKamDetailsInfo(eventId) {
    return this.http.get(this.applicationDataService.getEnvironment().EventApi
      + '/event/' + eventId + '/kamDetail/' + this.applicationDataService.getEnvironment().EventApiVersion).pipe(
      map((responseData) => {
        // const responseData = response;
        if (!responseData['error_status'] &&
          MessageCodesComparator.AreEqual(responseData['code'], MessageCodes.EVENT_KDFEF_200)) {
          return responseData['kamDetail'];
        } else {
          return {};
        }
      }),
      catchError(err => {
        return this.errorHandler.handleError('EventDetailsService:getEventKamDetailsInfo', err); 
      })
    );
  }

  fetchEventHighlights(eventId) {
    return this.http.get(this.applicationDataService.getEnvironment().EventApi
      + '/event/' + eventId + '/highlights/card/' + this.applicationDataService.getEnvironment().EventApiVersion).pipe(
      map((response) => {
        return response;
      }),
      catchError(err => this.errorHandler.handleError('EventDetailsService:getEventKamDetailsInfo', err))
    );
  }

  getEventInfo() {
    return this.eventInfo;
  }

  fetchEventImages(eventId) {
    return this.http.get(this.applicationDataService.getEnvironment().EventApi
      + '/event/' + eventId + '/images/' + this.applicationDataService.getEnvironment().EventApiVersion).pipe(
        map((response) => {
        return response;
      }),
      catchError(err => this.errorHandler.handleError('EventDetailsService:fetchEventImages', err))
    );
  }

  handleTableSelection(array, id) {
    let stoneAlreadySelected = false;
    array.selectedStoneTable.forEach((selectedStone) => {
      if (selectedStone.stone_id === id) {
        const i = array.selectedStoneTable.indexOf(selectedStone);
        array.selectedStoneTable.splice(i, 1);
        stoneAlreadySelected = true;
      }
    });

    array.filteredSelectedStoneArray.forEach((filterStone) => {
      if (filterStone === id) {
        const i = array.filteredSelectedStoneArray.indexOf(filterStone);
        array.filteredSelectedStoneArray.splice(i, 1);
      }
    });

    if (!stoneAlreadySelected) {
      array.stockTable.forEach((stoneInfo) => {
        if (stoneInfo.stone_id === id) {
          stoneInfo = JSON.parse(JSON.stringify(stoneInfo));
          array.selectedStoneTable.push(stoneInfo);
          array.filteredSelectedStoneArray.push(id);
          array.isAllSelectedStoneSelected = true;
        }
      });
    }
    return array;
  }

  reorderEventDetails(requestData, orderValue) {
    if (requestData.length > 0) {
      requestData.sort(function (obj1, obj2) {
        if (obj1[orderValue] < obj2[orderValue]) {
          return -1;
        } else if (obj1[orderValue] > obj2[orderValue]) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    return requestData;
  }

  updateIconsStatusInfo(array, res) {
    const stoneListArray = res.stoneList;
    stoneListArray.forEach(confirmStoneId => {
      array.forEach(tableStone => {
        if (tableStone.stone_id === confirmStoneId) {
          if (res.source === 'confirmedStones') {
            tableStone.stone_state = 6;
          } else if (res.source === 'ddcRequested') {
            tableStone['ddcStatus'] = res.status;
            tableStone['ddcHour'] = res.hour;
          } else if (res.source === 'basketRequested') {
            tableStone['isBasket'] = 1;
            tableStone['basketStatus'] = '=';
          } else if (res.source === 'onlineViewIncrement') {
            tableStone['totalViewedByUser']++;
          } else if (res.source === 'b2bRequested') {
            tableStone['isBtbUpdated'] = res.status;
          } else if (res.source === 'viewInShowRequested') {
            if (tableStone.viewRequestStatus !== 2) {
              tableStone['totalViewRequest']++;
            }
          }
        }
      });
    });
  }

  fetchAvailableEventDates(eventId) {
    return this.http.get(this.applicationDataService.getEnvironment().EventApi
      + '/event/' + eventId + '/available/dates/' + this.applicationDataService.getEnvironment().EventApiVersion).pipe(
      map((response) => {
        return response;
      }),
      catchError(err => this.errorHandler.handleError('EventDetailsService:fetchAvailableEventDates', err))
    );
  }

  fetchAvailableDaySlots(eventId, date) {
    return this.http.get(this.applicationDataService.getEnvironment().EventApi
      + '/event/' + eventId + '/available/' + date + '/slots/' + this.applicationDataService.getEnvironment().EventApiVersion).pipe(
        map((response) => {
          return response;
        }),
        catchError(err => this.errorHandler.handleError('EventDetailsService:fetchAvailableDaySlots', err))
      );
  }

  fetchAvailableTimeSlots(eventId, date, day) {
    return this.http.get(`${this.applicationDataService.getEnvironment().EventApi}
    /event/${eventId}/available/${date}/slots/${day}/${this.applicationDataService.getEnvironment().EventApiVersion}`).pipe(
      map((response) => {
        return response;
      }),
      catchError(err => this.errorHandler.handleError('EventDetailsService:fetchAvailableTimeSlots', err))
    );
  }

  submitAppointmentRequest(appointmentObj) {
    return this.http.post(this.applicationDataService.getEnvironment().EventApi
      + '/event/' + this.authService.getLoginName() + '/appointment/book/' + this.applicationDataService.getEnvironment().EventApiVersion,
      appointmentObj).pipe(
        map((response) => {
          return response;
        }),
        catchError(err => this.errorHandler.handleError('EventDetailsService:submitAppointmentRequest', err))
      );
  }

  fetchSubmittedAppointment(eventId) {
    return this.http.get(`${this.applicationDataService.getEnvironment().EventApi}
      /event/${eventId}/appointment/list/${this.applicationDataService.getEnvironment().EventApiVersion}`).pipe(
      map((response: Response) => {
        return response.json();
      }),
      catchError(err => this.errorHandler.handleError('EventDetailsService:fetchSubmittedAppointment', err))
    );
  }

  updateAppointmentRequest(appointmentObj) {
    return this.http.post(`${this.applicationDataService.getEnvironment().EventApi}
      /event/${this.authService.getLoginName()}/appointment/update/${this.applicationDataService.getEnvironment().EventApiVersion}`,
      appointmentObj).pipe(
        map((response) => {
          return response;
        }),
        catchError(err => this.errorHandler.handleError('EventDetailsService:updateAppointmentRequest', err))
      );
  }

  addStoneViewShow(showObj, eventId) {
    return this.http.post(`${this.applicationDataService.getEnvironment().EventApi}
      /event/${eventId}/selection/viewInShow/${this.applicationDataService.getEnvironment().EventApiVersion}`,
      showObj).pipe(
        map((response) => {
          return response;
        }),
        catchError(err => this.errorHandler.handleError('EventDetailsService:addStoneViewShow', err))
    );
  }

  requestCancelAppointment(cancelObj, eventId) {
    const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(cancelObj)
    };
    return this.http.delete(`${this.applicationDataService.getEnvironment().EventApi}
      /event/${eventId}/appointment/delete/${this.applicationDataService.getEnvironment().EventApiVersion}`,
      httpOptions).pipe(
        map((response) => {
          return response;
        }),
        catchError(err => this.errorHandler.handleError('EventDetailsService:requestCancelAppointment', err))
      );
  }

  fetchPreSelectedEventStones(eventId) {
    return this.http.get(`${this.applicationDataService.getEnvironment().EventApi}
      /event/${eventId}/selection/list/${this.applicationDataService.getEnvironment().EventApiVersion}`).pipe(
      map((response) => {
        return response;
      }),
      catchError(err => this.errorHandler.handleError('EventDetailsService:fetchPreSelectedEventStones', err))
    );
  }

  checkPreEventSelectionPermission() {
    return this.http.get(`${this.applicationDataService.getEnvironment().EventApi}
      /event/${this.authService.getLoginName()}/selection/checkPermission/
      ${this.applicationDataService.getEnvironment().EventApiVersion}`).pipe(
      map((res) => {
        return res;
      }),
      catchError(err => this.errorHandler.handleError('AuthService:checkPreEventSelectionPermission', err))
    );
  }

  addStoneToEvent(stoneObj, eventId) {
    const stoneBody = {
      'stone_ids': stoneObj
    };
    return this.http.post(`${this.applicationDataService.getEnvironment().EventApi}
      /event/${eventId}/selection/add/${this.applicationDataService.getEnvironment().EventApiVersion}`,
      JSON.stringify(stoneBody)).pipe(
      map((response) => {
        return response;
      }),
      catchError(err => this.errorHandler.handleError('EventDetailsService:addStoneToEvent', err))
    );
  }

  removePreSelectedStones(eventId, stoneObj) {
    const stoneBody = {
      'stone_ids': stoneObj
    };
    return this.http.post(`${this.applicationDataService.getEnvironment().EventApi}
      /event/${eventId}/selection/remove/${this.applicationDataService.getEnvironment().EventApiVersion}`,
      JSON.stringify(stoneBody)).pipe(
        map((response) => {
          return response;
        }),
        catchError(err => this.errorHandler.handleError('EventDetailsService:removePreSelectedStones', err))
      );
  }

  removeStoneFromAppointment(obj, eventCode) {
    const payload = {body: JSON.stringify(obj)};
    const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }), payload
    };
    return this.http.delete(`${this.applicationDataService.getEnvironment().EventApi}
      /event/${eventCode}/appointment/deleteStones/${this.applicationDataService.getEnvironment().EventApiVersion}`,
      httpOptions).pipe(
        map((response) => {
          return response;
        }),
        catchError(err => this.errorHandler.handleError('EventDetailsService:removeStoneFromAppointment', err))
    );
  }

  addNewComments(comment, id) {
    const commentData = {
      appointment_id: Number(id),
      comment: comment
    };
    return this.http.post(`${this.applicationDataService.getEnvironment().StoneManagementApi}
      /stonemgt/${this.authService.getLoginName() }/viewRequest/addComment/'
      ${this.applicationDataService.getEnvironment().StoneManagementApiVersion}`,
      JSON.stringify(commentData)).pipe(
        map((res) => {
          const response = res;
          if (!response['error_status']) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('EventDetailsService:addNewComments', err))
      );
  }

  arrangePreSelectedStones(table) {
    const eventStones = [];
    const regularStones = [];
    table.forEach(stone => {
      if (stone.event_id) {
        eventStones.push(stone);
      } else {
        regularStones.push(stone);
      }
    });
    return eventStones.concat(regularStones);
  }

  setBooleanForRemoveButton(param) {
    this.isRemoveVisible = param;
  }

  getBooleanForRemoveButton() {
    return this.isRemoveVisible;
  }

  setTabToBeOpen(tabName) {
    this.tabToRedirect = tabName;
  }

  getTabWhichToBeOpen() {
    return this.tabToRedirect;
  }
}
