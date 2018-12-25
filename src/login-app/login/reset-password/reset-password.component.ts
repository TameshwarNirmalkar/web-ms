import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotifyService } from '@srk/core';
import { LoginPageComponent } from '../login.enum';
import { AuthService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  public resetPasswordForm: FormGroup;
  public isResetSuccessfull = false;
  public errorMessage: any;
  @Input() data: any;
  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    private notify: NotifyService) { }

  ngOnInit() {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  submitResetForm(value: any) {
    this.errorMessage = '';
    const passwordValidation = this.isPasswordMatched(value);
    if (!passwordValidation) {
      this.errorMessage = 'PASSWORD_NOT_MATCHED';
    } else {
      this.initiateResetPassword(value.password);
    }
  }

  initiateResetPassword(password) {
    const resetJson = {};
    resetJson['password'] = password;
    this.authService.requestPasswordReset(resetJson, this.data).subscribe(res => {
      if (!res.error_status) {
        this.isResetSuccessfull = true;
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.LINK_EXPIRED_200)) {
        this.errorMessage = 'LINK_EXPIRED';
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.PASS_MATCH_200)) {
        this.errorMessage = 'PREVIOUS_PASSWORD_MATCH';
      } else {
        this.errorMessage = 'PASSWORD_NOT_CHANGED';
      }
    }, error => {
      this.errorMessage = 'SERVER_ERROR_OCCURRED';
    });
  }

  isPasswordMatched(data) {
    const newPasswordText = data.password;
    const confirmPasswordText = data.confirmPassword;
    let flag = false;
    if (newPasswordText === confirmPasswordText) {
      flag = true;
    }
    return flag;
  }

  renderLoginPage() {
    this.notify.notifyScreen({ component: LoginPageComponent.Authentication });
  }

}
