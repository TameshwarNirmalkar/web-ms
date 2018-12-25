import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MySelectionStockComponent } from './my-selection-stock.component';

describe('MySelectionStockComponent', () => {
  let component: MySelectionStockComponent;
  let fixture: ComponentFixture<MySelectionStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MySelectionStockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MySelectionStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
