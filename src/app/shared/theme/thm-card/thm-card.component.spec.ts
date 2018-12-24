/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import {} from 'jasmine';
import { HttpModule, Http, JsonpModule } from '@angular/http';
import { RouterTestingModule} from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStaticLoader } from '@ngx-translate/core/@ngx-translate/core';
import { ThmCardComponent } from './thm-card.component';

import {UserProfileService} from '@srk/core'

describe('ThmCardComponent', () => {
  let component: ThmCardComponent;
  let fixture: ComponentFixture<ThmCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ThmCardComponent
      ],
      imports: [TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
        deps: [Http]
      }), RouterTestingModule],
      providers: [TranslateService, UserProfileService]
    });

    TestBed.compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const userProfileService = fixture.debugElement.injector.get(UserProfileService);
    component.cardData = userProfileService.getCardList();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
