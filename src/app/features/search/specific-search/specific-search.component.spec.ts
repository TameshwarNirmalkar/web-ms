import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificSearchComponent } from './specific-search.component';

describe('SpecificSearchComponent', () => {
  let component: SpecificSearchComponent;
  let fixture: ComponentFixture<SpecificSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecificSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecificSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
