import { Component, OnInit, OnDestroy, ViewChild,
  AfterViewChecked, AfterViewInit, ElementRef, HostListener
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ConfirmationService } from 'primeng/components/common/api';
import { Subscription } from 'rxjs/Subscription';
import {
  SearchType,
  SearchTypeComparator,
  NotifyService,
  ApplicationStorageService,
  SearchService,
  MessageService,
  ApplicationDataService,
  MessageCodes,
  MessageCodesComparator,
  AuthService,
  EventDetailsService,
  UserProfileService,
  CustomTranslateService,
  DateTimeService
} from '@srk/core';

import { StompService } from '@srk/shared';
import { WebUserService } from './web-user.service';
declare var io: any;
declare var jQuery: any;

@Component({
  selector: 'app-web-user',
  templateUrl: './web-user.component.html',
  styleUrls: ['./web-user.component.scss']
})
export class WebUserComponent implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {

  @ViewChild('myCanvas') myCanvas: ElementRef;
  public context: CanvasRenderingContext2D;
  private subscription: Subscription;
  public menuItems: any;
  public msgs: string[] = [];
  public enableBot = false;
  public timerSubscription: any;
  public eventList: any;
  private webSocketSubscription: any;
  public downloadSubscription: Subscription;
  public downloadArray = [];
  public toggleTcPopup = false;
  public selectedRemarksObject: string;
  public checked: boolean = false;
  public agreeBoolean: boolean = false;
  public submitRequested = false;
  public selectedFileObject = [];
  public editorConfig = {
    theme: 'bubble',
    modules: {
      toolbar: []
    },
    readOnly: true
  };

  public particles = [];
  public showEventCelebration = this.authService.fetchCelebrateEventFlag();
  public clearIntervalForEventPartcile: any;
  constructor(
    private router: Router,
    //  private sailsService: SailsService,
    private webUserService: WebUserService,
    private notifyService: NotifyService,
    private appStore: ApplicationStorageService,
    private searchSvc: SearchService,
    private messageService: MessageService,
    private appDataSvc: ApplicationDataService,
    private authService: AuthService,
    private eventDetailsService: EventDetailsService,
    private stomp: StompService,
    private notify: NotifyService,
    private userProfileService: UserProfileService,
    private customTranslateSvc: CustomTranslateService,
    private confirmationService: ConfirmationService,
    private dateTimeService: DateTimeService
  ) {
    stomp.configure({
      host: this.appDataSvc.getEnvironment().dashboardws + '/dashboard-websocket',
      debug: false,
      queue: { 'init': false }
    });

    stomp.startConnect().then(() => {
      stomp.done('init');
      this.webSocketSubscription = stomp.subscribe('/dashboard-ws/cards/pushnotification/' +
        this.authService.getLoginName(), this.response);
    });
  }

  // response
  public response = (data) => {
    if (data && data.code === 'DS_CDF_200') {
      this.notifyService.notifyCardCountUpdate(data.data);
    }
  }

  ngOnInit() {
    this.getHolidayDetail();
    this.fetchTermsAndCondition();
    this.userProfileService.initializeUserProfileSettings();
    this.downloadSubscription = this.notify.notifyDownloadProgressActionObservable$.subscribe(res => {
      if (res && res.length > 0) {
        this.downloadArray = res;
      }
    });
    // this.initClientSocket();
    this.initPageItems();
    this.subscribeTranslation();
    this.initLazzyData();
    this.isBotEnabledUsers();
    this.initializeEventTimer();


  }

  getHolidayDetail() {
    this.dateTimeService.getHolidayAndSpecialEvent().subscribe(res => { },
      err => {
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
  }

  ngAfterViewChecked() {

  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.showEventCelebration) {
      this.genrateEventCelebration();
    }
  }


  ngAfterViewInit() {
    if (this.showEventCelebration) {
      this.genrateEventCelebration();
    }

    jQuery('.thm-menu .vertical_nav__minify').css({
      'height': window.innerHeight - 61 + 'px',
      // 'overflow': 'scroll'
    });

    // Make scroll thing happen.
    jQuery('#jsMenu').slimScroll({
      height: window.innerHeight - 61 + 'px',
      width: '55px',
      size: '10px',
      railVisible: true,
      alwaysVisible: true
    });

  }

  /*
    initClientSocket() {
      const webSocketApi = this.appDataSvc.getEnvironment().WebSocketApi;
      io.socket.url = webSocketApi;
      this.sailsService.connect(webSocketApi);
    }
  */
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.appStore.resetAll();
    //  this.sailsService.disconnect();
    this.searchSvc.clearSearchFilterCache();
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    //disconnect  socket
    if (this.stomp && this.stomp.config && this.stomp.config.queue && this.stomp.config.queue.init) {
      this.stomp.disconnect().then(() => {
      });
    }

    if (this.downloadSubscription) {
      this.downloadSubscription.unsubscribe();
    }

  }

