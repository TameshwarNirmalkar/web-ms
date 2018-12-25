import { Component, OnInit, Input, OnChanges, ViewChild, OnDestroy } from '@angular/core';
import { EventDetailsService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { NotifyService } from '@srk/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-event-venue-details',
  templateUrl: './event-venue-details.component.html',
  styleUrls: ['./event-venue-details.component.scss']
})
export class EventVenueDetailsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() eventId: any;
  @ViewChild('bookAppointment') bookAppointment;
  public eventInfo: any;
  public eventKamDetails: any;
  public imageList: any[] = [];
  public isKamDetailsAvailable = true;
  public visibleImageOverlay = false;
  public eventHighlights: any;
  public isImageFetched = false;
  public imageMessage: any;
  public highlightMessage: any;
  public appointmentSubscription: any;
  public hideHighlights = false;
  public timerSubscription: any;
  public remainingTime: any;
  public eventDays: any;
  public eventHour: any;
  public eventMinute: any;
  public isEventClosed = false;
  public eventSeconds: any;
  constructor(
    private eventDetailsService: EventDetailsService,
    private notify: NotifyService,
  ) { }

  ngOnInit() {
    this.timerSubscription = Observable.interval(1000).subscribe(x => {
      if (this.eventId && this.eventInfo && this.eventInfo.remaining_seconds > 0) {
        this.remainingTime = this.eventInfo.remaining_seconds;
        this.resetTime(this.remainingTime);
      } else {
        this.isEventClosed = true;
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
      }
    });
    this.appointmentSubscription = this.notify.notifyUpdateAppointmentListObservable$.subscribe((res) => {
      if (res.source === 'bookAppointment') {
        this.getEventHighlights();
      }
    });
  }

  ngOnChanges() {
    if (this.eventId) {
      this.getEventDetailedInfo();
      this.getEventKamInfo();
      this.getEventImages();
      this.getEventHighlights();
      this.imageMessage = 'Loading..';
      this.initializeTimer();
    }
  }

  getEventDetailedInfo() {
    const events = this.eventDetailsService.getEventInfo();
    events.forEach(event => {
      if (this.eventId === event.event_id) {
        this.eventInfo = event;
      }
    });
  }

  getEventKamInfo() {
    this.eventDetailsService.getEventKamDetailsInfo(this.eventId).subscribe(res => {
      if (res.hasOwnProperty('userStatus')) {
        this.eventKamDetails = res;
      } else {
        this.isKamDetailsAvailable = false;
      }
    }, error => {
      this.isKamDetailsAvailable = false;
    });
  }

  openWebsiteNewTab(link) {
    window.open(link, '_blank');
  }

  showImageOverlay() {
    this.visibleImageOverlay = !this.visibleImageOverlay;
  }

  closeImageOverlay() {
    this.visibleImageOverlay = false;
  }

  getEventImages() {
    this.imageList = [];
    this.eventDetailsService.fetchEventImages(this.eventId).subscribe(res => {
      if (!res.error_status && MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_IFEF_200)) {
        this.isImageFetched = true;
        const imageData = res.data;
        if (imageData.length > 0) {
          imageData.forEach(image => {
            this.imageList.push({
              source: image
            });
          });
        } else {
          this.isImageFetched = false;
          this.imageMessage = 'NO_IMAGES_FETCHED';
        }
      } else if (!res.error_status && MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_IFEN_200)) {
        this.isImageFetched = false;
        this.imageMessage = 'NO_IMAGES_FETCHED';
      }
    }, error => {
      this.isImageFetched = false;
      this.imageMessage = 'SERVER_ERROR_OCCURRED';
    });
  }

  getEventHighlights() {
    this.highlightMessage = 'Loading..';
    this.hideHighlights = false;
    this.eventDetailsService.fetchEventHighlights(this.eventId).subscribe(res => {
      if (!res.error_status && MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_EHF_200)) {
        const statusCount = this.checkIsHighLightsAvailable(res.data);
        if (statusCount !== 3) {
          this.eventHighlights = res.data;
        } else {
          this.hideHighlights = true;
        }
      } else if (!res.error_status && MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_EHNF_200)) {
        this.hideHighlights = true;
        this.highlightMessage = 'NO_HIGHLIGHT_FOUND';
      }
    }, error => {
      this.hideHighlights = true;
      this.eventHighlights = {};
      this.highlightMessage = 'SERVER_ERROR_OCCURRED';
    });
  }

  resetAppointment() {
    this.bookAppointment.initializeAppointment();
  }

  resetTime(remainingTime) {
    this.eventDays = Math.floor(remainingTime / 86400);
    this.eventHour = Math.floor((remainingTime % 86400) / 3600);
    this.eventMinute = Math.floor(((remainingTime % 86400) % 3600) / 60);
    this.eventSeconds = ((remainingTime % 86400) % 3600) % 60;
  }

  initializeTimer() {
    this.remainingTime = this.eventInfo.remaining_seconds;
    if (this.remainingTime > 0) {
      this.resetTime(this.remainingTime);
    } else {
      this.isEventClosed = true;
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }
    }
  }

  checkIsHighLightsAvailable(data) {
    let count = 0;
    for (const value in data) {
      if (data[value] === -1) {
        count++;
      }
    }
    return count;
  }

  ngOnDestroy() {
    this.appointmentSubscription.unsubscribe();
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

}
