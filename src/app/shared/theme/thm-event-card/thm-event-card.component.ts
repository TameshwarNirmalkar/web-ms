import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { EventDetailsService } from '@srk/core';
@Component({
  selector: 'thm-event-card',
  templateUrl: './thm-event-card.component.html',
  styleUrls: ['./thm-event-card.component.scss']
})
export class ThmEventCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() eventInfo: any;
  @Output() navigateTo = new EventEmitter();
  public timerSubscription: any;
  public remainingTime: any;
  public eventHour: any;
  public eventDays: any;
  public eventMinute: any;
  public eventSeconds: any;
  public countryFlagPath: any;
  constructor(
    private eventDetailsService: EventDetailsService
  ) { }

  ngOnInit() {
    this.timerSubscription = Observable.interval(1000).subscribe(x => {
      if (this.eventInfo && this.eventInfo.remaining_seconds > 0) {
        this.remainingTime = this.eventInfo.remaining_seconds;
        this.resetTime(this.remainingTime);
      } else {
        this.unsubscribeTimer();
      }
    });
  }

  ngOnChanges() {
    if (this.eventInfo) {
      this.remainingTime = this.eventInfo.remaining_seconds;
      this.countryFlagPath = '/assets/img/' + this.eventInfo.country_code + '.png';
    }
  }

  unsubscribeTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  redirectToEvent(event) {
    this.navigateTo.emit({ link: '/web/event/' + event.country_code });
  }

  ngOnDestroy() {
    this.unsubscribeTimer();
  }

  resetTime(remainingTime) {
    this.eventDays = Math.floor(remainingTime / 86400);
    this.eventHour = Math.floor((remainingTime % 86400) / 3600);
    this.eventMinute = Math.floor(((remainingTime % 86400) % 3600) / 60);
    this.eventSeconds = ((remainingTime % 86400) % 3600) % 60;
  }

}
