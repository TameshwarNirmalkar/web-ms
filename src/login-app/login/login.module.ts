import { NgModule } from '@angular/core';
// import { SharedModule } from '@srk/shared';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { ReCaptchaModule } from 'angular2-recaptcha';
import { AuthenticationComponent } from './authentication/authentication.component';
import { OtpComponent } from './otp/otp.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginDirective } from './login.directive';
import { RegistrationComponent } from './registration/registration.component';
import { LoginService } from './login.service';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LoginAsComponent } from './login-as/login-as.component';
import {SharingModule} from '../../app/shared/sharing.module';

@NgModule({
  imports: [
    SharingModule, LoginRoutingModule, ReCaptchaModule
  ],
  declarations: [LoginComponent,
    AuthenticationComponent,
    OtpComponent,
    ForgotPasswordComponent,
    LoginDirective,
    RegistrationComponent,
    ResetPasswordComponent,
    LoginAsComponent],
  providers: [LoginService]
})
export class LoginModule { }
