import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HAComponent } from './ha.component';

describe('HAComponent', () => {
  let component: HAComponent;
  let fixture: ComponentFixture<HAComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HAComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
