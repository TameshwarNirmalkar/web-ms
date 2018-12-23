import { TestBed, inject } from '@angular/core/testing';

import { ApplicationAuditService } from './application-audit.service';

describe('ApplicationAuditService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationAuditService]
    });
  });

  it('should be created', inject([ApplicationAuditService], (service: ApplicationAuditService) => {
    expect(service).toBeTruthy();
  }));
});
