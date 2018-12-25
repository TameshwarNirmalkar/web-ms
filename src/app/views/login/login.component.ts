import { Component, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { LoginDirective } from './login.directive';
import { Login } from './login';
import { AuthenticationComponent } from './authentication/authentication.component';
import { OtpComponent } from './otp/otp.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RegistrationComponent } from './registration/registration.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LoginAsComponent } from './login-as/login-as.component';
import { Subscription } from 'rxjs/Subscription';
import { NotifyService } from '@srk/core';
import { UserProfileService } from '@srk/core';
import { LoginPageComponent } from './login.enum';
import { ApplicationAuditService } from '@srk/core';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  entryComponents: [AuthenticationComponent, OtpComponent, ForgotPasswordComponent,
    RegistrationComponent, ResetPasswordComponent, LoginAsComponent]
})
export class LoginComponent implements OnInit, OnDestroy {
  public image: any;
  public videoUrl = 'http://dimdna.azureedge.net/srkweb/video/SRKFinal.mp4';
  @ViewChild(LoginDirective) dynamicComponent: LoginDirective;
  private subscription: Subscription;
  public loginPageVideo: any;
  public videoExten: boolean = true;
  public centerAlignMedia: any;
  public upperText: any;
  public lowerText: any;
  public loadVideo = false;
  public commonMediaFile: any;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private notifyService: NotifyService,
    private userProfileService: UserProfileService,
    private auditService: ApplicationAuditService,
    private loginService: LoginService) {
    this.image = userProfileService.getAdvertisementImage();
  }

  ngOnInit() {
    this.getVideo();
    let componentObject = this.checkTokenExist();
    if (!componentObject) {
      componentObject = new Login(LoginPageComponent.Authentication, AuthenticationComponent, {});
    }
    this.renderComponent(componentObject);
    this.subscription = this.notifyService.notifyChangeScreenObservable$.subscribe((res) => {
      if (res.component === LoginPageComponent.OTP) {
        componentObject = new Login(LoginPageComponent.OTP, OtpComponent, res.data);
      } else if (res.component === LoginPageComponent.ForgotPassword) {
        componentObject = new Login(LoginPageComponent.ForgotPassword, ForgotPasswordComponent, {});
      } else if (res.component === LoginPageComponent.Registration) {
        componentObject = new Login(LoginPageComponent.Registration, RegistrationComponent, {});
      } else {
        this.storeLoginPageAudit('index');
        componentObject = new Login(LoginPageComponent.Authentication, AuthenticationComponent, {});
      }
      this.renderComponent(componentObject);
    });
  }

  getVideo() {
    this.loginService.getVideoDetails().subscribe((res) => {
      if (!res.error_status) {
        if (res.data && res.data.primary) {
          this.commonMediaFile = res.data;
          this.loadVideo = true;
        }
      }
    });
  }

  checkTokenExist() {
    // const queryParams = new URLSearchParams(window.location.search);
    const loginName = this.getUrlParameter('?loginName');
    const token = this.getUrlParameter('?token');
    const registration = this.getUrlParameter('?register');
    if (loginName) {
      const resetComponentObject = new Login(LoginPageComponent.LoginAs, LoginAsComponent, token);
      return resetComponentObject;
    } else if (token) {
      const resetComponentObject = new Login(LoginPageComponent.ResetPassword, ResetPasswordComponent, token);
      return resetComponentObject;
    } else if (registration) {
      return new Login(LoginPageComponent.Registration, RegistrationComponent, {});
    }
  }

  loadLoginPage() {
    const componentObject = new Login(LoginPageComponent.Authentication, AuthenticationComponent, {});
    this.renderComponent(componentObject);
  }

  renderComponent(screenComponent) {
    this.storeLoginPageAudit(screenComponent.name);
    const activeComponent = screenComponent;
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(activeComponent.component);
    const viewContainerRef = this.dynamicComponent.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(componentFactory);
    (<Login>componentRef.instance).data = activeComponent.data;
  }

  storeLoginPageAudit(screenName) {
    let activityName: any;
    switch (screenName) {
      case 'AuthenticationScreen': activityName = 'index';
        break;
      case 'RegistrationScreen': activityName = 'Registration';
        break;
      case 'ForgotPasswordScreen': activityName = 'ForgotPassword';
        break;
      case 'ResetPasswordScreen': activityName = 'ResetPassword';
        break;
    }
    this.auditService.storeActivityAudit(activityName);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getUrlParameter(name: string) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(window.location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

}
