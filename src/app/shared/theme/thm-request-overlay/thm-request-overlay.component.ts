import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';
import { LoggerService } from '@srk/core';
import { ViewRequestService } from '../../services/view-request.service';
import { NotifyService } from '@srk/core';
import { UtilService } from '../../services/util.service';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { DateTimeService } from '@srk/core';
import { MessageService } from '@srk/core';
import { Observable, Subscription } from 'rxjs/Rx';
import * as _ from 'underscore';
@Component({
  selector: 'thm-request-overlay',
  templateUrl: './thm-request-overlay.component.html',
  styleUrls: ['./thm-request-overlay.component.scss'],
})
export class ThmRequestOverlayComponent implements OnInit, OnDestroy, OnChanges {
  @Input() visibleOverlay: any;
  @Input() stoneList: any;
  @Input() apiUrl: any;
  @Output() toggleOverlay = new EventEmitter();
  public responseMessage: any;
  public successStoneList = [];
  public successRequest = false;
  public dateTime = '';
  public comment: any;
  public errorMessage: any;
  public isRequested = false;
  public toggle = false;
  public ticks: any;
  public indianDate: any;

  public subscriptionInterval: any;

  constructor(
    private viewRequestService: ViewRequestService,
    private notify: NotifyService,
    private dateTimeService: DateTimeService,
    private logger: LoggerService,
    private utilService: UtilService,
    private messageService: MessageService) { }


  ngOnInit() {
    this.showDateInDatePicker();
  }

  showDateInDatePicker() {
    this.indianDate = this.dateTimeService.getIndianDate();
  }
  startTimer() {
    this.ticks = 3;
    this.subscriptionInterval = Observable.interval(1000).take(4).subscribe(x => {
      this.setTimerCountDown(x);
    });
  }
  setTimerCountDown(x) {
    if (this.ticks) {
      this.ticks = 4 - (x + 1);
    }
    if (this.ticks === 0) {
      if (this.visibleOverlay) {
        this.toggleViewRequestOverlay(true);
      }
    }
  }

  ngOnChanges() {
    this.dateTime = this.dateTimeService.getIndianDate();
  }

  resetTimerSubscription() {
    if (this.subscriptionInterval) {
      this.subscriptionInterval.unsubscribe();
    }
  }
  storeViewRequestDetails(date, comment) {
    this.responseMessage = '';
    this.errorMessage = '';
    const isDateCorrect = this.checkDateSelected(date);
    const isValidTime = this.checkTimeSelected(date);
    if (date && isDateCorrect && isValidTime) {
      this.isRequested = true;
      const value = {};
      const list = [];
      date = this.utilService.tranformDate(date, 'yyyy-MM-dd HH:mm');
      value['stone_ids'] = _.uniq(this.stoneList);
      value['view_date_time'] = date;
      value['view_request_note'] = comment;
      this.logger.logInfo('ThmRequestOverlayComponent', 'User action for View Request for stones :- ' + JSON.stringify(this.stoneList));
      this.viewRequestService.saveViewRequestStone(value, this.apiUrl).subscribe(res => {
        this.successRequest = false;
        if (!res.error_status) {
          if (res.hasOwnProperty('data')) {
            if (res.data.hasOwnProperty('stone_ids') && res.data.stone_ids.length > 0) {
              this.removeFailedRequestedStones(res.data.stone_ids);
            }
          }
          this.viewRequestSuccess(res.code);
        } else {
          this.isRequested = false;
          if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_VR_RS_500)) {
            this.responseMessage = 'ERROR_ADD_VIEW_REQUEST';
          }
        }
      }, error => {
        this.isRequested = false;
        this.responseMessage = 'SERVER_ERROR_OCCURRED';
      });
    } else {
      if (!isValidTime) {
        this.errorMessage = 'SELECT_TIME';
      } else if (!isDateCorrect) {
        this.errorMessage = 'Invalid_Date';
      } else {
        this.errorMessage = 'Select_Date';
      }
    }
  }
  viewRequestSuccess(code) {
    this.isRequested = false;
    if (MessageCodesComparator.AreEqual(code, MessageCodes.SMS_VR_RS_200)
      || MessageCodesComparator.AreEqual(code, MessageCodes.SMS_VR_SNE_200)) {
      this.successRequest = true;
      this.successStoneList = this.stoneList.toString();
      this.responseMessage = 'VIEW_REQUEST_SUCCESSFULL';
      this.startTimer();
      this.notify.notifyStoneStateUpdated({ source: 'viewRequested', stoneList: this.stoneList });
    } else if (MessageCodesComparator.AreEqual(code, MessageCodes.SMS_VR_RE_200)) {
      this.responseMessage = 'VIEW_REQUEST_ALREADY_EXIST';
    } else if (MessageCodesComparator.AreEqual(code, MessageCodes.SMS_VR_NSF_200)) {
      this.responseMessage = 'VIEW_REQUEST_NO_VALID_STONES';
    } else if (MessageCodesComparator.AreEqual(code, MessageCodes.SMS_VR_FR_NA_200)) {
      this.responseMessage = 'NO_VIEW_REQUEST_BEFORE';
    } else if (MessageCodesComparator.AreEqual(code, MessageCodes.SMS_MSG_VR_PARTIAL_SAVE_SHOW_STONES_200)) {
      this.responseMessage = 'PARTIAL_ADDED_EVENTS_STONES';
      this.successRequest = true;
      this.successStoneList = this.stoneList.toString();
      this.startTimer();
      this.notify.notifyStoneStateUpdated({ source: 'viewRequested', stoneList: this.stoneList });
    } else if (MessageCodesComparator.AreEqual(code, MessageCodes.SMS_MSG_VR_SHOW_NO_STONES_FOUND_200)) {
      this.responseMessage = 'STONES_IN_EVENT_VR';
    }
  }

  toggleViewRequestOverlay(toggle) {
    this.comment = '';
    this.errorMessage = '';
    this.successRequest = false;
    this.responseMessage = '';
    if (toggle) {
      this.visibleOverlay = !this.visibleOverlay;
    } else {
      this.visibleOverlay = false;
    }
    if (this.visibleOverlay) {
      this.successStoneList = [];
    }
    this.toggleOverlay.emit({ visible: this.visibleOverlay });
  }
  removeFailedRequestedStones(stoneIds) {
    stoneIds.forEach((unselected) => {
      this.stoneList.forEach((element) => {
        if (element === unselected) {
          const i = this.stoneList.indexOf(element);
          this.stoneList.splice(i, 1);
        }
      });
    });
  }

  checkDateSelected(date) {
    let flag = false;
    const todayDate = this.utilService.checkISTtime();
    const currentDate = this.utilService.tranformDate(todayDate, 'yyyy-MM-dd HH:mm');
    date = this.utilService.tranformDate(date, 'yyyy-MM-dd HH:mm');
    if (currentDate < date) {
      flag = true;
    }
    return flag;
  }

  checkTimeSelected(date) {
    let flag = false;
    if (date && date instanceof Date) {
      const daySelected = date.getDay();
      const time = this.utilService.tranformDate(date, 'HH:mm');
      let timeList = [];
      if (daySelected === 6) {
        timeList = this.dateTimeService.getAllowTimesSaturday();
      } else {
        timeList = this.dateTimeService.getAllowTimes();
      }
      const i = timeList.indexOf(time);
      if (i !== -1) {
        flag = true;
      }
    }
    return flag;
  }
  ngOnDestroy() {
    this.resetTimerSubscription();
  }

}
