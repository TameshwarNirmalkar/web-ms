import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ErrorHandlerService } from './error-handler.service';
import { empty } from 'rxjs/observable/empty';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ApplicationDataService {

  private readonly orgName = 'srkexports';
  private readonly appName = 'solitaire';
  private readonly searchResultLimit = 4;
  private readonly callingEntity = 'UI';
  private env: any;
  private applicationSettingList: any;
  public auditList: any;
  private applicationSettingsParam = ['view_request_refresh_internval', 'session_expiration', 'request_pickup_destination',
    'enableSmsOtp', 'enableEmailOtp', 'enableCaptcha', 'survey_user_code', 'survey_org'];

  constructor(private http: HttpClient,
    private errorHandler: ErrorHandlerService,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.initEnvironments();
  }

  public getOrgName(): string {
    return this.orgName;
  }

  public getAppName(): string {
    return this.appName;
  }

  public getCallingEntity(): string {
    return this.callingEntity;
  }

  public getEnvironment(): any {
    return this.env;
  }

  public getSearchResultLimit(): number {
    return this.searchResultLimit;
  }

  public getApplicationSettingValue(settingName) {
    let settingValue;
    const applicationList = this.applicationSettingList || JSON.parse(localStorage.getItem('srk-application-setting'));
    for (const setting in applicationList) {
      if (applicationList.hasOwnProperty(setting) &&
        applicationList[setting].hasOwnProperty('entity_value') &&
        settingName === setting) {
        settingValue = applicationList[setting].entity_value;
      }
    }
    return settingValue;
  }

  initEnvironments(): any {
    if (this.env === undefined || this.env === 'undefined' || this.env === null) {
      return this.http.get('../../../assets/env/environment.json').map( (res: any) => {
        this.env = res;
        return this.env;
      });
    }
  }

  initApplicationSetting() {
    const url = `${this.env.ApplicationApi}/clientConfig/getDefaultConfiguration/
    ${this.env.ApplicationVersion}/application_settings?params=${this.applicationSettingsParam.toString()}`;

    return this.http.get(url).pipe(
      map((response) => {
        this.applicationSettingList = response['data'].config_values;
        if (this.isDeviceSupportLocalStorage()) {
          window.localStorage.setItem('srk-application-setting', JSON.stringify(response['data'].config_values));
        }
      }),
      catchError(err => {
        return this.errorHandler.handleError('Application setting', err);
      })
    );
  }

  // This method is duplicate of UserDeviceService method. Kept coz of cyclic dependency.
  private isDeviceSupportLocalStorage(): boolean {
    let hasLocalStorage = false;
    try {
      if (window.localStorage || localStorage.getItem) {
        hasLocalStorage = true;
      } else {
        hasLocalStorage = false;
      }
    } catch (err) {
      hasLocalStorage = false;
    }
    return hasLocalStorage;
  }

  // To get auditing data
  initializeAuditSetting() {
    const url = `${this.env.AuditApi}/exposed/audit/list/${this.env.AuditApiVersion}`;
    return this.http.get(url).pipe(
      map((responseData) => {
        if (this.isDeviceSupportLocalStorage() && !responseData['error_status']) {
          this.auditList = responseData['data'];
          window.localStorage.setItem('srk-audit-setting', JSON.stringify(responseData['data']));
        }
        return responseData;
      }),
      catchError(err => this.errorHandler.handleError('Audit setting', err))
    );
  }

  getAuditData() {
    return this.auditList;
  }

}
