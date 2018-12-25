import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ErrorHandlerService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { AuthService } from '@srk/core';
import { Packets } from './packets';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PacketsService {

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private applicationDataService: ApplicationDataService,
    private auth: AuthService) { }

  getMyPackets(): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().StoneManagementApi + '/packet/getPacketForClient/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion + '/' + this.auth.getLoginName())
      // return this.http.get('/assets/JSON/packets.json')
      .pipe(
        map((res: any) => {
          if (!res.error_status) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('my-packets-api', err))
      );
  }

  getRecommendedPackets(): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().StoneManagementApi + '/packet/get/recommended/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion + '/' + this.auth.getUserDetail().party_id)
      // return this.http.get('/assets/JSON/packets.json')
      .pipe(
        map((res: any) => {
          if (!res.error_status) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('recommended-packets-api', err))
      );
  }

  getPacketDetailById(packet_id): Observable<any> {
    return this.http.get(
      this.applicationDataService.getEnvironment().StoneManagementApi + '/packet/get/' +
      this.applicationDataService.getEnvironment().StoneManagementApiVersion + '/' + packet_id)
      // return this.http.get('/assets/JSON/getPacket.json')
      .pipe(
        map((res: any) => {
          if (!res.error_status) {
            return res;
          }
        }),
        catchError(err => this.errorHandler.handleError('my-packets-api', err))
      );
  }


  getDefinedPackets() {
    return this.getMyPackets().subscribe((responsePackets) => {
      if (responsePackets.data !== undefined) {
        return responsePackets.data;
      }
    });
  }
}
