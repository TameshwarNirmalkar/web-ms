import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LusterComponent } from './luster.component';

describe('LusterComponent', () => {
  let component: LusterComponent;
  let fixture: ComponentFixture<LusterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LusterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
