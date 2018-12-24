import { TestBed, inject } from '@angular/core/testing';

import { DaypService } from '@srk/shared';

describe('DaypService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DaypService]
    });
  });

  it('should ...', inject([DaypService], (service: DaypService) => {
    expect(service).toBeTruthy();
  }));
});