  initPageItems() {
    this.menuItems = this.webUserService.getMenuItems();
  }

  subscribeTranslation() {
    this.subscription = this.notifyService.notifyTranslateObservable$.subscribe((res) => {
      if (res.hasOwnProperty('event') && res.event === 'profileChange') {
        this.initPageItems();
      }
    });
  }

  initLazzyData() {
    this.searchSvc.getSearchFilterData().subscribe(res => {
    });
    this.searchSvc.getSearchElement().subscribe(res => {
    });
  }

  globalSearchStone(event) {
    const config = {
      'range': {},
      'values': {
        'stone_id': event.value
      }
    };
    const searchCount = this.searchSvc.checkResultCount(this.appStore.getData('GENERAL_SEARCH:resultArray'));
    if (searchCount < this.appDataSvc.getSearchResultLimit()) {
      this.notifyService.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.searchSvc.specificSearch(config, SearchType.GLOBAL_SEARCH, 0, []).subscribe((response) => {
        if (response !== undefined) {
          this.notifyService.hideBlockUI();
          this.redirectSearchResponse(response);
        }
      }, error => {
        this.notifyService.hideBlockUI();
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    } else {
      this.notifyService.hideBlockUI();
      this.messageService.showErrorGrowlMessage('ERR_REACHED_SEARCH_TAB_LIMIT');
    }
  }

  redirectSearchResponse(response) {
    if (MessageCodesComparator.AreEqual(response.code, MessageCodes._LIMIT_EXCEED)) {
      if (response.data.body.length > 0) {
        this.navigateToResult();
      }
      this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
    } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes._OVER_LIMIT)) {
      if (response.data.body.length > 0) {
        this.navigateToResult();
        this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
      } else {
        this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
      }
    } else if (response.code === 'ELS#200') {
      if (response.data.body.length > 0) {
        this.navigateToResult();
      } else {
        this.messageService.showErrorGrowlMessage('NO_DATA_FOUND');
      }
    }
  }

  navigateToResult() {
    let count: number = this.appStore.getData('GENERAL_SEARCH:count');
    if (count === undefined) {
      count = 0;
    }
    count++;
    this.appStore.remove('GENERAL_SEARCH:count');
    this.appStore.store('GENERAL_SEARCH:count', count);
    this.appStore.remove('globalSearch');
    this.appStore.store('globalSearch', count);
    this.navigateChange();
  }

  navigateChange() {
    this.notifyService.hideBlockUI();
    let url = window.location.href;
    url = url.split('#').pop().split('?').pop();
    const page = url.substring(url.lastIndexOf('/') + 1);
    if (page === 'search-result') {
      this.notifyService.notifyGlobalSearch({ isGlobalSearch: true, type: SearchType.GENERAL_SEARCH });
    } else {
      const link = ['/web/search/search-result'];
      this.router.navigate(link);
    }
  }

  closeChatPopup(event, bot) {
    bot.visible = event.visible;
  }

  isBotEnabledUsers() {
    let clientName = this.authService.getUserDetail().login_name;
    if (clientName === 'janki.srkaycg' || clientName === 'Ankit') {
      this.enableBot = true;
    }
  }

  initializeEventTimer() {
    this.eventList = this.eventDetailsService.getEventInfo();
    if (this.eventList.length > 0) {
      this.timerSubscription = Observable.interval(1000).subscribe(x => {
        this.eventList.forEach(event => {
          if (event.remaining_seconds > 0) {
            event.remaining_seconds = event.remaining_seconds - 1;
          }
        });
      });
    }
  }

