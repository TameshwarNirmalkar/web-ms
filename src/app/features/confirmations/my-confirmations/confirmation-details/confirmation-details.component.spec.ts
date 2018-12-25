import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationDetailsComponent } from './confirmation-details.component';

describe('ConfirmationDetailsComponent', () => {
  let component: ConfirmationDetailsComponent;
  let fixture: ComponentFixture<ConfirmationDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
