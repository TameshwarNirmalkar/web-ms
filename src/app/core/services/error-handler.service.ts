import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotifyService } from './notify.service';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

@Injectable()
export class ErrorHandlerService {


  constructor(private notifyService: NotifyService) { }

  handleError(source: string, error: any) {
    let errMsg: string;
    if (error) {
      const body = error;
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    this.notifyService.notifyErrorLogger({ component: source, error: errMsg });
    return Observable.throw(errMsg);
  }

}
