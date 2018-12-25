import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaypPreSelectedComponent } from './dayp-pre-selected.component';

describe('DaypPreSelectedComponent', () => {
  let component: DaypPreSelectedComponent;
  let fixture: ComponentFixture<DaypPreSelectedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaypPreSelectedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaypPreSelectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
