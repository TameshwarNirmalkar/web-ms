import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmPacketPanelComponent } from './thm-packet-panel.component';

describe('ThmPacketPanelComponent', () => {
  let component: ThmPacketPanelComponent;
  let fixture: ComponentFixture<ThmPacketPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmPacketPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmPacketPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
