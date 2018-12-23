import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserDeviceService } from './user-device.service';
import { ErrorHandlerService } from './error-handler.service';
import * as _ from 'underscore';
import { AuthService } from './auth.service';
import { ApplicationDataService } from './application-data.service';
import { catchError, map } from 'rxjs/operators';

declare var $: any;

@Injectable()
export class ApplicationAuditService {

  public pageList: any[];
  public pageID: any;
  public pageName: any;
  public actID: any;
  public ipAddress: any;
  public apiLink: any;
  public savedSearchName: any;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private userDeviceService: UserDeviceService,
    private authService: AuthService,
    private applicationData: ApplicationDataService) {

  }

  fetchPageID() {
    return [
      { page: 'dashboard', key: 'CustomerZone' },
      { page: 'specific-search', key: 'Search' },
      { page: 'twin-diamonds-search', key: 'STDSearch' },
      { page: 'basket', key: 'MyBasket' },
      { page: 'view-request', key: 'MyViewRequest' },
      { page: 'ddc-stones', key: 'MyDDC' },
      { page: 'confirmations', key: 'MyConfirmation' },
      { page: 'saved-search', key: 'SavedSearch' },
      { page: 'user-profile', key: 'MyAccount' },
      { page: 'search-result', key: 'Result' },
      { page: 'twin-diamonds-result', key: 'STDResult' },
      { page: 'hold-list', key: 'MYHoldList' },
      { page: 'event', key: 'Event' },
      { page: 'packet', key: 'MyPacket' }
    ];
  }

  getActivityAuditData(url) {
    this.pageList = this.fetchPageID();
    let pageName: any;
    if (url.indexOf('event') > 0) {
      pageName = 'event';
    } else {
      pageName = url.substring(url.lastIndexOf('/') + 1);
    }
    const currentPageObject = _.findWhere(this.pageList, { page: pageName });
    if (currentPageObject) {
      this.storeActivityAudit(currentPageObject.key);
    }
  }

  storeActivityAudit(key) {
    const auditData = this.getActivityId(key);
    const apiLink = this.applicationData.getEnvironment().AuditApi + '/exposed/audit/activity/'
      + this.applicationData.getEnvironment().AuditApiVersion;
    if (auditData) {
      this.pageID = auditData.activity_id;
      this.pageName = auditData.activity_name;
      const successFunction = function (response) {
        this.ipAddress = response.Result;
        const config = {
          'activity_id': auditData.activity_id,
          'ip_address': this.ipAddress,
          'app_code': 13
        };
        $.ajax({
          url: apiLink,
          type: 'post',
          data: JSON.stringify(config),
          headers: {
            'token': 'solitaire',
            'Content-Type': 'application/json',
            'calling_entity': 'UI'
          },
          dataType: 'json',
          success: function (data) { }
        });
      };
      if (this.pageName === 'index' ||
        this.pageName === 'Registration' ||
        this.pageName === 'ForgotPassword' ||
        this.pageName === 'ResetPassword') {
        if (this.userDeviceService.getDeviceIP() &&
        this.userDeviceService.getDeviceIP() !== '' &&
        this.userDeviceService.getDeviceIP() !== null) {
          const config = {
            'activity_id': auditData.activity_id,
            'ip_address': this.userDeviceService.getDeviceIP(),
            'app_code': 13
          };
          this.saveActivityAuditData(config).subscribe((res) => {
          }, err => { 
            return this.errorHandler.handleError('ApplicationAuditService:saveActivityAuditData', err);
          });
        } else {
          $.ajax({
            url: this.applicationData.getEnvironment().IpAddressAPI + '/smartapp/smartapp.asmx/GetIPAddress', cache: true,
            success: successFunction,
            error: function (result) { }
          });
        }
      } else {
        const config = {
          'activity_id': auditData.activity_id
        };
        this.saveActivityAuditData(config).subscribe((res) => {
        }, err => {
          return this.errorHandler.handleError('ApplicationAuditService:saveActivityAuditData', err);
        });
      }
    }
  }

  storeActionAudit(key) {
    const auditData = this.getActionId(key);
    const apiLink = this.applicationData.getEnvironment().AuditApi + '/exposed/audit/action/'
      + this.applicationData.getEnvironment().AuditApiVersion;
    if (auditData) {
      this.actID = auditData.action_id;
      const successFunction = function (response) {
        this.ipAddress = response.Result;
        const config = {
          'activity_id': this.pageID,
          'action_id': this.actID,
          'ip_address': this.ipAddress,
          'app_code': 13
        };
        $.ajax({
          url: apiLink,
          type: 'post',
          data: JSON.stringify(config),
          headers: {
            'token': 'solitaire',
            'Content-Type': 'application/json',
            'calling_entity': 'UI'
          },
          dataType: 'json',
          success: function (data) { }
        });
      };
      if (this.pageName === 'index' ||
        this.pageName === 'Registration' ||
        this.pageName === 'ForgotPassword' ||
        this.pageName === 'ResetPassword') {
        if (this.userDeviceService.getDeviceIP() && this.userDeviceService.getDeviceIP() !== ''
        && this.userDeviceService.getDeviceIP() !== null) {
          const config = {
            'activity_id': this.pageID,
            'action_id': this.actID,
            'ip_address': this.userDeviceService.getDeviceIP(),
            'app_code': 13
          };
          this.saveActionAuditData(config)
            .subscribe((res) => {
              this.savedSearchName = undefined;
            }, err => this.errorHandler.handleError('ApplicationAuditService:saveActionAuditData', err));
        } else {
          $.ajax({
            url: this.applicationData.getEnvironment().IpAddressAPI + '/smartapp/smartapp.asmx/GetIPAddress', cache: true,
            success: successFunction,
            error: function (result) { }
          });
        }
      } else {
        if (this.pageID === undefined) {
          this.pageID = -1;
        }
        const config = {
          'activity_id': this.pageID,
          'action_id': auditData.action_id
        };
        if (this.savedSearchName) {
          config['search_name'] = this.savedSearchName;
        }
        this.saveActionAuditData(config)
          .subscribe((res) => {
            this.savedSearchName = undefined;
          }, err => {
            return this.errorHandler.handleError('ApplicationAuditService:saveActionAuditData', err);
          });
      }
    }
  }

  getActivityId(key) {
    let auditObject: any;
    const auditData = JSON.parse(localStorage.getItem('srk-audit-setting')) || this.applicationData.getAuditData();
    if (auditData && auditData.activity_list && auditData.activity_list.length > 0) {
      auditObject = _.findWhere(auditData.activity_list, { activity_name: key });
    }
    return auditObject;
  }

  getActionId(key) {
    let auditObject: any;
    const auditData = JSON.parse(localStorage.getItem('srk-audit-setting')) || this.applicationData.getAuditData();
    if (auditData && auditData.action_list && auditData.action_list.length > 0) {
      auditObject = _.findWhere(auditData.action_list, { action_name: key });
    }
    return auditObject;
  }

  saveActivityAuditData(config) {
    const headerData = this.getHeadersForAuditCall();
    return this.http.post(this.applicationData.getEnvironment().AuditApi + '/exposed/audit/activity/'
      + this.applicationData.getEnvironment().AuditApiVersion,
      JSON.stringify(config), { headers: headerData });
  }

  saveActionAuditData(config) {
    const headerData = this.getHeadersForAuditCall();
    return this.http.post(this.applicationData.getEnvironment().AuditApi + '/exposed/audit/action/'
      + this.applicationData.getEnvironment().AuditApiVersion,
      JSON.stringify(config), { headers: headerData })
  }

  saveSearchedStoneAudit(stoneList, searchConfig, type) {
    if (this.actID === undefined) {
      this.actID = -1;
    }
    if (this.pageID === undefined) {
      this.pageID = -1;
    }
    const config = {
      'action_id': this.actID,
      'activity_id': this.pageID,
      'response_stone_ids': stoneList,
      'filter': JSON.stringify(searchConfig)
    }
    const headerData = this.getHeadersForAuditCall();
    return this.http.post(this.applicationData.getEnvironment().AuditApi + '/exposed/audit/searchActivity/' +
      type + '/' + this.applicationData.getEnvironment().AuditApiVersion,
      JSON.stringify(config), { headers: headerData }).pipe(
        map((res) => res),
        catchError( err => this.errorHandler.handleError('ApplicationAuditService:saveSearchedStoneAudit', err))
      );
  }

  savedSearchAudit(key, name) {
    this.savedSearchName = name;
    const auditData = this.getActionId(key);
    if (auditData) {
      if (this.pageID === undefined) {
        this.pageID = -1;
      }
      const config = {
        'activity_id': this.pageID,
        'action_id': auditData.action_id
      };
      if (this.savedSearchName) {
        config['search_name'] = this.savedSearchName;
      }
      this.saveActionAuditData(config).subscribe((res) => {
        this.savedSearchName = undefined;
      }, err => { 
        return this.errorHandler.handleError('ApplicationAuditService:saveActionAuditData', err);
      });
    }
  }

  getHeadersForAuditCall() {
    let token: any;
    if (this.pageName === 'index' || this.pageName === 'Registration' ||
      this.pageName === 'ForgotPassword' || this.pageName === 'ResetPassword') {
      token = 'solitaire';
    } else {
      token = this.authService.getToken();
    }
    const headerData = new HttpHeaders();
    headerData.set('calling_entity', 'UI');
    headerData.set('token', token);
    return headerData;
  }

  getPageID() {
    if (this.pageID === undefined) {
      this.pageID = -1;
    }
    return this.pageID;
  }

  saveButtonActionAudit(key) {
    this.storeActionAudit(key);
  }
}
