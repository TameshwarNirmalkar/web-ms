import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmStoneCompareComponent } from './thm-stone-compare.component';

describe('ThmStoneCompareComponent', () => {
  let component: ThmStoneCompareComponent;
  let fixture: ComponentFixture<ThmStoneCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmStoneCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmStoneCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
