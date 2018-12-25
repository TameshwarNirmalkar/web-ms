import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPacketComponent } from './user-packet.component';

describe('UserPacketComponent', () => {
  let component: UserPacketComponent;
  let fixture: ComponentFixture<UserPacketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPacketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPacketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
