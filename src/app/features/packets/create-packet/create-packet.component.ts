import { Component, OnInit, ViewChild, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { PacketPanelService } from '@srk/shared';
import { PacketsService } from '../packets.service';
import { StoneDetailsService } from '@srk/shared';
import { Packets } from '../packets';
import { AuthService } from '@srk/core';
import { ApiService } from '@srk/shared';
import { NotifyService } from '@srk/core';
import { MessageService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import { ConfirmationService } from 'primeng/components/common/api';
import * as _ from 'underscore';
import { AddNoteService } from '@srk/shared';

@Component({
  selector: 'app-create-packet',
  templateUrl: './create-packet.component.html',
  styleUrls: ['./create-packet.component.scss']
})
export class CreatePacketComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('thmPacketPanel') thmPacketPanel;
  @Input() stone: any[];
  @Input() visiblePacketOverlay: boolean;
  @Input() showSelectedPacket: boolean;

  @Output() togglePacketIcon = new EventEmitter();
  @Output() togglePacketOverlay = new EventEmitter();
  @Output() updatePacketIcon = new EventEmitter();

  private stoneConfirmedSubscription: Subscription;
  private packetSubscription: Subscription;
  private showPacketSubscription: Subscription;
  private updatePacketSubscription: Subscription;
  public definedPackets: any[];
  public visibleShowPacketPopup = false;
  public visibleCreatePacketPopup = false;
  public visiblePacketListPopup = false;
  public selectedPacketToShow: any[] = [];
  public inputPacketName: any;
  public packetList: Packets[] = [];
  public selectedPacketName: any[] = [];
  public preSelectedPackets: any[] = [];
  public displayPacket: any;
  public selectedStoneLabel: any[] = [];
  public selectedPacketStoneID: any[];
  public packetConfig: any[] = [];

  constructor(
    private packetPanelSvc: PacketPanelService,
    private packetSvc: PacketsService,
    private stoneSvc: StoneDetailsService,
    private authService: AuthService,
    private apiService: ApiService,
    private notify: NotifyService,
    private messageService: MessageService,
    private customTranslateSvc: CustomTranslateService,
    private confirmationService: ConfirmationService,
    private notesService: AddNoteService) { }

  ngOnInit() {
    this.stoneSvc.getConfirmedExportMemo().subscribe(res => { }, error => { });
    if (this.authService.hasElementPermission('show_my_packet')) {
      this.getPreDefinedPackets();
    }
    this.packetSubscription = this.notify.notifyPacketCountOccuredObservable$.subscribe(res => {
      this.inputPacketName = '';
      this.visibleCreatePacketPopup = true;
    });
    this.showPacketSubscription = this.notify.notifyShowPacketEventOccuredObservable$.subscribe((response) => {
      this.openShowPacketPopup();
    });
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      this.updateStoneStateDetails(res);
    });
    this.updatePacketSubscription = this.notify.notifyUpdatePacketinTableActionObservable$.subscribe(res => {
      this.updatePacketInTable(res.packet);
    });
    this.selectedPacketStoneID = this.stone;
    this.getStoneLabel();
  }

  ngOnChanges() {
    if (this.visiblePacketOverlay) {
      this.showPacketListForStone(this.stone);
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

  getPreDefinedPackets() {
    this.definedPackets = [];
    this.packetSvc.getMyPackets().subscribe((responsePackets) => {
      if (responsePackets.data !== undefined) {
        this.saveDefinedPackets(responsePackets);
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('ERR_GET_MY_PACKTS');
    });
  }

  saveDefinedPackets(responseData) {
    responseData.data.forEach((packet) => {
      const definedPacket = new Packets('', '', { stone_ids: [], stone_details: [], display_data: {}, isSelected: false });
      definedPacket.packet_name = packet.packet_name;
      definedPacket.packet_id = packet.packet_id;
      definedPacket.data.stone_ids = packet.stone_ids;
      this.definedPackets.push(definedPacket);
    });
    if (this.definedPackets.length > 0) {
      this.notify.notifyShowPacketBtn({ visible: true });
    }
  }

  setStonePacketsList(array) {
    if (array.length > 0) {
      const packetStoneArray = [];
      array.forEach(packet => {
        if (packet.data.stone_details && packet.data.stone_details.length > 0) {
          const config = {};
          config['packet_name'] = packet.packet_name;
          config['stones'] = []
          packet.data.stone_details.forEach(stone => {
            config['stones'].push(stone.stone_id);
          });
          packetStoneArray.push(config);
        } else if (packet.data.stone_ids && packet.data.stone_ids.length > 0) {
          const config = {};
          config['packet_name'] = packet.packet_name;
          config['stones'] = []
          packet.data.stone_ids.forEach(stone_id => {
            config['stones'].push(stone_id);
          });
          packetStoneArray.push(config);
        }
      });
      array.forEach(packet => {
        packet.data.stone_details = this.stoneSvc.updatePacketName(packetStoneArray, packet.data.stone_details);
      });
      this.updatePacketIcon.emit({ array: packetStoneArray });
    }
    this.packetConfig = this.packetPanelSvc.setPacketConfiguration(array);
  }

  checkPacketName(): boolean {
    let flag = false;
    this.definedPackets.forEach(packet => {
      if (packet.packet_name === this.inputPacketName) {
        flag = true;
      }
    });
    return flag;
  }

  createPacket() {
    const isExist = this.checkPacketName();
    if (!this.inputPacketName || this.inputPacketName === '') {
      this.messageService.showErrorGrowlMessage('ERR_PACKET_NAME');
    } else if (isExist) {
      this.messageService.showErrorGrowlMessage('ERR_PACKET_ALREADY_EXIST');
    } else {
      this.saveNewPacket();
    }
  }

  saveNewPacket() {
    const packet = new Packets(
      'Packet_ID_' + this.inputPacketName, this.inputPacketName, { stone_details: [], display_data: {}, isSelected: false });
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    const apiLink = this.authService.getApiLinkForKey('create_packet_btn', '');
    const config = {
      'packet_name': packet.packet_name,
      'stone_id_list': [],
      'is_editable': 1
    };
    this.apiService.postCall('CreatePacketComponent:saveNewPacket', apiLink, JSON.stringify(config)).subscribe((response) => {
      this.notify.hideBlockUI();
      if (response && !response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.PS_IN_PCK_200)) {
        this.visibleCreatePacketPopup = false;
        this.savePacketData(response, packet);
      } else if (response && response.error_status && MessageCodesComparator.AreEqual(response.code,
        MessageCodes.PS_ONA_200)) {
        this.visibleCreatePacketPopup = false;
        this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
      } else if (response && response.error_status && MessageCodesComparator.AreEqual(response.code,
        MessageCodes.DP_PC_NAME_200)) {
        this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
      }
    }, (error) => {
      this.notify.hideBlockUI();
      this.messageService.showErrorGrowlMessage('ERR_PACKET_CREATE');
    });
  }

  savePacketData(packetDetails, packet) {
    if (packetDetails !== undefined) {
      packet.packet_id = packetDetails.data.packet_id;
      this.packetList.push(packet);
      this.definedPackets.push(packet);
      const config = {};
      config[packetDetails.data.packet_id] = {
        'packet_name': '',
        'stones': []
      };
      config[packetDetails.data.packet_id].packet_name = packetDetails.data.packet_name;
      this.packetConfig.push(config);
      this.setStonePacketsList(this.packetList);
      if (this.packetList.length === 1) {
        this.togglePacketIcon.emit({ visible: true });
      }
    }
  }

  openShowPacketPopup() {
    this.selectedPacketToShow = [];
    if (this.packetList.length > 0) {
      this.packetList.forEach(packet => {
        this.selectedPacketToShow.push(String(packet.packet_id));
      });
    }
    this.selectedPacketToShow = this.stoneSvc.removeDuplicateItemFromArray(this.selectedPacketToShow);
    this.visibleShowPacketPopup = true;
  }

  showPackets() {
    this.packetList = [];
    if (this.selectedPacketToShow.length > 0) {
      this.selectedPacketToShow.forEach(id => {
        this.definedPackets.forEach(packet => {
          if (packet.data.isSelected) {
            packet.data.isSelected = false;
          }
          if (String(packet.packet_id) === id) {
            if (packet.data.stone_ids && packet.data.stone_ids.length > 0) {
              this.stoneSvc.getStoneDetails(packet.data.stone_ids).subscribe((responseStone) => {
                if (responseStone) {
                  packet.data.stone_details = Object.assign([], responseStone);
                  this.stoneSvc.storeStoneAdditionalInfo(packet.data.stone_details).subscribe((response) => {
                    if (response) {
                      this.stoneSvc.getDiamondPriceInfo(packet.data.stone_details).subscribe((responseObj) => {
                        packet.data.stone_details = responseObj;
                        packet.data.stone_details = this.notesService.fetchStonesComment(packet.data.stone_details);
                        packet.data.display_data = this.stoneSvc.calculateSelectedStoneData(packet.data.stone_details);
                      });
                    }
                  });
                }
              });
            }
            this.packetList.push(packet);
          }
        });
      });
      this.setStonePacketsList(this.packetList);
      this.togglePacketIcon.emit({ visible: true });
    } else {
      this.togglePacketIcon.emit({ visible: false });
      this.displayPacket = undefined;
    }
    this.visibleShowPacketPopup = false;
  }

  deletePacket(object) {
    const removePacketHeader = this.customTranslateSvc.translateString('Delete packet');
    const removePacketMessage = this.customTranslateSvc.translateString(
      'DELETE_PACKET');
    this.confirmationService.confirm({
      message: removePacketMessage + '"' + object.packet_name + '" ?',
      header: removePacketHeader,
      accept: () => {
        this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
        this.packetPanelSvc.removePacket(object.packet_id).subscribe((deleteRes) => {
          this.notify.hideBlockUI();
          if (deleteRes !== undefined) {
            if (deleteRes.error_status === false &&
              MessageCodesComparator.AreEqual(deleteRes.code, MessageCodes.PS_DL_PCK_200)) {
              this.deletePacketFromList(deleteRes.code, object);
            } else if (deleteRes.error_status === true && MessageCodesComparator.AreEqual(deleteRes.code, MessageCodes.PS_NDD_404)) {
              this.messageService.showErrorGrowlMessage(MessageCodes[deleteRes.code]);
            }
          }
        }, error => {
          this.notify.hideBlockUI();
          this.messageService.showSuccessGrowlMessage('ERR_REMOVE_PACKET');
        });
      }
    });
  }

  deletePacketFromList(responseCode, object) {
    this.packetList.forEach((packet) => {
      if (packet.packet_id === object.packet_id) {
        object.data.isSelected = false;
        this.stoneSvc.removeElement(this.packetList, packet);
      }
    });
    this.definedPackets.forEach((packet) => {
      if (packet.packet_id === object.packet_id) {
        object.data.isSelected = false;
        this.stoneSvc.removeElement(this.definedPackets, packet);
      }
    });
    if (this.definedPackets.length === 0) {
      this.notify.notifyShowPacketBtn({ visible: false });
    }
    if (this.packetList.length === 0) {
      this.togglePacketIcon.emit({ visible: false });
    }
    this.setStonePacketsList(this.packetList);
    this.messageService.showSuccessGrowlMessage(MessageCodes[responseCode]);
  }

  saveStoneToPacket() {
    if (this.selectedPacketName && this.selectedPacketName.length > 0) {
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
            this.stoneSvc.removeElement(this.preSelectedPackets, preSelected);
          }
        });
      });
      this.preSelectedPackets = this.stoneSvc.removeDuplicateItemFromArray(this.preSelectedPackets);
      this.removeFromPacket(this.preSelectedPackets);
      this.visiblePacketListPopup = false;
      this.togglePacketOverlay.emit({ visible: false });
    } else {
      this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_TO_PACKET');
      return;
    }
  }

  addToPacket(array) {
    array.forEach((value) => {
      const data = {
        'packet_id': value,
        'stones': this.selectedPacketStoneID
      };
      this.addStoneToPacket(data);
    });
  }

  removeFromPacket(array) {
    array.forEach((value) => {
      const data = {
        'packet_id': value,
        'stones': this.selectedPacketStoneID
      };
      this.removeStoneFromPacket(data);
    });
  }

  addStoneToPacket(event) {
    this.packetList.forEach((object) => {
      if (String(event.packet_id) === String(object.packet_id) && event.stones.length > 0) {
        let stoneIDs = [];
        event.stones.forEach(stone => {
          stoneIDs.push(stone.stone_id);
        });
        stoneIDs = this.stoneSvc.checkDuplicateStones(object.data.stone_details, stoneIDs);
        if (stoneIDs.length > 0) {
          this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
          this.packetPanelSvc.saveStoneToPacket(event.packet_id, stoneIDs).subscribe((addStoneResponse) => {
            this.notify.hideBlockUI();
            if (MessageCodesComparator.AreEqual(addStoneResponse.code, MessageCodes.PS_IN_ST_200)) {
              if (object.data.stone_details === undefined || object.data.stone_details.length === 0) {
                object.data.stone_details = [];
              }
              event.stones.forEach(stone => {
                object.data.stone_details.push(stone);
              });
              this.stoneSvc.getStoneDetails(stoneIDs).subscribe(stoneRes => {
                if (stoneRes && stoneRes.length > 0) {
                  object.data.stone_details.forEach(item => {
                    stoneRes.forEach(stone => {
                      if (item.stone_id === stone.stone_id) {
                        item.price_srk = stone.price_srk;
                      }
                    });
                  });
                }
              });
              object.data.stone_details = this.stoneSvc.removeDuplicatesFromObject(object.data.stone_details, 'stone_id');
              this.addExtraStoneInfoPacket(object.packet_id);
              this.messageService.showSuccessGrowlMessage(MessageCodes.PS_IN_ST_200);
              this.setStonePacketsList(this.packetList);
            } else if (MessageCodesComparator.AreEqual(addStoneResponse.code, MessageCodes.PS_IN_ST_500)) {
              this.messageService.showErrorGrowlMessage(MessageCodes[addStoneResponse.code]);
            }
          }, error => {
            this.notify.hideBlockUI();
            this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_PACKET');
          });
        } else {
          this.messageService.showInfoGrowlMessage('STONE_EXIST_PACKET');
        }
      }
    });
  }

  removeStoneFromPacket(event) {
    this.packetList.forEach((packet) => {
      if (String(packet.packet_id) === String(event.packet_id) && event.stones.length > 0) {
        const stoneIDs = [];
        event.stones.forEach(stone => {
          stoneIDs.push(stone.stone_id);
        });
        if (stoneIDs.length > 0) {
          this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
          this.packetPanelSvc.removeStoneFromPacket(packet.packet_id, stoneIDs).subscribe((res) => {
            this.notify.hideBlockUI();
            if (MessageCodesComparator.AreEqual(res.code, MessageCodes.PS_RM_ST_200)) {
              stoneIDs.forEach(id => {
                packet.data.stone_details.forEach(stone => {
                  if (stone.stone_id === id) {
                    this.stoneSvc.removeElement(packet.data.stone_details, stone);
                  }
                });
              });
              if (packet.data.stone_details.length > 0) {
                this.addExtraStoneInfoPacket(packet.packet_id);
              } else {
                packet.data.display_data = {};
              }
              this.setStonePacketsList(this.packetList);
              this.messageService.showSuccessGrowlMessage(MessageCodes[res.code]);
            } else {
              this.messageService.showErrorGrowlMessage('STONE_NOT_FOUND');
            }
          }, error => {
            this.notify.hideBlockUI();
            this.messageService.showErrorGrowlMessage('ERR_REMOVE_STONE_PACKET');
          });
        }
      };
    });
  }

  displayPacketStoneTable(event) {
    this.setStonePacketsList(this.packetList);
    this.packetList.forEach((object) => {
      if (object.packet_id === event.packet.packet_id) {
        this.displayPacket = object;
      } else {
        object.data.isSelected = false;
      }
    });
    this.refreshPacketTable();
  }

  hidePacket(object) {
    const data = [];
    this.packetList.forEach((packet) => {
      if (packet.packet_id === object.packet_id) {
        data.push(packet);
        object.data.isSelected = false;
        this.stoneSvc.removeElement(this.packetList, packet);
      }
    });
    if (data.length === 1) {
      this.notify.notifyShowPacketBtn({ visible: true });
    }
    this.selectedPacketToShow.forEach(value => {
      if (value === String(object.packet_id)) {
        this.stoneSvc.removeElement(this.selectedPacketToShow, value);
      }
    });
    if (this.packetList.length === 0) {
      this.togglePacketIcon.emit({ visible: false });
    }
  }

  renamePacket(object) {
    this.packetList.forEach((packet) => {
      if (packet.packet_id === object.packet_id) {
        packet = object;
      }
    });
    this.packetConfig = this.packetPanelSvc.setPacketConfiguration(this.packetList);
  }

  showPacketListForStone(stone_ids) {
    if (this.packetList.length > 0) {
      this.selectedPacketStoneID = stone_ids;
      this.getStoneLabel();
      this.preSelectedPackets = [];
      this.selectedPacketName = [];
      if (this.showSelectedPacket) {
        this.packetConfig.forEach((config) => {
          for (const key in config) {
            if (config[key].stones !== undefined) {
              config[key].stones.forEach((stoneID) => {
                this.selectedPacketStoneID.forEach(stone => {
                  if (stoneID === stone.stone_id) {
                    this.preSelectedPackets.push(key);
                    this.selectedPacketName = this.preSelectedPackets;
                  }
                });
              });
            }
          }
        });
      }
      this.visiblePacketListPopup = true;
    }
  }

  canclePacket() {
    this.visiblePacketListPopup = false;
    this.togglePacketOverlay.emit({ visible: false });
  }

  addExtraStoneInfoPacket(packetId) {
    this.packetList.forEach((element) => {
      if (element.packet_id === packetId && element.data.stone_details) {
        this.stoneSvc.storeStoneAdditionalInfo(element.data.stone_details).subscribe((response) => {
          if (response) {
            this.stoneSvc.getDiamondPriceInfo(element.data.stone_details).subscribe((response) => {
              element.data.stone_details = response;
              element.data.stone_details = this.notesService.fetchStonesComment(element.data.stone_details);
              element.data.display_data = this.stoneSvc.calculateSelectedStoneData(element.data.stone_details);
            });
          }
        });
      }
    });
    this.refreshPacketTable();
  }

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    if (stoneList.length > 0) {
      if (res.hasOwnProperty('b2bAction')) {
      } else {
        if (res.source) {
          stoneList.forEach(stoneId => {
            if (this.thmPacketPanel) {
              if (this.thmPacketPanel.packet.data
                && this.thmPacketPanel.packet.data.stone_details.length > 0
                && this.thmPacketPanel !== undefined) {
                if (this.thmPacketPanel.hasOwnProperty('packetGridComponent')) {
                  this.thmPacketPanel.packet.data.stone_details = this.stoneSvc.updateDataTable(this.thmPacketPanel.packet.data.stone_details, res, stoneId);
                  this.thmPacketPanel.packet.data.display_data = this.stoneSvc.calculateSelectedStoneData(this.thmPacketPanel.packet.data.stone_details);
                }
              }
            }
          });
        }
      }
    }
    this.refreshPacketTable();
  }

  refreshPacketTable() {
    if (this.thmPacketPanel && this.thmPacketPanel.hasOwnProperty('packetGridComponent')) {
      if (this.thmPacketPanel.packetGridComponent) {
        this.thmPacketPanel.packetGridComponent.instance.refresh();
      }
    }
  }

  updatePacketInTable(packet) {
    this.packetList.forEach(object => {
      if (object.packet_id === packet.packet_id) {
        object = Object.assign({}, packet);
      }
    });
    this.setStonePacketsList(this.packetList);
    this.packetConfig = this.packetPanelSvc.setPacketConfiguration(this.packetList);
  }

  closePacketPopup(event) {
    this.visiblePacketOverlay = false;
    this.togglePacketOverlay.emit({ visible: false });

  }

  ngOnDestroy() {
    this.packetSubscription.unsubscribe();
    this.showPacketSubscription.unsubscribe();
    this.stoneConfirmedSubscription.unsubscribe();
    this.updatePacketSubscription.unsubscribe();
  }
}
