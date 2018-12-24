import { Component, OnInit, Input, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'thm-mediaicon',
  templateUrl: './thm-media-overlay.component.html',
  styleUrls: ['./thm-media-overlay.component.scss'],
})
export class ThmMediaIcon implements OnInit {
  public stoneDetails: any;
  @Input() stoneObj: any;
  @ViewChild('multimediaOverlay') multimediaOverlay: any;
  constructor() { }

  ngOnInit() {
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.multimediaOverlay.hide();
  }
}
