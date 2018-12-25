import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotifyService } from '@srk/core';
import { LoginPageComponent } from '../login.enum';
import { LoginService } from '../login.service';
import { AuthService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  public forgotForm: FormGroup;
  public isForgotPasswordSubmitted = false;
  public errorMessage: any;
  constructor(private formBuilder: FormBuilder,
    private loginService: LoginService,
    private authService: AuthService,
    private notify: NotifyService) {
  }

  ngOnInit() {
    this.forgotForm = this.formBuilder.group({
      email: ['', Validators.email]
    });
  }

  isInvalidEmail(email) {
    const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (email) {
      const isvalid = email.match(regex);
      return isvalid ? false : true;
    }
  }

  submitForgotForm(value: any) {
    this.errorMessage = '';
    this.initiateForgotRequest(value);
  }

  initiateForgotRequest(value: any) {
    value = value.toLowerCase();
    this.loginService.validateEmail(value).subscribe((response) => {
      if (response && response.code !== 'AUTH_UNIQ_EMAIL_200_1') {
        this.authService.requestPasswordForgot(value).subscribe((res) => {
          if (!res.error_status) {
            this.isForgotPasswordSubmitted = true;
          } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.NO_INIT_LOGIN_200)) {
            this.errorMessage = 'LOGIN_FIRST';
          } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.AUTH_LOGIN_NO_USER_200)) {
            this.errorMessage = 'LOGIN_NO_USER_EXIST';
          } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.AUTH_FP_BLOCKED_USER_200)) {
            this.errorMessage = 'BLOCKED_EMAIL_ADDRESS';
          } else {
            this.errorMessage = 'PASSWORD_DOES_NOT_RESET';
          }
        }, error => {
          this.errorMessage = 'SERVER_ERROR_OCCURRED';
        });
      } else {
        this.errorMessage = 'EMAIL_DOES_NOT_EXIST';
      }
    });
  }

  renderLoginPage() {
    this.notify.notifyScreen({ component: LoginPageComponent.Authentication });
  }
}
