import { TestBed, async, inject } from '@angular/core/testing';
import { MessageService } from './message.service';
import {} from 'jasmine';
import { HttpModule, Http, JsonpModule } from '@angular/http';
import { RouterTestingModule} from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStaticLoader } from '@ngx-translate/core/@ngx-translate/core';
describe('MessageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
        deps: [Http]
      }), RouterTestingModule],
      providers: [TranslateService, MessageService]
    });
    TestBed.compileComponents();
  });

  it('should display "User Profile Saved"...', inject([MessageService], (service: MessageService) => {
    this.msgs = [];
    service.showSuccessGrowlMessage('User Profile Saved');
    expect(this.msgs[0].detail).toEqual('User Profile Saved');
  }));
});
