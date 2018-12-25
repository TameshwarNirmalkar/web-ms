import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacketsComponent } from './packets.component';
import { SharedModule } from '@srk/shared';
import { PacketsService } from './packets.service';
import { PacketListComponent } from './packet-list/packet-list.component';
import { UserPacketComponent } from './user-packet/user-packet.component';
import { CreatePacketComponent } from './create-packet/create-packet.component';
import { PacketDetailsComponent } from './packet-details/packet-details.component';
import { PacketsRoutingModule } from './packets-routing.module';

@NgModule({
  imports: [
    CommonModule, PacketsRoutingModule,
    SharedModule
  ],
  declarations: [PacketsComponent, PacketListComponent, UserPacketComponent, CreatePacketComponent, PacketDetailsComponent],
  exports: [PacketsComponent, UserPacketComponent, CreatePacketComponent],
  providers: [PacketsService]
})
export class PacketsModule { }
