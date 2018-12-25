import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChange } from '@angular/core';
import { Packets } from '../packets';
import { PacketsService } from '../packets.service';
import { PacketPanelService } from '@srk/shared';
import { ApplicationStorageService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';

@Component({
  selector: 'app-user-packet',
  templateUrl: './user-packet.component.html',
  styleUrls: ['./user-packet.component.scss']
})
export class UserPacketComponent implements OnInit, OnChanges {
  @Input() packetCreated: Packets;
  @Input() togglePanel: boolean;

  @Output() showPanel = new EventEmitter();
  @Output() rename = new EventEmitter();
  @Output() hide = new EventEmitter();
  @Output() delete = new EventEmitter();

  public editedPacketName: any;
  public packetList: Packets[] = [];
  public stonePrice: any;
  public isEditable = false;
  public isRequested = false;

  constructor(
    private packetService: PacketsService,
    private packetPanelService: PacketPanelService,
    private notify: NotifyService,
    private messageService: MessageService,
    private appStore: ApplicationStorageService) { }

  ngOnInit() { }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.packetList.push(this.packetCreated);
  }

  closePacket(packet) {
    this.packetList.forEach((object) => {
      if (object.packet_name === packet.packet_name) {
        this.hide.emit(object);
      }
    });
  }

  deletePacket(packet) {
    this.packetList.forEach((object) => {
      if (object.packet_name === packet.packet_name) {
        this.delete.emit(object);
      }
    });
  }

  updatePacketName(pname) {
    this.isEditable = true;
    this.editedPacketName = pname;
  }

  renamePacketName(packetName, packet) {
    this.packetList.forEach((object) => {
      if (object.packet_id === packet.packet_id) {
        if (packetName !== '' && packetName !== undefined) {
          this.isRequested = true;
          this.packetPanelService.renamePacket(object.packet_id, packetName).subscribe((response) => {
            this.isRequested = false;
            if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_PAC_UPD_200)) {
              object.packet_name = response.data.packet_name;
              this.rename.emit(object);
              this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
            } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.DP_PC_NAME_200)) {
              this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
            }
          }, error => {
            this.isRequested = false;
            this.editedPacketName = object.packet_name;
            this.messageService.showErrorGrowlMessage('Error while renaming the packet');
          });
        } else {
          this.isRequested = false;
          this.messageService.showErrorGrowlMessage('ERR_PACKET_NAME');
          this.isEditable = false;
        }
        this.isEditable = false;
      }
    });
  }

  cancelRename(packet) {
    this.packetList.forEach((object) => {
      if (object.packet_id === packet.packet_id) {
        this.editedPacketName = object.packet_name;
      }
    });
    this.isEditable = false;
  }

  selectPacket(packet_id, toggle) {
    this.packetList.forEach((object) => {
      if (object.packet_id === packet_id) {
        if (object.data.stone_details.length > 0) {
          toggle = !toggle;
          object.data.isSelected = toggle;
          this.showPanel.emit({ packet: object });
        }
      }
    });
  }
}
