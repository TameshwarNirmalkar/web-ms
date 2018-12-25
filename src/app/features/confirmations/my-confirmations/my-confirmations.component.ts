import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ConfirmationService } from '../confirmation.service';
import { UtilService } from '@srk/shared';
import { NotifyService } from '@srk/core';
import { MessageService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';
import { DownloadStonesService } from '@srk/shared';
import { UserProfileService } from '@srk/core';
import { Observable } from 'rxjs/Observable';
import * as _ from 'underscore';

@Component({
  selector: 'app-my-confirmations',
  templateUrl: './my-confirmations.component.html',
  styleUrls: ['./my-confirmations.component.scss'],

})
export class MyConfirmationsComponent implements OnInit, OnDestroy {
  public myConfirmations: any[] = [];
  public displayConfirmations: any[];
  public eligible_discount: any;
  public pending_discount: any;
  public given_discount: any;
  public weeks: any[] = [];
  public selectedWeek: any;
  private showWeekHistory: number;
  public responseReceived = false;
  readonly yearFirstWeek = 1;
  readonly yearLastWeek = 53;
  public selectedStones: any[] = [];
  public downloadPopOverVisible = false;
  public selectedDownloadType: any;
  public confirmations: any[] = [];
  public clientLimit = 3;
  private isLoadMoreDisable = false;
  public sortedMyConfirmations: any[] = [];
  public totalConfirmationList = 0;
  public showLoadingMessage = true;
  public message: any;
  public confirmationFlag = false;
  public apiCount = 1;
  public displayWeekCount = 0;
  public latestWeekArray = [];
  public responseWeekLength: any;
  public dataFetchForWeekCounter = 0;

  constructor(
    private confirmationService: ConfirmationService,
    private utilService: UtilService,
    private notify: NotifyService,
    public messageService: MessageService,
    private appStore: ApplicationStorageService,
    private stoneDetailsService: StoneDetailsService,
    public downloadSvc: DownloadStonesService,
    public userProfileService: UserProfileService
  ) { }


  ngOnInit() {
    this.message = 'Loading..';
    if (this.userProfileService.getClientLimits() && this.userProfileService.getClientLimits().confirmation_week_limit) {
      const historyDays = this.userProfileService.getClientLimits().confirmation_week_limit.entity_value;
      let weeks = Number(historyDays) / 7;
      weeks = (weeks % 7 !== 0) ? weeks + 1 : weeks;
      this.showWeekHistory = Math.round(weeks);
    } else {
      this.showWeekHistory = 0;
    }
    this.getWeekForDay();
  }

  getWeekForDay() {
    const currentDate = new Date();
    const year: number = currentDate.getFullYear();
    const date = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();
    this.confirmationService.getWeekForDay('MyConfirmationsComponent', year, date).subscribe((res) => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.CS_WD_DF_200)) {
        const tempDate = new Date(res.data[0].week_start_date);
        const daysOff = (this.showWeekHistory - 1) * 7;
        const historyStartDate = this.utilService.tranformDate(this.utilService.fetchISTTime(new Date(tempDate.setDate(tempDate.getDate() - daysOff))), 'yyyy-MM-dd');
        const historyEndDate = this.utilService.tranformDate(this.utilService.fetchISTTime(new Date(res.data[0].week_end_date)), 'yyyy-MM-dd');
        this.confirmationService.getDatePeriodData(historyStartDate, historyEndDate).subscribe(res => {
          this.getWeekOptionsData(res.data);
          if (res && res.data) {
            this.responseWeekLength = res.data.length;
          }
        }, err => {
          this.message = 'SERVER_ERROR_OCCURRED';
        });
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  getWeekOptionsData(weekList) {
    if (weekList !== undefined) {
      weekList.forEach(week => {
        this.confirmationService.getDatePeriodData(week.week_start_date, week.week_end_date).subscribe((res) => {
          if (res && res.data && MessageCodesComparator.AreEqual(res.code, MessageCodes.CS_WD_DF_200)) {
            this.createWeekSelect(res.data);
          }
        }, error => {
          this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
        });
      });
    } else {
      this.displayConfirmations = [];
      this.message = 'NO_DATA_FOUND_CONFIRMATION';
      this.showLoadingMessage = false;
    }
  }

  getTopListWeek(element, flag) {
    this.weeks = this.weeks.reverse();
    this.weeks = this.sortByAppointment(this.weeks);
    this.latestWeekArray = [];
    if (flag) {
      this.latestWeekArray = _.first(this.weeks, element);
    } else {
      const index = _.indexOf(this.weeks, element);
      this.latestWeekArray.push(this.weeks[index + 1]);
    }
    this.latestWeekArray = _.compact(this.latestWeekArray);
    this.getWeekConfirmationsDetail();
  }

  getWeekConfirmationsDetail() {
    const observables = new Array();
    this.latestWeekArray.forEach(week => {
      observables.push(this.confirmationService.getMyConfirmations('MyConfirmationsComponent', week.label, week.year, week.value.weekNo, week.value.weekStartDate, week.value.weekEndDate));
    });
    Observable.forkJoin(observables).subscribe(
      res => {
        this.responseReceived = true;
        res.forEach((element, index) => {
          if (element["data"].stoneList.length === 0) {
            this.displayWeekCount++;
          }
          this.dataFetchForWeekCounter++;
        });
        if (this.weeks.length !== this.dataFetchForWeekCounter || this.weeks.length !== this.displayWeekCount) {
          this.getTopListWeek(_.last(this.latestWeekArray), false);
          this.splitWeekInfo(res);
        } else if (this.weeks.length === this.displayWeekCount && this.weeks.length === this.dataFetchForWeekCounter) {
          this.showNoConfirmHistory();
        }
      },
      error => this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED')
    );
  }

  showNoConfirmHistory() {
    this.showLoadingMessage = false;
    this.message = 'NO_DATA_FOUND_CONFIRMATION';
  }

  validateStoneExist(response) {
    const stoneArray = [];
    response.forEach(res => {
      if (res.hasOwnProperty('data') && res.data.hasOwnProperty('stoneList')) {
        res.data.stoneList.forEach(entry => {
          entry['kts'] = (entry['kts'] || '').split(',') === '' ? [] : (entry['kts'] || '').split(',');
          entry['sgs'] = (entry['sgs'] || '').split(',') === '' ? [] : (entry['sgs'] || '').split(',');
          entry['sgs'] = _.compact(entry['sgs']);
          entry['kts'] = _.compact(entry['kts']);
          if (entry['canada_marked'] === true && entry['forever_marked'] === true) {
            entry['eligibility'] = ['canada_marked', 'forever_marked'];
          } else if (entry['canada_marked'] === true) {
            entry['eligibility'] = ['canada_marked'];
          } else if (entry['forever_marked'] === true) {
            entry['eligibility'] = ['forever_marked'];
          } else {
            entry['eligibility'] = [];
          }
          entry['table'] = entry['table_'];
          entry['length'] = entry['length_'];
          entry['rap_off'] = entry['original_off_perct'];
          stoneArray.push(entry);
        });
      }
    });
    return stoneArray;
  }

  splitWeekInfo(confirmationList) {
    const stoneArray = this.validateStoneExist(confirmationList);
    confirmationList.forEach(element => {
      if (element && element.data && MessageCodesComparator.AreEqual(element.code, MessageCodes.SMS_GCS_200)) {
        this.eligible_discount = element.data.wvd.eligible_savings;
        this.pending_discount = element.data.wvd.pending_savings;
        this.given_discount = element.data.wvd.given_savings;
        if (element.data.stoneList && element.data.stoneList.length > 0) {
          this.myConfirmations.push(element.data);
          const count = this.myConfirmations.length;
          this.displayConfirmations = this.sortByAppointment(this.myConfirmations);
          if (this.displayConfirmations && this.displayConfirmations.length > 0) {
            this.displayConfirmations = this.stoneDetailsService.removeDuplicatesFromObject(this.displayConfirmations, 'weekNo');
          }
          this.totalConfirmationList = this.displayConfirmations.length;
        } else if (this.confirmationFlag === true) {
          this.myConfirmations.push(element.data);
          const count = this.myConfirmations.length;
        }
      }
    });
  }

  sortByAppointment(requestData) {
    requestData.sort(function (obj1, obj2) {
      let date1 = obj1.label.split('-');
      const newDate = date1[1].trim().split('/');
      date1 = (newDate[1] + '/' + newDate[0] + '/' + newDate[2]).toString();
      obj1['date'] = new Date(date1);
      let date2 = obj2.label.split('-');
      const newDate2 = date2[1].trim().split('/');
      date2 = (newDate2[1] + '/' + newDate2[0] + '/' + newDate2[2]).toString();
      obj2['date'] = new Date(date2);
      if (obj1['date'] > obj2['date']) {
        return -1;
      } else if (obj1['date'] < obj2['date']) {
        return 1;
      } else {
        return 0;
      }
    });
    return requestData;
  }

  createWeekSelect(weeksData) {
    weeksData.forEach(data => {
      this.weeks.push({
        label: 'Week: ' + this.getWeekLabel(data.week_start_date)
          + ' - ' + this.getWeekLabel(data.week_end_date),
        value: { 'weekNo': data.financial_week_number, 'year': data.year, 'weekStartDate': data.week_start_date, 'weekEndDate': data.week_end_date }
      });
    });
    if (this.weeks.length === this.responseWeekLength) {
      this.getTopListWeek(3, true);
    }
  }

  generateInvoiceClicked() {
    if (this.selectedStones.length > 0) {
      this.appStore.store('stoneListToGenerateEnvoice', this.selectedStones);
      this.notify.notifyStoneSelectedForInvoiceGeneration({ source: 'selectedStones', stoneList: this.selectedStones });
    } else {
      this.messageService.showErrorGrowlMessage('Please select minimum one stone');
    }
  }

  selectStoneData(e) {
    this.selectedStones = [];
    e.selectedRowsData.forEach((element) => {
      this.selectedStones.push(element.stoneId);
    });
  }

  addStoneDetailTab(data) {
    let thisStoneDate = this.getStoneDetailForStoneId(data.stoneId);
  }

  getStoneDetailForStoneId(stonId): any {
    this.stoneDetailsService.getStoneDetails(stonId).subscribe(stoneDetailResponse => {
      if (stoneDetailResponse !== undefined) {
        stoneDetailResponse.forEach(stoneDetail => {
          this.notify.notifyMyConfirmationPageForStoneClickedForDetail({ 'data': stoneDetail });
        });
      }
    });
  }

  loadMoreWeekDetails() {
    this.clientLimit = this.clientLimit + 3;
  }

  getWeekLabel(date) {
    const myDate = date.split('-');
    return myDate[2] + '/' + myDate[1] + '/' + myDate[0];
  }

  ngOnDestroy() {
    if (this.myConfirmations.length === 0) {
      this.confirmationFlag = true;
    }
  }
}