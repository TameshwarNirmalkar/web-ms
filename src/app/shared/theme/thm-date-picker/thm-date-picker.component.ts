import {
  Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, Component,
  OnDestroy, forwardRef, OnInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateTimeService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';
import { NotifyService } from '@srk/core';
import 'jquery';
import { UtilService } from '../../services/util.service';
import * as  _ from 'underscore';
declare var jQuery: any;
declare var moment: any;

export const DATE_PICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ThmDatePickerComponent),
  multi: true
};

@Component({
  selector: 'thm-date-picker',
  template: `<input autocomplete="off" #input type='text' placeholder="{{placeholder}}" (keydown)=false>
  <i class="fa fa-minus-circle" aria-hidden="true" *ngIf="showCancelButton" (click)="clearValue()" pTooltip="Remove Date" tooltipPosition="bottom"
    tooltipEvent="hover"></i>
  <div [style.width.px]="descriptionBoxWidth" *ngIf="showDescriptionBox && !timePicker">
    <div class="ui-g-5 ui-g-nopad">
      <div class="ui-g-6 calendar-color-legend srk-event-color-legend"></div>
      <div class="ui-g-6 calendar-color-legend-text paddb0">Event</div>
    </div>
    <div class="ui-g-7 ui-g-nopad">
      <div class="ui-g-2 calendar-color-legend srk-office-close-color-legend"></div>
      <div class="ui-g-10 calendar-color-legend-text paddb0">SRK Office is close</div>
    </div>
    <br><br>
    <div class="text-center" [ngClass]="{'special-date-desc': isEventDate}">{{eventDescription.toString()}}</div>
  </div>
  `,
  styleUrls: ['./thm-date-picker.component.scss'],
  providers: [DATE_PICKER_VALUE_ACCESSOR]
})
export class ThmDatePickerComponent implements OnInit, AfterViewInit, ControlValueAccessor, OnDestroy {

  private allowTimes: any[] = [];
  private functionDates: any[] = [];
  private subscription: Subscription;
  private visitingTime: any;
  private allDisabledDates: any[] = [];
  public eventDescription: any[] = [];
  public isEventDate = false;
  public descriptionBoxWidth: any;
  public disabledDescriptionDateArray = [];
  public currentDate: any;
  @Input() placeholder = '';
  @Input() timePicker: boolean;
  @Input() value = '';
  @Input() isInline: any;
  @Input() hideTimePicker: boolean;
  @Input() showHighlightedDates = true;
  @Input() disableWeekDays = true;
  @Input() disableDates = true;
  @Input() minDate;
  @Input() maxDate;
  @Input() currentDay;
  @Input() page;
  @Input() dateInDatePicker;
  @Input() showCancelButton: boolean;
  @Input() showDescriptionBox: boolean;
  @Output() dateChange = new EventEmitter();
  @ViewChild('input') input: ElementRef;
  @Output() displayDayDescription = new EventEmitter();
  private onTouched = () => { };
  private onChange: (value: string) => void = () => { };
  constructor(
    private dateTimeService: DateTimeService,
    private customTranslateService: CustomTranslateService,
    private utilService: UtilService,
    private notifyService: NotifyService) { }

  ngOnInit() {
    this.initDatePicker();
    this.initAllowTimes();
    this.subscribeDatePickerLangChange();
    if (this.currentDay !== 6) {
      this.visitingTime = this.dateTimeService.getVisitingTime();
    } else {
      this.visitingTime = this.dateTimeService.getVisitingTimeSaturday();
    }
  }

  initAllowTimes() {
    const today = moment();
    const todayDay = today.day();
    if (todayDay === 6) {
      this.allowTimes = this.dateTimeService.getAllowTimesSaturday();
    } else {
      this.allowTimes = this.dateTimeService.getAllowTimes();
    }

    if (this.page === 'ViewRequest') {
      this.setPastTimeDisable();
      if (this.allowTimes.length === 0) {
        this.hideTimePicker = true;
      }
    }
  }

  setPastTimeDisable() {
    const today = this.dateTimeService.getISTtime();
    this.allowTimes.forEach(time => {
      if (time < today) {
        this.allowTimes = _.without(this.allowTimes, time);
      }
    });

  }

  initDatePicker() {
    this.functionDates = JSON.parse(JSON.stringify(this.dateTimeService.getHighlightedDates()));
    this.allDisabledDates = JSON.parse(JSON.stringify(this.dateTimeService.getDisabledDates()));
    if (this.page === 'header') {
      this.functionDates.forEach(date => {
        if (this.allDisabledDates.indexOf(date.event_date) > -1) {
          this.disabledDescriptionDateArray.push(date.event_date);
          this.allDisabledDates = _.without(this.allDisabledDates, date.event_date);
        }
      });
    }
    this.displayEventDescriptionForCalendar(new Date());
  }

