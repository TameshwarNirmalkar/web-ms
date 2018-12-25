import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedStonesPanelComponent } from './selected-stones-panel.component';

describe('SelectedStonesPanelComponent', () => {
  let component: SelectedStonesPanelComponent;
  let fixture: ComponentFixture<SelectedStonesPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedStonesPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedStonesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
