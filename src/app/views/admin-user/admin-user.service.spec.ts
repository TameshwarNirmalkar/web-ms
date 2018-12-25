/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AdminUserService } from './admin-user.service';

describe('AdminUserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminUserService]
    });
  });

  it('should ...', inject([AdminUserService], (service: AdminUserService) => {
    expect(service).toBeTruthy();
  }));
});
