import { Component, OnInit, Input, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { EventDetailsService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { MessageService } from '@srk/core';
import { UtilService } from '@srk/shared';
import * as _ from 'underscore';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.scss']
})
export class BookAppointmentComponent implements OnInit, OnChanges, OnDestroy {
  @Input() eventCode: any;
  @Input() appointmentJson;
  @Input() enable: boolean;

  @Input() isUpdateAppointment: any;
  @Output() closeAppointmentPopup = new EventEmitter();
  public dateSlots: any[] = [];
  public daySlots: any[] = [];
  public timeSlots: any[] = [];
  public selectedDate: any;
  public selectedDay: any;
  public selectedTimeSlotId: any;
  public isSlotsFetched = false;
  public slotMessage: any;
  public slotAddedComment: any;
  public showLoadingSymbol = false;
  public selectedTimeSlot: any;
  public dayApiSubscription: any;
  public timeApiSubscription: any;
  public dateApiSubscription: any;
  public appointmentId: any;
  public totalStones: any;
  public notAvailableStones: any;
  public stoneIdList: any;
  public toTime: any;
  public fromTime: any;

  constructor(
    private eventDetailsService: EventDetailsService,
    private notify: NotifyService,
    private messageService: MessageService,
    private utilService: UtilService
  ) { }

  ngOnInit() { }

  ngOnChanges() {
    if (this.eventCode && this.enable) {
      this.initializeAppointment();
    }
  }

  initializeAppointment() {
    this.slotMessage = 'Loading..';
    this.selectedDate = null;
    this.selectedDay = null;
    this.selectedTimeSlotId = null;
    this.isSlotsFetched = false;
    this.slotAddedComment = null;
    this.appointmentId = null;
    this.toTime = null;
    this.fromTime = null;
    this.dateSlots = [];
    this.timeSlots = [];
    this.daySlots = [];
    this.fetchEventSlotDates(this.eventCode);
    if (!(_.isEmpty(this.appointmentJson))) {
      this.updateAppointmentField();
    }
  }

  updateAppointmentField() {
    if (!(_.isEmpty(this.appointmentJson))) {
      this.selectedDate = this.appointmentJson.appointment_date;
      this.getAvailableDaySlots(this.selectedDate);
      this.selectedDay = this.appointmentJson.slot_type;
      this.getAvailableTimeSlots(this.selectedDay);
      this.selectedTimeSlotId = this.appointmentJson.slot_id;
      this.appointmentId = this.appointmentJson.appointment_id;
      this.totalStones = this.appointmentJson.total_stones;
      this.notAvailableStones = this.appointmentJson.not_available;
      this.stoneIdList = this.appointmentJson.stone_ids;
      if (this.appointmentJson.party_remark && this.appointmentJson.party_remark.length > 0) {
        this.slotAddedComment = this.appointmentJson.party_remark[this.appointmentJson.party_remark.length - 1].comment;
      }
    }
  }

