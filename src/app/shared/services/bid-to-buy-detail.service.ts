import { Injectable } from '@angular/core';
import { DiamondAttributes } from '@srk/core';
import { ErrorHandlerService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BidToBuyDetailService {

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private applicationDataService: ApplicationDataService
  ) { }

  getbtbStoneDetail(): any {
    return this.http.get('/assets/JSON/btb-popup.json');
  }


}
