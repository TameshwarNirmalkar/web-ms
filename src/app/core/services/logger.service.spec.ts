/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { LoggerService } from './logger.service';
import { HttpModule, Http, Response } from '@angular/http';

describe('LoggerService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [LoggerService]
    });
  });

  it('should ...', inject([LoggerService], (service: LoggerService) => {
    expect(service).toBeTruthy();
  }));
});
