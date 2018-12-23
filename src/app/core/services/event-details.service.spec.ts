import { TestBed, inject } from '@angular/core/testing';

import { EventDetailsService } from './event-details.service';

describe('EventDetailsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventDetailsService]
    });
  });

  it('should ...', inject([EventDetailsService], (service: EventDetailsService) => {
    expect(service).toBeTruthy();
  }));
});
