import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { NotifyService } from './notify.service';
import { LoggerService } from './logger.service';

@Injectable()
export class ExceptionService {

  private subscription: Subscription;

  constructor(private notifyService: NotifyService, private logger: LoggerService) { }

  subscribeErrorLogging() {
    this.subscription = this.notifyService.notifyErrorObservable$.subscribe((res) => {
      if (res.hasOwnProperty('component') && res.hasOwnProperty('error')) {
        this.logger.logError(res.component, res.error);
      }
    });
  }

  unsubscribeErrorLogging() {
    this.subscription.unsubscribe();
  }
}
