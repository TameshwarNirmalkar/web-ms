import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorHandlerService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { StoneDetailsService } from './stone-details.service';
import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class PacketPanelService {

  public partyID: any;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private stoneSvc: StoneDetailsService,
    private applicationDataService: ApplicationDataService) {
  }

  getPacketStoneIDs(data: any[]) {
    if (data.length > 0) {
      const result = [];
      data.forEach((item) => {
        result.push(item.stone_id);
      });
      return result;
    }
  }

  renamePacket(packet_id, name): Observable<any> {
    const config = {
      'packet_id': Number(packet_id),
      'packet_name': name
    };

    return this.http.put(
      this.applicationDataService.getEnvironment().StoneManagementApi + '/packet/rename/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion, JSON.stringify(config))
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('PacketPanelService:renamePacket', err))
      );
  }

  removePacket(packet_id): Observable<any> {
    const config = {packet_id: Number(packet_id)};
    const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(config)
    };
    return this.http.delete(
      this.applicationDataService.getEnvironment().StoneManagementApi + '/packet/delete/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion, httpOptions)
      .pipe(
        map(res => res),
        catchError(err => this.errorHandler.handleError('PacketPanelService:removePacket', err))
      );
  }

  saveStoneToPacket(packet_id, stoneList): Observable<any> {
    stoneList = this.stoneSvc.removeDuplicateItemFromArray(stoneList);
    const config = {
      'packet_id': Number(packet_id),
      'stone_id_list': stoneList
    };
    return this.http.put(
      this.applicationDataService.getEnvironment().StoneManagementApi + '/packet/addStonesToPacket/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion, JSON.stringify(config))
      .pipe(
        map((res) => {
          if (!res['error_status']) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('PacketPanelService:saveStoneToPacket', err))
      );
  }

  removeStoneFromPacket(packet_id, stoneList): Observable<any> {
    stoneList = this.stoneSvc.removeDuplicateItemFromArray(stoneList);
    const config = {
      'packet_id': Number(packet_id),
      'stone_id_list': stoneList
    };
    return this.http.put(
      this.applicationDataService.getEnvironment().StoneManagementApi + '/packet/removeStonesFromPacket/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion, JSON.stringify(config))
      .pipe(
        map((res) => {
          if (!res['error_status']) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('PacketPanelService:removeStoneFromPacket', err))
      );
  }

  setDefinedPacketConfiguration(object: any[]) {
    const resultConfig = [];
    object.forEach((packet) => {
      const config = {};
      config[packet.packet_id] = {
        'packet_name': '',
        'stones': []
      };
      config[packet.packet_id].packet_name = packet.packet_name;
      config[packet.packet_id].stones = packet.stone_ids;
      resultConfig.push(config);
    });
    return resultConfig;
  }

  setPacketConfiguration(array) {
    const resultArray = [];
    if (array.length > 0) {
      array.forEach(object => {
        const config = {};
        config[object.packet_id] = {
          'packet_name': '',
          'stones': []
        };
        config[object.packet_id].packet_name = object.packet_name;
        if (object.data.hasOwnProperty('stone_details') && object.data.stone_details && object.data.stone_details.length > 0) {
          config[object.packet_id].stones = this.stoneSvc.createStoneIdList(object.data.stone_details);
        }
        resultArray.push(config);
      });
    }
    return resultArray;
  }

  removeElement(array, element) {
    const i = array.indexOf(element);
    array.splice(i, 1);
  }

  addStoneToPacketConfiguration(packetConfig, event) {
    packetConfig.forEach((config) => {
      for (const key in config) {
        if (config.hasOwnProperty(key)) {
          if (String(key) === String(event.packet_id)) {
            if (config[key].stones === undefined) {
              config[key].stones = [];
            }
            event.stones.forEach(stone => {
              config[key].stones.push(stone.stone_id);
            });
          }
        }
      }
    });
    return packetConfig;
  }

  removeStoneFromPacketConfiguration(packetConfig, event) {
    packetConfig.forEach((config) => {
      for (const key in config) {
        if (String(key) === String(event.packet_id)) {
          config[key].stones.forEach((value) => {
            event.stones.forEach(stone => {
              if (value === stone.stone_id) {
                this.removeElement(config[key].stones, value);
              }
            });
          });
        }
      }
    });
    return packetConfig;
  }

  removePacketFromPacketConfiguration(packetConfig, event) {
    packetConfig.forEach((config) => {
      for (const key in config) {
        if (key === String(event)) {
          this.removeElement(packetConfig, config[key]);
        }
      }
    });
    return packetConfig;
  }

  renamedPacketConfigurtaion(packetConfig, event) {
    packetConfig.forEach((config) => {
      for (const key in config) {
        if (key === String(event.packet_id)) {
          config[key].packet_name = event.packet_name;
        }
      }
    });
    return packetConfig;
  }

  getStonePacketList(array, id) {
    const resultArray = [];
    array.forEach(object => {
      if (object.data.stone_details) {
        object.data.stone_details.forEach(stone => {
          if (stone.stone_id === id) {
            resultArray.push(object.packet_name);
          }
        });
      }
    });
    return resultArray;
  }

  getValidAvailableStones(array) {
    const confirmableStones = [];
    array.forEach(element => {
      if (((element.stone_state !== 6)
        || (element.stone_state !== 0)
        || (element.stone_state !== 3 && element.reason_code === 1))
        || element.isOnHold !== 6) {
        confirmableStones.push(element);
      }
    });
    return confirmableStones;
  }
}
