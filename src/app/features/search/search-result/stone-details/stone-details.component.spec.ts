import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoneDetailsComponent } from './stone-details.component';

describe('StoneDetailsComponent', () => {
  let component: StoneDetailsComponent;
  let fixture: ComponentFixture<StoneDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoneDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoneDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
