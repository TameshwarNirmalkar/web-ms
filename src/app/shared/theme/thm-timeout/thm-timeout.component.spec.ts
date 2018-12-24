import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmTimeoutComponent } from './thm-timeout.component';

describe('ThmTimeoutComponent', () => {
  let component: ThmTimeoutComponent;
  let fixture: ComponentFixture<ThmTimeoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmTimeoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmTimeoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
