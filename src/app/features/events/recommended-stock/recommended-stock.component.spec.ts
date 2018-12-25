import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendedStockComponent } from './recommended-stock.component';

describe('RecommendedStockComponent', () => {
  let component: RecommendedStockComponent;
  let fixture: ComponentFixture<RecommendedStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecommendedStockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecommendedStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
