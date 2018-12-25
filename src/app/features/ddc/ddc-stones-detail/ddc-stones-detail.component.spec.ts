import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DdcStonesDetailComponent } from './ddc-stones-detail.component';

describe('DdcStonesDetailComponent', () => {
  let component: DdcStonesDetailComponent;
  let fixture: ComponentFixture<DdcStonesDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DdcStonesDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DdcStonesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
