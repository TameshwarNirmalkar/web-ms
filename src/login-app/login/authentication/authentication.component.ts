import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@srk/core';
import { LoggerService } from '@srk/core';
import { ActivatedRoute } from '@angular/router';
import { NotifyService } from '@srk/core';
import { LoginPageComponent } from '../login.enum';
import { ApplicationDataService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {
  public display: boolean = false;
  public countrycode;
  public loginForm: FormGroup;
  public siteKey: string;
  public enableOTP: boolean;
  public enableCaptcha: boolean;
  public image: any;
  public deviceInfo: any;
  public validCaptcha: boolean;
  public currentScreen: any;
  public errorMsg: string;
  public loginBtnIcon = 'none';

  constructor(private formBuilder: FormBuilder, private authService: AuthService,
    private logger: LoggerService, private route: ActivatedRoute, private notify: NotifyService,
    private applicationDataService: ApplicationDataService) {
  }

  ngOnInit() {
    this.countrycode = this.route.snapshot.data['countrycode'];
    this.overrideCaptchaForLocale(this.countrycode);
    this.validCaptcha = false;
    this.applicationDataService.initApplicationSetting().subscribe(res => {
      this.enableCaptcha = this.applicationDataService.getApplicationSettingValue('enableCaptcha');
    });
    this.siteKey = this.applicationDataService.getEnvironment().siteKey;
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required , this.noWhitespaceValidator]],
      password: ['', Validators.required]
    });
  }

  overrideCaptchaForLocale(code) {
    if (code === 'CN') {
      this.enableCaptcha = false;
    }
  }

  validateCaptcha() {
    let valid = false;
    if ((this.enableCaptcha && this.validCaptcha) || (!this.enableCaptcha)) {
      valid = true;
    }
    return valid;
  }

  handleCorrectCaptcha(captchaResponse: any) {
    if (captchaResponse != null) {
      this.validCaptcha = true;
    }
  }

 noWhitespaceValidator(registerForm: FormGroup) {
    let isWhitespace = (registerForm.value || '').trim().length === 0;
    let isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true }
}

  submitForm(value: any) {
    this.errorMsg = '';
    this.loginBtnIcon = 'fa fa-spinner fa-pulse';
    if (this.validateCaptcha()) {
      this.logger.logInfo('LoginComponent:submitForm :- ', value.username + ' tryinig to log into application');
      this.authService.isValidUser(value.username, value.password).subscribe(response => {
        const isErrorInResponse = response.error_status;
        if (!isErrorInResponse) {
          const validateSession = this.authService.isUserSessionAvailable();
          if (validateSession) {
            if (response.data.enable_otp) {
              this.notify.notifyScreen({ component: LoginPageComponent.OTP, data: {} });
            } else {
              this.authService.navigateToUserDashboard();
            }
            this.logger.logInfo('LoginComponent:submitForm', value.username + ' logged into application');
          } else {
            this.logger.logError('LoginComponent:submitForm', 'Session is invalid for user ' + value.username);
          }
        } else {
          this.loginBtnIcon = 'none';
          this.logger.logError('LoginComponent:submitForm', 'Error occurred while login user '
            + value.username + ' :-' + response.message);
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.AUTH_LOGIN_500_1)) {
            this.errorMsg = 'LOGIN_INVALID_CREDENTIALS';
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.AUTH_IC_CRED_200)) {
            this.errorMsg = 'LOGIN_INVALID_CREDENTIALS';
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.AUTH_LOGIN_NO_USER_200)) {
            this.errorMsg = 'LOGIN_NO_USER_EXIST';
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.AUTH_LOGIN_INVALID_USER_401)) {
            this.errorMsg = 'AUTH_LOGIN_INVALID_USER_401';
          }
        }
      }, error => {
        this.logger.logError('LoginComponent:submitForm', 'Error occurred while login user '
          + value.username + ' :-' + JSON.stringify(error));
        this.loginBtnIcon = 'none';
        this.errorMsg = 'Some technical problem occurred. Please try later.';
      });
    } else {
      this.logger.logError('LoginComponent:submitForm', value.username + ' entered wrong captcha.');
      this.loginBtnIcon = 'none';
      this.errorMsg = 'captchaSelect';
    }
  }

  showForgotPasswordPanel() {
    this.notify.notifyScreen({ component: LoginPageComponent.ForgotPassword });
  }

  showRegistrationPanel() {
    this.notify.notifyScreen({ component: LoginPageComponent.Registration });
  }
}
