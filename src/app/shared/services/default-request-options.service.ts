import { Injectable, Injector } from '@angular/core';
// import { HttpResponseBase, BaseRequestOptions, RequestOptions, RequestOptionsArgs } from '@angular/common/http';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';
import { AuthService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DefaultRequestOptionsService implements HttpInterceptor {

  private authSvc: AuthService;
  private applicationDataService: ApplicationDataService;
  private headers: any;

  constructor(private injector: Injector) {
    this.headers.set('Content-Type', 'application/json');
  }

  intercept(options: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const newOptions = super.merge(options);
    this.authSvc = this.injector.get(AuthService);
    this.applicationDataService = this.injector.get(ApplicationDataService);
    let surveyFlag = false;
    if (options.headers) {
      if (options.headers.keys().indexOf('user_code') > -1) {
        surveyFlag = true;
      }
    }
    if (!surveyFlag) {
      this.headers.set('calling_entity', this.applicationDataService.getCallingEntity());
      let token = this.authSvc.getToken();
      if (token === undefined || token === '' || token === null) {
        token = 'solitaire';
      }
      this.headers.set('Cache-Control', 'no-cache');
      this.headers.set('Pragma', 'no-cache');
      this.headers.set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
      this.headers.set('token', token);
    }
    return this.headers;
  }
}

export const RequestOptionsProvider = { provide: HttpResponse, useClass: DefaultRequestOptionsService };
