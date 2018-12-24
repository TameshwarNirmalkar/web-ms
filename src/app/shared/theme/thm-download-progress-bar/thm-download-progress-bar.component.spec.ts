import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmDownloadProgressBarComponent } from './thm-download-progress-bar.component';

describe('ThmDownloadProgressBarComponent', () => {
  let component: ThmDownloadProgressBarComponent;
  let fixture: ComponentFixture<ThmDownloadProgressBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThmDownloadProgressBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThmDownloadProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
