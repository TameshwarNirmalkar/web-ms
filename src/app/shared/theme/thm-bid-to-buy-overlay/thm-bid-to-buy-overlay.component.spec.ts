import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmBidToBuyOverlayComponent } from './thm-bid-to-buy-overlay.component';

describe('ThmBidToBuyOverlayComponent', () => {
  let component: ThmBidToBuyOverlayComponent;
  let fixture: ComponentFixture<ThmBidToBuyOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmBidToBuyOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmBidToBuyOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
