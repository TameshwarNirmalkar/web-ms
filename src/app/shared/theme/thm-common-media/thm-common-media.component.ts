import { Component, OnInit, Input, HostListener, OnChanges, AfterViewInit, Host } from '@angular/core';

// Component Decorator
@Component({
  selector: 'thm-common-media',
  templateUrl: './thm-common-media.component.html',
  styleUrls: ['./thm-common-media.component.scss']
})

// Component Class
export class ThmCommonMediaComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() commonMediaFile: any;

  public loginPageVideo: any;
  public videoExten: boolean = true;
  public centerAlignMedia: any;
  public upperText: any;
  public lowerText: any;
  public showLiveVideoContainer = false;
  public backGroundColor: any;

  constructor() {

  }
  ngOnInit() {
  }
  ngOnChanges() {
    if (this.commonMediaFile) {
      this.loginPageVideo = this.commonMediaFile.primary.FILE_PATH;
      this.backGroundColor = this.commonMediaFile.primary.COLOR_CODE;
      const Exte = /[^.]+$/.exec(this.loginPageVideo)[0];
      if (Exte === 'jpg' || Exte === 'gif' || Exte === 'jpeg' || Exte === 'png') {
        this.videoExten = false;
      } else if (Exte === 'mp4' || Exte === 'mov' || Exte === 'avi') {
        this.videoExten = true;
      } else {
        this.showLiveVideoContainer = this.commonMediaFile.primary.IS_WEB_URL ? true : false;
      }
      this.upperText = '';
      this.lowerText = '';
      if (this.commonMediaFile.primary.HEADER_DATA || this.commonMediaFile.primary.FOOTER_DATA) {
        this.upperText = this.commonMediaFile.primary.HEADER_DATA || '';
        this.lowerText = this.commonMediaFile.primary.FOOTER_DATA || '';
      }
    }
  }
  ngAfterViewInit() {
    const height = jQuery(window).height();
    const heightupper = jQuery('#upperid').height();
    const heightlower = jQuery('#lowerid').height();
    if (window.location.href.indexOf('login') > -1) {
      jQuery('#centerDiv').css('min-height', height - heightupper - heightlower - 100);
      jQuery('#bgvid').css('min-height', height - heightupper - heightlower - 200);
      setTimeout(function () {
        const bgvideoHeight = jQuery('#bgvid').height();
        const newHeight = (height - bgvideoHeight - heightlower - heightupper - 30) / 2;
        jQuery('#bgvid').css('padding-top', newHeight - 20);
        jQuery('#bgvid').css('max-height', height - heightupper - heightlower - 100);
      }, 2000);
    }
    if (window.location.href.indexOf('dashboard') > -1) {
      if (heightupper > 0) {
        jQuery('#centerDiv').css('margin-top', heightupper - 30);
      }
      jQuery('#bgvid').css('height', 193);
      if (!this.upperText && !this.lowerText) {
        jQuery('#upperid').css('min-height', 0);
        jQuery('#upperid').css('padding-top', 2);
        jQuery('#lowerid').css('min-height', 0);
        jQuery('#bgvid').css('min-height', 275);
      }
    }
  }

  @HostListener('window:resize', [])
  onWindowResize() {
    this.ngAfterViewInit();
  }
}
