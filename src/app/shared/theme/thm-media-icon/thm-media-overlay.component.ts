import { Component, OnInit, Input, HostListener, AfterViewInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'thm-media-icon',
  templateUrl: './thm-media-overlay.component.html',
  styleUrls: ['./thm-media-overlay.component.scss'],
})
export class ThemeMediaIcon implements OnInit, AfterViewInit {

  @Input() stoneObj: any;
  @Input() posX: any;
  @Input() posY: any;
  @Output() closeIconOverlay: EventEmitter<Boolean> = new EventEmitter<Boolean>();

  @ViewChild('mediaIconMenu') mediaIconMenu: ElementRef;
  // @ViewChild('multimediaOverlay') multimediaOverlay: any;

  arrowTop: boolean = true;

  constructor() { }

  ngOnInit() {
    (this.posY + this.mediaIconMenu.nativeElement.offsetHeight) > (window.innerHeight - 25)
  }

  ngAfterViewInit() {
    let isHeightGreater: Boolean = (this.posY + this.mediaIconMenu.nativeElement.offsetHeight) > (window.innerHeight - 25);
    this.arrowTop = true;
    if (isHeightGreater === true) {
      let heightOfContainer = 30;
      this.posY = this.posY - this.mediaIconMenu.nativeElement.offsetHeight - heightOfContainer;
      this.arrowTop = false;
    }

    isHeightGreater = null;
  }


  hideIconOverlay() {
    this.closeIconOverlay.emit(true);
  }

  @HostListener('window:click', ['$event'])
  onWindowsClick(event) {
    if (event && event.target && event.target && event.target.className) {
      if (!(event.target.className.indexOf('icon-media') > -1)) {
        this.closeIconOverlay.emit(true);
      }
    }
  }

}
