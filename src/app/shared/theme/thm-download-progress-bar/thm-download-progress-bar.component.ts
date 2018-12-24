import { Component, OnInit, OnDestroy, Input, DoCheck } from '@angular/core';

@Component({
  selector: 'thm-download-progress-bar',
  templateUrl: './thm-download-progress-bar.component.html',
  styleUrls: ['./thm-download-progress-bar.component.scss']
})
export class ThmDownloadProgressBarComponent implements OnInit, OnDestroy, DoCheck {
  @Input() downloadItem: any;
  public downloadFlag = false;
  public downloadFlag1 = false;
  public value = 0;
  public value1 = 0;
  constructor() { }

  ngOnInit() {

  }

  ngDoCheck() {
    if (this.downloadItem) {
      if (this.downloadItem.progress !== 100) {
        this.startDownloadProgressBar(this.downloadItem.progress);
      } else {
        this.stopDownloadProgressBar();
      }
    }
  }

  stopDownloadProgressBar() {
    this.downloadFlag = false;
  }

  startDownloadProgressBar(value) {
    this.downloadFlag = true;
    this.value = value;
  }

  ngOnDestroy() {
  }
}
