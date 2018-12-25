import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DdcComponent } from './ddc.component';

describe('DdcComponent', () => {
  let component: DdcComponent;
  let fixture: ComponentFixture<DdcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DdcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DdcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
