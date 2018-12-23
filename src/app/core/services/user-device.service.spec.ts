/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UserDeviceService } from './user-device.service';

describe('UserDeviceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserDeviceService]
    });
  });

  it('should ...', inject([UserDeviceService], (service: UserDeviceService) => {
    expect(service).toBeTruthy();
  }));
});
