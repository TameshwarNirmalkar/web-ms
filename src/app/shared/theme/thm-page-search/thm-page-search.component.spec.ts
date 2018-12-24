import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmPageSearchComponent } from './thm-page-search.component';

describe('ThmPageSearchComponent', () => {
  let component: ThmPageSearchComponent;
  let fixture: ComponentFixture<ThmPageSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmPageSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmPageSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
