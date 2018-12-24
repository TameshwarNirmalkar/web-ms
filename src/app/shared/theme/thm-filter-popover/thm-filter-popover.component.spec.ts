import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmFilterPopoverComponent } from './thm-filter-popover.component';

describe('ThmFilterPopoverComponent', () => {
  let component: ThmFilterPopoverComponent;
  let fixture: ComponentFixture<ThmFilterPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmFilterPopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmFilterPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
