import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldListComponent } from './hold-list.component';

describe('HoldListComponent', () => {
  let component: HoldListComponent;
  let fixture: ComponentFixture<HoldListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoldListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
