import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { ApplicationDataService } from '@srk/core';
import { AuthService } from '@srk/core';
import { ErrorHandlerService } from '@srk/core';

@Injectable()
export class HoldListService {

  constructor(
    private http: HttpClient,
    private applicationDataService: ApplicationDataService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService
  ) { }

  getMyHoldList(): any {
    return this.http.get(this.applicationDataService.getEnvironment().StoneManagementApi
      + '/stonemgt/' + this.authService.getLoginName() + '/hold/list/'
      + this.applicationDataService.getEnvironment().StoneManagementApiVersion)
      .map((res: Response) => {
        const responseArray = res.json();
        return responseArray;
      })
      .catch(err => { return this.errorHandler.handleError('HoldListService:getMyHoldList', err); });
  }

}
