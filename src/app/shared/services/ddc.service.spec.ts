import { TestBed, inject } from '@angular/core/testing';

import { DdcService } from './ddc.service';

describe('DdcService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DdcService]
    });
  });

  it('should ...', inject([DdcService], (service: DdcService) => {
    expect(service).toBeTruthy();
  }));
});
