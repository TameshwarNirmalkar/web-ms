/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RuleConfigService } from './rule-config.service';

describe('RuleConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RuleConfigService]
    });
  });

  it('should ...', inject([RuleConfigService], (service: RuleConfigService) => {
    expect(service).toBeTruthy();
  }));
});
