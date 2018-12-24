import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'thm-multimedia-popup',
  templateUrl: './thm-multimedia-popup.component.html',
  styleUrls: ['./thm-multimedia-popup.component.scss']
})
export class ThmMultimediaPopupComponent implements OnInit {
  @Input() popUpMultimediaInfo: any;
  @Input() displayMultimediaPopup: any;
  @Output() closePopup = new EventEmitter();
  public imagePopUpShow: boolean;
  public videoPopUpShow: boolean;
  public haPopUpShow: boolean;
  public pdfPopUpShow: boolean;
  public plotPopUpShow: boolean;
  public digiplotPopUpShow: boolean;
  constructor() {
  }

  ngOnInit() {
  }

  changePopUpMultimedia(image, video, ha, pdf, plot, digiplot, stoneDetails) {
    this.imagePopUpShow = image;
    this.videoPopUpShow = video;
    this.haPopUpShow = ha;
    this.pdfPopUpShow = pdf;
    this.plotPopUpShow = plot;
    this.popUpMultimediaInfo = stoneDetails;
    this.digiplotPopUpShow = digiplot;
  }

  togglePopup() {
    this.popUpMultimediaInfo = {};
    this.closePopup.emit({ status: false });
  }

  initializePopUp(stoneDetails) {
    this.popUpMultimediaInfo = stoneDetails;
    this.imagePopUpShow = false;
    this.haPopUpShow = false;
    this.videoPopUpShow = true;
    this.pdfPopUpShow = false;
    this.plotPopUpShow = false;
    this.digiplotPopUpShow = false;
  }

  updateImage(event) {
    event.target.src = './assets/img/no-image.svg';
  }

}