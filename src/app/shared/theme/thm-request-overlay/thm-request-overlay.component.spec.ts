import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmRequestOverlayComponent } from './thm-request-overlay.component';

describe('ThmRequestOverlayComponent', () => {
  let component: ThmRequestOverlayComponent;
  let fixture: ComponentFixture<ThmRequestOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmRequestOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmRequestOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
