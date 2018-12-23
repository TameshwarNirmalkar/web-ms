import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ErrorHandlerService } from './error-handler.service';
import { ApplicationDataService } from './application-data.service';
import { LoggerService } from './logger.service';
import { AuthService } from './auth.service';
import { UserDeviceService } from './user-device.service';
import { MessageCodes, MessageCodesComparator } from '../enums/message-codes.enum';
import { empty, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class UserProfileService {

  public userSelectedColumns: any[];
  public userColumnsOrder: any[];
  public searchFilters: any[];
  public userSelectedCards: any[];
  public userSelectedAlerts: any[];
  public userSelectedLanguage: any[] = [];
  public daypPreference: any[];
  public clientLimits: any;
  public kamDetails: any;
  public userSelectedConfirmationColumns: any[];
  public saveSearchResultPrefernce: any[];
  public PopUpVisible = true;
  public columnWidthSet: any;
  public daypColumnWidthSet: any;
  public columnorder: any;
  public isBtbVersionAvailable = false;

  constructor(
    private translateService: TranslateService,
    private errorHandler: ErrorHandlerService,
    private applicationDataService: ApplicationDataService,
    private logger: LoggerService,
    private http: HttpClient,
    private userDeviceService: UserDeviceService,
    private authService: AuthService
  ) { }

  getKAMDetails() {
    const body = JSON.stringify({});
    return this.http.post(this.applicationDataService.getEnvironment().DashboardApi +
      '/dashboard/card/kamDetail/' + this.applicationDataService.getEnvironment().DashboardVersion, body)
      .subscribe((response) => {
        const responseData = response;
        if (!responseData['error_status'] && responseData['data']) {
          this.kamDetails = responseData['data'].kamDetail;
          return responseData['data'].kamDetail;
        } else {
          return {};
        }
      }, err => { 
        return this.errorHandler.handleError('KAM Details', err); 
      });
  }

  importKAMDetails() {
    return this.kamDetails || JSON.parse(window.localStorage.getItem(this.authService.getLoginName() + '-kam-detail'));
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

  getMenuCountList() {
    return this.http.post(this.applicationDataService.getEnvironment().DashboardApi
      + '/dashboard/card/navigationCount/' + this.applicationDataService.getEnvironment().DashboardVersion, {});
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.getUserProfileLanguage();
  }

  initializeUserProfileSettings(): Observable<any> {
    const userProfileObservable$ = this.getUserProfileSettings();
    userProfileObservable$.subscribe((data: any[]) => {
      this.columnorder = data[0];
      if (!data[1].error_status) {
        this.setSelectedColumnList(data[1].data.config_values);
      } else {
        if (MessageCodesComparator.AreEqual(data[1].code, MessageCodes.CS_UNAUTHORIZED_401)) {
          // TODO: show forcefully logout message to the user.
          this.logger.logError('UserProfileService:initializeUserProfileSettings',
            'Error while fetching column filter :- ' + data[2].message);
        }
      }
      if (!data[2].error_status) {
        this.setSelectedCardList(data[2].data.config_values);
      } else {
        if (MessageCodesComparator.AreEqual(data[2].code, MessageCodes.CS_UNAUTHORIZED_401)) {
          // TODO: show forcefully logout message to the user.
          this.logger.logError('UserProfileService:initializeUserProfileSettings',
            'Error while fetching card filter :- ' + data[3].message);
        }
      }
      if (!data[3].error_status) {
        this.setSelectedAlertList(data[3].data.config_values);
      } else {
        if (MessageCodesComparator.AreEqual(data[3].code, MessageCodes.CS_UNAUTHORIZED_401)) {
          // TODO: show forcefully logout message to the user.
          this.logger.logError('UserProfileService:initializeUserProfileSettings',
            'Error while fetching alert filter :- ' + data[4].message);
        }
      }
      if (!data[4].error_status) {
        this.setSearchFilterList(data[4].data.config_values);
      } else {
        if (MessageCodesComparator.AreEqual(data[4].code, MessageCodes.CS_UNAUTHORIZED_401)) {
          // TODO: show forcefully logout message to the user.
          this.logger.logError('UserProfileService:initializeUserProfileSettings',
            'Error while fetching search filter :- ' + data[5].message);
        }
      }
      if (!data[5].error_status) {
        this.setDaypPreference(data[5].data.config_values);
      } else {
        if (MessageCodesComparator.AreEqual(data[5].code, MessageCodes.CS_UNAUTHORIZED_401)) {
          // TODO: show forcefully logout message to the user.
          this.logger.logError('UserProfileService:initializeUserProfileSettings',
            'Error while fetching DAYP Preference :- ' + data[6].message);
        }
      }
      if (!data[6].error_status) {
        this.clientLimits = data[6].data.config_values;
        this.setObjectInLocalStorage('user-selected-client-limits', this.clientLimits);
      } else {
        if (MessageCodesComparator.AreEqual(data[6].code, MessageCodes.CS_UNAUTHORIZED_401)) {
          // TODO: show forcefully logout message to the user.
          this.logger.logError('UserProfileService:initializeUserProfileSettings',
            'Error while fetching client limits :- ' + data[7].message);
        }
      }
      if (!data[7].error_status) {
        this.setSelectedConfirmationColumnList(data[7].data.config_values);
      } else {
        if (MessageCodesComparator.AreEqual(data[7].code, MessageCodes.CS_UNAUTHORIZED_401)) {
          // TODO: show forcefully logout message to the user.
          this.logger.logError('UserProfileService:initializeUserProfileSettings',
            'Error while fetching confirmation filters :- ' + data[8].message);
        }
      }
      if (!data[8].error_status) {
        this.setSaveSearchResultPreference(data[8].data.config_values);
      } else {
        if (MessageCodesComparator.AreEqual(data[8].code, MessageCodes.CS_UNAUTHORIZED_401)) {
          // TODO: show forcefully logout message to the user.
          this.logger.logError('UserProfileService:initializeUserProfileSettings',
            'Error while fetching save search result preference :- ' + data[8].message);
        }
      }
      if (data[9] && data[9].code && MessageCodesComparator.AreEqual(data[9].code, MessageCodes.B2B_GET_VERSION_200)) {
        this.isBtbVersionAvailable = true;
      } else {
        this.isBtbVersionAvailable = false;
        if (MessageCodesComparator.AreEqual(data[9].code, MessageCodes.CS_UNAUTHORIZED_401)) {
          // TODO: show forcefully logout message to the user.
          this.logger.logError('UserProfileService:initializeUserProfileSettings',
            'Error while fetching save search result preference :- ' + data[8].message);
        }
      }
    }, (err) => {
      this.logger.logError('WebDynamicDashboardComponent', 'End:- Error in receiving user-profile settings');
    },
      () => {
        return empty();
      });
    return userProfileObservable$;

  }

  getUserProfileSettings() {
    const env = this.applicationDataService.getEnvironment();
    const loginName = this.authService.getLoginName();
    const commonApi = `${env.ApplicationApi}/clientConfig/${loginName}/getConfiguration/${env.ApplicationVersion}`;
    return forkJoin([
      this.http.get('/assets/JSON/column-order.json'),
      this.http.get(`${commonApi}/column_filters`),
      this.http.get(`${commonApi}/card_filters`),
      this.http.get(`${commonApi}/alert_filters`),
      this.http.get(`${commonApi}/search_filters`),
      this.http.get(`${commonApi}/dayp_preference`),
      this.http.get(`${commonApi}/client_limits`),
      this.http.get(`${commonApi}/confirmation_column_filters`),
      this.http.get(`${commonApi}/search_preference`),
      this.http.get(`${env.B2BApi}/btob/${loginName}/permission/getBTBVersion/${env.SearchApiVersion}`)
    ]);
  }

  getAllLanguages(): any[] {
    const langs: any[] = [];
    langs.push({ label: 'Select Language', value: null });
    langs.push({ label: 'English', value: 'en' });
    langs.push({ label: 'Spanish', value: 'es' });
    langs.push({ label: 'Chinese', value: 'zh' });
    return langs;
  }

  getAdvertisementImage(): any {
    const imageUrl = '../../../assets/img/single-diamond.jpg';
    return imageUrl;
  }

  getDefaultColumnsList() {
    return [
      { name: 'Certificate', value: 'Certificate' },
      { name: 'Clarity', value: 'Clarity' },
      { name: 'Colour', value: 'Colour' },
      { name: 'Shape', value: 'Shape' },
      { name: 'Carat', value: 'Carat' },
      { name: 'Cut', value: 'cut' }
    ];
  }

  getAllColumnsList() {
    return [
      { name: '$/Carat', value: 'DollarCT' },
      { name: 'Off %', value: 'Off' },
      { name: 'Polish', value: 'polish' },
      { name: 'Symmetry', value: 'symmetry' },
      { name: 'Fluorescence', value: 'fluorescence' },
      { name: 'Measurement', value: 'Measurement' },
      { name: 'Diameter/Ratio', value: 'DR' },
      { name: 'Table', value: 'Tab' },
      { name: 'Total Depth (TD)', value: 'Td' },
      { name: 'Shade', value: 'shade' },
      { name: 'Luster', value: 'luster' },
      { name: 'Table White (TW)', value: 'table_white' },
      { name: 'Side White (SW)', value: 'side_white' },
      { name: 'Table Black (TB)', value: 'table_black' },
      { name: 'Side Black (SB)', value: 'side_black' },
      { name: 'SGS', value: 'SGS' },
      { name: 'Table Spot (TS)', value: 'table_spot' },
      { name: 'Side Spot (SS)', value: 'side_spot' },
      { name: 'Table Open (TO)', value: 'table_open' },
      { name: 'Crown Open (CO)', value: 'crown_open' },
      { name: 'Pav. Open (PO)', value: 'pav_open' },
      { name: 'Girdle Open (GO)', value: 'girdle_open' },
      { name: 'Table EF (TEF)', value: 'table_EF' },
      { name: 'Crown EF (CEF)', value: 'crown_EF' },
      { name: 'Pav. EF (PEF)', value: 'pav_EF' },
      { name: 'KTS', value: 'Key_To_Symbol' },
      { name: 'Lab Comments', value: 'Lab_Comments' },
      { name: 'Girdle %', value: 'GirdlePer' },
      { name: 'H&A', value: 'HandA' },
      { name: 'Certificate No', value: 'Certificate_No' },
      { name: 'Rap $/ct.', value: 'Rap_Dollar_CT' },
      { name: 'Eligible', value: 'Eligible' },
      { name: 'Amount', value: 'Amount' }
    ];
  }

  getDaypColumnList() {
    return [
      { name: 'EOC', value: 'dayp_eligible_offer_count' },
      { name: 'DAYP.$/Ct.Diff', value: 'dayp_diff_per' },
      { name: 'DAYP.Off.Amt', value: 'dayp_offer_amount' }

    ];
  }

  getB2BColumnList() {
    return [
      { name: 'B2B.$/Ct.Diff', value: 'btb_diff_per' },
      { name: 'B2B.Off.Amt', value: 'btb_offer_amount' }
    ];
  }

  getBasketColumnList() {
    return [
      { name: 'Notes', value: 'basket_note' },
      { name: 'Date', value: 'basket_date' },
      { name: 'Time', value: 'basket_time' },
      { name: 'Diff%', value: 'basket_diff' }
    ];
  }

  getViewRequestColumnList() {
    return [
      { name: 'VR Notes', value: 'view_request_note' }
    ];
  }

  getDaypPreferences() {
    return [
      { name: 'Offer $/ct.', value: 'dollar_ct' },
      { name: 'Offer %Off', value: 'off_percentage' }
    ];
  }

  getPopUpVisible() {
    return this.PopUpVisible;
  }

  setPopUpVisible() {
    this.PopUpVisible = false;
  }

  resetPopupVisile() {
    this.PopUpVisible = true;
  }

  getSelectedColumnList() {
    return this.userSelectedColumns || this.getObjectFromLocalStorage('user-selected-columns');
  }

  setSelectedColumnList(list) {
    this.userSelectedColumns = list;
    this.setObjectInLocalStorage('user-selected-columns', this.userSelectedColumns);
  }

  getSelectedColumnOrder() {
    return this.userColumnsOrder;
  }

  setSelectedColumnOrder(list) {
    this.userColumnsOrder = list;
  }


  getAllSearchFilterList() {
    return this.searchFilters || this.getObjectFromLocalStorage('user-selected-search-filters');
  }

  setSearchFilterList(list) {    
    this.searchFilters = list;
    this.setObjectInLocalStorage('user-selected-search-filters', this.searchFilters);
  }

  getSelectedCardList() {
    return this.userSelectedCards || this.getObjectFromLocalStorage('user-selected-cards');
  }

  getSelectedAlertList() {
    return this.userSelectedAlerts || this.getObjectFromLocalStorage('user-selected-alerts');
  }

  setSelectedCardList(list) {
    this.userSelectedCards = list;
    this.setObjectInLocalStorage('user-selected-cards', this.userSelectedCards);
  }

  setSelectedAlertList(list) {
    this.userSelectedAlerts = list;
    this.setObjectInLocalStorage('user-selected-alerts', this.userSelectedAlerts);
  }

  getSelectedLanguageList() {
    return this.userSelectedLanguage;
  }

  setDaypPreference(list) {
    this.daypPreference = list;
    this.setObjectInLocalStorage('user-selected-dayppreference', this.daypPreference);
  }

  getClientLimits() {
    return this.clientLimits || this.getObjectFromLocalStorage('user-selected-client-limits');
  }

  getSelectedDaypValues() {
    return this.daypPreference || this.getObjectFromLocalStorage('user-selected-dayppreference');
  }

  setLanguage(languageObjectList) {
    let lang;
    for (const i in languageObjectList) {
      if (languageObjectList.hasOwnProperty(i)) {
        if (languageObjectList[i].entity_value) {
          lang = i;
        }
      }
    }
    this.translateService.use(lang);
    if (this.userDeviceService.isDeviceSupportLocalStorage()) {
      window.localStorage.setItem('lang', lang);
    }
  }

  updateProfileSettingsList(body) {
    return this.http.post(this.applicationDataService.getEnvironment().ApplicationApi + '/clientConfig/1/save/'
      + this.applicationDataService.getEnvironment().ApplicationVersion, JSON.stringify(body)).pipe(
      map((res) => {
        return res;
      }),
      catchError(err => {
        return this.errorHandler.handleError(body.config_name, err);
      })
    );
  }

  getAccountDetails() {
    return this.http.get(this.applicationDataService.getEnvironment().AuthenticationApi + '/auth/profile/'
      + this.authService.getLoginName() + '/getBusinessDetails/'
      + this.applicationDataService.getEnvironment().AuthenticationVersion).pipe(
      map((res) => {
        return res;
      }),
      catchError(err => this.errorHandler.handleError('UserProfileService:getAccountDetails', err))
    );
  }

  callResetPassword(data) {
    const resetJson = {};
    resetJson['old_password'] = data.old_password;
    resetJson['new_password'] = data.new_password;
    resetJson['org_name'] = this.applicationDataService.getOrgName();
    resetJson['app_name'] = this.applicationDataService.getAppName();
    resetJson['app_code'] = 13;
    resetJson['device_details'] = this.userDeviceService.fetchUserDeviceDetails();
    return this.http.post(this.applicationDataService.getEnvironment().AuthenticationApi + '/auth/change/password/'
      + this.applicationDataService.getEnvironment().AuthenticationVersion, JSON.stringify(resetJson)).pipe(
      map((res) => {
        return res;
      }),
      catchError(err => this.errorHandler.handleError('UserProfileService:callResetPassword', err))
    );
  }


  getUserProfileLanguage() {
    return this.http.get(this.applicationDataService.getEnvironment().ApplicationApi + '/clientConfig/'
      + this.authService.getLoginName() + '/getConfiguration/'
      + this.applicationDataService.getEnvironment().ApplicationVersion + '/language_filters').pipe(
        map((res) => {
          if (!res['error_status']) {
            this.userSelectedLanguage = res['config_values'];
            this.setLanguage(this.userSelectedLanguage);
          } else {
            if (MessageCodesComparator.AreEqual(res[0].code, MessageCodes.CS_UNAUTHORIZED_401)) {
              // TODO: show forcefully logout message to the user.
              this.logger.logError('UserProfileService:initializeUserProfileSettings',
                'Error while fetching language filter :- ' + res[0].message);
            }
          }
          return this.userSelectedLanguage;
        })
      );
  }

  private getObjectFromLocalStorage(key): any {
    if (this.userDeviceService.isDeviceSupportLocalStorage()) {
      return window.localStorage.getItem(key) ? JSON.parse(window.localStorage.getItem(key)) : '';
    } else {
      return null;
    }
  }

  private setObjectInLocalStorage(key, value) {
    if (this.userDeviceService.isDeviceSupportLocalStorage() && value !== undefined && value !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }

  fetchSearchOrderList() {
    return [
      { name: 'Shape', order: 1 },
      { name: 'Carat', order: 3 },
      { name: 'Luster & Shades', order: 10 },
      { name: 'Extra Facet', order: 20 },
      { name: 'Date', order: 16 },
      { name: 'Fancy Color', order: 6 },
      { name: 'Tags', order: 2 },
      { name: 'Certificate', order: 9 },
      { name: 'Colour', order: 5 },
      { name: 'Finishing', order: 7 },
      { name: 'Fluorescence', order: 8 },
      { name: 'H&A', order: 12 },
      { name: 'Price', order: 13 },
      { name: 'Comments', order: 14 },
      { name: 'Eligibility', order: 15 },
      { name: 'Parameters', order: 18 },
      { name: 'Open Inclusions', order: 19 },
      { name: 'Inclusions', order: 17 },
      { name: 'Clarity', order: 4 }
    ];
  }

  getSelectedConfirmationColumnList() {
    return this.userSelectedConfirmationColumns || this.getObjectFromLocalStorage('user-selected-confirmation-preference');
  }

  setSelectedConfirmationColumnList(list) {
    this.userSelectedConfirmationColumns = list;
    this.setObjectInLocalStorage('user-selected-confirmation-preference', this.userSelectedConfirmationColumns);
  }

  getAllConfirmationColumnsList() {
    const finalRateFLag = this.authService.hasElementPermission('terms_discount') ||
      this.authService.hasElementPermission('blind_discount') ||
      this.authService.hasElementPermission('weekly_volume_discount') ||
      this.authService.hasElementPermission('co_op_discount') ||
      this.authService.hasElementPermission('event_discount');
    return [
      { name: 'Certificate', value: 'Certificate' },
      { name: 'Clarity', value: 'Clarity' },
      { name: 'Colour', value: 'Colour' },
      { name: 'Carat', value: 'Carat' },
      { name: '$/Carat', value: 'DollarCT' },
      { name: 'Off %', value: 'Off' },
      { name: 'Cut', value: 'cut' },
      { name: 'Polish', value: 'polish' },
      { name: 'Symmetry', value: 'symmetry' },
      { name: 'Fluorescence', value: 'fluorescence' },
      { name: 'Measurement', value: 'Measurement' },
      { name: 'Diameter/Ratio', value: 'DR' },
      { name: 'Table', value: 'Tab' },
      { name: 'Total Depth', value: 'Td' },
      { name: 'Shadow', value: 'shade' },
      { name: 'Luster', value: 'luster' },
      { name: 'Table-White', value: 'table_white' },
      { name: 'Side-White', value: 'side_white' },
      { name: 'Table-Black', value: 'table_black' },
      { name: 'Side-Black', value: 'side_black' },
      { name: 'SGS Comment', value: 'SGS' },
      { name: 'Table Spot', value: 'table_spot' },
      { name: 'Side Spot', value: 'side_spot' },
      { name: 'Table Open', value: 'table_open' },
      { name: 'Crown Open', value: 'crown_open' },
      { name: 'Pavallion Open', value: 'pav_open' },
      { name: 'Girdle Open', value: 'girdle_open' },
      { name: 'Table EF', value: 'table_EF' },
      { name: 'Crown EF', value: 'crown_EF' },
      { name: 'Pavallion EF', value: 'pav_EF' },
      { name: 'Key To Symbol', value: 'Key_To_Symbol' },
      { name: 'Lab Comments', value: 'Lab_Comments' },
      { name: 'Girdle %', value: 'GirdlePer' },
      { name: 'H&A', value: 'HandA' },
      { name: 'Certificate No', value: 'Certificate_No' },
      { name: 'Rap $/ct.', value: 'Rap_Dollar_CT' },
      { name: 'Eligible', value: 'Eligible' },
      { name: 'Amount', value: 'Amount' },
      { name: 'Type', value: 'Type' },
      { name: 'Status', value: 'Status' },
      { name: 'Blind %', value: 'Blind_Percent', permissionName: 'blind_discount' },
      { name: 'Final $/ct.', value: 'Final_Dollar_Per_Carat', isAllowToDisplay: finalRateFLag },
      { name: 'Final Off %', value: 'Final_Off_Percent', isAllowToDisplay: finalRateFLag },
      { name: 'Final Payable Amount', value: 'Final_Payable_Amount', isAllowToDisplay: finalRateFLag },
      { name: 'WVD %', value: 'WVD', permissionName: 'weekly_volume_discount' },
      { name: 'Date', value: 'Date' },
      { name: 'Time', value: 'Time' },
      { name: 'Order Id', value: 'orderId' },
      { name: 'Original Off %', value: 'Original_Off' },
      { name: 'Original $/ct.', value: 'Original_DollarCT' }
    ];
  }

  setSaveSearchResultPreference(list) {
    this.saveSearchResultPrefernce = list;
    this.setObjectInLocalStorage('user-selected-savesearchresultpreference', this.saveSearchResultPrefernce);
  }

  getSaveSearchResultPreference() {
    return [
      { name: 'SEARCH_RESULT_PREFERENCE_POPUP', value: 'enable_temp_save_search' },
      { name: 'DIAMOND_DETAIL_EXPANDED_COLUMN', value: 'is_coloumn_expanded'}
    ];
  }

  getSelectedSaveSearchPreference() {
    return this.saveSearchResultPrefernce || this.getObjectFromLocalStorage('user-selected-savesearchresultpreference');
  }

  getColumnWidth() {
    return {
      'eoc': 30, 'offer_price': 80, 'diff_per': 100, 'off_per': 60, 'offer_per': 105, 'dayp_offer_amt': 80,
      'offer': 60, 'cert': 40, 'shape': 45, 'clarity': 50, 'color': 40, 'carat': 40, 'dollarCt': 80, 'off': 45,
      'amount': 80, 'cut': 35, 'pol': 35, 'sym': 35, 'fluor': 40, 'measurement': 115, 'dr': 45, 'tab': 45, 'td': 40,
      'shd': 40, 'lus': 40, 'tw': 40, 'sw': 40, 'tb': 40, 'sb': 40, 'sgs': 380, 'ts': 30, 'ss': 30, 'to': 30, 'po': 30,
      'co': 30, 'go': 30, 'tef': 40, 'pef': 40, 'cef': 40, 'kts': 350, 'lab': 150, 'girdle': 65, 'ha': 50, 'certNo': 100,
      'rap': 70, 'eligible': 100, 'wvd': 50, 'coop': 60, 'online_per': 65, 'final_price': 60, 'final_off': 60, 'event': 65,
      'final_amount': 90, 'term': 65
    };
  }

  getDAYPColumnWidth() {
    return {
      'eoc': 65, 'offer_price': 80, 'diff_per': 80, 'offer_per': 105, 'dayp_offer_amt': 105, 'offer': 60, 'cert': 70,
      'shape': 90, 'clarity': 80, 'color': 80, 'carat': 80, 'dollarCt': 80, 'off': 80, 'amount': 90, 'cut': 65, 'pol': 65,
      'sym': 65, 'fluor': 70, 'measurement': 115, 'dr': 65, 'tab': 65, 'td': 60, 'shd': 70, 'lus': 70, 'tw': 60, 'sw': 60,
      'tb': 60, 'sb': 60, 'sgs': 380, 'ts': 60, 'ss': 60, 'to': 60, 'po': 60, 'co': 60, 'go': 60, 'tef': 70, 'pef': 70,
      'cef': 70, 'kts': 350, 'lab': 180, 'girdle': 95, 'ha': 70, 'certNo': 90, 'rap': 100, 'eligible': 100, 'wvd': 50,
      'coop': 60, 'online_per': 65, 'final_price': 60, 'final_off': 60, 'event': 65, 'final_amount': 90, 'term': 65
    };
  }

  getConfirmationHistoryWeeks() {
    if (this.clientLimits && this.clientLimits.confirmation_week_limit) {
      return this.clientLimits.confirmation_week_limit;
    }
  }

  setConfirmationHistoryWeeks(weeks) {
    this.clientLimits.confirmation_week_limit.entity_value = weeks;
  }

  getConfirmationHistoryDayOptions() {
    const array = [
      { label: '0', value: 0 },
      { label: 2, value: 2 },
      { label: 5, value: 5 },
      { label: 10, value: 10 },
      { label: 20, value: 20 },
      { label: 30, value: 30 },
      { label: 45, value: 45 },
      { label: 60, value: 60 },
      { label: 90, value: 90 }];
    return array;
  }

  updateConfirmationHistoryDays(days) {
    const config = {
      conf_hist_days: days
    };
    return this.http.post(this.applicationDataService.getEnvironment().StoneManagementApi + '/stonemgt/'
      + this.authService.getLoginName() + '/stone/confirmDays/update/'
      + this.applicationDataService.getEnvironment().StoneManagementApiVersion, JSON.stringify(config)).pipe(
      map((res) => {
        return res;
      }),
      catchError(err => this.errorHandler.handleError('UserProfileService:updateConfirmationHistoryDays', err)
      )
    );
  }

  getSrkColumnsOrder() {
    return this.columnorder;
  }

  checkBTBVersion() {
    return this.isBtbVersionAvailable;
  }

  fetchTermsAndCondition() {
    const url = `${this.applicationDataService.getEnvironment().AuthenticationApi}/auth/login/termAndConditions/show/v2is_profile_page=true`;
    return this.http.get(url);
  }
}
