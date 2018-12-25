import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfraGridComponent } from './infra-grid.component';

describe('InfraGridComponent', () => {
  let component: InfraGridComponent;
  let fixture: ComponentFixture<InfraGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfraGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfraGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
