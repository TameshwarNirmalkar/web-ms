/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { WebDashboardService } from './web-dashboard.service';

describe('WebDashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebDashboardService]
    });
  });

  it('should ...', inject([WebDashboardService], (service: WebDashboardService) => {
    expect(service).toBeTruthy();
  }));
});
