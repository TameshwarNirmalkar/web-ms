/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { SharedModule } from '@srk/shared';
import { HttpModule, Http, JsonpModule } from '@angular/http';
import { WebDashboardService } from '../web-dashboard.service';
import { RouterTestingModule} from '@angular/router/testing';
import { SearchModule } from '@srk/features/search';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStaticLoader } from '@ngx-translate/core/@ngx-translate/core';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { DragulaService } from 'ng2-dragula/ng2-dragula';

import { PrimaryDashboardLayoutComponent } from './primary-dashboard-layout.component';

describe('PrimaryDashboardLayoutComponent', () => {
  let component: PrimaryDashboardLayoutComponent;
  let fixture: ComponentFixture<PrimaryDashboardLayoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        PrimaryDashboardLayoutComponent
      ],
      imports: [TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
        deps: [Http]
      }), RouterTestingModule, SharedModule, DragulaModule, SearchModule],
      providers: [TranslateService, WebDashboardService, DragulaService]
    });
    TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrimaryDashboardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
