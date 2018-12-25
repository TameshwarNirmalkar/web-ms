import { Component, OnInit } from '@angular/core';
import { AuthService, MessageService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { UserProfileService } from '@srk/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageCodes, MessageCodesComparator } from '@srk/core';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  public changePasswordForm: FormGroup;
  public loginName: any;
  public errorMessage: any;
  public successMessage: any;
  constructor(private formBuilder: FormBuilder,
    private notify: NotifyService,
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private messageservice:MessageService) { }

  ngOnInit() {
    this.loginName = this.authService.getLoginName();
    this.changePasswordForm = this.formBuilder.group({
      old_password: ['', Validators.required],
      new_password: ['', ([Validators.required, Validators.minLength(6)])],
      confirmPassword: ['', Validators.required]
    });
  }

  isPasswordMatched() {
    const newPasswordText = this.changePasswordForm.value.new_password;
    const confirmPasswordText = this.changePasswordForm.value.confirmPassword;
    let flag = false;
    if (newPasswordText === confirmPasswordText) {
      flag = true;
    }
    return flag;
  }

  submitPasswordForm(passowrdForm) {
    this.errorMessage = '';
    this.successMessage = '';
    const passwordValidation = this.isPasswordMatched();
    if (!passwordValidation) {
      this.errorMessage = 'PASSWORD_NOT_MATCHED';
    } else {
      this.initiateResetPassword();
    }
  }

  initiateResetPassword() {
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    this.userProfileService.callResetPassword(this.changePasswordForm.value).subscribe(res => {
      if (!res.error_status) {        
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.AUTH_PASS_200)) {
          this.successMessage = 'PASSWORD_SUCCESSFULLY_CHANGED';
          this.clearPasswordField();
          this.authService.logoutUser().subscribe(res => {            
            if (!res.error_status && MessageCodesComparator.AreEqual(res.code,MessageCodes.AUTH_LOGOUT_200)) {
              this.messageservice.showInfoGrowlMessage('WE_ARE_LOGGING_YOU_OUT')
              this.authService.distroyUserSession();
            } else {
              this.messageservice.showErrorGrowlMessage('KINDLY_CHECK_IT_AGAIN')
            }
          }, error => {
              this.messageservice.showErrorGrowlMessage('SERVER_ERROR_OCCURRED')
            })
          }
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.AUTH_PASS_200_2)) {
        this.errorMessage = 'OLD_PASSWORD_INCORRECT';
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.PASS_MATCH_200)) {
        this.errorMessage = 'PREVIOUS_PASSWORD_MATCH';
      } else {
        this.errorMessage = 'PASSWORD_NOT_CHANGED';
      }
      this.notify.hideBlockUI();
    }, error => {
      this.notify.hideBlockUI();
      this.errorMessage = 'SERVER_ERROR_OCCURRED';
    });
  }

  clearPasswordField() {
    this.changePasswordForm.reset();
  }

}
