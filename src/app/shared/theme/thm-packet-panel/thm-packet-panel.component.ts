import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChange, OnDestroy } from '@angular/core';
import { PacketPanelService } from '../../services/packet-panel.service';
import { ThmConfirmOverlayComponent } from '../thm-confirm-overlay/thm-confirm-overlay.component';
import { LoggerService } from '@srk/core';
import { UserProfileService } from '@srk/core';
import { ApiService } from '../../services/api.service';
import { MessageService } from '@srk/core';
import { AuthService } from '@srk/core';
import { StoneDetailsService } from '../../services/stone-details.service';
import { ConfirmationService } from 'primeng/components/common/api';
import { CustomTranslateService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { BidToBuyService } from '../../services/bid-to-buy.service';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { DownloadStonesService } from '../../services/download-stones.service';
import { AddNoteService } from '../../services/add-note.service';
import { UtilService } from '../../services/util.service';
import { DaypService } from '../../services/dayp.service';
import { EventDetailsService } from '@srk/core';

@Component({
  selector: 'thm-packet-panel',
  templateUrl: './thm-packet-panel.component.html',
  styleUrls: ['./thm-packet-panel.component.scss']
})
export class ThmPacketPanelComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild(ThmConfirmOverlayComponent) thmConfirmOverlayComponent;
  @ViewChild('packetGridComponent') packetGridComponent;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;

  @Input() packet: any;
  @Input() panelData: any;
  @Input() packetConfiguration: any[];
  @Input() showTable: boolean;
  @Output() removeStone = new EventEmitter();
  @Output() saveStone = new EventEmitter();

  public stoneConfirmedSubscription: any;
  public packetSelectedStones: any[] = [];
  public displayStoneTable = false;
  public apiLink: any;
  public packetConfirmOverlayVisible = false;
  public addToPacketPopup = false;
  public packetNameList: any[] = [];
  public selectedPacketStoneID: any;
  public selectedPacketName: any[] = [];
  public preSelectedPackets: any[] = [];
  public popupRequestVisible = false;
  public ddcOverlayVisible = false;
  public definedDDCHour: any;
  public ddcStones: any[] = [];
  public btbOverlayVisible = false;
  public selectedStones: any[];
  public btbSelectedStones: any[];
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;
  public isBTBDataLoaded = false;
  public isBTBClosed = false;
  public downloadPopOverVisible = false;
  public downloadOptions: any[];
  public selectedDownloadType: any;
  public selectedColumnList: any;
  public commentsOverlayVisible = false;
  public allNotesForStone: any[] = [];
  public addnoteOverlayVisible = false;
  public isPreDaypActive = false;
  public selectedStonesObject = [];
  public toggleComparePopup = false;
  public isDaypPermissible = false;
  public isAllResultSelected = false;
  public isPreSelectEventPermissible = false;
  public eventDetails: any;
  public isEventPacketTab = false;
  public isColumnExpanded = false;
  public timer;
  public columnWidth = 180;
  public isIconVisible = false;
  public selectedStoneLabel: any[] = [];
  public allColumnWidth: any;
  public viewFinalPayableAndFinalOff = this.stoneSvc.showFinalPayableAndFinalOff();
  constructor(
    private utilService: UtilService,
    private packetPanelSvc: PacketPanelService,
    private apiService: ApiService,
    private logger: LoggerService,
    private messageService: MessageService,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private notify: NotifyService,
    private stoneSvc: StoneDetailsService,
    private confirmationService: ConfirmationService,
    private customTranslateSvc: CustomTranslateService,
    private downloadSvc: DownloadStonesService,
    public bidToBuyService: BidToBuyService,
    private daypSvc: DaypService,
    private notesService: AddNoteService,
    private eventDetailsService: EventDetailsService
  ) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.daypSvc.checkPreDaypStatus().subscribe(res => {
      if (!res['error_status'] && MessageCodesComparator.AreEqual(res['code'], MessageCodes.DAYP_EF_200)) {
        this.isPreDaypActive = res['data'].isDAYPEventOn;
      }
    });
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    if (this.showTable === true) {
      this.displayStoneTable = true;
    }
    this.packet.data.stone_details = this.utilService.updateStonesForDecimal(this.packet.data.stone_details);
    this.packet.data.stone_details = this.notesService.fetchStonesComment(this.packet.data.stone_details);
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      this.updateStoneStateDetails(res);
    });
    if (window.location.href.indexOf('event') !== -1) {
      this.isEventPacketTab = true;
    }
    this.eventDetailsService.checkPreEventSelectionPermission().subscribe(res => {
      let flag = false;
      if (!res['error_status']) {
        if (MessageCodesComparator.AreEqual(res['code'], MessageCodes.EVENT_SEL_PFS_200)) {
          flag = true;
          if (res.hasOwnProperty('data')) {
            this.eventDetails = this.eventDetailsService.reorderEventDetails(res['data'], 'button_order');
          }
        } else if (MessageCodesComparator.AreEqual(res['code'], MessageCodes.EVENT_NEF_200)) {
          flag = false;
        }
      }
      this.isPreSelectEventPermissible = flag;
    }, error => {
      this.isPreSelectEventPermissible = false;
    });
  }

  ngOnChanges() {
    if (this.packetConfiguration !== undefined) {
      this.createShowPacketPopupList();
    }
  }

  createShowPacketPopupList() {
    this.packetNameList = [];
    this.packetConfiguration.forEach((config) => {
      for (const key in config) {
        if (config.hasOwnProperty(key)) {
          this.packetNameList.push({ label: config[key].packet_name, value: key });
        }
      }
    });
    this.packet.data.stone_details = this.utilService.updateStonesForDecimal(this.packet.data.stone_details);
    this.packetNameList = this.stoneSvc.removeDuplicateItemFromArray(this.packetNameList);
  }

  viewSelectedStoneTable() {
    this.displayStoneTable = !this.displayStoneTable;
    if(this.displayStoneTable){
      this.stoneSvc.storeStoneAdditionalInfo(this.packet.data.stone_details).subscribe((response) => {
        if (response) {
          this.stoneSvc.getDiamondPriceInfo(this.packet.data.stone_details).subscribe((responseObj) => {
            this.packet.data.stone_details = responseObj;
            this.packet.data.display_data = this.stoneSvc.calculateSelectedStoneData(this.packet.data.stone_details);
          });
        }
      });
    }
  }

  showPacketPopup(data) {
    this.createShowPacketPopupList();
    this.selectedPacketStoneID = [data];
    this.getStoneLabel();
    this.preSelectedPackets = [];
    this.selectedPacketName = [];
    this.packetConfiguration.forEach((config) => {
      for (const key in config) {
        if (config[key].stones !== undefined) {
          config[key].stones.forEach((stoneID) => {
            if (stoneID === data.stone_id) {
              this.preSelectedPackets.push(key);
              this.selectedPacketName = this.preSelectedPackets;
            }
          });
        }
      }
    });
    this.addToPacketPopup = !this.addToPacketPopup;
  }

  addStoneToPacket() {
    this.createShowPacketPopupList();
    const list = [];
    if (this.packetSelectedStones.length > 0) {
      this.packetSelectedStones.forEach(id => {
        if (this.packet.data.stone_details.length > 0) {
          this.packet.data.stone_details.forEach(stone => {
            if (id === stone.stone_id) {
              list.push(stone);
            }
          });
        }
      });
      if (list.length > 0) {
        this.selectedPacketName = null;
        this.selectedPacketStoneID = list;
        this.getStoneLabel();
        this.selectedPacketName = [];
        this.addToPacketPopup = !this.addToPacketPopup;
      }
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  savePacketStone() {
    this.addToPacket(this.selectedPacketName);
    const removeList = [];
    this.selectedPacketName.forEach((newPacketSelected) => {
      this.preSelectedPackets.forEach((previouslyPacketSelected) => {
        if (newPacketSelected === previouslyPacketSelected) {
          removeList.push(previouslyPacketSelected);
        }
      });
    });
    removeList.forEach((element) => {
      this.preSelectedPackets.forEach((preSelected) => {
        if (element === preSelected) {
          this.packetPanelSvc.removeElement(this.preSelectedPackets, preSelected);
        }
      });
    });
    this.preSelectedPackets = this.stoneSvc.removeDuplicateItemFromArray(this.preSelectedPackets);
    this.removeFromPacket(this.preSelectedPackets);
    this.addToPacketPopup = false;
  }

  addToPacket(array) {
    array.forEach((value) => {
      const data = {
        'packet_id': value,
        'stones': this.selectedPacketStoneID
      };
      this.saveStone.emit(data);
    });
  }

  removeFromPacket(array) {
    array.forEach((value) => {
      const data = {
        'packet_id': value,
        'stones': this.selectedPacketStoneID
      };
      this.removeStone.emit(data);
    });
  }

  removeSingleStone(stoneID, packetID) {
    const removeMessage = this.customTranslateSvc.translateString('Are you sure, you want to remove this stone?');
    const removeStone = this.customTranslateSvc.translateString('Remove stone');
    this.confirmationService.confirm({
      message: removeMessage,
      header: removeStone,
      accept: () => {
        this.deleteStone(stoneID, packetID);
      }
    });
  }

  deleteStone(stoneID, packetID) {
    this.packet.data.stone_details.forEach((stone) => {
      if (stone.stone_id === stoneID) {
        this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
        this.packetPanelSvc.removeStoneFromPacket(packetID, [stoneID]).subscribe((res) => {
          this.notify.hideBlockUI();
          if (MessageCodesComparator.AreEqual(res.code, MessageCodes.PS_RM_ST_200)) {
            const i = this.packet.data.stone_details.indexOf(stone);
            this.packet.data.stone_details.splice(i, 1);
            if (this.packet.data.stone_details.length > 0) {
              this.stoneSvc.getDiamondPriceInfo(this.packet.data.stone_details).subscribe(response => {
                this.packet.data.stone_details = response;
                this.packet.data.display_data = this.stoneSvc.calculateSelectedStoneData(response);
              });
            } else {
              this.packet.data.isSelected = false;
              this.packet.data.display_data = {};
            }
            this.messageService.showSuccessGrowlMessage(MessageCodes.PS_RM_ST_200);
            // this.packetConfiguration = this.packetPanelSvc.removeStoneFromPacketConfiguration(this.packetConfiguration, event);
            this.notify.updatePacketinTable({ packet: this.packet });
          } else {
            this.messageService.showErrorGrowlMessage('STONE_NOT_FOUND');
          }
        }, error => {
          this.notify.hideBlockUI();
          this.messageService.showErrorGrowlMessage('Error while removing stone from packet');
        });
      }
    });
  }

  togglePacketConfirmOverlay(e) {
    this.packetConfirmOverlayVisible = e.visible;
    const availableStones = this.packetPanelSvc.getValidAvailableStones(this.packet.data.stone_details);
    this.panelData = this.stoneSvc.calculateSelectedStoneData(availableStones);
  }

  confirmPacketDiamonds() {
    this.packetSelectedStones = JSON.parse(JSON.stringify(this.packetSelectedStones));
    if (this.packetSelectedStones.length > 0) {
      this.logger.logInfo('ThmPacketPanelComponent', 'User action to confirm these stones :- ' + JSON.stringify(this.packetSelectedStones));
      this.thmConfirmOverlayComponent.checkOrderDetails();
      this.thmConfirmOverlayComponent.verifyDiamondConfirmation(this.packetSelectedStones);
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  /*********** Basket ***************/
  addToMyBasket() {
    this.packetSelectedStones = JSON.parse(JSON.stringify(this.packetSelectedStones));
    if (this.packetSelectedStones.length > 0) {
      this.apiLink = this.authService.getApiLinkForKey('add_basket_btn', '');
      const servicedata = '{"stone_ids":' + JSON.stringify(this.packetSelectedStones) + '}';
      this.apiService.postCall('SearchResultComponent:addToMyBasket', this.apiLink, servicedata).subscribe((response) => {
        if (response !== undefined) {
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_NSF_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SS_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'basketRequested', stoneList: this.packetSelectedStones });
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

  /*********** request hold ***************/
  requestHold() {
    this.packetSelectedStones = JSON.parse(JSON.stringify(this.packetSelectedStones));
    if (this.packetSelectedStones.length > 0) {
      this.apiLink = this.authService.getApiLinkForKey('request_hold_btn', '');
      const servicedata = '{"stone_ids":' + JSON.stringify(this.packetSelectedStones) + '}';
      this.apiService.postCall('SearchResultComponent:addToMyHold', this.apiLink, servicedata).subscribe((response) => {
        if (response !== undefined) {
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_SC_DUH_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_SC_ISH_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'holdRequested', stoneList: this.packetSelectedStones, status: true });
            const availableStones = this.packetPanelSvc.getValidAvailableStones(this.packet.data.stone_details);
            this.panelData = this.stoneSvc.calculateSelectedStoneData(availableStones);
            this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
          }
        }
      }, error => {
        this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_HOLD');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleRequestOverlay() {
    this.packetSelectedStones = JSON.parse(JSON.stringify(this.packetSelectedStones));
    if (this.packetSelectedStones.length > 0) {
      this.apiLink = this.authService.getApiLinkForKey('view_request_btn', '');
      this.popupRequestVisible = !this.popupRequestVisible;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleRequestPopup(e) {
    this.popupRequestVisible = e.visible;
  }

  /******************* DDC *******************************/

  applyDdc() {
    let countOfInvalideStone = 0;
    this.selectedStones = JSON.parse(JSON.stringify(this.packetSelectedStones));
    this.ddcStones = [];
    this.definedDDCHour = 0;
    this.selectedStones.forEach((value) => {
      this.packet.data.stone_details.forEach(stone => {
        if (stone.stone_id === value) {
          this.ddcStones.push(stone.stone_id);
          if (stone.business_process !== true) {
            countOfInvalideStone++;
          }
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

  checkStoneDDC(e) {
    if (!e.error_status) {
      this.notify.notifyStoneStateUpdated({ source: 'ddcRequested', stoneList: e.stones, status: 'ACTIVE', hour: e.ddc_hcode });
      this.ddcStones = [];
    }
  }

  updateDDC(stoneData) {
    this.ddcStones = [];
    this.thmDdcOverlay.selectedDdcHour = 0;
    this.definedDDCHour = 0;
    this.ddcStones.push(stoneData.stone_id);
    if (stoneData.ddcHour > 0) {
      this.definedDDCHour = stoneData.ddcHour;
    }
    this.ddcOverlayVisible = true;
  }

  removeDDC(e) {
    if (!e.error_status) {
      this.notify.notifyStoneStateUpdated({ source: 'ddcRequested', stoneList: e.stones, status: '', hour: 0 });
      this.packetSelectedStones = [];
    }
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
      if (!response['is_btb_active']) {
        this.isBTBClosed = true;
        this.isBTBDataLoaded = true;
        return;
      }


      if (response !== undefined) {
        if (!response['error_status']) {
          this.btbSelectedStones = data;
          if (response['data']) {
            response['data'].forEach(element => {
              this.stoneSvc.getB2BPopupData(element, this.btbSelectedStones);
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

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp(stoneInfo);
    this.toggleMultimediaPopup = true;

  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  addStoneInfoTab(data) {
    this.notify.notifyPacketPageForStoneClickedForDetail({ type: 'stoneDtl', 'data': data });
  }

  addTwinStoneInfoTab(pairId) {
    this.notify.notifyPacketPageForStoneClickedForDetail({ 'type': 'twinStoneDtl', 'data': pairId });
  }

  showDownloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_regular_btn');
    this.downloadPopOverVisible = true;
  }

  downloadResult(array) {
    if (this.packetSelectedStones.length > 0) {
      this.downloadSvc.downloadStoneDetails(array, this.packetSelectedStones, this.selectedDownloadType);
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }


  sendExcelMail(array) {
    if (this.packetSelectedStones.length > 0) {
      this.downloadSvc.mailStoneExcel(array, this.packetSelectedStones, 'PACKET ' + this.packet.packet_name);
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  addNoteForStone() {
    if (this.packetSelectedStones && this.packetSelectedStones.length > 0) {
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
      this.refreshNotes();
    }
  }

  refreshNotes() {
    this.packet.data.stone_details = this.notesService.fetchStonesComment(this.packet.data.stone_details);
    this.notify.notifyAddNewComment();
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  /*********** Add to Pre-DAYP Selection ***************/
  addStonesToPreDayp() {
    this.packetSelectedStones = JSON.parse(JSON.stringify(this.packetSelectedStones));
    if (this.packetSelectedStones.length > 0) {
      this.daypSvc.addToPreDAYPSelection(this.packetSelectedStones).subscribe((response) => {
        if (response && !response['error_status'] && MessageCodesComparator.AreEqual(response['code'], MessageCodes.SMS_DAYP_ASDE_200)) {
          this.messageService.showSuccessGrowlMessage(MessageCodes[response['code']]);
          this.notify.notifyStoneStateUpdated({ source: 'addedToPreDayp', stoneList: this.packetSelectedStones });
        } else if (response && MessageCodesComparator.AreEqual(response['code'], MessageCodes.SMS_DAYP_DNA_200)) {
          this.messageService.showInfoGrowlMessage(MessageCodes[response['code']]);
        } else if (response && response['error_status']) {
          this.messageService.showErrorGrowlMessage('ERR_SAVE_STONE_DAYP');
        }
      }, error => {
        this.messageService.showErrorGrowlMessage('ERR_SAVE_STONE_DAYP');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  compareStone() {
    this.selectedStonesObject = [];
    this.toggleComparePopup = true;
    this.selectedStonesObject = this.fetchStoneDetails();
  }

  closeCompareStoneOverlay() {
    this.selectedStonesObject = [];
    this.toggleComparePopup = false;
  }

  fetchStoneDetails() {
    const packetStoneObj = [];
    this.packetSelectedStones.forEach(stone => {
      this.packet.data.stone_details.forEach(stoneObj => {
        if (stoneObj.stone_id === stone) {
          packetStoneObj.push(stoneObj);
        }
      });
    });
    return packetStoneObj;
  }

  isAllStoneSelected(array) {
    if (this.isAllResultSelected) {
      this.packetSelectedStones = [];
      this.packetSelectedStones = this.fetchConfirmableStones(array);
    } else {
      this.packetSelectedStones = [];
    }
    this.updateRowColor();
  }

  stoneSelected(array) {
    let availableStones = [];
    availableStones = this.fetchConfirmableStones(array);
    this.isAllResultSelected = this.stoneSvc.isArrayMatch(this.packetSelectedStones, availableStones);
    this.updateRowColor();
  }

  fetchConfirmableStones(array) {
    const confirmableStones = [];
    array.forEach(element => {
      if (((element.stone_state === 6)
        || (element.stone_state === 0)
        || (element.stone_state === 3 && element.reason_code !== 1))) {
      } else {
        confirmableStones.push(element.stone_id);
      }
    });
    return confirmableStones;
  }

  addStonesToEvent(array, event) {
    if (this.packetSelectedStones.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.eventDetailsService.addStoneToEvent(this.packetSelectedStones, event.event_id).subscribe(res => {
        this.notify.hideBlockUI();
        if (!res.error_status) {
          if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_INS_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'eventAdded', stoneList: this.packetSelectedStones });
            this.messageService.showSuccessGrowlMessage(res.message);
          } else {
            this.messageService.showErrorGrowlMessage('STONE_NOT_ADDED_EVENT');
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

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    if (stoneList && stoneList.length > 0) {
      if (res.hasOwnProperty('b2bAction')) {
        this.stoneSvc.storeStoneAdditionalInfo(this.packet.data.stone_details).subscribe((response) => {
          if (response) {
            this.stoneSvc.getDiamondPriceInfo(this.packet.data.stone_details).subscribe((responseObj) => {
              this.packet.data.stone_details = responseObj;
              this.packet.data.display_data = this.stoneSvc.calculateSelectedStoneData(this.packet.data.stone_details);
            });
          }
        });
      } else {
        if (res.source) {
          stoneList.forEach(stoneId => {
            if (this.packet.data.stone_details.length > 0) {
              this.packet.data.stone_details.forEach(stoneObject => {
                if (stoneObject.stone_id === stoneId) {
                  const i = this.packet.data.stone_details.indexOf(stoneObject);
                  if (res.source === 'confirmedStones') {
                    stoneObject['stone_state'] = 6;
                  } else if (res.source === 'viewRequested') {
                    if (stoneObject.viewRequestStatus !== 2) {
                      stoneObject['totalViewRequest']++;
                    }
                  } else if (res.source === 'ddcRequested') {
                    stoneObject['ddcStatus'] = res.status;
                    stoneObject['ddcHour'] = res.hour;
                  } else if (res.source === 'basketRequested') {
                    stoneObject['isBasket'] = 1;
                    stoneObject['basketStatus'] = '=';
                  } else if (res.source === 'holdRequested') {
                    stoneObject['isOnHold'] = 6;
                    this.packet.data.stone_details.splice(i, 1);
                  } else if (res.source === 'b2bRequested') {
                    stoneObject['isBtbUpdated'] = res.status;
                  } else if (res.source === 'onlineViewIncrement') {
                    stoneObject['totalViewedByUser']++;
                  }
                }
              });
            }
          });
        }
      }
    }
  }

  ngOnDestroy() {
    this.stoneConfirmedSubscription.unsubscribe();
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneSvc.scrollLeft(this.packetGridComponent, '#packetGridContainer');
    } else if (params === 'right') {
      this.stoneSvc.scrollRight(this.packetGridComponent, '#packetGridContainer');
    }
  }

  scrollTableInInterval(params) {
    this.timer = setInterval(() => {
      this.scrollTable(params);
    }, 1);
  }

  stopScrolling() {
    clearInterval(this.timer);
  }

  scrollColumn() {
    this.isColumnExpanded = !this.isColumnExpanded;
    this.isIconVisible = !this.isIconVisible;
    this.stoneSvc.handleSortingOrder(this.packetGridComponent);
    const columns = JSON.parse(JSON.stringify(this.packetGridComponent.columns));
    if (this.isColumnExpanded) {
      columns[1].width = 290;
    } else {
      columns[1].width = 180;
    }
    this.packetGridComponent.columns = columns;
  }

  updateRowColor() {
    if (this.packetGridComponent) {
      this.packet.data.stone_details.forEach((element, index) => {
        this.stoneSvc.showRowColorChanges(this.packetGridComponent, this.packetSelectedStones, element.stone_id, index);
      });
    }
  }

  onCellPrepared(e) {
    if (e.rowType === 'data') {
      this.packetSelectedStones.forEach(stoneId => {
        if (e.key.stone_id === stoneId) {
          this.stoneSvc.changeRowColor(e.cellElement, true);
        }
      });
    }
  }

  getStoneLabel() {
    if (this.selectedPacketStoneID && this.selectedPacketStoneID.length > 0) {
      this.selectedStoneLabel = [];
      this.selectedPacketStoneID.forEach(stone => {
        this.selectedStoneLabel.push(stone.stone_id);
      });
    }
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }
}
