import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaypBasketComponent } from './dayp-basket.component';

describe('DaypBasketComponent', () => {
  let component: DaypBasketComponent;
  let fixture: ComponentFixture<DaypBasketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaypBasketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaypBasketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
