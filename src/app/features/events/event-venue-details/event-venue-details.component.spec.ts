import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventVenueDetailsComponent } from './event-venue-details.component';

describe('EventVenueDetailsComponent', () => {
  let component: EventVenueDetailsComponent;
  let fixture: ComponentFixture<EventVenueDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventVenueDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventVenueDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
