import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmKamCardComponent } from './thm-kam-card.component';

describe('ThmKamCardComponent', () => {
  let component: ThmKamCardComponent;
  let fixture: ComponentFixture<ThmKamCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmKamCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmKamCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
