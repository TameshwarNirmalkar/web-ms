import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ErrorHandlerService } from '@srk/core';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ApiService {

  constructor(private http: HttpClient, private errorHandler: ErrorHandlerService) { }

  postCall(component: string, url: string, request: any): any {
    return this.http.post(url, request).pipe(
      map((res) => res),
      catchError(err => this.errorHandler.handleError(component + ' :- ' + JSON.stringify(request), err))
    );
  }

}
