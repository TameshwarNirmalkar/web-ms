import { Injectable } from '@angular/core';
import { Device } from '../models/device';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { NotifyService } from './notify.service';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApplicationDataService } from './application-data.service';
declare var jQuery;

@Injectable()
export class UserDeviceService implements Resolve<any>  {

  readonly COUNTRY_API_URL = 'https://freegeoip.live/json?callback=JSONP_CALLBACK';
  readonly COUNTRY_API_URL_FALLBACK = 'https://ip-api.com/json?callback=JSONP_CALLBACK';

  private countryCodeRetryCount = 0;
  private waitingCountryCodeResponse = false;
  private hasLocalStorage: any;

  private device: Device = {
    name: '',
    model: '',
    device_type: '',
    version: '',
    ip: '',
    country_code: ''
  };

  constructor(
    private notifyService: NotifyService,
    private http: HttpClient,
    private applicationDataService: ApplicationDataService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
    this.waitingCountryCodeResponse = true;
    return this.initIpApi(this.COUNTRY_API_URL)
      .subscribe(
        deviceData => {
          if (deviceData) {
            this.waitingCountryCodeResponse = false;
            this.device.country_code = deviceData['country_code'] || deviceData['countryCode'];
            if (this.device.country_code === undefined) {
              this.device.country_code = 'CN';
            }
            return this.device.country_code;
          }
        },
        error => {
        });
  }

  fetchUserIp(device: object) {
    // return this.http.get(this.applicationDataService.getEnvironment().IpAddressAPI + '/smartapp/smartapp.asmx/GetIPAddress')
    //   .map(result => {
    //     if (device) {
    //       device['ip'] = result.json().Result;
    //     }
    //   }) ;
    jQuery.ajax({
      url: this.applicationDataService.getEnvironment().IpAddressAPI + '/smartapp/smartapp.asmx/GetIPAddress', success: function (result) {
        if (device) {
          device['ip'] = result.Result;
        }
      }, error: function (result) { }
    });
  }

  fetchUserDeviceDetails(): Device {
    if (this.device.ip === '') {
      this.fetchUserIp(this.device);
    }
    if (this.device.country_code === '' && !this.waitingCountryCodeResponse) {
      this.initUserCountryCodeContext(this.COUNTRY_API_URL);
    }
    if (this.device.device_type === '') {
      this.initDeviceBrowserContext();
      this.initDeviceTypeInfo();
    }
    return this.device;
  }

  private initUserCountryCodeContext(apiUrl: string) {
    this.initIpApi(apiUrl)
      .subscribe(
        deviceData => {
          if (deviceData) {
            this.device.country_code = deviceData['country_code'] || deviceData['countryCode'];
            this.countryCodeRetryCount = 0;
            this.waitingCountryCodeResponse = false;
          }
        },
        error => {
          this.notifyService.notifyErrorLogger({ component: 'UserDeviceService', error: error });
          if (this.countryCodeRetryCount === 0) {
            this.countryCodeRetryCount++;
            this.initUserCountryCodeContext(this.COUNTRY_API_URL_FALLBACK);
          } else {
            this.device.ip = '0';
          }
        });
  }

  initIpApi(apiUrl: string) {
    return this.http.jsonp(apiUrl, null);
  }

  private extractData(res: Response) {
    return res.json() || {};
  }

  private handleError(error: any) {
    let errMsg: string;
    if (error) {
      const body = error;
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    return Promise.reject(errMsg);
  }

  initDeviceBrowserContext() {
    const browserDtl: any = this.getBrowserInfo();
    this.device.name = browserDtl.name;
    this.device.version = browserDtl.version;
  }

  getBrowserInfo(): any {
    const browserDtl = { name: '', version: '' };
    const ua: any = navigator.userAgent;
    let tem: any;
    let M: any = ua.match(/(opera|chrome|safari|firefox|msie|edge|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      browserDtl.name = 'IE';
      browserDtl.version = tem[1] || '';
      return browserDtl;
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\bOPR\/(\d+)/);
      if (tem != null) {
        browserDtl.name = 'Opera';
        browserDtl.version = tem[1] || '';
        return browserDtl;
      }
      tem = ua.match(/\bEdge\/(\d+)/);
      if (tem != null) {
        browserDtl.name = 'Edge';
        browserDtl.version = tem[1] || '';
        return browserDtl;
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
      M.splice(1, 1, tem[1]);
    }
    browserDtl.name = M[0];
    browserDtl.version = M[1];
    return browserDtl;
  }

  initDeviceTypeInfo() {
    const smallDevice = navigator.userAgent.match(/iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile/i) != null;
    if (smallDevice || window.screen.width < 1024) {
      this.device.device_type = 'Small Device';
    } else {
      this.device.device_type = 'Computer';
    }
  }

  isDeviceSupportLocalStorage(): boolean {
    if (this.hasLocalStorage) {
      return this.hasLocalStorage;
    } else {
      try {
        this.hasLocalStorage = (window.localStorage || localStorage.getItem) ? true : false;
      } catch (err) {
        this.hasLocalStorage = false;
      }
      return this.hasLocalStorage;
    }
  }

  getDeviceIP() {
    return this.device.ip;
  }

}
