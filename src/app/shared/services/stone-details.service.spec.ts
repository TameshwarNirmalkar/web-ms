import { TestBed, inject } from '@angular/core/testing';

import { StoneDetailsService } from './stone-details.service';

describe('StoneDetailsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoneDetailsService]
    });
  });

  it('should ...', inject([StoneDetailsService], (service: StoneDetailsService) => {
    expect(service).toBeTruthy();
  }));
});
