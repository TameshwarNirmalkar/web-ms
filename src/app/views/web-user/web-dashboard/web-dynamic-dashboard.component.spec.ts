/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Inject, ViewChild, ComponentFactoryResolver, OnInit, OnDestroy } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import {} from 'jasmine';
import { HttpModule, Http, JsonpModule } from '@angular/http';
import { RouterTestingModule} from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStaticLoader } from '@ngx-translate/core/@ngx-translate/core';
import { WebDynamicDashboardComponent } from './web-dynamic-dashboard.component';
import { WebDashboardService } from './web-dashboard.service';
import { SharedModule } from '@srk/shared';
import { SearchModule } from '@srk/features/search';
import { PrimaryDashboardLayoutComponent } from './primary-dashboard-layout/primary-dashboard-layout.component';
import { SecondaryDashboardLayoutComponent } from './secondary-dashboard-layout/secondary-dashboard-layout.component';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { UserProfileService } from '@srk/core';
import { DashboardDirective } from './dashboard.directive';

describe('WebDynamicDashboardComponent', () => {
  let component: WebDynamicDashboardComponent;
  let fixture: ComponentFixture<WebDynamicDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        WebDynamicDashboardComponent, PrimaryDashboardLayoutComponent, SecondaryDashboardLayoutComponent, DashboardDirective
      ],
      imports: [TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
        deps: [Http]
      }), RouterTestingModule, SharedModule, DragulaModule, SearchModule],
      providers: [TranslateService, WebDashboardService, DragulaService, UserProfileService, ComponentFactoryResolver]
    });
    TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebDynamicDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
