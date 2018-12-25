import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedStonesPanelGridComponent } from './selected-stones-panel-grid.component';

describe('SelectedStonesPanelGridComponent', () => {
  let component: SelectedStonesPanelGridComponent;
  let fixture: ComponentFixture<SelectedStonesPanelGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedStonesPanelGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedStonesPanelGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
