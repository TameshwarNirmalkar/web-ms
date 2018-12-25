/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { WebUserComponent } from './web-user.component';
import { SharedModule } from '@srk/shared';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStaticLoader } from '@ngx-translate/core/@ngx-translate/core';
import { HttpModule, Http, JsonpModule } from '@angular/http';
import { WebUserService } from './web-user.service';
import { NotifyService } from '@srk/core';

describe('WebUserComponent', () => {
  let component: WebUserComponent;
  let fixture: ComponentFixture<WebUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebUserComponent],
      imports: [TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
        deps: [Http]
      }), RouterTestingModule, SharedModule],
      providers: [TranslateService, WebUserService, NotifyService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
