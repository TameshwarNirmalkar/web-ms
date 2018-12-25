import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaypSearchComponent } from './dayp-search.component';

describe('DaypSearchComponent', () => {
  let component: DaypSearchComponent;
  let fixture: ComponentFixture<DaypSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaypSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaypSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
