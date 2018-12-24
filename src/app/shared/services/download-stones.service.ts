import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { AuthService } from '@srk/core';
import { ErrorHandlerService } from '@srk/core';
import { ApplicationDataService } from '@srk/core';
import { Observable } from 'rxjs/Observable';
import { NotifyService } from '@srk/core';
import { MessageService } from '@srk/core';
import { UserProfileService } from '@srk/core';
import { HttpRequest, HttpResponse, HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { ApplicationStorageService } from '@srk/core';
import { ApplicationAuditService } from '@srk/core';
import { UtilService } from './util.service';
import { StoneDetailsService } from './stone-details.service';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class DownloadStonesService {
  public clientLimits: any;
  public downloadFlag = false;
  private readonly acceptedStoneParams = ['stone_id', 'shape', 'color', 'carat', 'price_srk', 'rap_off',
    'cut', 'polish', 'clarity', 'symmetry', 'fluor', 'diameter', 'ratio', 'total_depth_percent',
    'table', 'luster', 'table_black', 'side_black', 'table_white', 'side_white', 'table_spot',
    'side_spot', 'table_open', 'crown_open', 'pav_open', 'girdle_open', 'table_extra_facet',
    'crown_extra_facet', 'pav_extra_facet', 'hna', 'price_rap', 'kts', 'crown_angle', 'pav_angle',
    'crown_height', 'pav_height', 'lower_half', 'star_length', 'girdle_percent', 'culet',
    'lab_comment', 'eligibility', 'image_url', 'movie_url', 'cert_url', 'hna_url', 'sgs',
    'length', 'width', 'height', 'girdle', 'certificate_no', 'certificate', 'color_legends_json', 'tgirdle', 'digiplot_url'];

  private readonly acceptedDaypStoneParams = ['certificate', 'stone_id', 'shape', 'color', 'carat', 'price_srk',
    'table', 'rap_off', 'cut', 'polish', 'clarity', 'symmetry', 'fluor', 'ratio', 'total_depth_percent', 'luster',
    'table_black', 'side_black', 'table_white', 'side_white', 'table_spot', 'side_spot', 'table_open', 'crown_open',
    'pav_open', 'girdle_open', 'table_extra_facet', 'crown_extra_facet', 'pav_extra_facet', 'hna', 'price_rap', 'kts',
    'crown_angle', 'pav_angle', 'crown_height', 'pav_height', 'lower_half', 'star_length', 'girdle_percent', 'culet',
    'movie_url', 'image_url', 'hna_url', 'cert_url', 'sgs', 'length', 'width', 'height', 'table_percent', 'dayp_rate',
    'dayp_per', 'girdle', 'certificate_no', 'color_legends_json', 'tgirdle', 'final_submit', 'digiplot_url'];

  private acceptedConfirmationStoneParams = ['status', 'amount', 'diameter', 'lab_comment', 'eligibility',
    'certificate', 'stone_id', 'shape', 'color', 'carat', 'price_srk',
    'table', 'rap_off', 'cut', 'polish', 'clarity', 'symmetry', 'fluor', 'ratio', 'total_depth_percent', 'luster',
    'table_black', 'side_black', 'table_white', 'side_white', 'table_spot', 'side_spot', 'table_open', 'crown_open',
    'pav_open', 'girdle_open', 'table_extra_facet', 'crown_extra_facet', 'pav_extra_facet', 'hna', 'price_rap', 'kts',
    'crown_angle', 'pav_angle', 'crown_height', 'pav_height', 'lower_half', 'star_length', 'girdle_percent', 'culet',
    'movie_url', 'image_url', 'hna_url', 'cert_url', 'sgs', 'length', 'width', 'height', 'dayp_rate',
    'dayp_per', 'girdle', 'certificate_no', 'color_legends_json', 'tgirdle'];
  // 'terms_discount', 'event_discount', 'coOp_discount','blind_percent', 'wvd_percent',
  //  'price_final','final_off', 'final_payable_amount',

  public downloadOptions = [
    { label: 'HD Image', value: 'image' },
    { label: 'MP4', value: 'video' },
    { label: 'H&A', value: 'handa' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private applicationDataService: ApplicationDataService,
    private authService: AuthService,
    private messageService: MessageService,
    private notify: NotifyService,
    private userProfileService: UserProfileService,
    private httpClient: HttpClient,
    private appStore: ApplicationStorageService,
    private auditService: ApplicationAuditService,
    private stoneDetailsService: StoneDetailsService,
    private utilService: UtilService) {
    this.clientLimits = this.userProfileService.getClientLimits();
  }

  uploadExcel(formData): Observable<any> {
    const headerData = new HttpHeaders();
    headerData.append('Accept', 'application/json');
    headerData.append('calling_entity', 'UI');
    headerData.append('token', this.authService.getToken());

    return this.http.post(this.applicationDataService.getEnvironment().ExcelManagementApi +
      '/excelmgnt/upload/search/' + this.applicationDataService.getEnvironment().ExcelManagementApiVersion,
      formData, { headers: headerData })
      .pipe(
        map((response) => response ),
        catchError(err => this.errorHandler.handleError('excelService:uploadExcel', err))
      );
  }

  getDownloadOptions(permission: string) {
    const array = JSON.parse(JSON.stringify(this.downloadOptions));
    if (this.authService.hasElementPermission(permission)) {
      array.push({ label: 'Excel', value: 'excel' });
    }
    return array;
  }

  downloadStoneDetails(tableData, stone_ids, downloadType) {
    const data = [];
    stone_ids.forEach(id => {
      tableData.forEach(stone => {
        if (stone.stone_id === id) {
          data.push(stone);
        }
      });
    });
    let downloadAction: any;
    switch (downloadType) {
      case 'image':
        this.downloadStoneImage(data);
        downloadAction = 'IMAGE DOWNLOAD';
        break;
      case 'video':
        this.downloadStoneVideo(data);
        downloadAction = 'MOVIE DOWNLOAD';
        break;
      case 'handa':
        this.downloadStoneHandA(data);
        downloadAction = 'HA DOWNLOAD';
        break;
      case 'excel':
        this.downloadStoneExcel(tableData, stone_ids);
        downloadAction = 'EXCEL EXPORT';
        break;
    }
    this.auditService.storeActionAudit(downloadAction);
  }

  downloadStoneImage(array) {
    let imageDownloadLimit;
    if (this.clientLimits && this.clientLimits.gif_download_limit) {
      imageDownloadLimit = this.clientLimits.gif_download_limit.entity_value;
    } else {
      imageDownloadLimit = 3;
    }
    if (array.length <= imageDownloadLimit) {
      const zip = new JSZip();
      const folder = zip.folder('Images');
      const data = [];
      array.forEach(stone => {
        const stoneData = {};
        if (stone.image_url && stone.image_url !== '') {
          stone.image_url = stone.image_url.trim();
          stoneData['url'] = stone.image_url;
          stoneData['stone_id'] = stone.stone_id;
          data.push(stoneData);
        }
      });
      this.download(data, 'image', folder, zip);
    } else {
      const params = { imageDownloadLimit: imageDownloadLimit };
      this.messageService.showDynamicErrorGrowlMessage('MAXIMUM_IMAGE_DOWNLOAD_LIMIT', params);
    }
  }

  downloadStoneVideo(array) {
    let videoDownloadLimit;
    if (this.clientLimits && this.clientLimits.video_download_limit) {
      videoDownloadLimit = this.clientLimits.video_download_limit.entity_value;
    } else {
      videoDownloadLimit = 3;
    }
    if (array.length <= videoDownloadLimit) {
      const zip = new JSZip();
      const folder = zip.folder('Videos');
      const data = [];
      array.forEach(stone => {
        const stoneData = {};
        if (stone.download_movie_url && stone.download_movie_url !== '') {
          stone.download_movie_url = stone.download_movie_url.trim();
          stoneData['url'] = stone.download_movie_url;
          stoneData['stone_id'] = stone.stone_id;
          data.push(stoneData);
        }
      });
      this.download(data, 'movie', folder, zip);
    } else {
      const params = { videoDownloadLimit: videoDownloadLimit };
      this.messageService.showDynamicErrorGrowlMessage('MAXIMUM_VIDEO_DOWNLOAD_LIMIT', params);
    }
  }

  downloadStoneHandA(array) {
    let haDownloadLimit;
    if (this.clientLimits && this.clientLimits.handa_download_limit) {
      haDownloadLimit = this.clientLimits.handa_download_limit.entity_value;
    } else {
      haDownloadLimit = 3;
    }
    if (array.length <= haDownloadLimit) {
      const zip = new JSZip();
      const folder = zip.folder('H&A');
      const data = [];
      array.forEach(stone => {
        const stoneData = {};
        if (stone.hna_url && stone.hna_url !== '') {
          stone.hna_url = stone.hna_url.trim();
          stoneData['url'] = stone.hna_url;
          stoneData['stone_id'] = stone.stone_id;
          data.push(stoneData);
        }
      });
      this.download(data, 'hna', folder, zip);
    } else {
      const params = { haDownloadLimit: haDownloadLimit };
      this.messageService.showDynamicErrorGrowlMessage('MAXIMUM_HA_DOWNLOAD_LIMIT', params);
    }
  }

  download(data, type, folder, zip) {
    if (data.length > 0) {
      this.messageService.showInfoGrowlMessage('CONTENT_DOWNLOAD_SOON');
      let array = this.createDownloadIndex();
      let count = 0;
      const index = array.length - 1;
      const dataSize = data.length;
      let prePercentDone = 0;
      let percentDone = 0;
      let eventtotal = 0;
      let eventloaded = 0;
      let prevLoaded = 0;
      const downloadedItemArray: any = [];

      data.forEach(stoneData => {
        const request = this.createHttpRequestForDownload(stoneData.url);
        this.httpClient.request(request).subscribe(event => {
          this.notify.notifyDownloadProgress(array);
          if (event.type === HttpEventType.DownloadProgress) {
            eventloaded = prevLoaded + event.loaded;
            prevLoaded = event.loaded;
            if (downloadedItemArray.length === 0 || downloadedItemArray.indexOf(event.total) === -1) {
              eventtotal = eventtotal + event.total;
              downloadedItemArray.push(event.total);
            }
            if (dataSize === downloadedItemArray.length) {
              percentDone = Math.round(100 * dataSize * event.loaded / eventtotal);
              if (prePercentDone > percentDone) {
                percentDone = prePercentDone;
              } else {
                percentDone = percentDone > 100 ? 100 : percentDone;
              }
              array = this.updateDownloadIndex(index, array, percentDone, true);
              this.notify.notifyDownloadProgress(array);
              prePercentDone = percentDone;
            }

          } else if (event instanceof HttpResponse) {
            if (event.body.hasOwnProperty('body')) {
              count++;
              if (type !== 'movie') {
                const fileExtension = stoneData.url.split('.').pop();
                if (fileExtension === 'gif') {
                  folder.file(stoneData.stone_id + '.gif', event.body['body'].data, { base64: true });
                } else {
                  folder.file(stoneData.stone_id + '.jpeg', event.body['body'].data, { base64: true });
                }
              } else {
                folder.file(stoneData.stone_id + '.mp4', event.body['body'].data, { base64: true });
              }
              if (count === data.length) {
                zip.generateAsync({ type: 'blob' })
                  .then((content) => {
                    saveAs(content, 'download.zip');
                  });
                array = this.updateDownloadIndex(index, array, 100, false);
                this.notify.notifyDownloadProgress(array);
              }
            }
          }
        }, err => {
          array = this.updateDownloadIndex(index, array, 100, false);
          this.notify.notifyDownloadProgress(array);
          this.messageService.showErrorGrowlMessage('DOWNLOAD_FAILURE');
        });
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_FILES_FOUND_DOWNLOAD');
    }
  }

  fetch(url): Observable<object> {
    return this.http.post(this.applicationDataService.getEnvironment().ExcelManagementApi + '/request/headers/getBinaryData/'
    + this.applicationDataService.getEnvironment().ExcelManagementApiVersion, JSON.stringify({url: url}))
      .pipe(
        map(res => {
            if (!res['error_status'] && res) {
              const body = res['body'].data;
              return body;
            }
        }),
        catchError(err => this.errorHandler.handleError('searchResult:downloadImage', err))
      );
  }

  createHttpRequestForDownload(url) {
    const headerData: HttpHeaders = new HttpHeaders({
      'token': this.authService.getToken(),
      'Content-Type': 'application/json', 'calling_entity': 'UI'
    });
    const req = new HttpRequest('POST', this.applicationDataService.getEnvironment().ExcelManagementApi
      + '/request/headers/getBinaryData/' + this.applicationDataService.getEnvironment().ExcelManagementApiVersion,
      JSON.stringify
        ({
          url: url
        }),
      {
        headers: headerData,
        reportProgress: true
      }
    );
    return req;
  }

  downloadStoneExcel(data, stone_ids) {
    data = this.filterExcelColumns(data, stone_ids, '');
    this.messageService.showInfoGrowlMessage('CONTENT_DOWNLOAD_SOON');
    const config = {
      'stones': data
    };
    let array = this.createDownloadIndex();
    const index = array.length - 1;
    const headerData: HttpHeaders = new HttpHeaders({
      'token': this.authService.getToken(),
      'Content-Type': 'application/json', 'calling_entity': 'UI'
    });
    const req = new HttpRequest('POST', this.applicationDataService.getEnvironment().ExcelManagementApi
      + '/excelmgnt/download/search/' + this.applicationDataService.getEnvironment().ExcelManagementApiVersion,
      JSON.stringify(config),
      {
        headers: headerData,
        reportProgress: true,
        responseType: 'blob'
      }
    );
    let percentDone = 0;
    this.httpClient.request(req).subscribe(event => {
      if (event.type === HttpEventType.DownloadProgress) {
        percentDone = Math.round(100 * event.loaded / event.total);
        this.notify.notifyDownloadProgress(array);
      } else if (event instanceof HttpResponse) {
        const date = new Date();
        const fileName = this.authService.getLoginName() + '_' +
          this.utilService.tranformDate(date, 'shortDate') + '_' +
          this.utilService.getFormatTime(date) + '.xlsx';
        if (event.hasOwnProperty('body')) {
          const excelFile = event.body;
          saveAs(excelFile, fileName.toString());
          array = this.updateDownloadIndex(index, array, 100, false);
          this.notify.notifyDownloadProgress(array);
        } else {
          array = this.updateDownloadIndex(index, array, 100, false);
          this.notify.notifyDownloadProgress(array);
          this.messageService.showErrorGrowlMessage('ERR_EXCEL_DOWNLOAD');
        }
      }
    }, err => {
      array = this.updateDownloadIndex(index, array, 100, false);
      this.notify.notifyDownloadProgress(array);
      this.messageService.showErrorGrowlMessage('ERR_EXCEL_DOWNLOAD');
    });
  }

  mailStoneExcel(array, stone_ids, page_name) {
    const mail = true;
    this.messageService.showInfoGrowlMessage('MAIL_RECEIVE_SOON');
    this.mailExcel(array, stone_ids, page_name).subscribe(response => {
      if (response.error_status) {
        this.messageService.showErrorGrowlMessage('ERR_MAIL_SEND');
      } else {
        this.messageService.showSuccessGrowlMessage('MAIL_SEND_SUCCESS');
      }
    }, err => {
      this.messageService.showErrorGrowlMessage('ERR_MAIL_SEND');
    });
  }

  mailDAYPStoneExcel(array, stone_ids, page_name) {
    const mail = true;
    this.messageService.showInfoGrowlMessage('MAIL_RECEIVE_SOON');
    this.mailDAYPExcel(array, stone_ids, page_name).subscribe(response => {
      if (response.error_status) {
        this.messageService.showErrorGrowlMessage('ERR_MAIL_SEND');
      } else {
        this.messageService.showSuccessGrowlMessage('MAIL_SEND_SUCCESS');
      }
    }, err => {
      this.messageService.showErrorGrowlMessage('ERR_MAIL_SEND');
    });
  }

  mailExcel(data, stone_ids, page_name): Observable<any> {
    data = this.filterExcelColumns(data, stone_ids, '');
    const kamDetails = this.userProfileService.importKAMDetails();
    let cc = '';
    if (kamDetails) {
      if (kamDetails.primaryEmailId && kamDetails.primaryEmailId !== '') {
        cc = kamDetails.primaryEmailId;
      }
    }
    const config = {
      'stones': data,
      'is_mail_send': true,
      'cc': cc,
      'subject': page_name
    };
    return this.http.post(this.applicationDataService.getEnvironment().ExcelManagementApi
      + '/excelmgnt/download/search/' + this.applicationDataService.getEnvironment().ExcelManagementApiVersion,
      JSON.stringify(config))
      .pipe(
        map(response => response),
        catchError(err => this.errorHandler.handleError('searchResult:mailExcel', err))
      );
  }

  mailDAYPExcel(data, stone_ids, page_name): Observable<any> {
    data = this.filterExcelColumns(data, stone_ids, 'dayp');
    const kamDetails = this.userProfileService.importKAMDetails();
    let cc = '';
    if (kamDetails) {
      if (kamDetails.primaryEmailId && kamDetails.primaryEmailId !== '') {
        cc = kamDetails.primaryEmailId;
      }
    }
    const config = {
      'stones': data,
      'is_mail_send': true,
      'cc': cc,
      'subject': page_name
    };
    return this.http.post(this.applicationDataService.getEnvironment().ExcelManagementApi
      + '/excelmgnt/download/dayp/' + this.applicationDataService.getEnvironment().ExcelManagementApiVersion,
      JSON.stringify(config))
      .pipe(
        map(response => response),
        catchError(err => this.errorHandler.handleError('searchResult:mailExcel', err))
      );
  }

  downloadDaypStoneExcel(data, stone_ids) {
    this.messageService.showInfoGrowlMessage('CONTENT_DOWNLOAD_SOON');
    let tableArray = JSON.parse(JSON.stringify(data));
    tableArray = this.filterExcelColumns(tableArray, stone_ids, 'dayp');
    tableArray.forEach(stone => {
      if (stone.final_submit === null || stone.final_submit === undefined) {
        stone.final_submit = false;
      }
      if (!!stone.dayp_rate) {
        stone.dayp_rate = stone.dayp_rate.toString().replace(',', '');
        stone.dayp_rate = Number(stone.dayp_rate);
      }
      if (!!stone.dayp_per) {
        stone.dayp_per = stone.dayp_per.toString().replace(',', '');
        stone.dayp_per = Number(stone.dayp_per);
      }
    });
    const config = {
      'stones': tableArray
    };

    const headerData: HttpHeaders = new HttpHeaders({
      'token': this.authService.getToken(),
      'Content-Type': 'application/json',
      'calling_entity': 'UI'
    });
    const req = new HttpRequest('POST', this.applicationDataService.getEnvironment().ExcelManagementApi
      + '/excelmgnt/download/dayp/' + this.applicationDataService.getEnvironment().ExcelManagementApiVersion,
      JSON.stringify(config),
      {
        headers: headerData,
        reportProgress: true,
        responseType: 'blob'
      }
    );
    let percentDone = 0;
    this.httpClient.request(req).subscribe(event => {
      if (event.type === HttpEventType.DownloadProgress) {
        percentDone = Math.round(100 * event.loaded / event.total);
        this.notify.notifyDownloadProgress({ progress: percentDone, flag: true });
      } else if (event instanceof HttpResponse) {
        const date = new Date();
        const fileName = this.authService.getLoginName() + '_' +
          this.utilService.tranformDate(date, 'shortDate') + '_' +
          this.utilService.getFormatTime(date) + '.xlsx';
        if (event.hasOwnProperty('body')) {
          const excelFile = event.body;
          saveAs(excelFile, fileName.toString());
        } else {
          this.messageService.showErrorGrowlMessage('ERR_EXCEL_DOWNLOAD');
        }
        this.notify.notifyDownloadProgress({ progress: 100, flag: false });
      }
    }, err => {
      this.messageService.showErrorGrowlMessage('ERR_EXCEL_DOWNLOAD');
    });
  }


  downloadConfirmationExcel(data, stone_ids) {
    let tableArray = JSON.parse(JSON.stringify(data));
    tableArray = this.filterExcelColumns(tableArray, stone_ids, 'confirmation');
    const config = {
      'stones': tableArray
    };
    const headerData: HttpHeaders = new HttpHeaders({
      'token': this.authService.getToken(),
      'Content-Type': 'application/json',
      'calling_entity': 'UI'
    });
    const req = new HttpRequest('POST', this.applicationDataService.getEnvironment().ExcelManagementApi
      + '/excelmgnt/download/myConfirmation/' + this.applicationDataService.getEnvironment().ExcelManagementApiVersion,
      JSON.stringify(config),
      {
        headers: headerData,
        reportProgress: true,
        responseType: 'blob'
      }
    );
    let percentDone = 0;
    this.httpClient.request(req).subscribe(event => {
      if (event.type === HttpEventType.DownloadProgress) {
        percentDone = Math.round(100 * event.loaded / event.total);
        this.notify.notifyDownloadProgress({ progress: percentDone, flag: true });
      } else if (event instanceof HttpResponse) {
        const date = new Date();
        const fileName = this.authService.getLoginName() + '_' +
          this.utilService.tranformDate(date, 'shortDate') + '_' +
          this.utilService.getFormatTime(date) + '.xlsx';
        if (event.hasOwnProperty('body')) {
          const excelFile = event.body;
          saveAs(excelFile, fileName.toString());
        } else {
          this.messageService.showErrorGrowlMessage('ERR_EXCEL_DOWNLOAD');
        }
        this.notify.notifyDownloadProgress({ progress: 100, flag: false });
      }
    }, err => {
      this.messageService.showErrorGrowlMessage('ERR_EXCEL_DOWNLOAD');
    });
  }

  filterExcelColumns(array, stone_ids, type) {
    let dataArray = JSON.parse(JSON.stringify(array));
    const table = [];
    let config, parameterList;
    dataArray = this.fetchStoneDetails(dataArray, stone_ids);
    if (type === 'dayp') {
      parameterList = this.acceptedDaypStoneParams;
    } else if (type === 'confirmation') {
      parameterList = JSON.parse(JSON.stringify(this.acceptedConfirmationStoneParams));
      const permissionCheckFor = this.listOfPermissions();
      permissionCheckFor.forEach(permission => {
        if (this.authService.hasElementPermission(permission.permissionName)) {
          parameterList.push(permission.value);
        }
      });
      if (this.stoneDetailsService.showFinalPayableAndFinalOff()) {
        parameterList = parameterList.concat(['price_final', 'final_off', 'final_payable_amount']);
      }
    } else {
      parameterList = this.acceptedStoneParams;
    }
    dataArray.forEach(stone => {
      config = {};
      parameterList.forEach(value => {
        if (stone.hasOwnProperty(value)) {
          if (value === 'movie_url' && stone['movie_url'] === null) {
            stone[value] = '';
          }
          if (value === 'digiplot_url' && stone['digiplot_url'] === null) {
            stone[value] = '';
          }
          if (value === 'dayp_rate' && (stone['dayp_rate'] === null || stone['dayp_rate'] === undefined || stone['dayp_rate'] === '')) {
            stone[value] = '';
          }
          if (value === 'dayp_per' && (stone['dayp_per'] === null || stone['dayp_per'] === undefined || stone['dayp_per'] === '')) {
            stone[value] = '';
          }
          config[value] = stone[value];
        }
      });
      table.push(config);
    });
    return table;
  }

  listOfPermissions() {
    return [
      { permissionName: 'weekly_volume_discount', value: 'wvd_percent' },
      { permissionName: 'co_op_discount', value: 'coOp_discount' },
      { permissionName: 'blind_discount', value: 'blind_percent' },
      { permissionName: 'terms_discount', value: 'terms_discount' },
      { permissionName: 'event_discount', value: 'event_discount' }
    ]
  }

  fetchStoneDetails(array, stone_ids) {
    const stoneDetails = [];
    stone_ids.forEach(stone => {
      array.forEach(element => {
        if (element.stone_id === stone) {
          stoneDetails.push(element);
        }
      });
    });
    return stoneDetails;
  }

  createDownloadIndex() {
    let downloadIndexArray = [];
    if (this.appStore.getData('downloadIndex')) {
      downloadIndexArray = this.appStore.getData('downloadIndex');
    }
    const obj = {
      index: downloadIndexArray.length + 1,
      progress: 0,
      flag: true
    };
    downloadIndexArray.push(obj);
    this.appStore.store('downloadIndex', downloadIndexArray);
    return downloadIndexArray;
  }

  updateDownloadIndex(index, array, progress, flag) {
    if (array && array[index]) {
      array[index].progress = progress;
      array[index].flag = flag;
    }
    return array;
  }

  downloadAvailableDaypStock() {
    let percentDone = 0;
    this.notify.notifyDownloadProgress({ progress: percentDone, flag: true });
    this.messageService.showInfoGrowlMessage('CONTENT_DOWNLOAD_SOON');
    const headerData: HttpHeaders = new HttpHeaders({
      'token': this.authService.getToken(),
      'Content-Type': 'application/json',
      'calling_entity': 'UI'
    });
    const req = new HttpRequest('GET', this.applicationDataService.getEnvironment().ExcelManagementApi
      + '/excelmgnt/download/availableDaypStock/' + this.applicationDataService.getEnvironment().ExcelManagementApiVersion,
      {
        headers: headerData,
        reportProgress: true,
        responseType: 'blob'
      }
    );
    this.httpClient.request(req).subscribe(event => {
      if (event.type === HttpEventType.DownloadProgress) {
        percentDone = Math.round(100 * event.loaded / event.total);
        const array = [{ progress: percentDone, flag: true }]
        this.notify.notifyDownloadProgress(array);
      } else if (event instanceof HttpResponse) {
        const date = new Date();
        const fileName = this.authService.getLoginName() + '_DAYP_STOCK_' +
          this.utilService.tranformDate(date, 'shortDate') + '_' +
          this.utilService.getFormatTime(date) + '.xlsx';
        if (event.hasOwnProperty('body')) {
          const excelFile = event.body;
          saveAs(excelFile, fileName.toString());
        } else {
          this.messageService.showErrorGrowlMessage('ERR_EXCEL_DOWNLOAD');
        }
        this.notify.notifyDownloadProgress({ progress: 100, flag: false });
      }
    }, err => {
      this.messageService.showErrorGrowlMessage('ERR_EXCEL_DOWNLOAD');
    });
  }
}
