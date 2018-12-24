/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ThmMenuComponent } from './thm-menu.component';
import {} from 'jasmine';
import { HttpModule, Http, JsonpModule } from '@angular/http';
import { RouterTestingModule} from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStaticLoader } from '@ngx-translate/core/@ngx-translate/core';

describe('ThmMenuComponent', () => {
  let component: ThmMenuComponent;
  let fixture: ComponentFixture<ThmMenuComponent>;

  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [
          ThmMenuComponent
        ],
        imports: [TranslateModule.forRoot({
          provide: TranslateLoader,
          useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
          deps: [Http]
        }), RouterTestingModule],
        providers: [TranslateService]
      });
      TestBed.compileComponents();
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
