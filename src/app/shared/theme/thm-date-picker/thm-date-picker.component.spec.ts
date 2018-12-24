/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ThmDatePickerComponent } from './thm-date-picker.component';
import {} from 'jasmine';
import { HttpModule, Http, JsonpModule } from '@angular/http';
import { RouterTestingModule} from '@angular/router/testing';
import { CustomTranslateService } from '@srk/core';
import {DateTimeService} from '@srk/core';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStaticLoader } from '@ngx-translate/core/@ngx-translate/core';
import { NotifyService } from '@srk/core';


describe('ThmDatePickerComponent', () => {
  let component: ThmDatePickerComponent;
  let fixture: ComponentFixture<ThmDatePickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ThmDatePickerComponent
      ],
      imports: [TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
        deps: [Http]
      }), RouterTestingModule],
      providers: [TranslateService, CustomTranslateService, DateTimeService, NotifyService]
    });
    TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