  fetchTermsAndCondition() {
    this.webUserService.fetchTermsAndCondition().subscribe(response => {
      if (MessageCodesComparator.AreEqual(response.code, MessageCodes.AUTH_NOT_SHOW_TC_200) || 
      MessageCodesComparator.AreEqual(response.code, MessageCodes.AUTH_SHOW_TC_400)) {
        this.toggleTcPopup = false;
      } else {
        this.selectedFileObject = [];
        this.toggleTcPopup = true;
        if (response.data && response.data.terms_and_condition_string) {
          this.selectedFileObject = response.data['terms_and_condition_string'];
          jQuery('#hideEditorBox').bind('cut copy paste', function (e) {
            e.preventDefault();
          });
        }
        if (response.data && response.data.remarks) {
          this.selectedRemarksObject = response.data['remarks'];
        }
      }
    });
  }

  logout() {
    let logoutMessage = 'Do you want to logout?';
    let logoutHeader = 'Logout';
    logoutMessage = this.customTranslateSvc.translateString(logoutMessage);
    logoutHeader = this.customTranslateSvc.translateString(logoutHeader);
    this.confirmationService.confirm({
      message: logoutMessage,
      header: logoutHeader,
      accept: () => {
        this.authService.logoutUser().subscribe(res => {
          if (res.error_status === false) {
            const logout = [''];
            this.router.navigate(logout);
          }
        }, error => {
          this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
        });
      }
    });
  }

  TcSubmitBotton(checked) {
    if (this.checked === true) {
      this.submitRequested = true;
      this.webUserService.AcceptTermsAndCondition().subscribe(response => {
        if (MessageCodesComparator.AreEqual(response.code, MessageCodes.AUTH_TC_ACCEPTED_200)) {
          this.toggleTcPopup = false;
        }
      }, error => {
      });
    } else {
    }
  }

  navigateUser(event) {
    this.router.navigate([event]);
  }


  /*********************************Event celebrate flag**********************************************/
  genrateEventCelebration() {
    this.particles = [];
    var canvas = document.getElementById('canvas');
    var ctx = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');

    //canvas dimensions
    var W = window.innerWidth;
    var H = window.innerHeight;
    canvas['width'] = W;
    canvas['height'] = H;
    var mp = 200;
    this.particles = [];
    for (var i = 0; i < mp; i++) {
      this.particles.push({
        x: Math.random() * W, //x-coordinate
        y: Math.random() * H, //y-coordinate
        r: Math.random() * 4 + 1, //radius
        d: Math.random() * mp, //density
        color: "rgba(" + Math.floor((Math.random() * 255)) + ", " + Math.floor((Math.random() * 255)) + ", " + Math.floor((Math.random() * 255)) + ", 0.8)"
      });
    }
    var angle = 0;
    this.draw(this.particles, ctx, W, H, mp, angle);
    this.clearIntervalForEventPartcile = setInterval(() => {
      this.draw(this.particles, ctx, W, H, mp, angle);
    }, 33);
  }

  //Lets draw the flakes
  draw(particles, ctx, W, H, mp, angle) {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < mp; i++) {
      var p = particles[i];
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
      ctx.fill();
    }

    this.update(particles, angle, mp, W, H);
  }

  update(particles, angle, mp, W, H) {
    angle += 0.01;
    for (var i = 0; i < mp; i++) {
      var p = particles[i];
      p.y += Math.cos(angle + p.d) + 1 + p.r / 2;
      p.x += Math.sin(angle) * 2;
      if (p.x > W + 5 || p.x < -5 || p.y > H) {
        if (i % 3 > 0) //66.67% of the flakes
        {
          particles[i] = { x: Math.random() * W, y: -10, r: p.r, d: p.d, color: p.color };
        }
        else {
          //If the flake is exitting from the right
          if (Math.sin(angle) > 0) {
            //Enter from the left
            particles[i] = { x: -5, y: Math.random() * H, r: p.r, d: p.d, color: p.color };
          }
          else {
            //Enter from the right
            particles[i] = { x: W + 5, y: Math.random() * H, r: p.r, d: p.d, color: p.color };
          }
        }
      }
    }
  }

  continueShopping() {
    this.showEventCelebration = false;
    clearInterval(this.clearIntervalForEventPartcile);
    this.authService.setEventCelebrateFlag(this.showEventCelebration);
  }
  /*******************************************************************************************************/
}
