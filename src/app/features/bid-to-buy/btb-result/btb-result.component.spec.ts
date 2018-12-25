import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BtbResultComponent } from './btb-result.component';

describe('BtbResultComponent', () => {
  let component: BtbResultComponent;
  let fixture: ComponentFixture<BtbResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BtbResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BtbResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
