import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ApplicationDataService } from '@srk/core';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class UserLimitService {


  constructor(private http: HttpClient, private applicationDataService: ApplicationDataService) {
  }

  getClientDataJson(): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().ApplicationApi + '/configMaster/clientconfig/getDisplayConfig/' +
      this.applicationDataService.getEnvironment().ApplicationVersion + '/client_limits');
  }

  getClientRules(): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().ApplicationApi + '/configMaster/clientConfig/getConfig/' +
      this.applicationDataService.getEnvironment().ApplicationVersion + '/client_limits/USER_SPECIFIC/1');
  }

  saveNewRule(ruleArray: any): Observable<any> {
    if (!ruleArray) { return; }
    const body = JSON.stringify(ruleArray);
    return this.http.post(
      this.applicationDataService.getEnvironment().ApplicationApi + '/configMaster/clientconfig/save/' +
      this.applicationDataService.getEnvironment().ApplicationVersion, body)
      .pipe(
        map(res => res),
        catchError(this.handleError)
      );
  }

  saveUpdatedRule(ruleArray: any[]): Observable<any> {
    if (!ruleArray) { return; }
    const body = JSON.stringify(ruleArray);
    return this.http.post(
      this.applicationDataService.getEnvironment().ApplicationApi + '/configMaster/clientconfig/save/' +
      this.applicationDataService.getEnvironment().ApplicationVersion, body)
      .pipe(
        map(res => res),
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    let errMsg: string;
    if (error) {
      return Observable.throw(error);
    } else {
      errMsg = error.message ? error.message : error.toString();
      return Observable.throw(errMsg);
    }
  }
}
