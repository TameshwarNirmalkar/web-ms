import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmAddnoteOverlayComponent } from './thm-addnote-overlay.component';

describe('ThmAddnoteOverlayComponent', () => {
  let component: ThmAddnoteOverlayComponent;
  let fixture: ComponentFixture<ThmAddnoteOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmAddnoteOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmAddnoteOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
