import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenInclusionComponent } from './open-inclusion.component';

describe('OpenInclusionComponent', () => {
  let component: OpenInclusionComponent;
  let fixture: ComponentFixture<OpenInclusionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenInclusionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenInclusionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