  subscribeDatePickerLangChange() {
    this.subscription = this.notifyService.notifyTranslateObservable$.subscribe((res) => {
      if (res.hasOwnProperty('event') && res.event === 'profileChange') {
        this.initDatePicker();
        this.ngAfterViewInit();
      }
    });
  }

  writeValue(date: string) {
    this.value = date;
    jQuery(this.input.nativeElement).datetimepicker({ value: date });
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  displayEventDescriptionForCalendar(date) {
    date = this.utilService.tranformDate(date, 'dd-MM-yyyy');
    const dateEventObj = _.findWhere(this.functionDates, { event_date: date });
    if (!dateEventObj) {
      this.isEventDate = false;
      this.eventDescription = ['No event today'];
    } else {
      this.isEventDate = true;
      this.eventDescription = dateEventObj.event_desc;
    }
  }

  ngAfterViewInit() {
    const lang: string = this.customTranslateService.getUserLanguage();
    this.descriptionBoxWidth = jQuery('.xdsoft_datetimepicker').width();
    jQuery.datetimepicker.setLocale(lang);
    if (!this.timePicker) {
      jQuery(this.input.nativeElement).datetimepicker({
        format: this.hideTimePicker ? 'd-m-Y' : 'd-m-Y H:i',
        formatDate: 'd-m-Y',
        formatTime: 'h:i A',
        minDate: this.minDate ? this.minDate : false, // this.minDate == 0 will disable past dates
        maxDate: this.maxDate ? this.maxDate : false,
        scrollInput: false,
        // minDate: '08-05-2017',
        // minDate:'-1970/01/02',//yesterday is minimum date(for today use 0 or -1970/01/01)
        // maxDate:'+1970/01/02',//tomorrow is maximum date calendar
        // mask: true, // mask is causing issue in default year
        yearStart: new Date().getFullYear(),
        yearEnd: new Date().getFullYear() + 1,
        // dayOfWeekStart: 4,
        inline: this.isInline,
        timepicker: !this.hideTimePicker,
        defaultDate: this.dateInDatePicker,
        //  defaultSelect: true,
        closeOnWithoutClick: false,
        disabledWeekDays: this.disableWeekDays ? this.dateTimeService.getDisabledWeekDays() : [],
        highlightedDates: this.showHighlightedDates ? this.functionDates : [],

        disabledDates: this.disableDates ? this.allDisabledDates : [],
        allowTimes: this.allowTimes,
        // onChangeDateTime: (value) => {
        // },  
        onSelectDate: (value) => {
          const todayDate = new Date();
          const date = new Date(value);
          const day = date.getDay();
          let dayAllowTimes: any[] = [];
          this.input.nativeElement.blur();
          if (day === 6) {
            dayAllowTimes = this.dateTimeService.getAllowTimesSaturday();
          } else {
            dayAllowTimes = this.dateTimeService.getAllowTimes();
          }
          this.allowTimes = dayAllowTimes;
          if (this.page === 'ViewRequest' || this.page === 'UpcomingRequest') {
            if (todayDate.getDate() === date.getDate() && todayDate.getMonth() === date.getMonth() && todayDate.getFullYear() === date.getFullYear()) {
              this.setPastTimeDisable();
              if (this.allowTimes.length === 0) {
                this.hideTimePicker = true;
              }
            } else {
              this.hideTimePicker = false;
            }
          }
          jQuery(this.input.nativeElement).datetimepicker({
            timepicker: !this.hideTimePicker,
            allowTimes: dayAllowTimes
          });
          this.value = value;
          this.onChange(value);
          this.onTouched();
          this.dateChange.next(value);
          this.writeValue(value);
        },
        onSelectTime: (value) => {
          this.value = value;
          this.onChange(value);
          this.onTouched();
          this.dateChange.next(value);
        },
        onGenerate: (value) => {
          this.displayEventDescriptionForCalendar(value);
        },
        beforeShowDay: (date) => {
          const formattedDate = this.utilService.tranformDate(date, 'dd-MM-yyyy');
          return this.allDisabledDates.indexOf(formattedDate) > -1 ? 'srk-holiday' :
            (this.disabledDescriptionDateArray.indexOf(formattedDate) > -1 ? 'srk-holiday' : '');
        }
      });
    } else {
      jQuery(this.input.nativeElement).datetimepicker({
        datepicker: !this.timePicker,
        format: 'h:i A',
        formatTime: 'h:i A',
        closeOnWithoutClick: false,
        inline: this.isInline,
        startDate: new Date,
        allowTimes: this.visitingTime,
        onSelectTime: (value) => {
          this.value = value;
          this.onChange(value);
          this.onTouched();
          this.dateChange.next(value);
        }

      });
    }
    jQuery(this.input.nativeElement).datetimepicker('reset');
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  clearValue() {
    const tempValue = null;
    this.input.nativeElement.value = tempValue;
    this.value = tempValue;
    this.onChange(tempValue);
    this.onTouched();
    this.dateChange.next(tempValue);
  }

}
