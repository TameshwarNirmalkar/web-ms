import { TestBed, inject } from '@angular/core/testing';

import { BidToBuyDetailService } from './bid-to-buy-detail.service';

describe('BidToBuyDetailService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BidToBuyDetailService]
    });
  });

  it('should ...', inject([BidToBuyDetailService], (service: BidToBuyDetailService) => {
    expect(service).toBeTruthy();
  }));
});
