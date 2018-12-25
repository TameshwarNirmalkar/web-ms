import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FluorescenceComponent } from './fluorescence.component';

describe('FluorescenceComponent', () => {
  let component: FluorescenceComponent;
  let fixture: ComponentFixture<FluorescenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FluorescenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FluorescenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
