import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaypMySubmittedGridComponent } from './dayp-my-submitted-grid.component';

describe('DaypMySubmittedGridComponent', () => {
  let component: DaypMySubmittedGridComponent;
  let fixture: ComponentFixture<DaypMySubmittedGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaypMySubmittedGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaypMySubmittedGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
