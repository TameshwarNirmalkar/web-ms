import { TestBed, inject } from '@angular/core/testing';

import { ApplicationStorageService } from './application-storage.service';

describe('ApplicationStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationStorageService]
    });
  });

  it('should ...', inject([ApplicationStorageService], (service: ApplicationStorageService) => {
    expect(service).toBeTruthy();
  }));
});
