import {Component, OnInit, Input, OnDestroy, AfterContentChecked, ViewEncapsulation, AfterViewInit, OnChanges} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { NotifyService, UserProfileService } from '@srk/core';
import { BidToBuyService } from '../../services/bid-to-buy.service';
import { DaypService } from '../../services/dayp.service';

import { StoneDetailsService } from '../../services/stone-details.service';

declare var jQuery: any;

@Component({
  selector: 'thm-menu',
  templateUrl: './thm-menu.component.html',
  styleUrls: ['./thm-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ThmMenuComponent implements OnInit, OnDestroy, AfterContentChecked, AfterViewInit, OnChanges {

  @Input() menuList: any;
  public querySelector: any;
  public nav: any;
  public wrapper: any;
  public menu: any;
  private subscription: Subscription;
  public httpSubscription: Subscription;

  // nav menu height
  navMenuContainerHeight: number;

  constructor(private notifyService: NotifyService,
    private userProfileService: UserProfileService,
    private btbService: BidToBuyService,
    private daypService: DaypService,
    private stoneDetailsService: StoneDetailsService
  ) { }

  ngOnInit() {

    this.getMenuCount();
    this.fetchExportMemo('dashboard');
    this.querySelector = document.querySelector.bind(document);
    this.nav = document.querySelector('.vertical_nav__minify');
    this.wrapper = document.querySelector('.wrapper__minify');
    this.menu = document.getElementById('js-menu');
    this.subscription = this.notifyService.notifyMenuToggleObservable$.subscribe((res) => {
      if (res.hasOwnProperty('component')) {
        this.collapseMenuList();
      }
    });

    this.subscription = this.notifyService.notifyCardCountUpdateActionObservable$.subscribe((res) => {
      this.updateMenuCount(res);
    });
  }

  ngAfterViewInit () {

    /*setInterval(() => {

      let wrapperHeight = $('#searchTabResultId').height();

      if (typeof wrapperHeight === 'undefined' ) {

        this.navMenuContainerHeight = $('#root-container').height();

      } else {

        this.navMenuContainerHeight = $('#searchTabResultId').height();

      }

      wrapperHeight = null;

    }, 500);*/

  }

  ngOnChanges() {
    this.fetchDaypActiveStatus();
  }

  fetchDaypActiveStatus() {
    this.daypService.checkActiveDaypStatus().subscribe(res => {
      if (res.data.remainingTime.data.isDAYPEventOn === true) {
        this.menuList.forEach((element) => {
          if (element.label === 'DAYP') {
            element['liveFlag'] = 'Active';
          }
        });
      }
    });
  }

  ngAfterContentChecked() {
    // const height = jQuery('body').height();
    // jQuery('#navMenuContainerId').css({ 'height': (height - 80) + 'px' });
  }

  getMenuCount() {
    this.userProfileService.getMenuCountList().subscribe(res => {
      if (res) {
        this.updateMenuCount(res);
      }
    }, error => { });
  }

  updateMenuCount(countData) {

    this.menuList.forEach((element) => {
      const countNames = element.countName;
      if (countData.hasOwnProperty(countNames)) {
        const i = this.menuList.indexOf(element);
        this.menuList[i]['count'] = countData[countNames];
      }
      if (element.label === 'BID TO BUY' && countData.b2bv_code && countData.b2bv_code.indexOf(',') > -1) {
        const versionAvailable = countData.b2bv_code.split(',');
        let flag = false;
        versionAvailable.forEach(data => {
          if (Number(data) > 0 && !flag) {
            flag = true;
          }
        });
        if (flag) {
          element['liveFlag'] = 'Active';
        }
      }
    });
  }

  collapseMenuList() {
    this.nav.classList.toggle('vertical_nav');
    this.wrapper.classList.toggle('wrapper');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  fetchExportMemo(link) {
    // if (link === 'packet') {
    //   if (this.httpSubscription) {
    //     this.httpSubscription.unsubscribe();
    //   }
    //   this.httpSubscription = this.stoneDetailsService.getConfirmedExportMemo().subscribe(res => { }, error => { });
    // }
  }

}
