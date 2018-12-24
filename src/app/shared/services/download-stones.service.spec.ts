import { TestBed, inject } from '@angular/core/testing';

import { DownloadStonesService } from './download-stones.service';

describe('DownloadStonesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DownloadStonesService]
    });
  });

  it('should ...', inject([DownloadStonesService], (service: DownloadStonesService) => {
    expect(service).toBeTruthy();
  }));
});
