import { TestBed, inject } from '@angular/core/testing';

import { DaypEventResolverService } from './dayp-event-resolver.service';

describe('DaypEventResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DaypEventResolverService]
    });
  });

  it('should ...', inject([DaypEventResolverService], (service: DaypEventResolverService) => {
    expect(service).toBeTruthy();
  }));
});
