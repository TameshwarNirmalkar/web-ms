import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaypMySubmittedComponent } from './dayp-my-submitted.component';

describe('DaypMySubmittedComponent', () => {
  let component: DaypMySubmittedComponent;
  let fixture: ComponentFixture<DaypMySubmittedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaypMySubmittedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaypMySubmittedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
