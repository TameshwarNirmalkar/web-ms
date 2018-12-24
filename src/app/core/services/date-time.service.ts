import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CustomTranslateService } from './custom-translate.service';
import { AuthService } from './auth.service';
import { ApplicationDataService } from './application-data.service';
import { MessageService } from './message.service';
import { ErrorHandlerService } from './error-handler.service';
import { MessageCodes, MessageCodesComparator } from '../enums/message-codes.enum';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

declare var moment: any;

@Injectable()
export class DateTimeService {

  public srkHoliday: any[] = [];
  public specialEvent: any[] = [];
  public eventDate: any;
  public currentISTtime: any;
  public currentDate: any;

  constructor(private customTranslateService: CustomTranslateService,
    private applicationData: ApplicationDataService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private http: HttpClient,
    private messageService: MessageService, ) { }

  getDisabledDates() {
    const dates: string[] = [];
    this.srkHoliday.forEach(date => {
      const dateArray = date.split('-');
      date = dateArray.reverse().join('-');
      dates.push(date);
    });
    return dates;
  }

  getDisabledWeekDays() {
    let days: number[] = [];
    days = [0, 7];
    return days;
  }

  getHolidayAndSpecialEvent() {
    const year = new Date().getFullYear()
    return this.http.get(this.applicationData.getEnvironment().ApplicationApi
      + '/configMaster/clientConfig/' + this.applicationData.getOrgName() + '/geteventsAndHolidays/'
      + this.applicationData.getEnvironment().ApplicationPreviousVersion + '/'
      + year).subscribe((res) => {
        const srkHolidayAndEvents = JSON.parse(JSON.stringify(res));
        srkHolidayAndEvents.forEach(element => {
          if (element.srk_holiday) {
            if (!element['srk_holiday'].error_status && 
              MessageCodesComparator.AreEqual(element['srk_holiday'].code, MessageCodes.CS_WD_HF_200)) {
              this.srkHoliday = element['srk_holiday']['data'];
            }
          }
          if (element.special_events) {
            if (!element['special_events'].error_status && 
              MessageCodesComparator.AreEqual(element['special_events'].code, MessageCodes.CS_WD_EF_200)) {
              this.specialEvent = element['special_events']['data'];
            }
          }
        });
        return res;
      }, err => {
        return this.errorHandler.handleError('DateTimeService:getHolidayAndSpecialEvent', err);
      });
  }

  fetchCurrentTime(): Observable<any> {
    return this.http.get(
      this.applicationData.getEnvironment().AuditApi + '/exposed/IST/datetime/' +
      this.applicationData.getEnvironment().AuditApiVersion)
      .pipe(
        map((response) => {
          const responseData = JSON.parse(JSON.stringify(response));
          if (MessageCodesComparator.AreEqual(responseData.code, MessageCodes.SUCCESSFULLY_GENERATED_IST_TIME_200)) {
            const currentTime = responseData;
            const hour = currentTime.data.hour;
            const minute = currentTime.data.minute;
            const date = currentTime.data.date;
            const month = currentTime.data.month;
            const year = currentTime.data.year;
            this.currentDate = `${date}-${month}-${year}`;
            this.currentISTtime = `${hour}:${minute}`;
          }
          if (!responseData.error_status && responseData.data) {
            return responseData.data;
          }
        }),
        catchError( err => this.errorHandler.handleError('UtilService:fetchCurrentTime', err))
      );
  }

  setIndianTime(time) {
    this.currentISTtime = time;
  }

  getISTtime() {

    return this.currentISTtime;
  }

  getIndianDate() {
    return this.currentDate;
  }

  getHighlightedDates() {
    const dates = [];
    this.specialEvent.forEach(data => {
      const specialEvent = {
        event_desc: [],
        event_date: ''
      };
      const dateArray = data.event_date.split('-');
      specialEvent.event_date = dateArray.reverse().join('-');
      specialEvent.event_desc = data.event_desc;
      dates.push(specialEvent);
    });
    return dates;
  }

  getAllowTimes(): string[] {
    let times: string[] = [];
    times = this.getTimesFromServer();
    // times = this.convertAllTimesInLocalHours(times);
    return times;
  }

  getAllowTimesSaturday() {
    return ['09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00',
      '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45',
      '15:00'];
  }

  getTimesFromServer(): any[] {
    return ['09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00',
      '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45',
      '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00',
      '17:15', '17:30'];
  }

  getVisitingTime(): any[] {
    return ['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00',
      '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45',
      '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00',
      '17:15'];
  }

  getVisitingTimeSaturday() {
    return ['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00',
      '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45'];
  }

  convertAllTimesInLocalHours(times: any[]): any[] {
    const localTimes: any[] = [];
    for (let x = 0; x <= times.length; x++) {
      if (times[x] !== undefined && times[x] !== null) {
        const localTime: any = moment(times[x], 'HH:mm:ssTZD');
        const hoursMin = localTime.hours() + ':' + localTime.minutes();
        localTimes.push(hoursMin);
      }
    }
    return localTimes;
  }

}
