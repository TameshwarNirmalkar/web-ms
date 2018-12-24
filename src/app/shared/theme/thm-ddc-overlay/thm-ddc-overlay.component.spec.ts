import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmDdcOverlayComponent } from './thm-ddc-overlay.component';

describe('ThmDdcOverlayComponent', () => {
  let component: ThmDdcOverlayComponent;
  let fixture: ComponentFixture<ThmDdcOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmDdcOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmDdcOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
