import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { AuthService, ApplicationDataService } from '@srk/core'
import { Observable } from 'rxjs/Observable';


@Injectable()
export class ThmHeaderService {


    constructor(private applicationData: ApplicationDataService,
        private http: HttpClient,
        private authService: AuthService) {

    }

    getSurveyConfigOfUser(): Observable<any> {
        return this.http.get(this.applicationData.getEnvironment().SurveyApi + '/survey/' +
            this.authService.getLoginName() + '/getUserSurveyConfig/'+
            this.applicationData.getEnvironment().SurveyApiVersion);
    }

    saveUserSurveyStatus(body): Observable<any> {
        return this.http.post(this.applicationData.getEnvironment().SurveyApi + 'survey/' +
            this.authService.getLoginName() + '/updateUserSurveyStatus/' + this.applicationData.getEnvironment().SurveyApiVersion, body);
    }
}