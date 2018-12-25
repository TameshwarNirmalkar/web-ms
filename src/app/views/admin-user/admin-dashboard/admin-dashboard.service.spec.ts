/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminDashboardService]
    });
  });

  it('should ...', inject([AdminDashboardService], (service: AdminDashboardService) => {
    expect(service).toBeTruthy();
  }));
});
