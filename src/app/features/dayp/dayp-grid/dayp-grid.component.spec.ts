import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaypGridComponent } from './dayp-grid.component';

describe('DaypGridComponent', () => {
  let component: DaypGridComponent;
  let fixture: ComponentFixture<DaypGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaypGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaypGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
