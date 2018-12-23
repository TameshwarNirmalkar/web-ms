import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionStorageService } from './services/session-storage.service';
import { HttpClientModule } from '@angular/common/http';

import {
  AuthService,
  ExceptionService,
  LoggerService,
  UserDeviceService,
  UserDetailService,
  UserProfileService,
  DateTimeService,
  NotifyService,
  ApplicationDataService,
  ErrorHandlerService,
  UserPushNotificationService,
  DaypEventResolverService,
  SessionTimeoutService,
  EventDetailsService,
  SearchService,
  ApplicationAuditService,
  ApplicationStorageService
} from './services';

@NgModule({
  imports: [
    HttpClientModule,
    CommonModule,
  ],
  declarations: [],
  providers: [
    AuthService,
    ExceptionService,
    LoggerService,
    UserDeviceService,
    UserDetailService,
    UserProfileService,
    DateTimeService,
    NotifyService,
    ApplicationDataService,
    ErrorHandlerService,
    UserPushNotificationService,
    DaypEventResolverService,
    SessionTimeoutService,
    EventDetailsService,
    SessionTimeoutService,
    SearchService,
    ApplicationAuditService,
    ApplicationStorageService,
    SessionStorageService
  ]
})
export class CoreModule {
}
