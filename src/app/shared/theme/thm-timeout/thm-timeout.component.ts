import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AuthService, NotifyService } from '@srk/core';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { SessionTimeoutService } from '@srk/core';

@Component({
  selector: 'thm-timeout',
  templateUrl: './thm-timeout.component.html',
  styleUrls: ['./thm-timeout.component.scss']
})
export class ThmTimeoutComponent implements OnInit, OnDestroy {
  public sessionOverlay = false;
  public sessionObservable: any;
  public sessionHeader: any;
  public remainingSessionDuration: any;
  constructor(
    private authService: AuthService,
    private sessionTimeoutService: SessionTimeoutService,
    private router: Router,
    private notifyService: NotifyService
  ) { }

  ngOnInit() {
    this.sessionTimeoutService.resetSessionTimeout();
    this.sessionObservable = Observable.interval(1000).subscribe(x => {
      if (this.sessionTimeoutService.getRemainingTimeout() < 60000) {
        this.showSessionTimeOutOverlay();
        if (this.sessionTimeoutService.getRemainingTimeout() < 1000) {
          this.initiateLogOut();
        }
      }
    });
  }

  showSessionTimeOutOverlay() {
    const sessionRemainingTime = this.sessionTimeoutService.getRemainingTimeout() / 1000;
    this.sessionOverlay = true;
    this.sessionHeader = 'Your session is about to expire in ' + Math.round(sessionRemainingTime) + ' seconds';
  }

  initiateLogOut() {
    this.authService.logoutUser().subscribe(res => {
      if (res.error_status === false) {
        this.sessionOverlay = false;
        this.authService.distroyUserSession();
        const logout = [''];
        this.notifyService.notifyDaypBtbPageLogout({ status: 2 });
        this.router.navigate(logout);
      }
    });
  }

  renewSession() {
    const token = this.authService.getToken();
    this.sessionTimeoutService.renewUserSession(token).subscribe(res => {
      this.sessionOverlay = false;
      this.sessionTimeoutService.resetSessionTimeout();
    });
  }

  ngOnDestroy() {
    this.sessionObservable.unsubscribe();
  }

}
