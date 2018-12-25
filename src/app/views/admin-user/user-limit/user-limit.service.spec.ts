/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UserLimitService } from './user-limit.service';

describe('UserLimitService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserLimitService]
    });
  });

  it('should ...', inject([UserLimitService], (service: UserLimitService) => {
    expect(service).toBeTruthy();
  }));
});
