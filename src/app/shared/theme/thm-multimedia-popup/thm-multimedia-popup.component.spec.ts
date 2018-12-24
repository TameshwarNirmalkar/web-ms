import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmMultimediaPopupComponent } from './thm-multimedia-popup.component';

describe('ThmMultimediaPopupComponent', () => {
  let component: ThmMultimediaPopupComponent;
  let fixture: ComponentFixture<ThmMultimediaPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmMultimediaPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmMultimediaPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
