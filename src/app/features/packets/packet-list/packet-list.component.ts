import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PacketPanelService } from '@srk/shared';
import { StoneDetailsService } from '@srk/shared';
import { MessageService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';

@Component({
  selector: 'app-packet-list',
  templateUrl: './packet-list.component.html',
  styleUrls: ['./packet-list.component.scss']
})
export class PacketListComponent implements OnInit {

  @Input() packets: any[];
  @Output() packetInfoTab = new EventEmitter();
  @Output() remove = new EventEmitter();
  @Output() rename = new EventEmitter();

  public editedPacketName: any;
  public isEditable = false;
  public isRequested = false;

  constructor(
    private packetPanelSvc: PacketPanelService,
    private messageService: MessageService,
    private stoneSvc: StoneDetailsService) { }

  ngOnInit() { }

  addPacketInfoTab(packetName, packetID) {
    this.packetInfoTab.emit({ name: packetName, id: packetID });
  }

  editPacketName(packetID) {
    this.packets.forEach((object) => {
      if (object.packet_id === packetID) {
        this.editedPacketName = object.packet_name;
        object.isEditable = !object.isEditable;
      }
    });
  }

  renamePacketName(packetName, packet) {
    this.packets.forEach((object) => {
      if (object.packet_id === packet.packet_id) {
        if (packetName !== '' && packetName !== undefined) {
          this.isRequested = true;
          this.packetPanelSvc.renamePacket(object.packet_id, packetName).subscribe((response) => {
            this.isRequested = false;
            object.isEditable = !object.isEditable;
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
            object.isEditable = !object.isEditable;
          });
        } else {
          this.isRequested = false;
          this.messageService.showErrorGrowlMessage('ERR_PACKET_NAME');
          object.isEditable = !object.isEditable;
        }
      }
    });
  }

  cancelRename(packet) {
    this.packets.forEach((object) => {
      if (object.packet_id === packet.packet_id) {
        this.editedPacketName = object.packet_name;
        object.isEditable = !object.isEditable;
      }
    });
  }

}
