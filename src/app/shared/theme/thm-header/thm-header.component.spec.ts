/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { } from 'jasmine';

import { ThmHeaderComponent } from './thm-header.component';
import { HttpModule, Http, JsonpModule } from '@angular/http';
import { RouterTestingModule} from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';

describe('ThmHeaderComponent', () => {
  let component: ThmHeaderComponent;
  let fixture: ComponentFixture<ThmHeaderComponent>;

  // beforeEach(() => {
  //   TestBed.configureTestingModule({
  //     declarations: [
  //       ThmHeaderComponent
  //     ],
  //     imports: [TranslateModule.forRoot({
  //       provide: TranslateLoader,
  //       useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
  //       deps: [Http]
  //     }), RouterTestingModule],
  //     providers: [TranslateService]
  //   });
  //   TestBed.compileComponents();
  // });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
