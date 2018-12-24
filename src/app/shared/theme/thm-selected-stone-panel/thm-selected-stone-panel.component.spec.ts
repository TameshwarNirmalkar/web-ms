import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmSelectedStonePanelComponent } from './thm-selected-stone-panel.component';

describe('ThmSelectedStonePanelComponent', () => {
  let component: ThmSelectedStonePanelComponent;
  let fixture: ComponentFixture<ThmSelectedStonePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmSelectedStonePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmSelectedStonePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
