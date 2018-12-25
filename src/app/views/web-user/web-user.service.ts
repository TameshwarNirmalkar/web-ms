import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { EventDetailsService } from '@srk/core';
import { ErrorHandlerService } from '@srk/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class WebUserService {

  private defaultMenus = [
    {
      label: 'DASHBOARD', iconClass: 'icon-dashboard', routeLink: 'dashboard',
      name: 'dashboard_menu', countName: 'dashboard_count', order: 1
    },
    {
      label: 'SPECIFIC SEARCH', iconClass: 'icon-search', routeLink: 'search',
      name: 'search_menu', countName: 'search_count', order: 3
    },
    {
      label: 'TWIN DIAMONDS', iconClass: 'icon-Twin-Shape-Round', routeLink: 'twin-diamonds',
      name: 'twin_diamond_menu', order: 4
    },
    {
      label: 'BID TO BUY', iconClass: 'icon-b2b', routeLink: 'bid-to-buy',
      name: 'btob_menu', countName: 'btob_count', order: 5
    },
    {
      label: 'DAYP', iconClass: 'icon-dayp', routeLink: 'dayp',
      name: 'dayp_menu', countName: 'dayp_count', order: 6
    },
    {
      label: 'RECOMMENDATION', iconClass: 'srk-recommend', routeLink: 'recommendation',
      name: 'recommendations_menu', countName: 'my_recommendation_count', order: 7
    },
    {
      label: 'CONFIRMATIONS', iconClass: 'icon-confirmations', routeLink: 'confirmations',
      name: 'confirmations_menu', countName: 'confirmation_stone_count', order: 8
    },
    {
      label: 'BASKET', iconClass: 'icon-cart', routeLink: 'basket',
      name: 'basket_menu', countName: 'my_basket_count', order: 9
    },
    {
      label: 'PACKET', iconClass: 'icon-packet', routeLink: 'packet',
      name: 'packet_menu', countName: 'packet_count', order: 10
    },
    {
      label: 'VIEW REQUESTS', iconClass: 'icon-my-view', routeLink: 'view-request',
      name: 'view_request_menu', countName: 'view_request_count', order: 11
    },
    {
      label: 'DDC', iconClass: 'icon-ddc', routeLink: 'ddc',
      name: 'ddc_menu', countName: 'ddc_stone_count', order: 12
    },
    {
      label: 'HOLD LIST', iconClass: 'icon-hold-list-option-2', routeLink: 'hold-list',
      name: 'hold_list_menu', countName: 'hold_count', order: 13
    },

    {
      label: 'PROFILE', iconClass: 'icon-user', routeLink: 'user-profile',
      name: 'profile_menu', countName: 'profile_count', order: 14
    }
  ];


  constructor(
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private applicationData: ApplicationDataService,
    private eventDetailsService: EventDetailsService,
    private http: HttpClient
  ) { }

  getMenuItems() {
    const activeMenus: any[] = [];
    let allMenus = JSON.parse(JSON.stringify(this.defaultMenus));
    const eventList = this.eventDetailsService.getEventInfo();
    const reOrderEvent = JSON.parse(JSON.stringify(eventList)).reverse();
    if (reOrderEvent.length > 0) {
      reOrderEvent.forEach(element => {
        const menu = {
          label: element.event_name,
          countryFlag: `/assets/img/${element.country_code}.png`,
          routeLink: `event/${element.country_code}`,
          name: 'show_menu',
          countName: 'event_count',
          order: 2
        };
        if (element.hasOwnProperty('remaining_seconds') && element.remaining_seconds > 0) {
          menu['liveFlag'] = 'Live';
        }
        allMenus.push(menu);
      });
    }
    allMenus = this.sortMenuOrder(allMenus, 'order');
    allMenus.forEach((menu) => {
      if (this.authService.hasElementPermission(menu.name)) {
        activeMenus.push(menu);
      }
    });
    return activeMenus;
  }

  sortMenuOrder(requestData, params) {
    requestData.sort(function (obj1, obj2) {
      if (obj1.order < obj2.order) {
        return -1;
      } else if (obj1.order > obj2.order) {
        return 1;
      } else {
        return 0;
      }
    });
    return requestData;
  }

  fetchTermsAndCondition(): Observable<any> {
    const url = `${this.applicationData.getEnvironment().AuthenticationApi}/auth/login/termAndConditions/show/v2`;
    return this.http.get(url);

  }

  AcceptTermsAndCondition(): Observable<any> {
    const url = `${this.applicationData.getEnvironment().AuthenticationApi}/auth/login/termAndConditions/v2`;
    return this.http.post(url, null);
  }

}
