import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldListDetailsComponent } from './hold-list-details.component';

describe('HoldListDetailsComponent', () => {
  let component: HoldListDetailsComponent;
  let fixture: ComponentFixture<HoldListDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoldListDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldListDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
