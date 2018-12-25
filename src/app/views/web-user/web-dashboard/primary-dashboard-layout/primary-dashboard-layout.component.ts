import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebDashboardService } from '../web-dashboard.service';
import { CustomTranslateService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { LoggerService } from '@srk/core';
import { UserDeviceService } from '@srk/core';
import { UserProfileService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';
import { ApplicationStorageService } from '@srk/core';
import { Router } from '@angular/router';
import { MessageService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { Observable } from 'rxjs/Observable';
import { EventDetailsService } from '@srk/core';
import { AuthService } from '@srk/core';
import { DaypService } from '@srk/shared';
import { TitleCasePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'underscore';
declare var jQuery;

@Component({
  selector: 'app-primary-dashboard-layout',
  templateUrl: './primary-dashboard-layout.component.html',
  styleUrls: ['./primary-dashboard-layout.component.scss']
})

export class PrimaryDashboardLayoutComponent implements OnInit, OnDestroy {

  primaryImagebanner: any;
  imageData: any[] = [];
  recentConfirmationData: any[] = [];
  cardList: any[];
  lazzyCardList: any[] = [];
  firstColumnList: any[];
  secondColumnList: any[];
  wdCalculationData: any[];
  weeklyVolumeData: any;
  weeklyVolumeDiscount = 0;
  weeklyTotalSavings = 0;
  flip = 'inactive';
  public isKamDetailsAvailable = true;
  public kamDetails: any;
  private subscription: Subscription;
  private cardUpdateSubscription: Subscription;
  public loadingConfirmationData = true;
  public isDaypActive = false;
  public isExclusiveStoneMovieActive = false;
  public daypEventDetails: any;
  public daypTime: any;
  public timeSubScription: Subscription;
  public eventDetails: any[] = [];
  public isErrorCodeInResponse: string;
  public commonMediaFile: any;
  public loadVideo = false;
  public fetchStoneDetails = [];
  public stoneID = [];
  public isWvdAllowedToDisplay = this.authService.hasElementPermission('weekly_volume_discount');

  constructor(
    private webDashboardService: WebDashboardService,
    private customTranslateSvc: CustomTranslateService,
    private logger: LoggerService,
    private messageService: MessageService,
    private router: Router,
    private eventDetailsService: EventDetailsService,
    private userDeviceService: UserDeviceService,
    private userProfileService: UserProfileService,
    private appStore: ApplicationStorageService,
    private notifyService: NotifyService,
    private authService: AuthService,
    private translateService: TranslateService,
    private daypSvc: DaypService) { }

  ngOnInit() {
    this.notifyService.hideBlockUI();
    if (this.userDeviceService.isDeviceSupportLocalStorage() &&
        window.localStorage.getItem(this.authService.getLoginName() + '-dashboard-cards')
      ) {
          this.cardList = JSON.parse(window.localStorage.getItem(this.authService.getLoginName() + '-dashboard-cards'));
    } else {
      this.lazzyCardList = this.userProfileService.getCardList();
    }
    this.fetchDaypEventCard();
    this.fetchCards();
    if (this.userDeviceService.isDeviceSupportLocalStorage() &&
        window.localStorage.getItem(this.authService.getLoginName() + '-kam-detail')
      ) {
          this.kamDetails = JSON.parse(window.localStorage.getItem(this.authService.getLoginName() + '-kam-detail'));
    } else {
      this.kamDetails = [{
        userDisplayName: '',
        primaryEmailId: null,
        mobileNo: null,
        userProfileImage: '',
        userStatus: 'Offline'
      }];
      this.getWebKamDetails();
    }
    this.observeForCarouselResize();
    this.firstColumnList = [
      { name: 'adv-box', class: 'ui-g-12 ui-md-12 ui-lg-6' },
      { name: 'graph-box', class: 'ui-g-12 ui-md-12 ui-lg-6' },
      { name: 'recent-box', class: 'ui-g-12 ui-md-12 ui-lg-12' }
    ];
    this.secondColumnList = [
      { name: 'movie-box', class: 'ui-g-12 ui-md-12 ui-lg-12' },
      { name: 'search-box', class: 'ui-g-12 ui-md-12 ui-lg-12' },
      { name: 'contact-box', class: 'ui-g-12 ui-md-12 ui-lg-12' }
    ];
    if (!this.isWvdAllowedToDisplay) {
      this.secondColumnList.unshift({ name: 'adv-box', class: 'ui-g-12 ui-md-12 ui-lg-12' });
    }
    this.webDashboardService.getWeeklyVolumeList().subscribe(res => {
      if (res) {
        this.weeklyVolumeData = res;
        this.weeklyVolumeDiscount = this.weeklyVolumeData.eligible_discount;
        this.weeklyTotalSavings = this.weeklyVolumeData.eligible_savings;
      }
    }, error => {
      this.logger.logError('PrimaryDashboardLayoutComponent', 'End:- Error in receiving weekly volume list');
    });
    this.webDashboardService.getWalletCardList().subscribe(res => {
      if (res) {
        this.wdCalculationData = res;
      }
    }, error => {
      this.logger.logError('PrimaryDashboardLayoutComponent', 'End:- Error in receiving weekly volume details');
    });
    this.webDashboardService.getRecentConfirmationList().subscribe(res => {
      if (res) {
        this.loadingConfirmationData = false;
        this.recentConfirmationData = res;
      }
    }, error => {
      this.logger.logError('PrimaryDashboardLayoutComponent', 'End:- Error in receiving recent confirmation list');
    });
    this.recentConfirmationData = this.customTranslateSvc.translateColumns('status', this.recentConfirmationData);
    this.eventDetails = this.eventDetailsService.getEventInfo();
    this.cardUpdateSubscription = this.notifyService.notifyCardCountUpdateActionObservable$.subscribe((res) => {
      this.updateCardDetailsCount(res);
    });
    this.primaryAdLoad();
    this.getStoneDetails();
  }

  getStoneDetails() {
    this.webDashboardService.getExclusiveStoneDetails().subscribe(response => {
      if (!response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.AS_DQ_DF_200)) {
        const stoneDetails = response.data.stone_details;
        stoneDetails.forEach((stoneId, index) => {
          this.stoneID.push(stoneId.stone_id);
          this.fetchStoneDetails[index] = {
              stone_id: stoneId.stone_id,
              carat: stoneId.carat,
              color: stoneId.color,
              clarity: stoneId.clarity,
              shape: stoneId.shape,
              movie_url: stoneId.movie_url,
              fullname: stoneId.color_full_name
            };
        });
        this.isExclusiveStoneMovieActive = true;
      }
    }, error => { });
  }

  getWebKamDetails() {
    this.userProfileService.getKAMDetails().subscribe(res => {
      if (res.hasOwnProperty('mainDesc')) {
        this.kamDetails = res;
        if (this.userDeviceService.isDeviceSupportLocalStorage()) {
          window.localStorage.setItem(this.authService.getLoginName() + '-kam-detail', JSON.stringify(this.kamDetails));
        }
      } else {
        this.isKamDetailsAvailable = false;
      }
    }, error => {
      this.isKamDetailsAvailable = false;
      this.logger.logError('PrimaryDashboardLayoutComponent', 'End:- Error in receiving KAM details');
    });
  }

  primaryAdLoad() {
    this.webDashboardService.fetchPrimaryAdvertisement().subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.AS_SUI_200)) {
        this.imageData = res.data;
        this.commonMediaFile = res.data;
        this.primaryImagebanner = this.imageData['primary'];
        this.loadVideo = true;
      }
    });
  }

  errorHandler(event) {
    this.primaryImagebanner = this.imageData['secondary'];
  }

  showWWDetail() {
    jQuery('#cardFront').fadeOut(1000);
  }

  hideWWDetail() {
    jQuery('#cardFront').fadeIn(1000);
  }

  fetchCards() {
    this.webDashboardService.getCards()
      .subscribe(cards => {
        if (cards !== undefined) {
          this.lazzyCardList = [];
          this.cardList = [];
          for (const cardName in cards.data) {
            if (cards.data.hasOwnProperty(cardName)) {
              const cardData = cards.data[cardName];
              this.cardList.push(cardData);
            }
          }
          this.cardList = this.reorderCardBySequence(this.cardList);
          this.cardList = this.updateDashboardCardForRecommendedCard(this.cardList);
          if (this.cardList) {
            this.cardList = this.customTranslateSvc.translateDashboardCardList(this.cardList);
            if (this.userDeviceService.isDeviceSupportLocalStorage()) {
              window.localStorage.setItem(this.authService.getLoginName() + '-dashboard-cards', JSON.stringify(this.cardList));
            }
          }
        }
      });
  }

  reorderCardBySequence(array) {
    array.sort(function (obj1, obj2) {
      if (obj1.orderNo < obj2.orderNo) {
        return -1;
      } else if (obj1.orderNo > obj2.orderNo) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }

  fetchDaypEventCard() {
    this.daypSvc.checkActiveDaypStatus().subscribe(res => {
      if (res && !res.error_status && res.data && res.data.remainingTime && res.data.remainingTime.data) {
        const responseData = res.data.remainingTime.data;
        this.isDaypActive = responseData.isDAYPEventOn;
        this.daypTime = {
          days: responseData.days,
          hours: responseData.hours,
          minutes: responseData.minutes,
          seconds: responseData.seconds,
          start_date: responseData.start_date,
          end_date: responseData.end_date
        };
        if (this.daypTime && this.daypTime.start_date && this.daypTime.end_date) {
          const startDate = this.daypTime.start_date.split(',');
          const endDate = this.daypTime.end_date.split(',');
          const startTime = startDate[1].trim() ?
            (startDate[1].trim().substring(startDate[1].trim().lastIndexOf(':'), 0) ?
              startDate[1].trim().substring(startDate[1].trim().lastIndexOf(':'), 0) : '') : '';
          const endTime = endDate[1].trim() ?
            (endDate[1].trim().substring(endDate[1].trim().lastIndexOf(':'), 0) ?
              endDate[1].trim().substring(endDate[1].trim().lastIndexOf(':'), 0) : '') : '';
          this.daypTime['start_time'] = startTime;
          this.daypTime['end_time'] = endTime;
        }
        if (this.isDaypActive) {
          this.daypSvc.getDaypEventDetails().subscribe(response => {
            if (response && !response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.DAYP_EF_200)) {
              this.getDaypTimeCountDown();
              this.daypEventDetails = response.data[0];
            }
          });
        }
      }
    });
  }

  getDaypTimeCountDown() {
    if (this.daypTime) {
      this.timeSubScription = Observable.interval(1000).subscribe(t => {
        if (this.daypTime.seconds > 0) {
          this.daypTime.seconds--;
        } else if (this.daypTime.seconds === 0 && this.daypTime.minutes > 0) {
          this.daypTime.seconds = 59;
          this.daypTime.minutes--;
        } else if (this.daypTime.minutes === 0 && this.daypTime.hours > 0) {
          this.daypTime.minutes = 59;
          this.daypTime.hours--;
        } else if (this.daypTime.hours === 0 && this.daypTime.days > 0) {
          this.daypTime.hours = 23;
          this.daypTime.days--;
        }
      });
    }
  }

  observeForCarouselResize() {
    this.subscription = this.notifyService.notifyMenuToggleObservable$.subscribe((res) => {
      if (res.hasOwnProperty('component')) {
        this.refreshCarouselData();
      }
    });
  }

  refreshCarouselData() {
    const $carousel = $('.owl-carousel');
    const carsouselData = $carousel.data('owl.carousel');
    if (carsouselData !== undefined) {
      carsouselData._invalidated.width = true;
      setTimeout(() => {
        $carousel.trigger('refresh.owl.carousel');
      }, 300);
    }
  }

  customizeText(arg: any) {
    return arg.valueText + '%';
  }

  navigateSearchResult(e) {
    if (e.status) {
      let count = 1;
      if (this.appStore.getData('GENERAL_SEARCH:count')) {
        count = this.appStore.getData('GENERAL_SEARCH:count');
        count++;
      }
      this.appStore.store('GENERAL_SEARCH:count', count);
      this.notifyService.hideBlockUI();
      this.router.navigate(['/web/search/search-result']);
    } else {
      this.messageService.showErrorGrowlMessage('Sorry! No data found');
    }
  }

  navigateToConfirmation() {
    const link = ['/web/confirmations'];
    this.router.navigate(link);
  }

  navigateToDayp() {
    const link = ['/web/dayp'];
    this.router.navigate(link);
  }

  navigateToPage(e) {
    const link = [e.link];
    if (e.link !== '/web/search/') {
      if (e.param) {
        this.router.navigate(link, { queryParams: { page: e.param } });
      } else {
        this.router.navigate(link);
      }
    } else {
      const searchUploaded = {
        status: true
      };
      this.navigateSearchResult(searchUploaded);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.timeSubScription) {
      this.timeSubScription.unsubscribe();
    }
    if (this.cardUpdateSubscription) {
      this.cardUpdateSubscription.unsubscribe();
    }
  }

  updateCardDetailsCount(object) {
    if (this.cardList && this.cardList.length > 0) {
      this.cardList.forEach(card => {
        if (card.cardId === '3') {
          card.mainDisplayValue = String(object.my_basket_count);
        }
        if (card.cardId === '5') {
          card.mainDisplayValue = String(object.ddc_stone_count);
        }
        if (card.cardId === '4') {
          card.mainDisplayValue = String(object.view_request_count);
        }
      });
      window.localStorage.setItem(this.authService.getLoginName() + '-dashboard-cards', JSON.stringify(this.cardList));
    }
  }

  updateDashboardCardForRecommendedCard(cardList) {
    const cardData = _.findWhere(cardList, { 'cardId': '8' });
    const params = { kamName: this.fetchFirstNameOfKam() };
    if (cardData && cardData.mainDisplayText) {
      this.translateService.get(cardData.mainDisplayText, params).subscribe((res: string) => {
        cardData['mainDisplayText'] = res;
      });
    }
    if (_.findWhere(cardList, { 'cardId': '8', 'mainDisplayValue': '0' })) {
      cardList.splice(_.findIndex(cardList, { 'cardId': '8', 'mainDisplayValue': '0' }), 1)
    }
    return cardList;
  }

  fetchFirstNameOfKam() {
    let kamFirstName = 'KAM';
    if (this.kamDetails && this.kamDetails.userDisplayName) {
      if (this.kamDetails.userDisplayName.indexOf(' ')) {
        kamFirstName = new TitleCasePipe().transform(this.kamDetails.userDisplayName.split(' ')[0]);
      }
    }
    return kamFirstName;
  }
}
