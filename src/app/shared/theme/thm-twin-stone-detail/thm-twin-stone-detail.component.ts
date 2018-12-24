import { Component, OnInit, Input, HostListener, ViewChild, OnChanges } from '@angular/core';
import { AuthService } from '@srk/core';
import { ThmConfirmOverlayComponent } from '../thm-confirm-overlay/thm-confirm-overlay.component';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { LoggerService } from '@srk/core';
import { ApiService } from '../../services/api.service';
import { MessageService } from '@srk/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { StoneDetailsService } from '../../services/stone-details.service';

@Component({
  selector: 'thm-twin-stone-detail',
  templateUrl: './thm-twin-stone-detail.component.html',
  styleUrls: ['./thm-twin-stone-detail.component.scss']
})
export class ThmTwinStoneDetailComponent implements OnInit, OnChanges {

  @ViewChild(ThmConfirmOverlayComponent) thmConfirmOverlayComponent;
  @Input() twinStones: any[];
  @Input() stoneDetails: any;
  @Input() isDaypActive: boolean;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;


  public showCombineView = false;
  public showDetailView = true;
  public imageShow = true;
  public videoShow = false;
  public haShow = false;
  public certShow = false;
  public verifyShow = false;
  public plotShow = false;
  public imageShowST1 = true;
  public videoShowST1 = false;
  public haShowST1 = false;
  public certShowST1 = false;
  public verifyShowST1 = false;
  public plotShowST1 = false;
  public digiPlotShowST1 = false;
  public popupVisible = false;
  public twinStoneIds = [];
  public viewRequestApiLink: any;
  public confirmOverlayVisible = false;
  public displayImagePopup = false;
  public ddcOverlayVisible = false;
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;
  public digiPlotShow = false;
  public showMedia: any = 'Image';
  public stoneObj: any;
  constructor(
    private authService: AuthService,
    private logger: LoggerService,
    private searchService: SearchService,
    private notify: NotifyService,
    private messageService: MessageService,
    private stoneDetailsService: StoneDetailsService,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.stoneObj = {
      isAllowedHoldButton: true,
      isDDCButtonAllowed: true,
      isBasketAllowed: true,
      isViewRequest: true,
      isConfirmedButtonAllowed: true
    };
    const pageName = window.location.href;
    if (pageName.indexOf('hold-list') > -1) {
      this.stoneObj = {
        isAllowedHoldButton: false,
        isDDCButtonAllowed: false,
        isBasketAllowed: false,
        isViewRequest: false,
        isConfirmedButtonAllowed: true
      };
    }
    if (pageName.indexOf('basket') > -1) {
      this.stoneObj = {
        isAllowedHoldButton: true,
        isDDCButtonAllowed: true,
        isBasketAllowed: false,
        isViewRequest: true,
        isConfirmedButtonAllowed: true
      };
    }
    if (pageName.indexOf('bid-to-buy') > -1) {
      this.stoneObj = {
        isAllowedHoldButton: false,
        isDDCButtonAllowed: false,
        isBasketAllowed: true,
        isViewRequest: true,
        isConfirmedButtonAllowed: false
      };
    }
    if (pageName.indexOf('dayp-stones') > -1 && this.isDaypActive) {
      this.stoneObj = {
        isAllowedHoldButton: false,
        isDDCButtonAllowed: false,
        isBasketAllowed: false,
        isViewRequest: true,
        isConfirmedButtonAllowed: false
      };
    }
    if (this.twinStones) {
      this.twinStoneIds.push(this.twinStones[0].stone_id);
      this.twinStoneIds.push(this.twinStones[1].stone_id);
    }
    this.viewRequestApiLink = this.authService.getApiLinkForKey('view_request_btn', '');
    this.logViewedByMe();
  }

  ngOnChanges() {
    if (!this.isDaypActive) {
      this.stoneObj = {
        isAllowedHoldButton: false,
        isDDCButtonAllowed: true,
        isBasketAllowed: false,
        isViewRequest: true,
        isConfirmedButtonAllowed: true
      };
    } else {
      this.stoneObj = {
        isAllowedHoldButton: false,
        isDDCButtonAllowed: false,
        isBasketAllowed: false,
        isViewRequest: true,
        isConfirmedButtonAllowed: false
      };
    }
  }

  stoneDetailScroll(divId, menuDiv) {
    const filterItem = $('#' + divId).offset().top - $('#BasicDiv').offset().top;
    const activeDivName = document.getElementById(menuDiv);
    $('.scrl').removeClass('active');
    $(activeDivName).addClass('active');
    $('.stn_detail_wrap').animate({
      scrollTop: (filterItem)
    }, 1000);
  }

  logViewedByMe() {
    this.twinStoneIds.forEach((element, index) => {
      if (this.twinStoneIds) {
        this.stoneDetailsService.incrementStoneView(this.twinStoneIds[index]).subscribe(res => {
          this.notify.notifyStoneStateUpdated({ source: 'onlineViewIncrement', stoneList: [this.twinStoneIds[index]] });
        });
      }
    });
  }

