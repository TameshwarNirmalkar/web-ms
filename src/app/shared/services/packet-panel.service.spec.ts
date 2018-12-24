import { TestBed, inject } from '@angular/core/testing';

import { PacketPanelService } from './packet-panel.service';

describe('PacketPanelService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PacketPanelService]
    });
  });

  it('should ...', inject([PacketPanelService], (service: PacketPanelService) => {
    expect(service).toBeTruthy();
  }));
});
