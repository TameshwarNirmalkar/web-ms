/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DateTimeService } from './date-time.service';
import { CustomTranslateService } from './custom-translate.service';
import {} from 'jasmine';
import { HttpModule, Http, JsonpModule } from '@angular/http';
import { RouterTestingModule} from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStaticLoader } from '@ngx-translate/core/@ngx-translate/core';
import { UserProfileService } from './user-profile.service';

beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
      deps: [Http]
    }), RouterTestingModule],
    providers: [TranslateService, DateTimeService, CustomTranslateService, UserProfileService]
  });
  TestBed.compileComponents();
});

it('should ...', inject([DateTimeService], (service: DateTimeService) => {
  expect(service).toBeTruthy();
}));
