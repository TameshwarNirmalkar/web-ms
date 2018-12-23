import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ErrorHandlerService } from './error-handler.service';
import { ApplicationDataService } from './application-data.service';
import { LoggerService } from './logger.service';
import { AuthService } from './auth.service';
import { UserDeviceService } from './user-device.service';
import { MessageCodes, MessageCodesComparator } from '../enums/message-codes.enum';
import { empty, forkJoin } from 'rxjs';

@Injectable()
export class DaypEventResolverService {

  public isPreDaypActive = false;
  public isDaypActive = false;
  public remainingDaypTime: any;

  constructor(
    private translateService: TranslateService,
    private errorHandler: ErrorHandlerService,
    private applicationDataService: ApplicationDataService,
    private logger: LoggerService,
    private http: HttpClient,
    private userDeviceService: UserDeviceService,
    private authService: AuthService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.initializeDaypEvents();
  }

  initializeDaypEvents(): Observable<any> {
    const daypObservable$ = this.checkDaypSettings();
    daypObservable$.subscribe((data: any[]) => {
      if (!data[0].error_status && MessageCodesComparator.AreEqual(data[0].code, MessageCodes.DAYP_EF_200)) {
        this.isPreDaypActive = data[0].data.isDAYPEventOn;
      }
      if (!data[1].error_status && MessageCodesComparator.AreEqual(data[1].code, MessageCodes.DAYP_EF_200)) {
        this.remainingDaypTime = {
          days: data[1].data.days,
          hours: data[1].data.hours,
          minutes: data[1].data.minutes,
          seconds: data[1].data.seconds,
          start_date: data[1].data.start_date,
          end_date: data[1].data.end_date
        };
        this.isDaypActive = data[1].data.isDAYPEventOn;
      }
    }, (err) => {
      this.logger.logError('DaypEventResolverService:initializeDaypEvents', 'Error while fetching predayp status');
    }, () => {
      return empty();
    });
    return daypObservable$;
  }

  checkDaypSettings() {
    return forkJoin([
      this.http.get(`${this.applicationDataService.getEnvironment().DAYPApi}/dayp/
      ${this.authService.getLoginName()}/preDayp/isdaypon/${this.applicationDataService.getEnvironment().DAYPApiVersion}`),
      this.http.get(`${this.applicationDataService.getEnvironment().DAYPApi}/dayp/
      ${this.authService.getLoginName()}/daypEvent/remainingHour/${this.applicationDataService.getEnvironment().DAYPApiVersion}`)
    ]);
  }

  getPreDaypStatus() {
    return this.isPreDaypActive;
  }

  getDaypStatus() {
    return this.isDaypActive;
  }

  getRemainingDaypTime() {
    return this.remainingDaypTime;
  }

  getDaypEventDetails() {
    return this.http.get(`${this.applicationDataService.getEnvironment().DAYPApi}/dayp/${this.authService.getLoginName()}
    /daypEvent/getEventDetails/${this.applicationDataService.getEnvironment().DAYPApiVersion}`);
      // .catch(err => { return this.errorHandler.handleError('DaypService:finalDaypSubmit', err); });
  }

}
