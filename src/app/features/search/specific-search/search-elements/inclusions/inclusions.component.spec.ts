import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InclusionsComponent } from './inclusions.component';

describe('InclusionsComponent', () => {
  let component: InclusionsComponent;
  let fixture: ComponentFixture<InclusionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InclusionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InclusionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
