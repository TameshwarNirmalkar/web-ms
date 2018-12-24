import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { AuthService } from '@srk/core';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class DdcService {

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private applicationDataService: ApplicationDataService,
    private auth: AuthService) { }

  getDDCstoneDetails(): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().StoneManagementApi + '/stonemgt/' +
      this.auth.getLoginName() + '/ddc/list/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion + '?activity_id=12')
      .pipe(
        map((response) => {
          if (!response['error_status']) {
            return response;
          }
        }),
        catchError(err => this.errorHandler.handleError('DdcService:getDDCstoneDetails', err))
      );
  }

  saveStoneToDDC(savePayload, params): Observable<any> {
    return this.http.post(
      `${this.applicationDataService.getEnvironment().StoneManagementApi}/stonemgt/
      ${this.auth.getLoginName()}/ddc/${params}/${this.applicationDataService.getEnvironment().StoneManagementApiVersion}`,
      JSON.stringify(savePayload))
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('DdcService:saveStoneToDDC', err))
      );
  }

  removeDDCFromStone(stoneList): Observable<any> {
    const config = {
      'stone_ids': stoneList,
      'audit': {
        'action_id': 12,
        'activity_id': 1
      }
    };
    return this.http.post(
      `${this.applicationDataService.getEnvironment().StoneManagementApi}/stonemgt/${this.auth.getLoginName()}
      /ddc/remove/${this.applicationDataService.getEnvironment().StoneManagementApiVersion}`,
      JSON.stringify(config))
      .pipe(
        map((response: Response) => {
          const responseData = response.json();
          return responseData;
        }),
        catchError(err => this.errorHandler.handleError('DdcService:removeDDCFromStone', err))
      );
  }

  getDDCHours(stoneList): Observable<any> {
    const payload = {
      'stone_ids': stoneList
    };
    return this.http.post(
      this.applicationDataService.getEnvironment().StoneManagementApi + '/stonemgt/'
      + this.auth.getLoginName() + '/ddcHour/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion, JSON.stringify(payload))
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('DdcService:getDDCHourss', err))
      );
  }
}
