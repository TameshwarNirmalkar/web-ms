import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedStockPanelComponent } from './selected-stock-panel.component';

describe('SelectedStockPanelComponent', () => {
  let component: SelectedStockPanelComponent;
  let fixture: ComponentFixture<SelectedStockPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedStockPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedStockPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
