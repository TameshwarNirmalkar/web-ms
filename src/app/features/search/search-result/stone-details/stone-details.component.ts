import { Component, OnInit, Input, HostListener, ViewChild } from '@angular/core';
import { AuthService } from '@srk/core';
import { ThmConfirmOverlayComponent } from '@srk/shared';
import { LoggerService } from '@srk/core';
import { ApiService } from '@srk/shared';
import { MessageService } from '@srk/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';

declare var jQuery: any;
declare var Waypoint: any;

@Component({
  selector: 'app-stone-details',
  templateUrl: './stone-details.component.html',
  styleUrls: ['./stone-details.component.scss']
})
export class StoneDetailsComponent implements OnInit {

  @ViewChild(ThmConfirmOverlayComponent) thmConfirmOverlayComponent;
  @Input() stoneDetails: any;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;

  public showTagsList: any;
  public tagList: any[];
  public selectedTags: any[];
  public imageShow = true;
  public videoShow = false;
  public haShow = false;
  public certShow = false;
  public verifyShow = false;
  public plotShow = false;
  public popupVisible = false;
  public selectedStones = [];
  public apiLink: any;
  public confirmOverlayVisible = false;
  public displayImagePopup = false;
  public ddcOverlayVisible = false;
  public ddcStones: any[] = [];
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;

  constructor(
    private authService: AuthService,
    private logger: LoggerService,
    private notify: NotifyService,
    private searchService: SearchService,
    private messageService: MessageService,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.showTagsList = false;
    this.tagList = [
      { label: 'Popular', value: 'Popular' },
      { label: 'Trending', value: 'Trending' },
      { label: 'Exclusive', value: 'Exclusive' },
      { label: 'Preferred Parameter', value: 'Preferred Parameter' }
    ];
    // var sticky = new Waypoint.Sticky({
    //   element: jQuery('#buttonMenuBar')
    // });
  }

  showAddTags(stoneId) {
    this.showTagsList = !this.showTagsList;
  }

  addNewTags(event, stoneId) {
    const eventOccured = event.originalEvent.type;
    if (eventOccured === 'click') {
      if (this.stoneDetails.tags.indexOf(event.value) < 0) {
        const selectedTagArray = [];
        selectedTagArray.push(event.value);
        this.searchService.addTagsToStones(selectedTagArray, stoneId).subscribe((res) => {
          if (!res.error_status) {
            this.stoneDetails.tags.push(event.value);
            this.showTagsList = !this.showTagsList;
          } else {
            this.messageService.showErrorGrowlMessage('TAGS_NOT_ADDED');
          }
        }, error => {
          this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
        });
      } else {
        this.messageService.showErrorGrowlMessage('TAGS_ALREADY_EXIST');
      }
    }
  }

  changeMultimedia(image, video, ha, verify, cert, plott) {
    this.imageShow = image;
    this.videoShow = video;
    this.haShow = ha;
    this.verifyShow = verify;
    this.certShow = cert;
    this.plotShow = plott;
  }

  filterSelected(divId, btnId) {
    // this.isMenubarFixed = true;
    jQuery('.btn-tab').removeClass('detail-tab-active');
    jQuery('#' + btnId).addClass('detail-tab-active');
    const filterItem = jQuery('#' + divId).offset().top;
    jQuery('html, body').animate({
      scrollTop: (filterItem - 80)
    }, 800);
  }

  // @HostListener('window:scroll', ['$event'])
  // onWindowScroll(event) {
  //   this.setFilterMenuPositionOnPage();
  // }
  //
  // setFilterMenuPositionOnPage() {
  //   const scrollValue: any = jQuery(window).scrollTop();
  //   if (scrollValue > 707) {
  //     this.isMenubarFixed = true;
  //     jQuery('.menu-bar').removeClass('position-absolute');
  //     jQuery('.menu-bar').addClass('position-fixed');
  //   } else if (this.isMenubarFixed && scrollValue < 250) {
  //     this.isMenubarFixed = false;
  //     jQuery('.menu-bar').removeClass('position-fixed');
  //     jQuery('.menu-bar').addClass('position-absolute');
  //   }
  // }

  storeStoneList(value) {
    if (value) {
      this.selectedStones.push(this.stoneDetails.stone_id);
    } else {
      this.selectedStones = [];
    }
  }

  toggleViewRequestOverlay() {
    this.apiLink = this.authService.getApiLinkForKey('view_request_btn', '');
    this.popupVisible = !this.popupVisible;
    this.storeStoneList(this.popupVisible);
  }

  toggleOverlay(e) {
    this.popupVisible = e.visible;
    this.storeStoneList(this.popupVisible);
  }

  confirmDiamonds() {
    if (this.stoneDetails.stone_id) {
      this.confirmOverlayVisible = true;
      this.storeStoneList(this.confirmOverlayVisible);
      this.logger.logInfo('StoneDetailsComponent', 'User action to confirm these stones :- ' + this.stoneDetails.stone_id);
      this.thmConfirmOverlayComponent.checkOrderDetails();
      this.thmConfirmOverlayComponent.verifyDiamondConfirmation([this.stoneDetails.stone_id]);
    }
  }

  toggleConfirmOverlay(e) {
    this.confirmOverlayVisible = e.visible;
    this.storeStoneList(this.confirmOverlayVisible);
  }

  applyDDC() {
    this.ddcStones = [];
    if (this.stoneDetails.stone_id) {
      this.ddcStones.push(this.stoneDetails.stone_id);
      this.ddcOverlayVisible = true;
    }
  }

  toggleDdcOverlay(e) {
    this.ddcOverlayVisible = e.visible;
  }

  addToMyBasket() {
    this.apiLink = this.authService.getApiLinkForKey('add_basket_btn', '');
    const servicedata = '{"stone_ids":[' + JSON.stringify(this.stoneDetails.stone_id) + ']}';
    if (this.stoneDetails.stone_id) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.apiService.postCall('StoneDetailsComponent:addToMyBasket', this.apiLink, servicedata).subscribe((response) => {
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
  }

  requestHold() {
    this.apiLink = this.authService.getApiLinkForKey('request_hold_btn', '');
    const servicedata = '{"stone_ids":[' + JSON.stringify(this.stoneDetails.stone_id) + ']}';
    if (this.stoneDetails.stone_id) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.apiService.postCall('StoneDetailsComponent:requestHold', this.apiLink, servicedata).subscribe((response) => {
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
    } else {
      this.messageService.showErrorGrowlMessage('Please Select Stone');
    }
  }

  toggleMultimediaOverlay() {
    this.stoneMultimediaInfo = this.stoneDetails;
    this.themeMultimediaPopUp.changePopUpMultimedia(this.imageShow, this.videoShow, this.haShow, this.certShow, this.plotShow);
    this.toggleMultimediaPopup = true;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

}
