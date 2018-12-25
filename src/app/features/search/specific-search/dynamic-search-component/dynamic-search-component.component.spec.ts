import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicSearchComponentComponent } from './dynamic-search-component.component';

describe('DynamicSearchComponentComponent', () => {
  let component: DynamicSearchComponentComponent;
  let fixture: ComponentFixture<DynamicSearchComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicSearchComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicSearchComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
