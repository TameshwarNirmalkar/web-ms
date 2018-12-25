import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMenubarComponent } from './search-menubar.component';

describe('SearchMenubarComponent', () => {
  let component: SearchMenubarComponent;
  let fixture: ComponentFixture<SearchMenubarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchMenubarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchMenubarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
