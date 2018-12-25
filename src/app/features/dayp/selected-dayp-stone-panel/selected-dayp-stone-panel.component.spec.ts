import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedDaypStonePanelComponent } from './selected-dayp-stone-panel.component';

describe('SelectedDaypStonePanelComponent', () => {
  let component: SelectedDaypStonePanelComponent;
  let fixture: ComponentFixture<SelectedDaypStonePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedDaypStonePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedDaypStonePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
