import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { AuthService, ErrorHandlerService, ApplicationDataService } from '@srk/core';
import { Dashboard } from './dashboard';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class WebDashboardService {

  allCard: any[];
  private readonly dashboards: string[] = ['PrimaryDashboard', 'SecondaryDashboard'];
  public kamDetails: any;

  constructor(
    private errorHandler: ErrorHandlerService,
    private http: HttpClient,
    private authService: AuthService,
    private applicationDataService: ApplicationDataService) { }

  getActiveDashboard(allDashboards: Dashboard[]): Dashboard {
    const userPreferredDashboard = this.dashboards[0];
    let activeDashboard: Dashboard = allDashboards[0];
    const activeDashboards = allDashboards.filter((dashboardItem) => {
      if (dashboardItem.name === userPreferredDashboard) { return dashboardItem; }
    });
    if (activeDashboards !== undefined && activeDashboards.length > 0) {
      activeDashboard = activeDashboards[0];
    }
    return activeDashboard;
  }

  fetchPrimaryAdvertisement(): Observable<any> {
    return this.http.post(this.applicationDataService.getEnvironment().AdminApi +
      '/solitaire-admin/dashboard/show/uploaded/files/' +
      this.applicationDataService.getEnvironment().AdminVersion, null)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('WebDashboardService:primaryAdvertise', err))
      );
  }

  getCards(): Observable<any> {
    const token = this.authService.getToken();
    const body = JSON.stringify({});
    return this.http.post(this.applicationDataService.getEnvironment().DashboardApi
      + '/dashboard/card/cards/' + this.applicationDataService.getEnvironment().DashboardVersion, body)
      .pipe(
        map((response: any) => {
          if (!response.error_status) {
            return response;
          }
        }),
        catchError(err => this.errorHandler.handleError('Diamond Cards', err))
      );
  }

  getCardList() {
    return [
      {
        name: '', mainDisplayValue: '', mainDisplayText: '',
        icon: '', footerLeftName: '',
        footerRightName: ''
      },
      {
        name: '', mainDisplayValue: '', mainDisplayText: '',
        icon: '', footerLeftName: '',
        footerRightName: ''
      },
      {
        name: '', mainDisplayValue: '', mainDisplayText: '',
        icon: '', footerLeftName: '',
        footerRightName: ''
      },
      {
        name: '', mainDisplayValue: '', mainDisplayText: '',
        icon: '', footerLeftName: '',
        footerRightName: ''
      }
    ];
  }

  getWeeklyVolumeList(): Observable<any> {
    const body = JSON.stringify({});
    return this.http.post(this.applicationDataService.getEnvironment().DashboardApi
      + '/dashboard/card/wvd/' + this.applicationDataService.getEnvironment().DashboardVersion, body)
      .pipe(
        map((response: any) => {
          const data = response;
          if (!data.error_status) {
            return data.WeeklyVolumeDiscount;
          }
        }),
        catchError(err => this.errorHandler.handleError('Weekly Discount', err))
      );
  }

  getRecentConfirmationList(): Observable<any> {
    const body = {};
    return this.http.post(this.applicationDataService.getEnvironment().DashboardApi +
      '/dashboard/card/recentConfirmation/' + this.applicationDataService.getEnvironment().DashboardVersion, body)
      .pipe(
        map((res: any) => {
          const responseData = res;
          if (!responseData.error_status) {
            return responseData.recentConfirmationList;
          }
        }),
        catchError(err => this.errorHandler.handleError('Recent Confirmation', err))
      );
  }

  getKAMDetails(): Observable<any> {
    const token = this.authService.getToken();
    const body = JSON.stringify({});
    return this.http.post(this.applicationDataService.getEnvironment().DashboardApi +
      '/dashboard/card/kamDetail/' + this.applicationDataService.getEnvironment().DashboardVersion, body)
      .pipe(
        map((response: any) => {
          const responseData = response;
          if (!responseData.error_status && responseData.data) {
            this.kamDetails = responseData.data.kamDetail;
            return responseData.data.kamDetail;
          } else {
            return {};
          }
        }),
        catchError(err => this.errorHandler.handleError('KAM Details', err))
      );
  }

  importKAMDetails() {
    return this.kamDetails;
  }
  getWalletCardList() {
    const body = JSON.stringify({});
    return this.http.post(this.applicationDataService.getEnvironment().DashboardApi +
      '/dashboard/card/wvdDetail/' + this.applicationDataService.getEnvironment().DashboardVersion, body)
      .pipe(
        map((response: any) => {
          const data = response;
          if (!data.error_status) {
            return data.WeeklyVolumeDiscountList;
          }
        }),
        catchError(err => this.errorHandler.handleError('Wallet Details', err))
      );
  }

  getMenuCountList(): Observable<any> {
    return this.http.post(this.applicationDataService.getEnvironment().DashboardApi
      + '/dashboard/card/navigationCount/' + this.applicationDataService.getEnvironment().DashboardVersion, {});
  }

  getExclusiveStoneDetails(): Observable<any> {
    return this.http.get(this.applicationDataService.getEnvironment().AdminApi
      + '/solitaire-admin/exclusiveStoneUrl/list/'
      + this.applicationDataService.getEnvironment().AdminVersion + '/false'
    );
  }

  getCardSequence() {
    return [
      'Uploaded Stones',
      'Bid to Buy Stones',
      'My Basket Stones',
      'My View Requested',
      'DDC Diamond Stones',
      'DAYP Stones',
      'Recommended Stones',
      'Show Card Stones'];
  }

}
