import { Injectable } from '@angular/core';
import { UserDeviceService } from './user-device.service';
import { UserDetailService } from './user-detail.service';
import { LogMap } from '../models/log-map';
import { Log } from '../models/log';
import { ApplicationDataService } from './application-data.service';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LoggerService {

  private logDtl: Log;
  private sessionId: string;
  private userDetail: any = {
    name: '',
    email: '',
    id: ''
  };

  constructor(
    private applicationDataService: ApplicationDataService,
    private userDeviceService: UserDeviceService,
    private userDetailService: UserDetailService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  initLoggingContext() {
    this.logDtl = new Log(this.applicationDataService.getOrgName(), this.applicationDataService.getAppName(),
      this.applicationDataService.getCallingEntity(), this.userDeviceService.fetchUserDeviceDetails());
  }

  logInfo(componentName: string, stack_trace: string) {
    this.logDtl.severity = 'INFO';
    this.log(componentName, stack_trace);
  }

  logError(componentName: string, stack_trace: string) {
    this.logDtl.severity = 'ERROR';
    this.log(componentName, stack_trace);
  }

  private log(componentName: string, stack_trace: string): void {
    const currentLog = Object.assign({}, this.logDtl);
    currentLog.session_id = this.authService.getToken();
    currentLog.user_details = this.getUserDetails();
    currentLog.log_map = this.createLogMapping(componentName);
    currentLog.date_time = this.getLogTime();
    currentLog.stack_trace = stack_trace;
    this.postLog(currentLog).subscribe(res => res);
  }

  private postLog(log) {
    log = JSON.stringify(log);
    return this.http.post(`${this.applicationDataService.getEnvironment().ApplicationApi}/configMaster/clientConfig/printLog/v1`, log);
  }

  private getLogTime(): string {
    const now: any = new Date();
    return now.toGMTString();
  }

  private getUserDetails(): any {
    const userDtl = this.authService.getUserDetail();
    if (this.userDetail.name === '' && userDtl !== undefined && userDtl !== null) {
      this.userDetail.name = userDtl.login_name;
      this.userDetail.email = userDtl.email;
      this.userDetail.id = userDtl.party_id;
    }
    return this.userDetail;
  }

  private createLogMapping(sourceComponent: string ): LogMap {
    const logMap: LogMap = <LogMap>{};
    logMap.token = sourceComponent;
    logMap.sequence = '0';
    logMap.parent = 'WEB';
    logMap.child = '';
    return logMap;
  }
}
