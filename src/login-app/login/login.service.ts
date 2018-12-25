import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApplicationDataService } from '@srk/core';
import { ErrorHandlerService } from '@srk/core';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LoginService {

  constructor(
    private http: HttpClient,
    private applicationDataService: ApplicationDataService,
    private errorHandler: ErrorHandlerService
  ) { }

  getCountry(): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().DashboardApi + '/dashboard/country/details/' +
      this.applicationDataService.getEnvironment().DashboardVersion)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('LoginService:getCountry', err))
      );
  }

  getState(country_code): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().DashboardApi + '/dashboard/country/details/' +
      this.applicationDataService.getEnvironment().DashboardVersion + '?country_code=' + country_code)
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('LoginService:getState', err))
      );
  }

  getCity(country_code, state_code): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().DashboardApi + '/dashboard/country/details/' +
      this.applicationDataService.getEnvironment().DashboardVersion + '?country_code=' + country_code + '&&region_code=' + state_code)
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('LoginService:getCity', err))
      );
  }

  getPincode(city_code): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().DashboardApi + '/dashboard/country/details/' +
      this.applicationDataService.getEnvironment().DashboardVersion + '?city_code=' + city_code)
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('LoginService:getPincode', err))
      );
  }

  companyNameValidation(companyName): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().AuthenticationApi + '/auth/validate/companyName/' + companyName + '/' +
      this.applicationDataService.getEnvironment().AuthenticationVersion)
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('LoginService:companyNameValidation', err))
      );
  }

  validateEmail(email): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().AuthenticationApi + '/auth/validate/emailId/' + email + '/' +
      this.applicationDataService.getEnvironment().AuthenticationVersion)
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('LoginService:validateEmail', err))
      );
  }

  validateLoginName(loginName): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().AuthenticationApi + '/auth/validate/loginname/' + loginName + '/' +
      this.applicationDataService.getEnvironment().AuthenticationVersion)
      .pipe(
        map( res => res),
        catchError(err => this.errorHandler.handleError('LoginService:validateLoginName', err))
      );
  }

  getVideoDetails(): Observable<any> {
    const headerData = new HttpHeaders();
    headerData.append('calling_entity', 'UI');
    return this.http.get(`${this.applicationDataService.getEnvironment().AdminApi}/solitaire-admin/loginPage/show/uploaded/video/files/
    ${this.applicationDataService.getEnvironment().AdminVersion}`, { headers: headerData });
  }

}
