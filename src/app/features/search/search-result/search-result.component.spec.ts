/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SearchResultComponent } from './search-result.component';
import { SharedModule } from '@srk/shared';
import { UserProfileService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import {} from 'jasmine';
import { HttpModule, Http, JsonpModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStaticLoader } from '@ngx-translate/core/@ngx-translate/core';
import { SearchService } from '@srk/core';

describe('SearchResultComponent', () => {
  let component: SearchResultComponent;
  let fixture: ComponentFixture<SearchResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        SearchResultComponent
      ],
      imports: [TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
        deps: [Http]
      }), SharedModule],
      providers: [TranslateService, SearchService, UserProfileService, CustomTranslateService]
    });
    TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
