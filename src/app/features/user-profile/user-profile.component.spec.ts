/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UserProfileComponent } from './user-profile.component';
import {} from 'jasmine';
import { HttpModule, Http, JsonpModule } from '@angular/common/http';
import { RouterTestingModule} from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStaticLoader } from '@ngx-translate/core/@ngx-translate/core';
import { SharedModule } from '@srk/shared';
import { UserProfileService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        UserProfileComponent
      ],
      imports: [TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
        deps: [Http]
      }), RouterTestingModule, SharedModule],
      providers: [TranslateService, UserProfileService, CustomTranslateService, MessageService, NotifyService]
    });
    TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
  });

  it('should check CardList', () => {
    const userProfileService = fixture.debugElement.injector.get(UserProfileService);
    fixture.detectChanges();
    expect(userProfileService.getCardList()).toEqual(component.cardList);
  });

  it('should check allCards', () => {
    const userProfileService = fixture.debugElement.injector.get(UserProfileService);
    fixture.detectChanges();
    expect(userProfileService.getCards()).toEqual(component.allCards);
  });

  it('should check getPreferredColumns', () => {
    const userProfileService = fixture.debugElement.injector.get(UserProfileService);
    this.data = component.getPreferredColumns();
    fixture.detectChanges();
    expect(userProfileService.getPreferredSearchTableColumns()).toEqual(this.data);
  });

  it('should check langs', () => {
    const userProfileService = fixture.debugElement.injector.get(UserProfileService);
    fixture.detectChanges();
    expect(userProfileService.getAllLanguages()).toEqual(component.langs);
  });

  it('should check selectedLang', () => {
    const userProfileService = fixture.debugElement.injector.get(UserProfileService);
    fixture.detectChanges();
    expect(userProfileService.getUserLanguage()).toEqual(component.selectedLang);
  });

  it('should check allColumns', () => {
    const userProfileService = fixture.debugElement.injector.get(UserProfileService);
    fixture.detectChanges();
    expect(userProfileService.getSearchTableColumns()).toEqual(component.allColumns);
  });

  it('should check selectedColumns', () => {
    fixture.detectChanges();
    expect(component.getPreferredColumns()).toEqual(component.selectedColumns);
  });
});
