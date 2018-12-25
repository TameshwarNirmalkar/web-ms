import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApplicationDataService } from '@srk/core';
import { AuthService } from '@srk/core';
import { ErrorHandlerService } from '@srk/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ConfirmationService {

  constructor(
    private http: HttpClient,
    private appDataSvc: ApplicationDataService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService
  ) { }

  getMyConfirmations(component, label, year, weekNo, weekStart, weekEnd): Observable<any> {
    return this.http.get(this.appDataSvc.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/stone/getconfirmedstone/'
      + this.appDataSvc.getEnvironment().StoneManagementApiVersion
      + '/' + weekNo + '?activity_id=5&&start_date=' + weekStart + '&&end_date=' + weekEnd)
      .pipe(
        map((res: any) => {
          res.data.label = label;
          res.data.weekNo = weekNo;
          return res;
        }),
        catchError(err => this.errorHandler.handleError(component + 'Error while fetching User Confirmation detail  ', err))
      );
  }

  getWeekForDay(component: string, year: number, date: string): Observable<any> {
    return this.http.get(this.appDataSvc.getEnvironment().ApplicationApi
      + '/configMaster/clientConfig/' + this.appDataSvc.getOrgName() + '/getDateData/'
      + this.appDataSvc.getEnvironment().ApplicationVersion + '?date=' + date)
      .pipe(
        map(res => res),
        catchError(err => {
          const requestString = 'Error while fetching Week for year:' + year + ' and date:' + date;
          return this.errorHandler.handleError(component + requestString, err);
        })
      );
  }

  getLiveWvd(weekNo, stoneIds): Observable<any> {
    const obj = {
      'stone_ids': stoneIds
    };
    return this.http.post(this.appDataSvc.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/stone/liveWvd/'
      + this.appDataSvc.getEnvironment().StoneManagementApiVersion + '/'
      + weekNo, JSON.stringify(obj))
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('ConfirmationService:getLiveWvd', err))
      );
  }

  // My Invoice

  /*
  *   List of all the invoice generated with tracking detail
  */

  listInvoices(component): Observable<any> {
    return this.http.get(this.appDataSvc.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/proformainvoice/list/v1')
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError(component + 'Error while fetching User Confirmation detail  ', err))
      );
  }

  /*
  *   Generate invoice for list of selected stones
  http://stonemanagement-ms.qa.aptitudelabs.com/stonemgt/2992/proformainvoice/create/v1
  {
  "stoneIds": [1115140060, 1101720001]
  }
  */

  createInvoice(data) : Observable<any> {
    return this.http.post(this.appDataSvc.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/proformainvoice/updateandgenerate/v1', data)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('ConfirmationService:createInvoice', err))
      );
  }

  /*
  *   Create new invoice page pre-fill data for list of selected stones
  */

  generateInvoice(stoneList): Observable<any> {
    const invoice = {
      stoneIds: stoneList
    };

    return this.http.post(this.appDataSvc.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/proformainvoice/create/v1', invoice)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('ConfirmationService:generateInvoice', err))
      );
  }

  /*
  *   initWorkflow for stone
  */

  initWorkflow(processKey, invoiceId): Observable<any> {
    const data = { 'token': this.authService.getToken() };
    return this.http.post(this.appDataSvc.getEnvironment().diamondOrderManagementApi
      + '/initWorkflow/' + this.appDataSvc.getEnvironment().diamondOrderManagementApiVersion + '/' + processKey + '/' + invoiceId, data)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('ConfirmationService:initWorkflow ', err))
      );
  }

  /*
  *   getWorkflowStatus for stone
  */

  getWorkflowStatus(processKey, invoiceId): Observable<any> {
    return this.http.get(this.appDataSvc.getEnvironment().diamondOrderManagementApi
      + '/getWorkflowStatus/' + this.appDataSvc.getEnvironment().diamondOrderManagementApiVersion + '/' + processKey + '/' + invoiceId)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('ConfirmationService:getWorkflowStatus', err))
      );
  }

  /*
  *   approve for stone
  */

  approveWorkFlow(processKey, invoiceId): Observable<any> {
    return this.http.get(this.appDataSvc.getEnvironment().diamondOrderManagementApi
      + '/approve/' + this.appDataSvc.getEnvironment().diamondOrderManagementApiVersion + '/' + processKey + '/' + invoiceId)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('ConfirmationService:approveWorkFlow', err))
      );
  }

  /*
  *   getHistoryTasks for stone
  */

  getHistoryTasks(processKey, invoiceId): Observable<any> {
    return this.http.get(this.appDataSvc.getEnvironment().diamondOrderManagementApi
      + '/getHistoryTasks/' + this.appDataSvc.getEnvironment().diamondOrderManagementApiVersion + '/' + processKey + '/' + invoiceId)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('ConfirmationService:getHistoryTasks', err))
      );
  }

  /*
  *   Get list of verified delivery address
  */

  userAddresses(component, year, weekNo): Observable<any> {
    return this.http.get(this.appDataSvc.getEnvironment().StoneManagementApi
      + '/stonemgt/ritesh.khatri/stone/getconfirmedstone/'
      + this.appDataSvc.getEnvironment().StoneManagementApiVersion
      + '/' + weekNo + '?activity_id=5')
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError(component + 'Error while fetching User Confirmation detail  ', err))
      );
  }

  /*
  *   Add new delivery address
  */

  addAddress(component, year, weekNo): Observable<any> {
    return this.http.get(this.appDataSvc.getEnvironment().StoneManagementApi
      + '/stonemgt/ritesh.khatri/stone/getconfirmedstone/'
      + this.appDataSvc.getEnvironment().StoneManagementApiVersion
      + '/' + weekNo + '?activity_id=5')
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError(component + 'Error while fetching User Confirmation detail  ', err))
      );
  }

  getDatePeriodData(startDate, endDate): Observable<any> {
    return this.http.get(this.appDataSvc.getEnvironment().ApplicationApi
      + '/configMaster/clientConfig/' + this.appDataSvc.getOrgName() + '/getDatePeriodData/weekWise/'
      + this.appDataSvc.getEnvironment().ApplicationVersion + '?date_from='
      + startDate + '&date_to=' + endDate)
      .pipe(
        map(res => res),
        catchError(err => {
          const requestString = 'Error while fetching data from:'
            + startDate + ' to:' + endDate;
          return this.errorHandler.handleError(requestString, err);
        })
      );
  }
}
