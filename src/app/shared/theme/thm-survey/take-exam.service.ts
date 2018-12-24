import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { AuthService, ApplicationDataService } from '@srk/core';
import { Observable } from 'rxjs';

@Injectable()
export class TakeExamService {

  constructor(public http: HttpClient,
    private applicationDataService: ApplicationDataService,
    private authService: AuthService) { }

  getSurveyElementsAPI(surveyId, hostname): Observable<any> {
    let responseFromGetSurveyElementsAPI
    return this.http.get('https://' + this.applicationDataService.getApplicationSettingValue('survey_org') + '.serenaway.com/steerhigh/v2/getSurveyElements/' + surveyId, this.setHeaderSerenaway(this.applicationDataService.getApplicationSettingValue('survey_user_code'),
      this.applicationDataService.getApplicationSettingValue('survey_org'),
      this.authService.getToken()));
  }
  saveResponsesAPI(responseJson, surveyId, hostname): Observable<any> {
    return this.http.post("https://" + this.applicationDataService.getApplicationSettingValue('survey_org') + ".serenaway.com/steerhigh/v2/saveSurveyResponse/" + surveyId + "/true", responseJson, this.setHeaderSerenaway(this.applicationDataService.getApplicationSettingValue('survey_user_code'),
      this.applicationDataService.getApplicationSettingValue('survey_org'),
      this.authService.getToken()));
  }
  callIndraftSurveyAPI(surveyId, surveyReceipientDetailsId, hostname): Observable<any> {
    return this.http.get("https://" + this.applicationDataService.getApplicationSettingValue('survey_org') + ".serenaway.com/steerhigh/v2/getSurveyResponses/" + surveyId + "/" + surveyReceipientDetailsId + "/true", this.setHeaderSerenaway(this.applicationDataService.getApplicationSettingValue('survey_user_code'),
      this.applicationDataService.getApplicationSettingValue('survey_org'),
      this.authService.getToken()));
  }

  setHeaderSerenaway(userCode, orgName, token) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    headers.append('user_code', userCode);
    headers.append('orgName', orgName);
    headers.append('token', token);
    const options = new HttpResponse({ headers: headers });
    return options;
  }
}
