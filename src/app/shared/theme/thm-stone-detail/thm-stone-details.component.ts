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
declare var jQuery: any;
declare var Waypoint: any;

@Component({
  selector: 'thm-stone-details',
  templateUrl: './thm-stone-details.component.html',
  styleUrls: ['./thm-stone-details.component.scss'],
})
export class ThmStoneDetailsComponent implements OnInit, OnChanges {

  @ViewChild(ThmConfirmOverlayComponent) thmConfirmOverlayComponent;
  @Input() stoneDetails: any;
  @Input() parentScreenName: any;
  @Input() isDaypActive: boolean;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;

  public showTagsList: any;
  public tagList = [];
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
  public showConfirmationButton: any;
  public isEventStoneTab = true;
  public showAllbuttons = true;
  public isHoldStoneTab = true;
  public definedDDCHour: number;
  public digiPlotShow = false;
  public suggestionList: any[] = [];
  public showLoadingSymbol = false;
  public enterKeyPressCount = 0;
  public basketButton = true;
  public isSearchResultPage = false;
  public enlargeMediaType = 'Image';
  public viewFinalPayableAndFinalOff = this.stoneDetailsService.showFinalPayableAndFinalOff();
  public requestHoldButton = true;
  public applyDDCButton = true;
  public confirmStoneButton = true;
  public viewRequestButton = true;
  public addNoteButton = true;

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
    this.showTagsList = false;
    if (this.stoneDetails) {
      this.stoneDetailsService.getTagVoteMapping(this.stoneDetails.stone_id).subscribe(response => {
        if (response && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MSG_SUCCESS_FIND_TAG_DETAILS_200)) {
          if (response.data && response.data.length > 0) {
            this.stoneDetails.tags = Object.assign([], response.data);
            this.getTagList();
          }
        }
      }, err => {
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    }
    this.logViewedByMe();
    if (this.parentScreenName && (this.parentScreenName === 'confirmationScreen' || this.parentScreenName === 'eventsScreen')) {
      this.showConfirmationButton = false;
    } else {
      this.showConfirmationButton = true;
    }
    const pageName = window.location.href;
    if (pageName.indexOf('event') > -1) {
      this.showConfirmationButton = false;
      this.isEventStoneTab = false;
      this.isHoldStoneTab = false;
      this.showAllbuttons = false;
      this.requestHoldButton = false;
      this.applyDDCButton = false;
      this.viewRequestButton = false;
      this.addNoteButton = false;
    }
    if (pageName.indexOf('confirmations') > -1) {
      this.showAllbuttons = false;
      this.requestHoldButton = false;
      this.applyDDCButton = false;
      this.confirmStoneButton = false;
      this.viewRequestButton = false;
      this.addNoteButton = false;
    }
    if (pageName.indexOf('hold-list') > -1) {
      this.isHoldStoneTab = false;
      this.requestHoldButton = false;
      this.applyDDCButton = false;
      this.confirmStoneButton = true;
      this.viewRequestButton = false;
      this.addNoteButton = false;
    }
    if (pageName.indexOf('basket') > -1) {
      this.basketButton = false;
      this.requestHoldButton = true;
      this.applyDDCButton = true;
      this.confirmStoneButton = true;
      this.viewRequestButton = true;
      this.addNoteButton = true;
    }
    if (pageName.indexOf('bid-to-buy') > -1) {
      this.basketButton = true;
      this.requestHoldButton = false;
      this.applyDDCButton = false;
      this.confirmStoneButton = false;
      this.viewRequestButton = true;
      this.addNoteButton = true;

    }
    if (pageName.indexOf('dayp-stones') > -1 && this.isDaypActive) {
      this.basketButton = false;
      this.requestHoldButton = false;
      this.applyDDCButton = false;
      this.confirmStoneButton = false;
      this.viewRequestButton = true;
      this.addNoteButton = true;
    }

    if (pageName.indexOf('search-result') === -1 &&
      pageName.indexOf('twin-diamonds-result') === -1 &&
      pageName.indexOf('ddc-stones') === -1 &&
      pageName.indexOf('packet') === -1 &&
      pageName.indexOf('bid-to-buy') === -1 &&
      pageName.indexOf('dayp-stones') === -1 &&
      pageName.indexOf('basket') === -1) {
      window.scrollTo(0, 0);
    } else {
      this.isSearchResultPage = true;
    }
  }

