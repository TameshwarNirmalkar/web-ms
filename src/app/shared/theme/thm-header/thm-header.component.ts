import { Component, OnInit, Input, EventEmitter, Output, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/components/common/api';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'underscore';
import { Subscription } from 'rxjs/Subscription';
import { Base64 } from 'js-base64';
import { Observable } from 'rxjs/Observable';
import { NotifyService, UserProfileService,
  DateTimeService, AuthService, CustomTranslateService,
  MessageCodes, MessageCodesComparator, UserPushNotificationService,
  ApplicationDataService, MessageService, SearchService,
  ApplicationAuditService, UserDeviceService
} from '@srk/core';

import { DownloadStonesService } from '../../services/download-stones.service';
import { TakeExamService } from '../thm-survey/take-exam.service';
import { HIREST_URL_CONSTANT } from '../thm-survey/urlConstant';
import { ThmHeaderService } from './thm-header.service';
import { UtilService } from '../../services/util.service';

declare var jQuery: any;

@Component({
  selector: 'thm-header',
  templateUrl: './thm-header.component.html',
  styleUrls: ['./thm-header.component.scss']
})
export class ThmHeaderComponent implements OnInit, OnDestroy {
  @Output() stoneIDs = new EventEmitter();
  @Output() redirectUser = new EventEmitter();
  @ViewChild('searchField') searchField: any;
  @ViewChild('confirmDialog') confirmDialog: any;

  private updateNotificationCountSubscription: Subscription;
  public timerSubscription: Subscription;
  public querySelector: any;
  public nav: any;
  public wrapper: any;
  public menu: any;
  public mailNotifications: any[] = [];
  public clientDisplayName: any;
  public registerForNotification: any;
  public notificationCount: number;
  public messageList: any[] = [];
  public messageFromWebSocket: any;
  public inputStoneIds: any;
  public isFileUploaded = false;
  public selectedFileName: any;
  public fileLength: number;
  public fileExtError: any;
  public fileSizeError: any;
  public fileSearch: any;
  public searchForm: FormGroup;
  public logoutDaypBtbObservable: Subscription;
  public loginSurveyId: any
  public logoutSurveyId: any;
  public surveyQuestionsObj: any = {};
  public isLogoutClicked: boolean = false;
  public isAskMeLaterClicked: boolean = false;
  public logoutSurveyTaken: boolean = false;
  public isSurveyAvailable = false;
  //serenaway
  public message: any;
  public link: any;
  public surveyId: any;
  public surveyResponsesDetailsId: any;
  public getCurrentIp: any;
  public surveyPublishMode: any;
  public requestId: any;
  public surveyReceipientDetailId: any;
  public surveyQuesJson: any;
  public surveyName: any;
  public surveyResponseData: any;
  public currentPageNumber: any;
  public showValidationMessage: boolean;
  public validationMessage: any;
  public profileData: any;
  public displayMode: any;
  public statementLength: any;
  public currentDisplayPageNumber: any;
  public feedbackDetails: any;
  public showFeedback: boolean;
  public surveyType: string;
  public surveyStatus: string;
  public getReceipientDetailsById: any;
  public surveyEndDate: any;
  public surveyGiven: Boolean;

  public myPagesArray: any;
  public ctr: any;
  public temp: any
  public index: any;
  public examId: any;
  public userId: any;
  public examDetailsobject: any;
  public examName: any;
  public exam_timer_status: string;
  public callSaveResponseApiStatusOnTimerEnd: boolean;
  public popupHeight = window.innerHeight * (80 / 100);
  public popupWidth = window.innerWidth * (80 / 100);
  public indianTime: any;
  public indianDate: any;
  public currentClockTime: any;
  public timeCounter = 0;
  private readonly monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  public showSrkCalendar = false;

  constructor(
    private formBuilder: FormBuilder,
    private searchSvc: SearchService,
    private notifyService: NotifyService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private userProfileService: UserProfileService,
    private customTranslateSvc: CustomTranslateService,
    private userPushNotificationService: UserPushNotificationService,
    private applicationDataService: ApplicationDataService,
    public messageService: MessageService,
    public uploadService: DownloadStonesService,
    public notify: NotifyService,
    private auditService: ApplicationAuditService,
    public _takeSurveyService: TakeExamService,
    private thmHeaderService: ThmHeaderService,
    private utilService: UtilService,
    private userDeviceService: UserDeviceService,
    private dateTimeService: DateTimeService) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {

    if (this.nav) {

      if ($('#navMenuContainerId').width() < 56) {

        jQuery('#jsMenu').slimScroll({
          destroy: true
        }).animate({ 'width': '55px' }, 300, 'linear', () => {

          jQuery('#jsMenu').slimScroll({
            height: window.innerHeight - 61 + 'px',
            width: '55px',
            size: '10px',
            railVisible: true,
            alwaysVisible: true
          });

        });

      } else {

        jQuery('#jsMenu').slimScroll({
          destroy: true
        }).animate({ 'width': '200px' }, 300, 'linear', () => {

          jQuery('#jsMenu').slimScroll({
            height: window.innerHeight - 61 + 'px',
            width: '200px',
            size: '10px',
            railVisible: true,
            alwaysVisible: true
          });

        });

      }

    }

  }

  ngOnInit() {
    this.getUserSurveyConfiguration();
    this.notificationCount = 0;
    this.clientDisplayName = this.authService.getUserDetail().person_name;
    this.querySelector = document.querySelector.bind(document);
    this.nav = document.querySelector('.vertical_nav_menu__minify');
    this.updateNotificationCountSubscription = this.notifyService.notifyMessageRecieedFromPushObservable$.subscribe((res) => {
      if (res.count) {
        this.updateNotificationCount(res.count);
      }
    });

    this.searchForm = this.formBuilder.group({
      search_value: ['', Validators.required]
    });
    this.logoutDaypBtbObservable = this.notifyService.notifyToLogoutObservable$.subscribe(res => {
      if (res.status) {
        this.showLogoutOverlay();
      }
    });
    this.getCurrentISTTime();
  }

  getCurrentISTTime() {
    this.dateTimeService.fetchCurrentTime().subscribe(res => {
      if (res) {
        this.timeCounter = 0;
        this.indianTime = res.hour + ':' + res.minute + ':' + res.second;
        this.indianDate = res.date + ' ' + this.monthNames[Number(res.month) - 1] + ' ' + res.year;
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
        this.getTimeCountDown(res);
      }
    });
  }

  getTimeCountDown(time) {
    let seconds = (Number(time.hour) * 60 * 60) + (Number(time.minute) * 60) + Number(time.second);
    let mins, hour, sec;
    this.timerSubscription = Observable.timer(0, 1000)
      .subscribe(t => {
        this.timeCounter++;
        if (this.timeCounter === 300) {
          this.getCurrentISTTime();
        }
        seconds++;
        hour = Math.floor((seconds % 86400) / 3600);
        mins = Math.floor(((seconds % 86400) % 3600) / 60);
        sec = ((seconds % 86400) % 3600) % 60;
        this.indianTime = (hour < 10 ? '0' : '') + hour.toString() + ':' + (mins < 10 ? '0' : '') +
          mins.toString() + ':' + (sec < 10 ? '0' : '') + sec.toString();
        const ISTTime = (hour < 10 ? '0' : '') + hour.toString() + ':' + (mins < 10 ? '0' : '') +
          mins.toString();
        this.dateTimeService.setIndianTime(ISTTime);
      });
  }

  showTime() {
    this.currentClockTime = this.utilService.checkISTtime();
    this.indianTime = this.utilService.tranformDate(this.currentClockTime, 'HH:mm:ss');
    this.indianDate = this.utilService.tranformDate(this.currentClockTime, 'dd-MoM-yyyy');
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.popupHeight = window.innerHeight * (80 / 100);
    this.popupWidth = window.innerWidth * (80 / 100);
  }

  ngOnDestroy() {
    this.updateNotificationCountSubscription.unsubscribe();
    this.logoutDaypBtbObservable.unsubscribe();
    this.timerSubscription.unsubscribe();
  }

  fetchAllMessage() {
    this.userPushNotificationService.fetchMessage(false).subscribe((res) => {
      this.messageList = res.data;
      this.mailNotifications = this.messageList;
      let count = this.messageList.length;
      this.updateNotificationCount(count);
    }, error => {

    });
  }

  updateNotificationCount(count) {
    this.notificationCount = this.notificationCount + count;
  }

  collapseList() {

    if ($(this.nav).hasClass('vertical_nav_menu')) {

      jQuery('#jsMenu').slimScroll({
        destroy: true
      }).animate({ 'width': '55px' }, 300, 'linear', () => {

        jQuery('#jsMenu').slimScroll({
          height: window.innerHeight - 61 + 'px',
          width: '55px',
          size: '10px',
          railVisible: true,
          alwaysVisible: true
        });

      });

    } else {

      jQuery('#jsMenu').slimScroll({
        destroy: true
      }).animate({ 'width': '200px' }, 300, 'linear', () => {

        jQuery('#jsMenu').slimScroll({
          height: window.innerHeight - 61 + 'px',
          width: '200px',
          size: '10px',
          railVisible: true,
          alwaysVisible: true
        });

      });

    }


    this.notifyService.notifyToggleMenu({ component: 'component' });
    this.nav.classList.toggle('vertical_nav_menu');

  }

  logout() {
    if (window.location.href.indexOf('dayp') > -1) {
      this.notifyService.notifyDaypBtbPageLogout({ status: 1 });
    } else if (window.location.href.indexOf('bid-to-buy') > -1) {
      this.notifyService.notifyDaypBtbPageLogout({ status: 1 });
    } else {
      if (this.logoutSurveyId) {
        this.isLogoutClicked = true
        this.showSurveyPopUp(this.logoutSurveyId);
        this.surveyId = this.logoutSurveyId;
        if (window.localStorage.getItem("ask-me-later-clicked-logout") === "true" || this.logoutSurveyTaken)
          this.showLogoutOverlay();
      }
      else
        this.showLogoutOverlay();
    }
  }

  showLogoutOverlay() {
    let logoutMessage = 'Do you want to logout?';
    let logoutHeader = 'Logout';
    logoutMessage = this.customTranslateSvc.translateString(logoutMessage);
    logoutHeader = this.customTranslateSvc.translateString(logoutHeader);
    this.confirmationService.confirm({
      message: logoutMessage,
      header: logoutHeader,
      accept: () => {
        this.authService.logoutUser().subscribe(res => {
          if (res.error_status === false) {
            this.userProfileService.resetPopupVisile();
            const logout = [''];
            this.notifyService.notifyDaypBtbPageLogout({ status: 2 });
            this.router.navigate(logout);
          }
        }, error => {
          this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
        });
      }
    });
  }

  uploadExcel(event) {
    const fileList: FileList = event.target.files || event.srcElement.files;
    this.fileLength = fileList.length;
    this.fileSearch = fileList[0];
    this.selectedFileName = this.fileSearch.name;
    const ext = this.selectedFileName.substring(this.selectedFileName.lastIndexOf('.') + 1).toLowerCase();
    const extArray = ['xls', 'xlsx'];
    this.fileExtError = extArray.indexOf(ext) === -1 ? true : false;
    this.fileSizeError = fileList[0].size > 4000000 ? true : false;
    if (!this.fileExtError && !this.fileSizeError) {
      this.isFileUploaded = true;
    }
  }

  cancelFileSearch() {
    this.isFileUploaded = false;
  }

  onSubmit(value) {
    if (this.isFileUploaded) {
      if (!this.fileExtError && !this.fileSizeError) {
        this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
        this.uploadSearchExcel();
      } else {
        this.messageService.showErrorGrowlMessage('EXT_FILE_SIZE_ERROR');
      }
    } else {
      this.auditService.storeActionAudit('GLOBAL SEARCH');
      if (value.search_value !== '' && value.search_value !== null) {
        value.search_value = value.search_value.trim();
        let array = [];
        if ((value.search_value).indexOf(',') > -1) {
          value.search_value = value.search_value.replace(/,/g, ' ');
        }
        array = (value.search_value).split(' ');
        array = _.compact(array);
        if (array && array.length > 0) {
          this.searchSvc.getBtbVersionList().subscribe(res => {
            this.stoneIDs.emit({ key: 'stone_id', value: array });
          }, err => {
            this.stoneIDs.emit({ key: 'stone_id', value: array });
          });
        } else {
          this.messageService.showErrorGrowlMessage('ENTER_VALID_STONEID_HEADER');
        }
        this.searchField.nativeElement.blur();
      } else {
        this.messageService.showErrorGrowlMessage('ENTER_VALID_STONEID_HEADER');
      }
    }
  }

  uploadSearchExcel() {
    const fileFormData: FormData = new FormData();
    fileFormData.append('excel', this.fileSearch, this.selectedFileName);
    this.uploadService.uploadExcel(fileFormData).subscribe(response => {
      if (response && !response.error_status && (MessageCodesComparator.AreEqual(response.code, MessageCodes.EMS_SEU_SUCCESS_200)
        || MessageCodesComparator.AreEqual(response.code, MessageCodes.EMS_SDU_SUCCESS_200))) {
        this.isFileUploaded = false;
        if (response.data) {
          let stoneArray = [];
          let certificateArray = [];
          if (response.data.stone_ids) {
            stoneArray = response.data.stone_ids;
          }
          if (response.data.certificate_no) {
            certificateArray = response.data.certificate_no;
          }
          if (stoneArray.length > 0 || certificateArray.length > 0) {
            this.stoneIDs.emit({ key: 'stone_id', value: stoneArray.concat(certificateArray) });
          } else {
            this.messageService.showErrorGrowlMessage('ENTER_VALID_EXCEL');
            this.notify.hideBlockUI();
          }
        } else {
          this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
          this.notify.hideBlockUI();
        }
      } else {
        this.messageService.showErrorGrowlMessage('ENTER_VALID_EXCEL');
        this.notify.hideBlockUI();
      }
    });
  }

  openNotificationPopup() {
    this.auditService.storeActivityAudit('Notification');
  }

  goToProfilePage() {
    this.auditService.storeActivityAudit('ProfileClick');
    this.redirectUser.emit('/web/user-profile');
  }

  goToHomePage() {
    this.auditService.storeActivityAudit('LogoClick');
    this.redirectUser.emit('/web/dashboard');
  }

  getUserSurveyConfiguration() {
    this.thmHeaderService.getSurveyConfigOfUser().subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.RMS_DFS_200)) {
        if (res.data.login_survey_id || res.data.logout_survey_id) {
          this.loginSurveyId = res.data.login_survey_id;
          this.logoutSurveyId = res.data.logout_survey_id;
          if (this.loginSurveyId) {
            this.showSurveyPopUp(this.loginSurveyId);
          }
        }
      }
    }, err => {
    });
  }

  showSurveyPopUp(surveyId) {
    this.fetchQuestionFromSereneway(surveyId, this.surveyQuestionsObj);
  }

  askMeLaterAction() {
    this.surveyQuestionsObj['show_survey_overlay'] = false;
    this.isAskMeLaterClicked = true;
    if (this.isLogoutClicked) {
      this.showLogoutOverlay();
      window.localStorage.setItem("ask-me-later-clicked-logout", JSON.stringify(this.isAskMeLaterClicked));
    } else
      window.localStorage.setItem("ask-me-later-clicked-login", JSON.stringify(this.isAskMeLaterClicked));
  }

  dontAskAgainAction() {
    this.surveyQuestionsObj['show_survey_overlay'] = false;
    if (this.isLogoutClicked) {
      this.showLogoutOverlay();
      this.saveUserStatus(this.logoutSurveyId, true, false);
    } else {
      this.saveUserStatus(this.loginSurveyId, true, false);
    }
  }

  saveUserStatus(surveyId, isUserDeclined, isSurveyCompleted) {
    const body = {
      'survey_id': Number(surveyId),
      'is_user_declined': isUserDeclined,
      'is_survey_completed': isSurveyCompleted,
      'login_name': this.authService.getLoginName()
    };
    this.thmHeaderService.saveUserSurveyStatus(body).subscribe(res => {

    }, err => {
      this.messageService.showErrorGrowlMessage('Failure while storing data');
    });
    if (isSurveyCompleted) {
      this.surveyQuestionsObj['show_survey_overlay'] = false;
      if (Number(surveyId) !== Number(this.loginSurveyId)) {
        this.showLogoutOverlay();
        this.logoutSurveyTaken = true;
      }
    }
    if (isUserDeclined) {
      if (Number(surveyId) === Number(this.loginSurveyId)) {
        window.localStorage.setItem("dont-ask-me-login", "true");
      } else {
        window.localStorage.setItem("dont-ask-me-logout", "true");
      }
    }

  }
  fetchQuestionFromSereneway(surveyId, surveyQueObj) {
    const serenaywaySurvayApiUrl = this.applicationDataService.getApplicationSettingValue('survey_org');
    let finalSurveyId
    let postData = {
      "survey_id": surveyId,
      "recipient_details": [
        {
          "user_code": this.authService.getLoginName(),
          "created_by": "12",
          "updated_by": "12"
        }
      ]
    };
    const me = this;
    $.ajax({
      url: 'https://' + serenaywaySurvayApiUrl + '.serenaway.com/steerhigh/v1/publish/survey/recipients/configure/mail',
      headers: {
        'orgName': serenaywaySurvayApiUrl,
        'content-Type': 'application/json'
      },
      method: 'POST',
      dataType: 'json',
      data: JSON.stringify(postData),
      success: function (data) {
        surveyQueObj['url'] = data.data[0].survey_access_details.survey_url;
        if (surveyId === me.logoutSurveyId) {
          if (window.localStorage.getItem("ask-me-later-clicked-logout") === "true" || window.localStorage.getItem("dont-ask-me-logout") === "true" || me.logoutSurveyTaken) {
            surveyQueObj['show_survey_overlay'] = false;
            me.showLogoutOverlay();
          } else {
            surveyQueObj['show_survey_overlay'] = true;
            me.surveyLoadInitialize(surveyId, surveyQueObj['url']);
          }
        } else if (surveyId === me.loginSurveyId) {
          if (window.localStorage.getItem("ask-me-later-clicked-login") === "true" || window.localStorage.getItem("dont-ask-me-login") === "true") {
            surveyQueObj['show_survey_overlay'] = false;
          } else {
            surveyQueObj['show_survey_overlay'] = true;
            me.surveyLoadInitialize(surveyId, surveyQueObj['url']);
          }
        }
      }, error: function () {
        if (surveyId === me.logoutSurveyId)
          me.showLogoutOverlay();
      }
    });
  }

  surveyLoadInitialize(surveyIdFromSrk, url) {
    this.isSurveyAvailable = false;
    this.surveyName = '';
    this.callSaveResponseApiStatusOnTimerEnd = false;
    this.link = url;
    this.examId = +localStorage.getItem('examId');
    this.userId = +localStorage.getItem('userCode');
    const params = this.link.split('?')[1];
    this.surveyId = this.trimTheQueryParameters(params.get(HIREST_URL_CONSTANT.PARAM_SURVEY_ID));
    this.surveyPublishMode = this.trimTheQueryParameters(params.get(HIREST_URL_CONSTANT.PARAM_SURVEY_PUBLISH_MODE));
    this.surveyReceipientDetailId = this.trimTheQueryParameters(params.get(HIREST_URL_CONSTANT.PARAM_SURVEY_RECIPIENTS_DETAILS_ID));
    this.requestId = this.trimTheQueryParameters(params.get(HIREST_URL_CONSTANT.PARAM_REQUEST_ID));
    this.surveyType = this.trimTheQueryParameters(params.get(HIREST_URL_CONSTANT.PARAM_SURVEY_TYPE));
    this.showValidationMessage = false;
    this.getSurveyElementAPICall(surveyIdFromSrk, (new URL(this.link)).hostname);
  }

  updateStatusForExam(status) {
    const reqBody = {};
    reqBody[this.message.USER_ID] = this.userId;
    reqBody[this.message.FIELD_EXAM_ID] = this.examId;
    reqBody[this.message.CANDIDATE_EXAM_STATUS] = status;
  }
  currentPage(survey) {

    const currentPageNumber = survey.currentPageNo;
    this.currentDisplayPageNumber = currentPageNumber + 1;
    const surveyProgressStatus = HIREST_URL_CONSTANT.FIELD_SURVEY_STATUS_INDRAFT;
    const responsesDataArray = JSON.stringify(survey.data);
    if (this.showValidationMessage !== true) {
      this.createSurveyResponseJson(currentPageNumber, surveyProgressStatus, responsesDataArray);
    }
    localStorage.setItem("surveyJson", responsesDataArray);
    localStorage.setItem("page_number", this.currentDisplayPageNumber);
    this.callSaveResponseApiStatusOnTimerEnd = true;
  }
  completePage(survey) {
    this.surveyGiven = true;
    const currentPageNumber = survey.currentPageNo;
    const surveyProgressStatus = HIREST_URL_CONSTANT.FIELD_SURVEY_STATUS_COMPLETED;
    const responsesDataArray = JSON.stringify(survey.data);
    this.exam_timer_status = "COMPLETED";
    if (this.showValidationMessage !== true) {
      this.createSurveyResponseJson(currentPageNumber, surveyProgressStatus, responsesDataArray);
      this.saveUserStatus(this.surveyId, false, true);
    }
  }

  getSurveyElementAPICall(surveyId, hostname) {
    this._takeSurveyService.getSurveyElementsAPI(surveyId, hostname).subscribe(getSurveyElementsApiresponse => {
      this.isSurveyAvailable = true;
      this.surveyName = getSurveyElementsApiresponse.data.survey_name;
      this.surveyQuesJson = getSurveyElementsApiresponse.data.survey_questions_json;
      this.statementLength = JSON.parse(this.surveyQuesJson);
      this.statementLength = this.statementLength.pages.length;
      this.currentDisplayPageNumber = 1;
      this.surveyQuesJson = JSON.parse(this.surveyQuesJson);
      // this.surveyQuesJson['pages'] = this.shuffle(this.surveyQuesJson['pages']);
      this.surveyQuesJson = JSON.stringify(this.surveyQuesJson);
      // this.callIndraft(surveyId);
    }, error => {
      var errorCode = JSON.parse(error.status);
      if (errorCode == "403") {
        // this.tokenService.logout(window.location.href);
      }
    });
  }


  public shuffle(pagesArray) {
    this.ctr = pagesArray.length, this.temp, this.index;
    // While there are elements in the array
    while (this.ctr > 0) {
      // Pick a random index
      this.index = Math.floor(Math.random() * this.ctr);
      // Decrease ctr by 1
      this.ctr--;
      // And swap the last element with it
      this.temp = pagesArray[this.ctr];
      pagesArray[this.ctr] = pagesArray[this.index];
      pagesArray[this.index] = this.temp;
    }
    return pagesArray;
  }

  callIndraft(surveyId) {
    if (this.surveyPublishMode === '0') {
      this.callIndraftResponseAPI(surveyId);
    }
  }

  callIndraftResponseAPI(surveyId) {
    this._takeSurveyService.callIndraftSurveyAPI(surveyId, this.surveyReceipientDetailId, (new URL(this.link)).hostname).subscribe(indraftSurveyresponse => {
      if (indraftSurveyresponse.data.progress_status === 0) {
        this.surveyResponseData = JSON.parse(indraftSurveyresponse.data.survey_responses_json);
        this.currentPageNumber = indraftSurveyresponse.data.completed_page_number;
        this.currentDisplayPageNumber = this.currentPageNumber + 1;
      } else {
        this.showValidationMessage = true;
        this.displayMode = 'display';
        this.currentDisplayPageNumber = 1;
        this.surveyResponseData = JSON.parse(indraftSurveyresponse.data.survey_responses_json);
        this.validationMessage = HIREST_URL_CONSTANT.MSG_CONS_SURVEY_COMPLETED;
      }

    });
  }
  trimTheQueryParameters(queryParam) {
    const uriConvertedParamsValue = decodeURIComponent(queryParam);
    let decodedString;
    if (uriConvertedParamsValue !== 'null') {
      decodedString = (Base64.decode(uriConvertedParamsValue).replace(/['']+/g, ''));
    } else {
      decodedString = uriConvertedParamsValue;
    }
    const removeTheDoubleQuotesFromDecodedString = decodedString.replace(/"([^"]+(?="))"/g, '$1');
    return removeTheDoubleQuotesFromDecodedString;
  }


  createSurveyResponseJson(currentPageNumber, surveyProgressStatus, responsesDataArray) {
    const responseJson = {};
    responseJson[HIREST_URL_CONSTANT.FIELD_COMPLETED_PAGE_NUMBER] = currentPageNumber;
    responseJson[HIREST_URL_CONSTANT.FIELD_SURVEY_STATUS] = surveyProgressStatus;
    responseJson[HIREST_URL_CONSTANT.FIELD_SURVEY_RESPONSES] = responsesDataArray.toString();
    responseJson[HIREST_URL_CONSTANT.FIELD_RESPONSES_ADDITIONAL_DETAILS] = [];
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const ampm = (today.getHours() >= 12) ? 'PM' : 'AM';
    const dateTime = date + ' ' + time + ' ' + ampm;
    const timeJson = this.makeResponseAdditionalDetailsJson(HIREST_URL_CONSTANT.VALUE_SUBMITTED_ON, dateTime);
    responseJson[HIREST_URL_CONSTANT.FIELD_RESPONSES_ADDITIONAL_DETAILS].push(timeJson);

    const channelValue = this.userDeviceService.fetchUserDeviceDetails().device_type;
    const channelJson = this.makeResponseAdditionalDetailsJson(HIREST_URL_CONSTANT.VALUE_CHANNEL, channelValue);
    responseJson[HIREST_URL_CONSTANT.FIELD_RESPONSES_ADDITIONAL_DETAILS].push(channelJson);

    const browserValue = this.userDeviceService.fetchUserDeviceDetails().version;
    const browserJson = this.makeResponseAdditionalDetailsJson(HIREST_URL_CONSTANT.VALUE_BROWSER, browserValue);
    responseJson[HIREST_URL_CONSTANT.FIELD_RESPONSES_ADDITIONAL_DETAILS].push(browserJson);
    const ipJson = this.makeResponseAdditionalDetailsJson(HIREST_URL_CONSTANT.VALUE_IP_ADDRESS, this.userDeviceService.getDeviceIP);

    responseJson[HIREST_URL_CONSTANT.FIELD_RESPONSES_ADDITIONAL_DETAILS].push(ipJson);
    if (this.surveyPublishMode === '1') {
      if (this.getCurrentIp === undefined && this.getCurrentIp === null) {
        responseJson[HIREST_URL_CONSTANT.FIELD_CREATED_BY] = HIREST_URL_CONSTANT.VALUE_DEFAULT_USER;
        responseJson[HIREST_URL_CONSTANT.FIELD_UPDATED_BY] = HIREST_URL_CONSTANT.VALUE_DEFAULT_USER;
      } else {
        responseJson[HIREST_URL_CONSTANT.FIELD_CREATED_BY] = this.getCurrentIp;
        responseJson[HIREST_URL_CONSTANT.FIELD_UPDATED_BY] = this.getCurrentIp;
      }
      responseJson[HIREST_URL_CONSTANT.PARAM_SURVEY_RECIPIENTS_DETAILS_ID] = -1;
      if (this.surveyResponsesDetailsId !== undefined && this.surveyResponsesDetailsId !== null) {
        responseJson[HIREST_URL_CONSTANT.FIELD_SURVEY_RESPONSES_ID] = this.surveyResponsesDetailsId;
      }

    } else {
      const details_json = this.makeResponseAdditionalDetailsJson(HIREST_URL_CONSTANT.VALUE_REQUEST_ID, this.requestId);
      responseJson[HIREST_URL_CONSTANT.FIELD_RESPONSES_ADDITIONAL_DETAILS].push(details_json);
      responseJson[HIREST_URL_CONSTANT.FIELD_CREATED_BY] = this.surveyReceipientDetailId;
      responseJson[HIREST_URL_CONSTANT.FIELD_UPDATED_BY] = this.surveyReceipientDetailId;
      responseJson[HIREST_URL_CONSTANT.PARAM_SURVEY_RECIPIENTS_DETAILS_ID] = this.surveyReceipientDetailId;
    }
    this.saveResponsesAPICall(responseJson, this.surveyId);
  }
  saveResponsesAPICall(surveyResponseJson, surveyId) {
    this._takeSurveyService.saveResponsesAPI(surveyResponseJson, surveyId, (new URL(this.link)).hostname).subscribe(getSaveSurveyResponseJson => {

    });
  }

  makeResponseAdditionalDetailsJson(name, value) {
    const json = {};
    json[HIREST_URL_CONSTANT.VALUE_ATTRIBUTE_NAME] = name;
    json[HIREST_URL_CONSTANT.VALUE_ATTRIBUTE_VALUE] = value;
    return json;
  }


  displaySrkCalendar() {
    this.showSrkCalendar = true;
  }
}