  fetchEventSlotDates(eventId) {
    if (this.dateApiSubscription) {
      this.dateApiSubscription.unsubscribe();
    }
    this.dateApiSubscription = this.eventDetailsService.fetchAvailableEventDates(eventId).subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_MSG_AVAILABLE_DATES_SUCCESS_200)) {
        this.slotMessage = null;
        this.isSlotsFetched = true;
        res.data.forEach(obj => {
          const dateObj = {
            label: obj.date,
            value: obj.date,
            slots: obj.available_slots
          };
          this.dateSlots.push(dateObj);
        });
      } else {
        this.isSlotsFetched = false;
        this.slotMessage = 'NO_SLOTS_AVAILABLE';
      }
    }, error => {
      this.isSlotsFetched = false;
      this.slotMessage = 'SERVER_ERROR_OCCURRED';
    });
  }

  getAvailableDaySlots(date) {
    this.selectedDate = date;
    this.selectedDay = null;
    this.selectedTimeSlotId = null;
    this.daySlots = [];
    this.timeSlots = [];
    this.slotAddedComment = null;
    if (this.dayApiSubscription) {
      this.dayApiSubscription.unsubscribe();
    }
    if (this.timeApiSubscription) {
      this.timeApiSubscription.unsubscribe();
    }
    this.showLoadingSymbol = true;
    this.slotMessage = null;
    this.dayApiSubscription = this.eventDetailsService.fetchAvailableDaySlots(this.eventCode, this.selectedDate).subscribe(res => {
      this.showLoadingSymbol = false;
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_MSG_AVAILABLE_SLOTS_SUCCESS_200)) {
        this.isSlotsFetched = true;
        res.data.forEach(obj => {
          const dayObj = {
            label: obj.slot_type,
            value: obj.slot_type,
            slots: obj.available_slots
          };
          this.daySlots.push(dayObj);
        });
      } else {
        this.slotMessage = 'NO_SLOTS_AVAILABLE';
      }
    }, error => {
      this.showLoadingSymbol = false;
      this.slotMessage = 'SERVER_ERROR_OCCURRED';
    });
  }

  getAvailableTimeSlots(day) {
    this.selectedDay = day;
    this.selectedTimeSlotId = null;
    this.showLoadingSymbol = true;
    this.timeSlots = [];
    this.slotAddedComment = null;
    if (this.timeApiSubscription) {
      this.timeApiSubscription.unsubscribe();
    }
    this.slotMessage = null;
    this.timeApiSubscription = this.eventDetailsService.fetchAvailableTimeSlots(this.eventCode, this.selectedDate, this.selectedDay)
      .subscribe(res => {
        this.showLoadingSymbol = false;
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_MSG_AVAILABLE_SLOT_TIMINGS_SUCCESS_200)) {
          this.isSlotsFetched = true;
          res.data.forEach(obj => {
            const timeObj = {
              labelFrom: obj.from_time, labelTo: obj.to_time, value: obj.from_time + '-' + obj.to_time,
              slots: obj.available_slots, id: obj.slot_id
            };
            this.timeSlots.push(timeObj);
          });
        } else {
          this.slotMessage = 'NO_SLOTS_AVAILABLE';
        }
      }, error => {
        this.showLoadingSymbol = false;
        this.slotMessage = 'SERVER_ERROR_OCCURRED';
      });
  }

  bookAppointment() {
    this.setTimeRange();
    const appointmentRequestBody = {
      'event_id': this.eventCode,
      'event_date': this.selectedDate,
      'slot_id': Number(this.selectedTimeSlotId),
      'from_time': this.fromTime,
      'to_time': this.toTime
    };
    if (this.slotAddedComment) {
      appointmentRequestBody['party_remark'] = this.slotAddedComment;
    }
    this.showLoadingSymbol = true;
    this.eventDetailsService.submitAppointmentRequest(JSON.stringify(appointmentRequestBody)).subscribe(res => {
      this.showLoadingSymbol = false;
      if (!res.error_status &&
        MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_MSG_BOOKING_SUCCESSFUL_200)) {
        this.appointmentId = res.data[0].appointment_id;
        this.createNewAppointment(this.appointmentId);
        this.messageService.showSuccessGrowlMessage(MessageCodes.EVENT_MSG_BOOKING_SUCCESSFUL_200);
      }
    }, error => {
      this.showLoadingSymbol = false;
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  updateAppointment() {
    this.setTimeRange();
    const appointmentRequestBody = {
      'event_id': this.eventCode,
      'event_date': this.selectedDate,
      'slot_id': Number(this.selectedTimeSlotId),
      'appointment_id': this.appointmentId,
      'from_time': this.fromTime,
      'to_time': this.toTime
    };
    if (this.slotAddedComment) {
      appointmentRequestBody['party_remark'] = this.slotAddedComment;
    }
    this.showLoadingSymbol = true;
    this.eventDetailsService.updateAppointmentRequest(JSON.stringify(appointmentRequestBody)).subscribe(res => {
      this.showLoadingSymbol = false;
      if (!res.error_status) {
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_UPDATE_APPT_SUCCESS_200)) {
          this.createNewAppointment(this.appointmentId);
          this.messageService.showSuccessGrowlMessage(MessageCodes.EVENT_UPDATE_APPT_SUCCESS_200);
        } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_UPDATE_APPT_EXITS_200)) {
          this.messageService.showErrorGrowlMessage(MessageCodes.EVENT_UPDATE_APPT_EXITS_200);
        } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_UPDATE_APPT_NOT_EXITS_200)) {
          this.messageService.showErrorGrowlMessage(MessageCodes.EVENT_UPDATE_APPT_NOT_EXITS_200);
        } else if(MessageCodesComparator.AreEqual(res.code,MessageCodes.EVENT_UPDATE_PAST)){
          this.messageService.showErrorGrowlMessage(MessageCodes.EVENT_UPDATE_PAST);
        }
      }
    }, error => {
      this.showLoadingSymbol = false;
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  createNewAppointment(id) {
    let fromDate;
    let toDate;
    this.timeSlots.forEach(element => {
      if (element.id === Number(this.selectedTimeSlotId)) {
        fromDate = element.labelFrom;
        toDate = element.labelTo;
      }
    });
    const appointmentEntry = this.createAppointmentJson(id, fromDate, toDate);
    if (this.isUpdateAppointment) {
      this.notify.updateAppointmentList({ source: 'updateAppointment', appointmentObj: appointmentEntry });
    } else {
      this.notify.updateAppointmentList({ source: 'bookAppointment', appointmentObj: appointmentEntry });
    }
    this.initializeAppointment();
    this.closeAppointmentPopup.emit({ status: false });
  }

  createAppointmentJson(id, fromDate, toDate) {
    let commentEntry;
    if (this.appointmentJson) {
      commentEntry = this.appointmentJson.party_remark;
    }
    const appointmentEntry = {
      'appointment_id': id,
      'appointment_date': this.selectedDate,
      'slot_id': this.selectedTimeSlotId,
      'event_id': this.eventCode,
      'total_stones': this.totalStones ? this.totalStones : 0,
      'not_available': this.notAvailableStones ? this.notAvailableStones : 0,
      'stone_ids': this.stoneIdList ? this.stoneIdList : [],
      'appointment_from_time': fromDate,
      'appointment_to_time': toDate,
      'slot_type': this.selectedDay,
      'party_remark': commentEntry ? commentEntry : []
    };
    if (this.slotAddedComment) {
      const commentObj = {
        comment: this.slotAddedComment,
        comment_date_time: this.utilService.tranformDate(new Date(), 'yyyy-MM-dd HH:mm')
      };
      appointmentEntry.party_remark.push(commentObj);
    }
    return appointmentEntry;
  }

  uppercaseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  setTimeRange() {
    this.timeSlots.forEach(time => {
      if (time.id === Number(this.selectedTimeSlotId)) {
        this.fromTime = this.utilService.tranformDate(time.labelFrom, 'HH:mm');
        this.toTime = this.utilService.tranformDate(time.labelTo, 'HH:mm');
      }
    });
  }

  ngOnDestroy() {
    if (this.appointmentJson) {
      this.appointmentJson = {};
    }
    this.initializeAppointment();
    if (this.timeApiSubscription) {
      this.timeApiSubscription.unsubscribe();
    }
    if (this.dayApiSubscription) {
      this.dayApiSubscription.unsubscribe();
    }
    if (this.dateApiSubscription) {
      this.dateApiSubscription.unsubscribe();
    }
  }

}

