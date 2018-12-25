import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '@srk/core';
import { LoggerService } from '@srk/core';
@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit {

  @Input() data: any;
  public otpForm: FormGroup;
  public image: any;
  public otpResentMsg: string;
  public otpMismatchError: string;
  public otpBtnIcon = 'none';

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    private logger: LoggerService) {
  }

  ngOnInit() {
    this.otpForm = this.formBuilder.group({
      otpValue: ['']
    });
  }

  submitOTPForm(value: any) {
    if (value.otpValue) {
      const otpJSON = {
        'otp': parseInt(value.otpValue, 10),
        'token': this.authService.getToken()
      };
      this.otpBtnIcon = 'fa fa-spinner fa-pulse';
      this.otpMismatchError = '';
      this.authService.verifyOtp(otpJSON).subscribe(response => {
        if (response.error_status === false) {
          this.screenNavigation();
        } else {
          this.otpBtnIcon = 'none';
          this.otpMismatchError = 'OTP did not match.';
        };
      }, error => {
        this.otpBtnIcon = 'none';
        this.otpMismatchError = 'SESSION_EXPIRED';
      });
    } else {
      this.otpMismatchError = 'ENTER_OTP';
    }
  }

  screenNavigation() {
    this.authService.navigateToUserDashboard();
    this.logger.logInfo('LoginComponent', 'End:- User logged into application');
  }

  resendOTPMobile() {
    const userData = this.buildDataForOtpApi(true, false);
    this.authService.sendOtp(userData).subscribe(response => {
      const status = this.data = response[0].error_status;
      if (!status) {
        this.otpResentMsg = 'OTP sent to registered mobile.';
      }
    });
  }

  resendOTPEmail() {
    const userData = this.buildDataForOtpApi(false, true);
    this.authService.sendOtp(userData).subscribe(response => {
      const status = this.data = response[0].error_status;
      if (!status) {
        this.otpResentMsg = 'OTP sent to registered email.';
      }
    });
  }

  buildDataForOtpApi(isMobileOTP, isEmailOTP) {
    return {
      'receiverList': {
        'phoneNumber': this.authService.getUserDetail().contact,
        'email': this.authService.getUserDetail().email
      },
      'sendSMSOTP': isMobileOTP,
      'sendEmailOTP': isEmailOTP,
      'token': this.authService.getToken()
    };
  }

  isNumber(event: any) {
    event = (event) ? event : window.event;
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

}
