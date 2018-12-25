import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginAsComponent } from './login-as.component';

describe('LoginAsComponent', () => {
  let component: LoginAsComponent;
  let fixture: ComponentFixture<LoginAsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginAsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginAsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
