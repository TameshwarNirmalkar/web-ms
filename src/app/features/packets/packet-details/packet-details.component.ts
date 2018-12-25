/* tslint:disable */
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChange, HostListener, OnDestroy, AfterViewInit } from '@angular/core';
import { PacketsService } from '../packets.service';
import { NotifyService } from '@srk/core';
import { UserProfileService } from '@srk/core';
import { ConfirmationService } from 'primeng/components/common/api';
import { MessageService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { AuthService } from '@srk/core';
import { ApiService } from '@srk/shared';
import { StoneDetailsService } from '@srk/shared';
import { Subscription } from 'rxjs/Subscription';
import { ThmConfirmOverlayComponent } from '@srk/shared';
import { AddNoteService } from '@srk/shared';
import { UtilService } from '@srk/shared';
import { PacketPanelService } from '@srk/shared';
import { LoggerService } from '@srk/core';
import { BidToBuyService } from '@srk/shared';
import { DownloadStonesService } from '@srk/shared';
import * as _ from 'underscore';

@Component({
  selector: 'app-packet-details',
  templateUrl: './packet-details.component.html',
  styleUrls: ['./packet-details.component.scss']
})
export class PacketDetailsComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @ViewChild(ThmConfirmOverlayComponent) thmConfirmOverlayComponent;
  @ViewChild('packetGridComponent') packetGridComponent;
  @ViewChild('selectedPacketStonePanel') selectedPacketStonePanel;
  @ViewChild('thmPacketPanel') thmPacketPanelComponent;

  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;

  @Input() packet: any;
  @Input() panelData: any;
  @Input() packetConfiguration: any[];
  @Output() removeStone = new EventEmitter();
  @Output() saveStone = new EventEmitter();

  public packetSelectedStones: any[] = [];
  public stoneConfirmedSubscription: any;
  public displayStoneTable = true;
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
  public isColumnExpanded = false;
  public selectedStonesObject = [];
  public toggleComparePopup = false;
  public isDaypPermissible = false;
  public isAllStoneSelected = false;

  public stoneButtonList: any;
  public selectedStoneObj: any;
  public httpSubscription: Subscription;

  public selectedStoneArray = [];
  public packetStones: any[];
  public timer;
  public columnWidth = 160;
  public isIconVisible = false;
  public selectedStoneLabel: any[] = [];
  public menuDistanceFromTop: any;
  public currentScroll: any;
  public height = window.innerHeight - 252;
  public selectedTableToggle = false;
  public allColumnWidth: any;

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
    private notesService: AddNoteService) {
  }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.stoneButtonList = {
      addNote: true,
      addToEvent: true,
      requestHold: true,
      applyDDC: true,
      addToBasket: true,
      viewRequest: true,
      confirmButton: true,
      addToDayp: true
    };
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.selectedStoneObj = {
      selectedStones: [],
      selectedStoneArray: [],
      panelData: {},
      isAllSelectedStoneSelected: false
    };
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.onWindowScroll();
  }

  ngOnChanges() {
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      if (res.source) {
        this.updateStoneStateDetails(res);
      }
    });
    this.updateSelectedStones();
    this.updatePacketNameList();
  }

  updateSelectedStones() {
    if (this.selectedStoneObj && this.packet.data && this.packet.data.stone_details && this.packet.data.stone_details.length > 0) {
      const stoneList = this.stoneSvc.createStoneIdList(this.selectedStoneObj.selectedStoneArray);
      this.selectedStoneObj.selectedStoneArray = [];
      this.selectedStoneObj.selectedStones = [];
      stoneList.forEach(id => {
        const object = _.findWhere(this.packet.data.stone_details, { stone_id: id });
        if (object) {
          this.selectedStoneObj.selectedStones.push(id);
          this.selectedStoneObj.selectedStoneArray.push(object);
        }
      });
      this.selectedStoneObj.panelData = this.stoneSvc.calculateSelectedStoneData(this.selectedStoneObj.selectedStoneArray);
    }
  }

  updatePacketNameList() {
    if (this.packetConfiguration !== undefined) {
      this.packetNameList = [];
      this.packetConfiguration.forEach((config) => {
        for (const key in config) {
          if (config.hasOwnProperty(key)) {
            this.packetNameList.push({ label: config[key].packet_name, value: key });
          }
        }
      });
      this.packetNameList = this.stoneSvc.removeDuplicateItemFromArray(this.packetNameList);
    }
  }

  ngOnDestroy() {
    this.stoneConfirmedSubscription.unsubscribe();
  }

  updateSelectedStonePanel() {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    this.selectedStoneObj.selectedStones = this.packetSelectedStones;
    this.selectedStoneObj.selectedStoneArray = JSON.parse(JSON.stringify(this.stoneSvc.removeDuplicatesFromObject(this.selectedStoneArray, 'stone_id')));
    this.selectedStoneObj.panelData = {};
    if (this.packetSelectedStones.length > 0) {
      this.selectedStoneObj.isAllSelectedStoneSelected = true;
      this.httpSubscription = this.stoneSvc.getDiamondPriceInfo(this.selectedStoneObj.selectedStoneArray).subscribe(res => {
        this.selectedStoneObj['selectedStoneArray'] = res;
        this.selectedStoneObj['panelData'] = this.stoneSvc.calculateSelectedStoneData(this.selectedStoneObj.selectedStoneArray);
      });
    } else {
      this.selectedStoneObj.isAllSelectedStoneSelected = false;
    }
    this.selectedStoneObj = {...this.selectedStoneObj};
  }

  refreshNotes() {
    this.packet.data.stone_details = this.notesService.fetchStonesComment(this.packet.data.stone_details);
    if (this.selectedStoneObj && this.selectedStoneObj.selectedStoneArray && this.selectedStoneObj.selectedStoneArray.length > 0) {
      this.selectedStoneObj.selectedStoneArray = this.notesService.fetchStonesComment(this.selectedStoneObj.selectedStoneArray);
    }
  }

  updateSelectedStonePacket() {
    if (this.packetSelectedStones.length > 0) {
      this.packetSelectedStones = JSON.parse(JSON.stringify(this.packetSelectedStones));
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  updatePacketStoneArray(e) {
    this.packetSelectedStones = e.array.selectedStones;
    this.selectedStoneArray = e.array.selectedStoneArray;
    this.filterSelectedStones();
    this.updateSelectedStonePanel();
  }


  viewSelectedStoneTable() {
    this.displayStoneTable = !this.displayStoneTable;
  }

  showPacketPopup(data) {
    this.updatePacketNameList();
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
                this.messageService.showSuccessGrowlMessage(MessageCodes.PS_RM_ST_200);
                this.packetConfiguration = this.packetPanelSvc.removeStoneFromPacketConfiguration(this.packetConfiguration, event);
              });
            } else {
              this.packet.data.isSelected = false;
              this.packet.data.display_data = {};
            }
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

  filterSelectedStones() {
    let availableStones = [];
    availableStones = this.fetchConfirmableStones();
    if (availableStones.length > 0) {
      this.isAllStoneSelected = this.stoneSvc.isArrayMatch(this.packetSelectedStones, availableStones);
    }
    this.fetchStoneDetails();
    this.updateSelectedStonePanel();
    this.updateRowColor();
  }

  togglePacketConfirmOverlay(e) {
    this.packetConfirmOverlayVisible = e.visible;
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
      this.packetSelectedStones.forEach(stone => {
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


  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  /*********** Add to Pre-DAYP Selection ***************/
  addStonesToPreDayp() {
    this.packetSelectedStones = JSON.parse(JSON.stringify(this.packetSelectedStones));
    this.apiLink = this.authService.getApiLinkForKey('pre_dayp_btn', '');
    const servicedata = '{"stone_ids":' + JSON.stringify(this.packetSelectedStones) + '}';
    if (this.packetSelectedStones.length > 0) {
      this.apiService.postCall('SearchResultComponent:addStonesToPreDayp', this.apiLink, servicedata).subscribe((response) => {
        if (response && !response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_ASDE_200)) {
          this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
        } else if (response && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_DNA_200)) {
          this.messageService.showInfoGrowlMessage(MessageCodes[response.code]);
        } else if (response && response.error_status) {
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
    this.fetchStoneDetails();
  }

  isAllCheckboxSelected() {
    if (this.isAllStoneSelected) {
      this.packetSelectedStones = [];
      this.packet.data.stone_details.forEach(element => {
        this.packetSelectedStones = this.fetchConfirmableStones();
      });
    } else {
      this.packetSelectedStones = [];
    }
    this.fetchStoneDetails();
    this.updateSelectedStonePanel();
    this.updateRowColor();
  }

  closeCompareStoneOverlay() {
    this.selectedStonesObject = [];
    this.toggleComparePopup = false;
  }

  fetchConfirmableStones() {
    const confirmableStones = [];
    this.packet.data.stone_details.forEach(element => {
      if (((element.stone_state === 6)
        || (element.stone_state === 0)
        || (element.isOnHold === 6)
        || (element.stone_state === 3 && element.reason_code !== 1))) {
      } else {
        confirmableStones.push(element.stone_id);
      }
    });
    return confirmableStones;
  }

  fetchStoneDetails() {
    this.selectedStoneArray = [];
    this.packetSelectedStones.forEach(id => {
      this.packet.data.stone_details.forEach(stoneObj => {
        if (stoneObj.stone_id === id) {
          this.selectedStoneArray.push(stoneObj);
        }
      });
    });
  }

  refreshTable() {
    if (this.packet) {
      if (this.packetGridComponent) {
        this.packetGridComponent.instance.refresh();
      }
      if (this.selectedPacketStonePanel && this.selectedPacketStonePanel.selectedPacketStoneTable) {
        this.selectedPacketStonePanel.selectedPacketStoneTable.instance.refresh();
      }
    }
  }

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    if (stoneList) {
      stoneList.forEach(stoneId => {
        if (this.packet.data.stone_details.length > 0) {
          this.packet.data.stone_details = this.updatetable(this.packet.data.stone_details, res, stoneId);
        }
        if (this.selectedStoneObj && this.selectedStoneObj.selectedStoneArray && this.selectedStoneObj.selectedStoneArray.length > 0) {
          this.selectedStoneObj.selectedStoneArray = this.updatetable(this.selectedStoneObj.selectedStoneArray, res, stoneId);
        }
      });
    }
    this.refreshTable();
  }

  updatetable(array, res, stoneId) {
    array.forEach(stoneObject => {
      if (stoneObject.stone_id === stoneId) {
        const i = array.indexOf(stoneObject);
        if (res.source === 'confirmedStones' || res.source === 'holdRequested') {
          array[i]['stone_state'] = 6;
          array.splice(i, 1);
          this.removeConfirmedStone([stoneId], this.packetSelectedStones);
          this.filterSelectedStones();
        } else if (res.source === 'viewRequested') {
          if (array[i].viewRequestStatus !== 2) {
            array[i]['totalViewRequest']++;
          }
        } else if (res.source === 'ddcRequested') {
          array[i]['ddcStatus'] = res.status;
          array[i]['ddcHour'] = res.hour;
        } else if (res.source === 'basketRequested') {
          array[i]['isBasket'] = 1;
          array[i]['basketStatus'] = '=';
        } else if (res.source === 'b2bRequested') {
          array[i]['isBtbUpdated'] = res.status;
        } else if (res.source === 'onlineViewIncrement') {
          array[i]['totalViewedByUser']++;
        }
      }
    });
    return array;
  }

  removeConfirmedStone(array, array2) {
    array.forEach((value) => {
      if (array2.indexOf(value) > -1) {
        const i = array2.indexOf(value);
        array2.splice(i, 1);
      }
    });
  }

  stoneFromSelectedStone(event) {
    this.selectedPacketStoneID = event.object;
    this.getStoneLabel();
    this.preSelectedPackets = [];
    this.selectedPacketName = [];
    this.addToPacketPopup = !this.addToPacketPopup;
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
    }, 1)
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
      columns[1].width = 160;
    }
    this.packetGridComponent.columns = columns;
  }

  onCellPrepared(e) {
    if (e.rowType === 'data') {
      this.selectedStoneObj.selectedStones.forEach(stoneId => {
        if (e.key.stone_id === stoneId) {
          this.stoneSvc.changeRowColor(e.cellElement, true);
        }
      });
    }
  }

  updateRowColor() {
    if (this.packetGridComponent) {
      this.packet.data.stone_details.forEach((element, index) => {
        this.stoneSvc.showRowColorChanges(this.packetGridComponent, this.selectedStoneObj.selectedStones, element.stone_id, index);
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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.fixedHeader();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.onWindowScroll();
    this.adjustTableSize();
  }

  fixedHeader() {
    this.currentScroll = window.scrollY;
    const containerWidth = jQuery('#fixedBasketPanel').outerWidth();
    if (jQuery('#fixedBasketPanel').offset() && jQuery('#fixedBasketPanel').offset().top) {
      this.menuDistanceFromTop = jQuery('#fixedBasketPanel').offset().top > 0 ? jQuery('#fixedBasketPanel').offset().top : 0;
      if ((this.currentScroll + 10) > this.menuDistanceFromTop) {
        // jQuery('#pktContainer').addClass('stuck').innerWidth(containerWidth).css('padding-bottom', '10px');
      } else {
        // jQuery('#pktContainer').removeClass('stuck').innerWidth(containerWidth).css('padding-bottom', '0px');
      }
      this.adjustTableSize();
    }
  }

  adjustTableSize() {
    this.height = window.innerHeight - 252;
    this.adjustTableBoxSize();
  }

  adjustTableBoxSize() {
    if (jQuery('#pktContainer')) {
      jQuery('#pktContainer').css('height', window.innerHeight - 100);
    }
  }

  fetchMenuDistanceFromTop() {
    if (jQuery('#fixedBasketPanel').offset() && jQuery('#fixedBasketPanel').offset().top) {
      this.menuDistanceFromTop = jQuery('#fixedBasketPanel').offset().top > 0 ? jQuery('#fixedBasketPanel').offset().top : 0;
    }
  }

  toggleSelectedTable(e) {
    this.selectedTableToggle = e.status;
    this.adjustTableSize();
  }

  onResultLoading(event) {
    const container = this.packetGridComponent;
    this.utilService.handleSort(event, container, 'stoneReqSortData', event);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      const container = this.packetGridComponent;
      if (this.packet.data.hasOwnProperty('sortedColumnOrder') && this.packet.data.hasOwnProperty('sortedColumn') && container) {
        container.instance.columnOption(this.packet.data.sortedColumn, 'sortOrder', this.packet.data.sortedColumnOrder);
      }
    }, 1000);
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }
}