  downloadCertificate(cert_url) {
    const req = new XMLHttpRequest();
    req.open('GET', cert_url, true);
    req.responseType = 'blob';
    req.onload = function (event) {
      const blob = req.response;
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'Certificate' + new Date() + '.pdf';
      link.click();
    };
    req.send();
  }

  onScrollAddActiveClass() {
    $('.details-box').scroll(function () {
      const scrollDistance = $('.details-box').scrollTop();
      $('.std-head').each(function (i) {
        if ($(this).position().top <= scrollDistance) {
          $('.scrl').removeClass('active');
          $('.scrl').eq(i).addClass('active');
        }
      });
    }).scroll();
  }

  changeMultimediaST1(image, video, ha, verify, cert, plott, digiplot) {
    this.imageShowST1 = image;
    this.videoShowST1 = video;
    this.haShowST1 = ha;
    this.verifyShowST1 = verify;
    this.certShowST1 = cert;
    this.plotShowST1 = plott;
    this.digiPlotShowST1 = digiplot;
    if (image === true) {
      this.showMedia = "Image";
    } else if (video === true) {
      this.showMedia = 'Video'
    } else if (ha == true) {
      this.showMedia = 'HA'
    } else if (cert == true) {
      this.showMedia = 'PDF'
    } else if (plott == true) {
      this.showMedia = 'Plotting'
    } else if (digiplot == true) {
      this.showMedia = 'Digiplott'
    } else {
      this.showMedia = 'Video'
    }
    this.changeMultimedia(image, video, ha, verify, cert, plott, digiplot);
  }


  changeMultimedia(image, video, ha, verify, cert, plott, digiPlot) {
    this.imageShow = image;
    this.videoShow = video;
    this.haShow = ha;
    this.verifyShow = verify;
    this.certShow = cert;
    this.plotShow = plott;
    this.digiPlotShow = digiPlot;
  }

  toggleViewRequestOverlay() {
    this.popupVisible = !this.popupVisible;
  }

  toggleOverlay(e) {
    this.popupVisible = e.visible;
  }

  confirmDiamonds() {
    this.logger.logInfo('ThmTwinStoneDetailComponent', 'User action to confirm these twin stones :- ' + this.twinStoneIds);
    this.thmConfirmOverlayComponent.checkOrderDetails();
    this.thmConfirmOverlayComponent.verifyDiamondConfirmation(this.twinStoneIds);
  }

  toggleConfirmOverlay(e) {
    this.confirmOverlayVisible = e.visible;
  }

  applyDDC() {
    this.ddcOverlayVisible = true;
  }

  toggleDdcOverlay(e) {
    this.ddcOverlayVisible = e.visible;
  }

  addToMyBasket() {
    const apiLink = this.authService.getApiLinkForKey('add_basket_btn', '');
    const stones = { "stone_ids": this.twinStoneIds };
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    this.apiService.postCall('ThmTwinStoneDetailComponent:addToMyBasket', apiLink, JSON.stringify(stones)).subscribe((response) => {
      this.notify.hideBlockUI();
      if (response !== undefined) {
        if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_NSF_200)) {
          this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
        } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SS_200)) {
          this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
        } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SNE_200)) {
          this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
        }
      }
    }, error => {
      this.notify.hideBlockUI();
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  requestHold() {
    const apiLink = this.authService.getApiLinkForKey('request_hold_btn', '');
    const stones = { "stone_ids": this.twinStoneIds };
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    this.apiService.postCall('ThmTwinStoneDetailComponent:requestHold', apiLink, stones).subscribe((response) => {
      this.notify.hideBlockUI();
      if (!response.error_status) {
        this.messageService.showSuccessGrowlMessage('Added to Hold List Successfully');
      } else {
        this.messageService.showErrorGrowlMessage('Error while adding to Hold List');
      }
    }, error => {
      this.notify.hideBlockUI();
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  toggleMultimediaOverlay() {
    this.themeMultimediaPopUp.changePopUpMultimedia(this.imageShow, this.videoShow, this.haShow, this.certShow, this.plotShow, this.digiPlotShow, this.twinStones[1]);
    this.toggleMultimediaPopup = true;
  }

  toggleMultimediaOverlayST1() {
    this.themeMultimediaPopUp.changePopUpMultimedia(this.imageShowST1, this.videoShowST1, this.haShowST1, this.certShowST1, this.plotShowST1, this.digiPlotShowST1, this.twinStones[0]);
    this.toggleMultimediaPopup = true;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  displayCombineView() {
    this.showCombineView = true;
    this.showDetailView = false
  }

  displayDetailView() {
    this.showCombineView = false;
    this.showDetailView = true
  }
}
