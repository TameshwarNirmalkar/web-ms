import { TestBed, inject } from '@angular/core/testing';

import { HoldListService } from './hold-list.service';

describe('HoldListService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HoldListService]
    });
  });

  it('should ...', inject([HoldListService], (service: HoldListService) => {
    expect(service).toBeTruthy();
  }));
});
