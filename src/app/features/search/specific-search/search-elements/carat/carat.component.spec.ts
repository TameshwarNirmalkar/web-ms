import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaratComponent } from './carat.component';

describe('CaratComponent', () => {
  let component: CaratComponent;
  let fixture: ComponentFixture<CaratComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaratComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaratComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
