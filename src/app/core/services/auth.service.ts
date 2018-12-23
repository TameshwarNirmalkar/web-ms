import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApplicationDataService } from './application-data.service';
import { UserDeviceService } from './user-device.service';
import { ErrorHandlerService } from './error-handler.service';
import { SessionTimeoutService } from './session-timeout.service';
import { ApplicationStorageService } from './application-storage.service';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class AuthService {
  private token: any;
  private userRole: any;
  private userDetail: any;
  private elementList: any;
  private urlList = {};
  private login_name: any;
  private user_role: any;
  public displayEventCelebrationFlag = false;
  constructor(
    private errorHandler: ErrorHandlerService,
    private applicationData: ApplicationDataService,
    private userDeviceService: UserDeviceService,
    private http: HttpClient,
    private router: Router,
    private appStore: ApplicationStorageService,
    private sessionTimeoutService: SessionTimeoutService
  ) {
    this.getLocalStoredValues();
  }

  getLocalStoredValues() {
    const paramLoginName = this.getUrlParameter('?loginName');
    const localStorageLoginName = this.getStringFromLocalStorage('login-name');
    this.login_name = paramLoginName || localStorageLoginName;
    if (this.login_name) {
      this.setStringInLocalStorage('login-name', this.login_name);
      this.token = this.getStringFromLocalStorage(this.login_name + '-auth-token');
      this.userRole = this.getObjectFromLocalStorage(this.login_name + '-user-role');
      this.userDetail = this.getObjectFromLocalStorage(this.login_name + '-user-detail');
      this.elementList = this.getObjectFromLocalStorage(this.login_name + '-element-list');

      if( this.getStringFromLocalStorage(`${this.login_name}-event-celebration-flag` ) === 'true') {
        this.displayEventCelebrationFlag = true;
      } else {
        this.displayEventCelebrationFlag = false;
      }
    }
  }

  getToken(): string {
    this.sessionTimeoutService.resetSessionTimeout();
    return this.token;
  }

  getUserDetail() {
    return this.userDetail;
  }

  getLoginName() {
    let login_name = null;
    if (this.userDetail && this.userDetail.login_name) {
      login_name = this.userDetail.login_name;
    } else {
      this.distroyUserSession();
    }
    return login_name;
  }

  isUserSessionAvailable(): boolean {
    return this.getLoginName() && this.token;
  }

  hasRoutePermission(url: string) {
    // TODO:- need to check the 'provided url' permission in user permission list.
    return true;
  }

  hasElementPermission(elementName: string) {
    const elements = this.elementList;
    const list = Object.keys(elements);
    let flag = false;
    list.forEach((element) => {
      if (!flag) {
        if (element === elementName) {
          flag = true;
        }
      }
    });
    return flag;
  }

  getApiLinkForKey(elementName: string, key: string) {
    let link;
    for (const element in this.elementList) {
      if (this.elementList.hasOwnProperty(element) && element === elementName) {
        if (this.elementList[element].action && this.elementList[element].action[key]) {
          link = this.elementList[element].action[key];
          link = this.replaceIdsInUrl(link);
        } else {
          link = this.elementList[element].action;
          link = this.replaceIdsInUrl(link);
        }
      }
    }
    return link;
  }

  private replaceIdsInUrl(link: string): string {
    if (link) {
      if (link.indexOf(':login_name') >= 0) {
        link = link.replace(':login_name', this.getLoginName());
      }
      if (link.indexOf(':party_id') >= 0) {
        link = link.replace(':party_id', this.userDetail.party_id);
      }
      if (link.indexOf(':StoneManagementApi') >= 0) {
        link = link.replace(':StoneManagementApi', this.applicationData.getEnvironment().StoneManagementApi);
      }
      if (link.indexOf(':StoneManagementApi') >= 0) {
        link = link.replace(':StoneManagementApiVersion', this.applicationData.getEnvironment().StoneManagementApiVersion);
      }
    }
    return link;
  }

  navigateToUserDashboard() {
    const userRole = this.getUserRole();
    if (userRole !== 'admin') {
      this.router.navigate(['web']);
      // window.location.href = "/web/dashboard";
    } else if (userRole === 'admin') {
      this.router.navigate(['admin']);
    }
  }

  navigateToChangePassword(code) {
    const userRole = this.getUserRole();
    if (userRole !== 'admin') {
      this.router.navigate(['changePassword']);
    } else if (userRole === 'admin') {
      this.router.navigate(['admin']);
    }
  }

  isValidUser(userName: string, password: string) {
    const loginData = this.createLoginData(userName, password);
    return this.http.post(this.applicationData.getEnvironment().AuthenticationApi
      + '/auth/login/' + this.applicationData.getEnvironment().AuthenticationVersion, loginData).pipe(
      map((response) => {
        // if(responseData.code === "AUTH_FORCE_CHANGE_PASSWORD_200"){
        //   this.navigateToChangePassword(responseData.code);
        // }
        const token = response['headers'].token;
        const status = response['error_status'];

        if (!status) {
          this.setLocalStorageCredentials(response['data'].user_payload.user_detail.login_name, token, response['data']);
        }
        return response;
      }),
      catchError(err => this.errorHandler.handleError('Login', err))
    );
  }

  fetchPermissionList(list) {
    const htmlElementJson = {};
    const urlJson = {};
    for (const element in list) {
      if (list.hasOwnProperty(element)) {
        const listData = list[element];
        if (listData.resource_type === 'HTML-ELEMENT') {
          htmlElementJson[element] = listData;
        } else {
          urlJson[element] = listData;
        }
      }
    }
    this.elementList = htmlElementJson;
    this.setObjectInLocalStorage(this.login_name + '-element-list', htmlElementJson);
    this.urlList = urlJson;
  }

  createLoginData(userName: string, password: string): any {
    const orgName = this.applicationData.getOrgName();
    const appName = this.applicationData.getAppName();
    const deviceDetails: any = this.userDeviceService.fetchUserDeviceDetails();
    return JSON.stringify({
      'login_name': userName.trim(),
      'password': password,
      'app_name': appName,
      'org_name': orgName,
      'device_details': deviceDetails,
      'app_code': 13
    });
  }

  getUserRole() {
    const roleNames = Object.keys(this.userRole);
    this.fetchPermissionList(this.userRole[roleNames[0]]);
    return roleNames[0];
  }

  sendOtp(data) {
    data = JSON.stringify(data);
    const url = `${this.applicationData.getEnvironment().NotificationApi}/notification/SMS/sendOTPSMSandMail/
    ${this.applicationData.getEnvironment().NotificationVersion}`;
    return this.http.post(url, data).pipe(
      map((response: Response) => response.json()),
      catchError(err => this.errorHandler.handleError('AuthService:sendOtp', err))
    );
  }

  verifyOtp(data) {
    data = JSON.stringify(data);
    const url = `${this.applicationData.getEnvironment().NotificationApi}/notification/SMS/verifyOTP/
    ${this.applicationData.getEnvironment().NotificationVersion}`;
    return this.http.post(url, data).pipe(
      map((res: Response) => res.json()),
      catchError(err => this.errorHandler.handleError('AuthService:verifyOtp', err))
    );
  }

  registerUser(userData) {
    const data = this.createRegistrationData(userData);
    const url = `${this.applicationData.getEnvironment().AuthenticationApi}
    /auth/registration/${this.applicationData.getEnvironment().AuthenticationVersion}`;
    return this.http.post(url, data).pipe(
      map((response) => {
        if (!response['error_status']) {
          this.token = response['headers'].token;
        }
        return response;
      }),
      catchError(err => this.errorHandler.handleError('AuthService:registerUser', err))
    );
  }

  uploadUserDocument(documentData) {
    const headerData = new HttpHeaders();
    headerData.append('enctype', 'multipart/form-data');
    headerData.append('Accept', 'application/json');
    headerData.append('calling_entity', 'UI');
    headerData.append('token', this.token);
    const url = `${this.applicationData.getEnvironment().AuthenticationApi}
    /auth/ftp/file/upload/uploadFile/${this.applicationData.getEnvironment().AuthenticationVersion}`;
    return this.http.post(url, documentData, { headers: headerData }).pipe(
      map((response: Response) => {
        response.json();
      }),
      catchError(err => this.errorHandler.handleError('AuthService:uploadUserDocument', err))
    );
  }

  createRegistrationData(data: any): any {
    const orgName = this.applicationData.getOrgName();
    const appName = this.applicationData.getAppName();
    const deviceDetails: any = this.userDeviceService.fetchUserDeviceDetails();
    delete data['agree'];
    const registrationData = data;
    registrationData['login_name'] = data.login_name.trim();
    registrationData['app_name'] = appName;
    registrationData['org_name'] = orgName;
    registrationData['device_details'] = deviceDetails;
    registrationData['zip_code'] = data.zip_code.toString();
    registrationData['recieve_notification'] = data.recieve_notification ? 1 : 0;
    registrationData['third_party_country'] = data.third_party_country ? data.third_party_country : 0;
    registrationData['third_party_state'] = data.third_party_state ? data.third_party_state : 0;
    registrationData['third_party_city'] = data.third_party_city ? data.third_party_city : 0;
    registrationData['third_party_zip_code'] = (data.third_party_zip_code ? data.third_party_zip_code : 0).toString();
    return JSON.stringify(registrationData);
  }

  logoutUser() {
    const url = `${this.applicationData.getEnvironment().LogoutApi}
    /auth/logout/${this.applicationData.getEnvironment().LogoutVersion}`;
    return this.http.get(url).pipe(
      map((response) => {
        if (!response['error_status']) {
          this.clearUserData();
          this.clearLocalStorageData();
          // window.location.href = '/';
          return response;
        }
      }),
      catchError(err => this.errorHandler.handleError('AuthService:logoutUser', err))
    );
  }

  private clearUserData() {
    this.token = null;
    this.userDetail = {};
    this.userRole = {};
    this.elementList = [];
    this.appStore.resetAll();
  }

  public clearLocalStorageData() {
    if (this.userDeviceService.isDeviceSupportLocalStorage()) {
      localStorage.removeItem(this.login_name + '-event-celebration-flag');
      localStorage.removeItem(this.login_name + '-auth-token');
      localStorage.removeItem(this.login_name + '-user-detail');
      localStorage.removeItem(this.login_name + '-user-role');
      localStorage.removeItem(this.login_name + '-element-list');
      localStorage.removeItem(this.login_name + '-session-timeout');
      localStorage.removeItem('user-selected-columns');
      localStorage.removeItem('user-selected-cards');
      localStorage.removeItem('user-selected-alerts');
      localStorage.removeItem('user-selected-search-filters');
      localStorage.removeItem('user-selected-dayppreference');
      localStorage.removeItem('user-selected-client-limits');
      localStorage.removeItem('dont-ask-me-login');
      localStorage.removeItem('dont-ask-me-logout');
      localStorage.removeItem('ask-me-later-clicked-login');
      localStorage.removeItem('ask-me-later-clicked-logout');
      localStorage.removeItem('user-selected-confirmation-preference');
      localStorage.removeItem('user-selected-savesearchresultpreference');
      // localStorage.clear();
    }
  }

  distroyUserSession() {
    this.clearUserData();
    this.clearLocalStorageData();
    this.router.navigate(['']);
  }

  requestPasswordForgot(data) {
    const forgotJson = {};
    forgotJson['email_id'] = data;
    forgotJson['org_name'] = this.applicationData.getOrgName();
    forgotJson['app_name'] = this.applicationData.getAppName();
    forgotJson['app_code'] = 13;
    forgotJson['device_details'] = this.userDeviceService.fetchUserDeviceDetails();
    const url = `${this.applicationData.getEnvironment().AuthenticationApi}
    /auth/forgot/password/${this.applicationData.getEnvironment().AuthenticationVersion}`;
    return this.http.post(url, JSON.stringify(forgotJson)).pipe(
      map((response: Response) => {
        return response.json();
      }),
      catchError(err => this.errorHandler.handleError('AuthService:requestPasswordForgot', err))
    );
  }

  requestChangePassword(userName, password) {
    const headerData = new HttpHeaders();
    headerData.append('Accept', 'application/json');
    headerData.append('calling_entity', 'UI');
    const changePasswordJson = {};
    changePasswordJson['login_name'] = userName;
    changePasswordJson['password'] = password;
    const url = `${this.applicationData.getEnvironment().AuthenticationApi}
    /auth/forceChange/password/${this.applicationData.getEnvironment().AuthenticationVersion}`;
    return this.http.post(url, JSON.stringify(changePasswordJson), { headers: headerData }).pipe(
      map((response) => {
        return response;
      }),
      catchError(err => this.errorHandler.handleError('AuthService:callChangePassword', err))
    );
  }

  requestPasswordReset(jsonValue, token) {
    const headerData = new HttpHeaders();
    headerData.append('Accept', 'application/json');
    headerData.append('calling_entity', 'UI');
    headerData.append('token', token);
    jsonValue['org_name'] = this.applicationData.getOrgName();
    jsonValue['app_name'] = this.applicationData.getAppName();
    jsonValue['app_code'] = 13;
    jsonValue['device_details'] = this.userDeviceService.fetchUserDeviceDetails();
    const url = `${this.applicationData.getEnvironment().AuthenticationApi}
    /auth/reset/password/${this.applicationData.getEnvironment().AuthenticationVersion}`;
    return this.http.post(url, JSON.stringify(jsonValue), { headers: headerData }).pipe(
      map((response) => {
        return response;
      }),
      catchError(err => this.errorHandler.handleError('AuthService:callResetPassword', err))
    );
  }

  public getStringFromLocalStorage(key): any {
    if (this.userDeviceService.isDeviceSupportLocalStorage()) {
      return window.localStorage.getItem(key);
    } else {
      return null;
    }
  }

  private setStringInLocalStorage(key, value) {
    if (this.userDeviceService.isDeviceSupportLocalStorage() && value !== undefined && value !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
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

  authenticateLoginAs(token, loginName) {
    this.token = token;
    return this.http.get(this.applicationData.getEnvironment().AdminApi + '/solitaire-admin/web/loginas/' +
      this.applicationData.getEnvironment().AdminVersion + '?login_name=' + loginName).pipe(
      map(res => {
        return res;
      }),
      catchError(err => err)
    );
  }

  setLocalStorageCredentials(loginName, token, userData) {
    this.login_name = loginName;
    this.token = token;
    this.userDetail = userData.user_payload.user_detail;
    this.userRole = userData.roles;
    this.clearLocalStorageData();
    this.setStringInLocalStorage('login-name', this.login_name);
    this.setStringInLocalStorage(loginName + '-auth-token', this.token);
    this.setObjectInLocalStorage(loginName + '-user-detail', userData.user_payload.user_detail);
    this.setObjectInLocalStorage(loginName + '-user-role', userData.roles);
    const roleNames = Object.keys(this.userRole);
    this.fetchPermissionList(this.userRole[roleNames[0]]);
  }

  fetchCelebrateEventFlag() {
    return this.displayEventCelebrationFlag;
  }

  setEventCelebrateFlag(flag) {
    this.displayEventCelebrationFlag = flag;
    this.setStringInLocalStorage(this.login_name + '-event-celebration-flag', this.displayEventCelebrationFlag);
  }

  getUrlParameter(name: string) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      const results = regex.exec(window.location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
}
