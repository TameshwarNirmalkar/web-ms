import { Component, OnInit } from '@angular/core';
import { AuthService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-login-as',
  templateUrl: './login-as.component.html',
  styleUrls: ['./login-as.component.scss']
})
export class LoginAsComponent implements OnInit {

  public token: any;
  public loginName: any;
  public message: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private applicationDataService: ApplicationDataService,
    private location: Location) { }

  ngOnInit() {
    this.message = 'Loading...';
    // const queryParams = new URLSearchParams(window.location.search);
    this.loginName = this.getUrlParameter('?loginName');
    this.token = this.getUrlParameter('token');
    const existingToken = this.authService.getStringFromLocalStorage(this.loginName + '-auth-token');

    this.authService.authenticateLoginAs(this.token, this.loginName).subscribe(response => {
      if (response && !response.error_status && response.code === 'AS200' && response.data) {
        if (response.data.user_payload && response.data.roles && response.data.token) {
          this.authService.setLocalStorageCredentials(this.loginName, response.data.token, response.data);
          this.router.navigate(['/web/dashboard']);
        } else {
          this.handleErrorLoginAs('ERROR_LOGINAS_NO_ROLES');
        }
      } else {
        this.handleErrorLoginAs('ERROR_LOGINAS');
      }
    }, err => {
      this.handleErrorLoginAs('ERROR_LOGINAS');
    });
  }

  handleErrorLoginAs(msg) {
    this.location.replaceState('login');
    this.message = msg;
  }

  getUrlParameter(name: string) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

}
