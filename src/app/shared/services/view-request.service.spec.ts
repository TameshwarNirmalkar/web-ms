import { TestBed, inject } from '@angular/core/testing';

import { ViewRequestService } from './view-request.service';

describe('ViewRequestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ViewRequestService]
    });
  });

  it('should ...', inject([ViewRequestService], (service: ViewRequestService) => {
    expect(service).toBeTruthy();
  }));
});
