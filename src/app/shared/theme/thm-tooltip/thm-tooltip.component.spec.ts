import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmTooltipComponent } from './thm-tooltip.component';

describe('ThmTooltipComponent', () => {
  let component: ThmTooltipComponent;
  let fixture: ComponentFixture<ThmTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