  getTagList() {
    this.stoneDetailsService.getTagDetails().subscribe(response => {
      if (response && response.data && response.data.length > 0
        && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MSG_SUCCESS_GET_TAG_DETAILS_200)) {
        response.data.forEach(tagValue => {
          this.tagList.push({ label: tagValue.tag_name, value: tagValue.tag_id });
          this.stoneDetails.tags.forEach(item => {
            if (tagValue.tag_id === +item.tagId) {
              const tagIndex = this.tagList.indexOf(tagValue);
              this.tagList.splice(tagIndex, 1);
            }
          });
        });
      }
    }, err => {
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  ngOnChanges() {
    if (this.isDaypActive) {
      this.basketButton = false;
      this.requestHoldButton = false;
      this.applyDDCButton = false;
      this.confirmStoneButton = false;
      this.viewRequestButton = true;
      this.addNoteButton = true;
    } else {
      this.basketButton = false;
      this.requestHoldButton = false;
      this.applyDDCButton = true;
      this.confirmStoneButton = true;
      this.viewRequestButton = true;
      this.addNoteButton = true;
    }
  }

  logViewedByMe() {
    if (this.stoneDetails) {
      this.stoneDetailsService.incrementStoneView(this.stoneDetails.stone_id).subscribe(res => {
        this.notify.notifyStoneStateUpdated({ source: 'onlineViewIncrement', stoneList: [this.stoneDetails.stone_id] });
      });
    }
  }

  showAddTags(stoneId) {
    this.showTagsList = !this.showTagsList;
  }

  clearSelectedTag() {
    this.selectedTags = [];
  }
  ngViewAfterInit() {

  }

  addNewTags(event, stoneId) {
    $('#tagListDropbox').keydown(function (e) {
      if (e.keyCode === 13 && this.enterKeyPressCount === 0) {
        this.attachTag(null, e.currentTarget.outerText.trim(), stoneId);
        this.enterKeyPressCount = this.enterKeyPressCount + 1;
      }
    }.bind(this));

    const eventOccured = event.originalEvent.type;
    if (eventOccured === 'click') {
      this.attachTag(event.value, null, stoneId);
    }
  }

  attachTag(tag_id, tag_name, stoneId) {
    this.showLoadingSymbol = !this.showLoadingSymbol;
    let selectedIndex = 0;
    this.tagList.forEach(tag => {
      if (tag_name === null) {
        if (tag.value === tag_id) {
          tag_name = tag.label;
          selectedIndex = this.tagList.indexOf(tag);
        }
      } else {
        if (tag.label === tag_name) {
          tag_id = tag.value;
          selectedIndex = this.tagList.indexOf(tag);
        }
      }
    });

    if (this.stoneDetails.tags.indexOf(tag_name) < 0) {
      this.stoneDetailsService.attachTagToStones(stoneId, tag_id, tag_name).subscribe(response => {
        if (response && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MSG_SUCCESS_TAG_ATTACHED_TO_STONE_200)) {
          if (response.data && response.data.length > 0) {
            const selectedTagArray = [];
            selectedTagArray.push(tag_name);
            this.storeTagToES(selectedTagArray, stoneId, response.data, selectedIndex);
          }
        }
      }, error => {
        this.messageService.showErrorGrowlMessage('TAGS_NOT_ADDED');
      });
    }
  }

  changeMultimedia(image, video, ha, verify, cert, plott, digiPlot) {
    this.imageShow = image;
    this.videoShow = video;
    this.haShow = ha;
    this.verifyShow = verify;
    this.certShow = cert;
    this.plotShow = plott;
    this.digiPlotShow = digiPlot;
    this.enlargeMediaType = image ? 'Image' : video ? 'Video' : ha ? 'HA' : cert ? 'PDF' : plott ? 'Plotting' : digiPlot ? 'Digiplott' : '';
  }

  filterSelected(divId, btnId) {
    jQuery('.btn-tab').removeClass('detail-tab-active');
    jQuery('#' + btnId).addClass('detail-tab-active');
    const filterItem = jQuery('#' + divId).offset().top;
    if (this.isSearchResultPage) {
      jQuery('#stonedetailssearch').animate({
        scrollTop: (filterItem)
      }, 800);
    } else {
      jQuery('html, body').animate({
        scrollTop: (filterItem - 80)
      }, 800);
    }
  }
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
    this.thmDdcOverlay.selectedDdcHour = 0;
    if (this.stoneDetails.hasOwnProperty('ddcHour') && Number(this.stoneDetails.ddcHour) > 0) {
      this.definedDDCHour = Number(this.stoneDetails.ddcHour);
    }
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
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_SC_DUH_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_SC_ISH_200)) {
            this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
          }
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

  toggleMultimediaOverlay(flag) {
    // this.stoneMultimediaInfo = this.stoneDetails;
    if (!flag) {
      this.themeMultimediaPopUp.changePopUpMultimedia(this.imageShow, this.videoShow, this.haShow, this.certShow, this.plotShow, this.digiPlotShow, this.stoneDetails);
    } else {
      this.themeMultimediaPopUp.changePopUpMultimedia(false, false, false, false, false, true, this.stoneDetails);
    }
    this.toggleMultimediaPopup = true;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  userActionFunction(actionType, item) {
    const stoneId = this.stoneDetails.stone_id;
    const tagId = item.tagId;
    this.showLoadingSymbol = !this.showLoadingSymbol;
    this.stoneDetailsService.storeUserActionOnTag(stoneId, tagId, actionType).subscribe(response => {
      if (response && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MSG_SUCCESS_ACTION_UPDATED_TAG_DETAILS_200)) {
        this.stoneDetails.tags = response.data.tags.slice();
        if (response.data.removeTagStatus) {
          const selectedTagArray = [];
          selectedTagArray.push(item.tagName);
          this.removeTagToES(selectedTagArray, stoneId);
          this.tagList.push({ label: item.tagName, value: +item.tagId });
        }
        this.showLoadingSymbol = !this.showLoadingSymbol;
      } else {
        this.showLoadingSymbol = !this.showLoadingSymbol;
      }
    }, err => {
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      this.showLoadingSymbol = !this.showLoadingSymbol;
    });
  }

  storeTagToES(selectedTagArray, stoneId, tagResponse, selectedIndex) {
    this.searchService.addTagsToStones(selectedTagArray, stoneId).subscribe((res) => {
      if (!res.error_status) {
        this.stoneDetails.tags = Object.assign([], tagResponse);
        this.selectedTags = [];
        this.tagList.splice(selectedIndex, 1);
        this.showTagsList = !this.showTagsList;
        this.showLoadingSymbol = !this.showLoadingSymbol;
        this.enterKeyPressCount = 0;
      } else {
        this.messageService.showErrorGrowlMessage('TAGS_NOT_ADDED');
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }

  removeTagToES(selectedTagArray, stoneId) {
    this.searchService.removeTagsToStones(selectedTagArray, stoneId).subscribe((res) => {
      if (!res.error_status) {
        this.selectedTags = [];
        this.showTagsList = !this.showTagsList;
      } else {
        this.messageService.showErrorGrowlMessage('TAGS_NOT_REMOVED');
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }
}
