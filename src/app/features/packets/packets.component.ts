import { Component, OnInit, ViewChild, OnDestroy, HostListener, AfterViewChecked } from '@angular/core';
import { PacketsService } from './packets.service';
import { PacketPanelService } from '@srk/shared';
import { StoneDetailsService } from '@srk/shared';
import { MessageService } from '@srk/core';
import { ConfirmationService } from 'primeng/components/common/api';
import { CustomTranslateService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { UserDeviceService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { UtilService } from '@srk/shared';
import { AuthService } from '@srk/core';
import { AddNoteService } from '@srk/shared';

declare var jQuery;

@Component({
  selector: 'app-packets',
  templateUrl: './packets.component.html',
  styleUrls: ['./packets.component.scss'],

})
export class PacketsComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('packetPanel') packetPanel;
  @ViewChild('thmPacketPanel') thmPacketPanelComponent;

  public packets: any[] = [];
  public displayPopup = false;
  public packetConfig: any[] = [];
  public message: string;
  public stoneClickedForDetailViewSubscription: any;
  public myPacketData = [];
  public selectedStoneForDetail: any[] = [];
  public updateStone: any;
  public menuDistanceFromTop: any;
  public currentScroll: any;
  public currentTabSelected: any;
  public lastCreatedTab: any;

  constructor(
    private packetService: PacketsService,
    private packetPanelSvc: PacketPanelService,
    private stoneSvc: StoneDetailsService,
    private messageService: MessageService,
    private userDeviceService: UserDeviceService,
    private confirmationService: ConfirmationService,
    private notify: NotifyService,
    private customTranslateSvc: CustomTranslateService,
    private utilService: UtilService,
    private authService: AuthService,
    private notesService: AddNoteService) { }

  ngOnInit() {
    this.stoneSvc.getConfirmedExportMemo().subscribe(res => { }, error => { });
    this.initializePackets();
    this.stoneClickedForDetailViewSubscription = this.notify.notifyPacketPageStoneDetailTabActionObservable$.subscribe((res) => {
      if (res.data) {
        if (res.data && res.type === 'stoneDtl') {
          this.addStoneDetailTab(res.data);
        } else if (res.data && res.type === 'twinStoneDtl') {
          this.addTwinStoneInfoTab(res.data, this.packets);
        }
      }
    });
    this.packets.push({ name: 'My Packets', permissionName: 'show_my_packet', data: this.myPacketData });
    this.packets.push({ name: 'Recommended Packets', permissionName: 'show_recommended_packet', data: [] });
    this.currentTabSelected = 'My Packets';
    this.getMyPacketsList();
  }

  ngAfterViewChecked() {
    jQuery('.container').css('margin-right', '10px');
    this.utilService.setSearchTabWidth();
  }

  scrollTabPanelRight() {
    this.utilService.scrollTabPanelRight();
  }

  scrollTabPanelLeft() {
    this.utilService.scrollTabPanelLeft();
  }

  initializePackets() {
    if (this.userDeviceService.isDeviceSupportLocalStorage()) {
      const myPacketsCount = window.localStorage.getItem(this.authService.getLoginName() + '-my-packets-size');
      if (myPacketsCount && Number(myPacketsCount)) {
        const totalMyPacketsCount = Number(myPacketsCount);
        for (let index = 0; index < totalMyPacketsCount; index++) {
          this.myPacketData.push({ 'stone_details': null, 'packets_details': null, 'shared_packet_details': {} });
        }
      }
    }
  }

  getRecommendedPacketsList() {
    this.message = 'Loading...';
    this.packets.forEach((item) => {
      if (item.name === 'Recommended Packets' && item.data.length === 0) {
        this.message = 'NO_PACKET_FOUND';
      }
    });
    // this.packetService.getRecommendedPackets().subscribe((response) => {
    //   if (response.data !== undefined) {
    //     this.packets.forEach((item) => {
    //       if (item.name === 'Recommended Packets') {
    //         item.data = response.data;
    //         item.data.forEach((object) => {
    //           object.isEditable = false;
    //         });
    //       }
    //     });
    //     this.packetConfig = [];
    //     this.setConfig(response.data);
    //   } else {
    //     this.message = 'NO_PACKET_FOUND';
    //   }
    //   this.customTranslateSvc.translateSelectItem(this.packets);
    // }, error => {
    //   this.message = 'NO_PACKET_FOUND';
    // });
  }

  getMyPacketsList() {
    this.message = 'Loading...';
    this.packetService.getMyPackets().subscribe((response) => {
      if (MessageCodesComparator.AreEqual(response.code, MessageCodes.PS_NFP_200)) {
        this.message = 'NO_PACKET_FOUND';
        this.packets.forEach((item) => {
          if (item.name === 'My Packets') {
            item.data = [];
            if (this.userDeviceService.isDeviceSupportLocalStorage()) {
              window.localStorage.setItem(this.authService.getLoginName() + '-my-packets-size', '0');
            }
          }
        });
      } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.PS_GET_PCK_200)) {
        if (response.data !== undefined) {
          this.packets.forEach((item) => {
            if (item.name === 'My Packets') {
              item.data = response.data;
              item.data.forEach((object) => {
                object.isEditable = false;
              });
              if (this.userDeviceService.isDeviceSupportLocalStorage()) {
                window.localStorage.setItem(this.authService.getLoginName() + '-my-packets-size', response.data.length);
                window.localStorage.setItem(this.authService.getLoginName() + '-my-packets', JSON.stringify(item.data));
              }
            }
          });
          this.packetConfig = [];
          this.setConfig(response.data);
          this.getPacketPrice(response.data);
          this.customTranslateSvc.translateSelectItem(this.packets);
          this.getRecommendedPacketsList();
        }
      }
    }, error => {
      this.message = 'NO_PACKET_FOUND';
    });
  }

  getPacketPrice(array) {
    array.forEach((packet) => {
      if (packet.stone_ids.length > 0) {
        this.stoneSvc.getStoneDetails(packet.stone_ids).subscribe(res => {
          if (res) {
            this.stoneSvc.getDiamondPriceInfo(res).subscribe((response) => {
              packet['stone_details'] = response;
              packet.packet_price = this.stoneSvc.calculateSelectedStoneData(packet.stone_details).final_payable;
            });
          } else {
            packet.packet_price = 0.0;
          }
        });
      } else {
        packet.packet_price = 0.0;
      }
    });
  }

  handleTabViewChange(param) {
    this.message = '';
    if (param.hasOwnProperty('name')) {
      this.currentTabSelected = param.name;
    } else if (param.hasOwnProperty('packet_name')) {
      this.currentTabSelected = param.packet_name;
    } else if (param.hasOwnProperty('stoneName')) {
      this.currentTabSelected = param.stoneName;
    } else if (param.hasOwnProperty('pairId')) {
      this.currentTabSelected = param.pairId;
    }
    switch (this.currentTabSelected) {
      case 'My Packets':
        const myPacket = window.localStorage.getItem(this.authService.getLoginName() + '-my-packets');
        if (myPacket) {
          this.packets.forEach((item) => {
            if (item.name === 'My Packets') {
              item.data = JSON.parse(myPacket);
              this.getPacketPrice(item.data);
              this.getMyPacketsList();
            }
          });
        } else {
          this.getMyPacketsList();
        }
        break;
      case 'Recommended Packets':
        this.getRecommendedPacketsList();
        break;
      default:
        this.refreshTable();
        break;
    }
  }

  setConfig(array) {
    this.packetConfig = this.packetPanelSvc.setDefinedPacketConfiguration(array);
  }

  addDetailedPacketTab(e) {
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    this.packets.forEach((element) => {
      if (element.name) {
        this.removeDetailedPacketTab(e.name);
      }
    });
    this.addPacketDetails(e.id);
  }

  addTwinStoneInfoTab(pairId, tabs) {
    this.stoneSvc.getStoneDetailsByPairId(pairId).subscribe(resPairStones => {
      if (resPairStones && resPairStones.length === 2) {
        this.stoneSvc.addTwinStoneInfoTab(resPairStones, tabs);
        this.lastCreatedTab = pairId;
      }
    });
  }

  removeDetailedPacketTab(tabName) {
    let flag = 0;
    this.packets.forEach((element, index) => {
      if (element.packet_name === tabName) {
        const i = this.packets.indexOf(element);
        this.packets.splice(i, 1);
        flag++;
      } else if (element.stoneName === tabName) {
        const i = this.packets.indexOf(element);
        this.packets.splice(i, 1);
        flag++;
      } else if (element.pairId === tabName) {
        const i = this.packets.indexOf(element);
        this.packets.splice(i, 1);
        flag++;
      }
      if (flag > 0) {
        if (this.packets[index - 1] && this.packets[index - 1].hasOwnProperty('name')) {
        //  this.currentTabSelected = this.packets[index - 1].name;
        this.currentTabSelected = 'My Packets';
        } else if (this.packets[index - 1] && this.packets[index - 1].hasOwnProperty('packet_name')) {
         // this.currentTabSelected = this.packets[index - 1].packet_name;
         this.currentTabSelected = 'My Packets';
        } else if (this.packets[index - 1] && this.packets[index - 1].hasOwnProperty('stoneName')) {
         // this.currentTabSelected = this.packets[index - 1].stoneName;
         this.currentTabSelected = 'My Packets';
        } else if (this.packets[index - 1] && this.packets[index - 1].hasOwnProperty('pairId')) {
         // this.currentTabSelected = this.packets[index - 1].pairId;
         this.currentTabSelected = 'My Packets';
        } else {
         // this.currentTabSelected = this.packets[0].name;
         this.currentTabSelected = 'My Packets';
        }
      }
    });
  }

  addPacketDetails(id) {
    this.packetService.getPacketDetailById(id).subscribe((res) => {
      if (res.data !== undefined) {
        if (res.data[0].stone_ids.length > 0) {
          this.addPacketStoneDetails(res.data[0]);
        } else {
          this.notify.hideBlockUI();
          this.messageService.showErrorGrowlMessage('Sorry, selected packet is empty');
        }
      }
    });
  }

  addPacketStoneDetails(data) {
    this.stoneSvc.getStoneDetails(data.stone_ids).subscribe((stone_res) => {
      if (stone_res) {
        this.stoneSvc.getDiamondPriceInfo(stone_res).subscribe((response) => {
          this.notify.hideBlockUI();
          response = this.stoneSvc.fetchStoneAdditionalInfo(response);
          response = this.notesService.fetchStonesComment(response);
          let packet = {
            'packet_id': data.packet_id,
            'packet_name': data.packet_name,
            'data': {
              'stone_details': this.utilService.updateStonesForDecimal(response),
              'display_data': this.stoneSvc.calculateSelectedStoneData(response)
            }
          };
          this.currentTabSelected = data.packet_name;
          this.lastCreatedTab = data.packet_name;
          packet = this.setStonePacketNameList(packet);
          this.packets.push(packet);
        });
      }
    });
  }

  setStonePacketNameList(packet) {
    if (packet.data.stone_details) {
      packet.data.stone_details.forEach(stone => {
        let nameArray = [];
        for (let i = 0; i < 2; i++) {
          this.packets[i].data.forEach(packetObj => {
            if (packetObj.stone_ids.length > 0) {
              packetObj.stone_ids.forEach(object => {
                if (object === stone.stone_id) {
                  nameArray.push(packetObj.packet_name);
                }
              });
            }
          });
        }
        nameArray = this.stoneSvc.removeDuplicateItemFromArray(nameArray);
        stone.stone_packet = nameArray.toString();
      });
      this.refreshTable();
    }
    return packet;
  }

  addStoneToPacket(event) {
    let stoneIDs = [];
    event.stones.forEach(stone => {
      stoneIDs.push(stone.stone_id);
    });
    this.packets.forEach(object => {
      if (object.name && object.data.length > 0) {
        object.data.forEach(packet => {
          if (String(packet.packet_id) === event.packet_id && packet.stone_details && packet.stone_details.length > 0) {
            stoneIDs = this.stoneSvc.checkDuplicateStones(packet.stone_details, stoneIDs);
          }
        });
      } else if (String(object.packet_id) === event.packet_id) {
        stoneIDs = this.stoneSvc.checkDuplicateStones(object.data.stone_details, stoneIDs);
      }
    });
    if (stoneIDs.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.packetPanelSvc.saveStoneToPacket(event.packet_id, stoneIDs).subscribe((res) => {
        this.notify.hideBlockUI();
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.PS_IN_ST_200)) {
          this.messageService.showSuccessGrowlMessage(MessageCodes.PS_IN_ST_200);
          this.packets.forEach(object => {
            if (object.packet_id) {
              if (String(object.packet_id) === String(event.packet_id)) {
                if (object.data.stone_details === undefined || object.data.stone_details.length === 0) {
                  object.data.stone_details = [];
                }
                event.stones.forEach(stone => {
                  object.data.stone_details.push(stone);
                });
                object.data.stone_details = this.stoneSvc.removeDuplicatesFromObject(object.data.stone_details, 'stone_id');
                this.addExtraStoneInfoPacket(object);
              }
              object = this.setStonePacketNameList(object);
            }
            this.packetConfig = this.packetPanelSvc.addStoneToPacketConfiguration(this.packetConfig, event);
            this.updateStonePacketList(event);
          });
        } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.PS_IN_ST_500)) {
          this.messageService.showErrorGrowlMessage(MessageCodes[res.code]);
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_PACKET');
      });
    }
  }

  updateStonePacketList(event) {
    for (let i = 0; i < 2; i++) {
      this.packets[i].data.forEach(packet => {
        if ((String(packet.packet_id) === event.packet_id) && packet.stone_ids.length > 0) {
          packet.stone_details.forEach(object => {
            event.stones.forEach(stone => {
              packet.stone_details.push({ packet_id: event.packet_id, stone_id: stone.stone_id });
            });
          });
        }
      });
    }
  }

  removeStoneFromPacket(event) {
    const stoneIDs = [];
    event.stones.forEach(stone => {
      stoneIDs.push(stone.stone_id);
    });
    if (stoneIDs.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.packetPanelSvc.removeStoneFromPacket(event.packet_id, stoneIDs).subscribe((res) => {
        this.notify.hideBlockUI();
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.PS_RM_ST_200)) {
          this.messageService.showSuccessGrowlMessage(res.message);
          this.packets.forEach(object => {
            if (object.packet_id && (String(object.packet_id) === String(event.packet_id))) {
              stoneIDs.forEach(id => {
                object.data.stone_details.forEach(stone => {
                  if (String(stone.stone_id) === String(id)) {
                    const stoneIndex = object.data.stone_details.indexOf(stone);
                    object.data.stone_details.splice(stoneIndex, 1);
                  }
                });
              });

              if (object.data.stone_details.length > 0) {
                object.data.display_data = this.stoneSvc.calculateSelectedStoneData(object.data.stone_details);
              } else {
                this.packets.forEach(tab => {
                  if (tab.packet_id && (String(tab.packet_id) === String(event.packet_id))) {
                    const i = this.packets.indexOf(tab);
                    this.packets.splice(i, 1);
                  }
                });
              }
            }
            this.packetConfig = this.packetPanelSvc.removeStoneFromPacketConfiguration(this.packetConfig, event);
            this.updateRemovedStonePacketList(event);
            object = this.setStonePacketNameList(object);
          });
        } else {
          this.messageService.showErrorGrowlMessage('STONE_NOT_FOUND');
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('ERR_REMOVE_STONE_PACKET');
      });
    }
  }

  updateRemovedStonePacketList(event) {
    for (let i = 0; i < 2; i++) {
      this.packets[i].data.forEach(packet => {
        if (packet.stone_ids.length > 0) {
          event.stones.forEach(stone => {
            packet.stone_details.forEach(object => {
              if ((String(object.packet_id) === event.packet_id) && (object.stone_id === stone.stone_id)) {
                const index = packet.stone_details.indexOf(object);
                packet.stone_details.splice(index, 1);
              }
            });
          });
        }
      });
    }
  }

  addExtraStoneInfoPacket(element) {
    if (element && element.data.stone_details) {
      this.stoneSvc.storeStoneAdditionalInfo(element.data.stone_details).subscribe((response) => {
        if (response) {
          this.stoneSvc.getDiamondPriceInfo(element.data.stone_details).subscribe((stoneResponse) => {
            element.data.stone_details = stoneResponse;
            element.data.display_data = this.stoneSvc.calculateSelectedStoneData(element.data.stone_details);
          });
        }
      });
    }
    // this.refreshPacketTable();
  }

  removePacket(event) {
    this.packets.forEach((object) => {
      if (object.data && object.data.length > 0) {
        object.data.forEach((packet) => {
          if (packet.packet_id === event) {
            const removePacketHeader = this.customTranslateSvc.translateString('Delete packet');
            const removePacketMessage = this.customTranslateSvc.translateString(
              'DELETE_PACKET');
            this.confirmationService.confirm({
              message: removePacketMessage + '"' + packet.packet_name + '" ?',
              header: removePacketHeader,
              accept: () => {
                this.deletePacket(event, object, packet);
              }
            });
          }
        });
      }
    });
  }

  deletePacket(event, object, packet) {
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    this.packetPanelSvc.removePacket(event).subscribe((response) => {
      this.notify.hideBlockUI();
      if (response !== undefined) {
        if (response.error_status === false && MessageCodesComparator.AreEqual(response.code, MessageCodes.PS_DL_PCK_200)) {
          this.packetPanelSvc.removeElement(object.data, packet);
          if (object.data.length === 0) {
            this.message = 'NO_PACKET_FOUND';
          }
          this.packetConfig = this.packetPanelSvc.removePacketFromPacketConfiguration(this.packetConfig, event);
          this.updatePacketTabs(event);
          this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
          this.reducePacketCountInLocalStorage();
        } else if (response.error_status === true && MessageCodesComparator.AreEqual(response.code, MessageCodes.PS_NDD_404)) {
          this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
        }
      }
    }, error => {
      this.notify.hideBlockUI();
      this.messageService.showErrorGrowlMessage('ERR_REMOVE_PACKET');
    });
  }

  updatePacketTabs(packetId) {
    this.packets.forEach((object, index) => {
      if (object.packet_id === packetId) {
        this.packets.splice(index, 1);
      }
    });
  }

  reducePacketCountInLocalStorage() {
    if (this.userDeviceService.isDeviceSupportLocalStorage()) {
      const packetCount = window.localStorage.getItem(this.authService.getLoginName() + '-my-packets-size');
      if (packetCount && Number(packetCount)) {
        let packetCountNo = Number(packetCount);
        packetCountNo = (packetCountNo > 0) ? (packetCountNo - 1) : 0;
        window.localStorage.setItem(this.authService.getLoginName() + '-my-packets-size', String(packetCountNo));
      } else {
        window.localStorage.setItem(this.authService.getLoginName() + '-my-packets-size', '0');
      }
    }
  }

  renamePacket(object) {
    for (let i = 0; i <= 1; i++) {
      if (this.packets[i].data !== undefined) {
        this.packets[i].data.forEach((packet) => {
          if (packet.packet_id === object.packet_id) {
            packet = Object.assign({}, object);
            this.packetConfig.forEach((config) => {
              for (const key in config) {
                if (key === String(object.packet_id)) {
                  config[key].packet_name = object.packet_name;
                }
              }
            });
          }
        });
      }
    }
  }

  addStoneDetailTab(data) {
    this.packets.forEach((element) => {
      if (element.stoneName === data.stone_id) {
        this.removeDetailedPacketTab(element.stoneName);
      }
    });
    this.packets.push({
      stoneName: data.stone_id,
      stoneInfo: data
    });
    this.lastCreatedTab = data.stone_id;
  }

  refreshTable() {
    if (this.thmPacketPanelComponent && this.thmPacketPanelComponent.hasOwnProperty('packetGridComponent')) {
      if (this.thmPacketPanelComponent.packetGridComponent) {
        this.thmPacketPanelComponent.packetGridComponent.instance.refresh();
      }
    }
  }

  ngOnDestroy() {
    this.stoneClickedForDetailViewSubscription.unsubscribe();
  }

  changeActiveTab(e) {
    if (this.packetPanel) {
      this.packetPanel.selectedIndex = this.packets.length - 1;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.fixedHeader();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.onWindowScroll();
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
    }
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

}
