import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ViewChild } from '@angular/core';
import { AuthService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageService } from '@srk/core';
import { ApiService } from '../../services/api.service';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { LoggerService } from '@srk/core';
import { ThmConfirmOverlayComponent } from '../thm-confirm-overlay/thm-confirm-overlay.component';
import { BidToBuyService } from '../../services/bid-to-buy.service';
import { StoneDetailsService } from '../../services/stone-details.service';
import { AddNoteService } from '../../services/add-note.service';
import * as _ from 'underscore';
@Component({
  selector: 'thm-stone-compare',
  templateUrl: './thm-stone-compare.component.html',
  styleUrls: ['./thm-stone-compare.component.scss']
})
export class ThmStoneCompareComponent implements OnInit, OnChanges {
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @ViewChild(ThmConfirmOverlayComponent) thmConfirmOverlayComponent;
  @Output() refreshAllNotes = new EventEmitter();
  @Output() noStoneAvailable = new EventEmitter();
  @Input() stoneData: any;
  public imageShow = true;
  public videoShow = false;
  public haShow: any;
  public verifyShow: any;
  public certShow: any;
  public plotShow: any;
  public toggleMultimediaPopup = false;
  public selectedButtons = [];
  public showValue = false;
  public selectedStones = [];
  public apiLink: any;
  public ddcOverlayVisible = false;
  public definedDDCHour: any;
  public ddcStones = [];
  public confirmOverlayVisible = false;
  public requestPopupVisible = false;
  public stoneConfirmedSubscription: any;
  public btbOverlayVisible = false;
  public btbSelectedStones = [];
  public isBTBDataLoaded = false;
  public isBTBClosed = false;
  public addnoteOverlayVisible = false;
  public commentsOverlayVisible = false;
  public allNotesForStone: any;
  public stoneMultimediaInfo: any;
  public showSubmitButton = true;
  public showHoldButton = true;
  public stoneButtonList: any;
  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private notify: NotifyService,
    private apiService: ApiService,
    private logger: LoggerService,
    private bidToBuyService: BidToBuyService,
    private stoneDetailsService: StoneDetailsService,
    private notesService: AddNoteService
  ) { }

  ngOnInit() {
    this.assignButtonsAsPerPage();
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      if (res.source) {
        this.updateStoneStateDetails(res);
      }
    });
  }

  assignButtonsAsPerPage() {
    this.stoneButtonList = {
      addNote: true,
      addBasket: true,
      requestHold: true,
      applyDDC: true,
      confirmButton: true,
      viewRequest: true
    };
    if (window.location.href.indexOf('bid-to-buy') > -1) {
      this.stoneButtonList = {
        addNote: true,
        addBasket: true,
        requestHold: false,
        applyDDC: false,
        confirmButton: false,
        viewRequest: true
      };
    } else if (window.location.href.indexOf('dayp') > -1) {
      this.stoneButtonList = {
        addNote: true,
        addBasket: false,
        requestHold: false,
        applyDDC: false,
        confirmButton: false,
        viewRequest: true
      };
    } else if (window.location.href.indexOf('ddc') > -1) {
      this.stoneButtonList = {
        addNote: true,
        addBasket: true,
        requestHold: false,
        applyDDC: true,
        confirmButton: true,
        viewRequest: false
      };
    } else if (window.location.href.indexOf('hold') > -1) {
      this.stoneButtonList = {
        addNote: false,
        addBasket: false,
        requestHold: false,
        applyDDC: false,
        confirmButton: true,
        viewRequest: false
      };
    } else if (window.location.href.indexOf('basket') > -1) {
      this.stoneButtonList = {
        addNote: true,
        addBasket: false,
        requestHold: true,
        applyDDC: true,
        confirmButton: true,
        viewRequest: true
      };
    }
  }

  ngOnChanges() {
    if (this.stoneData) {
      this.initializeStoneCompare();
    }
  }

  onChangeSelectedStones(checked, selectedStone) {
    if (window.location.href.indexOf('twin-diamonds') !== -1) {
      if (checked) {
        this.stoneData.forEach(stone => {
          if (selectedStone.std_grp_no === stone.std_grp_no) {
            this.selectedStones.push(stone.stone_id);
          }
        });
      } else {
        const currentlySelected = this.selectedStones;
        this.stoneData.forEach(stone => {
          if (selectedStone.std_grp_no === stone.std_grp_no) {
            const i = currentlySelected.indexOf(stone.stone_id);
            if (i > -1) {
              currentlySelected.splice(i, 1);
            }
          }
        });
        this.selectedStones = currentlySelected;
      }
    }
    this.selectedStones = this.stoneDetailsService.removeDuplicateItemFromArray(this.selectedStones);
  }

  initializeStoneCompare() {
    this.selectedStones = [];
    this.stoneData.forEach(stone => {
      stone['imageShow'] = true;
      stone['videoShow'] = false;
      stone['haShow'] = false;
      stone['verifyShow'] = false;
      stone['certShow'] = false;
      stone['plotShow'] = false;
      stone['digiPlotShow'] = false;
    });
  }

  changeMultimedia(image, video, ha, verify, cert, plott, digiplot, stone) {
    stone['imageShow'] = image;
    stone['videoShow'] = video;
    stone['haShow'] = ha;
    stone['verifyShow'] = verify;
    stone['certShow'] = cert;
    stone['plotShow'] = plott;
    stone['digiPlotShow'] = digiplot;
  }

  closeStoneObject(id) {
    if (this.stoneData.length && this.stoneData.length < 3) {
      this.messageService.showErrorGrowlMessage('Compare Cannot have less than two stones.');
    } else {
      this.stoneData.forEach(stone => {
        if (stone.stone_id === id) {
          const i = this.stoneData.indexOf(stone);
          this.stoneData.splice(i, 1);
        }
      });
      const i = this.selectedStones.indexOf(id);
      if (i > -1) {
        this.selectedStones.splice(i, 1);
      }
      if (!this.stoneData && this.stoneData.length < 1) {
        this.noStoneAvailable.emit({ status: true });
      }
    }
  }

  toggleMultimediaOverlay(stone) {
    this.themeMultimediaPopUp.changePopUpMultimedia(stone.imageShow, stone.videoShow, stone.haShow, stone.certShow, stone.plotShow, stone.digiPlotShow, stone);
    this.toggleMultimediaPopup = true;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }
  /*********** Basket ***************/
  addToMyBasket() {
    this.selectedStones = this.createDeepCopyArray();
    this.apiLink = this.authService.getApiLinkForKey('add_basket_btn', '');
    const servicedata = '{"stone_ids":' + JSON.stringify(this.selectedStones) + '}';
    if (this.selectedStones.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.apiService.postCall('ThmStoneCompareComponent:addToMyBasket', this.apiLink, servicedata).subscribe((response) => {
        this.notify.hideBlockUI();
        if (response !== undefined) {
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_NSF_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SS_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'basketRequested', stoneList: this.selectedStones });
            this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SNE_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          }
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('ERR_SAVE_STONE_BASKET');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  /*******************************************/


  /*********** request hold ***************/
  requestHold(array) {
    this.selectedStones = this.createDeepCopyArray();
    this.apiLink = this.authService.getApiLinkForKey('request_hold_btn', '');
    const servicedata = '{"stone_ids":' + JSON.stringify(this.selectedStones) + '}';
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.apiService.postCall('ThmStoneCompareComponent:addToMyHold', this.apiLink, servicedata).subscribe((response) => {
        this.notify.hideBlockUI();
        if (response !== undefined) {
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_SC_DUH_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_SC_ISH_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'holdRequested', stoneList: this.selectedStones, status: true });
            this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_PARTIAL_HOLD_201)) {
            const stoneIds = response.data.stone_ids;
            const differenceStones = _.difference(this.selectedStones, stoneIds);
            this.notify.notifyStoneStateUpdated({ source: 'holdRequested', stoneList: differenceStones, status: true });
            const params = { holdStones: differenceStones.toString() };
            this.messageService.showDynamicSuccessGrowlMessage('PARTIAL_HOLD_APPLIED', params);
          }
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  /************************************************/

  /*********** confirmations ***************/
  confirmDiamonds() {
    const stoneIds = this.createDeepCopyArray();
    if (stoneIds.length > 0) {
      this.logger.logInfo('ThmSelectedStonePanelComponent', 'User action to confirm these stones :- ' + JSON.stringify(stoneIds));
      this.thmConfirmOverlayComponent.checkOrderDetails();
      this.thmConfirmOverlayComponent.verifyDiamondConfirmation(stoneIds);
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleConfirmOverlay(e) {
    this.confirmOverlayVisible = e.visible;
  }
  /**************************************************/

  /**********VIEW REQUEST*********************************/
  toggleOverlay(e) {
    this.requestPopupVisible = e.visible;
  }

  toggleViewRequestOverlay() {
    this.apiLink = this.authService.getApiLinkForKey('view_request_btn', '');
    this.selectedStones = this.createDeepCopyArray();
    if ((this.selectedStones).length !== 0) {
      this.requestPopupVisible = !this.requestPopupVisible;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }
  /****************************************************/
  applyDDC() {
    let countOfInvalideStone = 0;
    this.selectedStones = JSON.parse(JSON.stringify(this.selectedStones));
    this.ddcStones = [];
    this.definedDDCHour = 0;
    this.selectedStones.forEach((value) => {
      this.stoneData.forEach(stone => {
        if (stone.stone_id === value && stone.business_process) {
          this.ddcStones.push(stone.stone_id);
        }
        if (stone.business_process !== true) {
          countOfInvalideStone++;
        }
      });
    });
    if (this.ddcStones.length > 0 && countOfInvalideStone !== this.ddcStones.length) {
      this.ddcOverlayVisible = true;
    } else {
      if (countOfInvalideStone > 0) {
        this.messageService.showErrorGrowlMessage('SELECTED_STONE_NV_DDC');
      } else {
        this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
      }
    }
  }

  toggleDdcOverlay(e) {
    this.ddcOverlayVisible = e.visible;
  }

  updateDDC(stoneData) {
    this.ddcStones = [];
    this.thmDdcOverlay.selectedDdcHour = 0;
    this.definedDDCHour = 0;
    this.ddcStones.push(stoneData.stone_id);
    if (stoneData.ddcHour > 0) {
      this.definedDDCHour = stoneData.ddcHour;
    }
    this.logger.logInfo('ThmStoneCompareComponent', 'User action to update ddc these stones :- ' + JSON.stringify(this.ddcStones));
    this.ddcOverlayVisible = true;
  }

  openBTB(data) {
    this.btbSelectedStones = [];
    this.isBTBDataLoaded = false;
    this.isBTBClosed = false;
    this.bidToBuyService.getBTBPopuStone(data.stone_id).subscribe((response) => {
      data.bid_rate = null;
      data.offer_per_disc = null;
      data.bid_percentage = null;
      data.offer_per_disc_diff = null;
      if (!response.is_btb_active) {
        this.isBTBClosed = true;
        this.isBTBDataLoaded = true;
        return;
      }
      if (response !== undefined) {
        if (!response.error_status) {
          this.btbSelectedStones = data;
          if (response.data) {
            response.data.forEach(element => {
              this.stoneDetailsService.getB2BPopupData(element, this.btbSelectedStones);
            });
          }
        }
        this.isBTBDataLoaded = true;
      }
    });
    this.btbOverlayVisible = true;
  }

  toggleBTBOverlay(e) {
    this.btbOverlayVisible = e.visible;
  }

  addNoteForStone(array) {
    this.selectedStones = this.createDeepCopyArray();
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.addnoteOverlayVisible = true;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleAddNoteOverlay(e) {
    if (e.forAddNote) {
      this.addnoteOverlayVisible = e.visible;
    } else {
      this.commentsOverlayVisible = e.visible;
    }
    if (e.noteDetil) {
      this.refreshAllNotes.emit({ status: true });
      this.stoneData = this.notesService.fetchStonesComment(this.stoneData);
    }
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    if (stoneList && this.stoneData) {
      stoneList.forEach(confirmStoneId => {
        this.stoneData.forEach(tableStone => {
          if (tableStone.stone_id === confirmStoneId) {
            if (res.source === 'confirmedStones' || res.source === 'holdRequested') {
              if (this.stoneData.length < 3) {
                this.noStoneAvailable.emit({ status: true });
              } else {
                this.closeStoneObject(confirmStoneId);
              }
            } else if (res.source === 'ddcRequested') {
              tableStone['ddcStatus'] = res.status;
              tableStone['ddcHour'] = res.hour;
            } else if (res.source === 'basketRequested') {
              tableStone['isBasket'] = 1;
              tableStone['basketStatus'] = '=';
            } else if (res.source === 'viewRequested') {
              if (tableStone.viewRequestStatus !== 2) {
                tableStone['totalViewRequest']++;
              }
            } else if (res.source === 'b2bRequested') {
              tableStone['isBtbUpdated'] = res.status;
            }
          }
        });
      });
    }
  }

  createDeepCopyArray() {
    let stoneIds = [];
    stoneIds = this.selectedStones;
    return JSON.parse(JSON.stringify(stoneIds));
  }
}
