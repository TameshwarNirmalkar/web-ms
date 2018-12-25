import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAllStockComponent } from './show-all-stock.component';

describe('ShowAllStockComponent', () => {
  let component: ShowAllStockComponent;
  let fixture: ComponentFixture<ShowAllStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowAllStockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowAllStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
