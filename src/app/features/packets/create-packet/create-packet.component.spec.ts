import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePacketComponent } from './create-packet.component';

describe('CreatePacketComponent', () => {
  let component: CreatePacketComponent;
  let fixture: ComponentFixture<CreatePacketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePacketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePacketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
