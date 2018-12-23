/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UserProfileService } from './user-profile.service';
import {} from 'jasmine';
import { RouterTestingModule} from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStaticLoader } from '@ngx-translate/core/@ngx-translate/core';
import { NotifyService } from './notify.service';
import { MessageService } from './message.service';
import { CustomTranslateService } from './custom-translate.service';
import { BaseRequestOptions, Response, ResponseOptions, HttpModule, Http, JsonpModule } from '@angular/http';
import {MockBackend, MockConnection } from '@angular/http/testing';

describe('UserProfileService', () => {
  const mockResponse = {
    'name': 'stonesUploaded', 'mainText': '950', 'mainDesc': 'Stones Uploaded',
    'icon': 'fa-diamond'
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TranslateService, UserProfileService, NotifyService, MessageService, CustomTranslateService,
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend, options) => new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
        }
      ],
      imports: [HttpModule, TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, 'assets/i18n', '.json'),
        deps: [Http]
      }), RouterTestingModule]
    });
    TestBed.compileComponents();
  });


  it('should ...', (inject([UserProfileService, MockBackend], (service: UserProfileService, mockBackend: MockBackend) => {

    mockBackend.connections.subscribe(conn => {
      conn.mockRespond(new Response(new ResponseOptions({ body: JSON.stringify(mockResponse) })));
    });

    service.getCardList().subscribe(res => {
      expect(res.name).toEqual('stonesUploaded');
    });
  })));
});
