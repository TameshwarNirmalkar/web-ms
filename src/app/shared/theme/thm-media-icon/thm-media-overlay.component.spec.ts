import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmMediaIcon } from './thm-bid-to-buy-overlay.component';

describe('ThmBidToBuyOverlayComponent', () => {
  let component: ThmMediaIcon;
  let fixture: ComponentFixture<ThmMediaIcon>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmMediaIcon ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmMediaIcon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
