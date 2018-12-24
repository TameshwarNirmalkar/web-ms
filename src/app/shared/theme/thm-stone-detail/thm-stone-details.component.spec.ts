import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmStoneDetailsComponent } from './thm-stone-details.component';

describe('StoneDetailsComponent', () => {
  let component: ThmStoneDetailsComponent;
  let fixture: ComponentFixture<ThmStoneDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmStoneDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmStoneDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
