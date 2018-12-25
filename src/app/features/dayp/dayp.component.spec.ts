import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaypComponent } from './dayp.component';

describe('DaypComponent', () => {
  let component: DaypComponent;
  let fixture: ComponentFixture<DaypComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaypComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaypComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
