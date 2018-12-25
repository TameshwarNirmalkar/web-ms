/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { WebUserService } from './web-user.service';

describe('WebUserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebUserService]
    });
  });

  it('should ...', inject([WebUserService], (service: WebUserService) => {
    expect(service).toBeTruthy();
  }));
});
