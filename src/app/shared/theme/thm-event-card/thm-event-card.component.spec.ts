import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmEventCardComponent } from './thm-event-card.component';

describe('ThmEventCardComponent', () => {
  let component: ThmEventCardComponent;
  let fixture: ComponentFixture<ThmEventCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmEventCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmEventCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
