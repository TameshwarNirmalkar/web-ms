import { Component, OnInit, Input } from '@angular/core';
import { ConfirmationService } from 'primeng/components/common/api';
import {
  CustomTranslateService, NotifyService, SearchService, ApplicationStorageService, MessageService,
  MessageCodes, MessageCodesComparator, UserProfileService
} from '@srk/core';
import * as _ from 'underscore';
import { Router } from '@angular/router';
import { DaypService } from '@srk/shared';

@Component({
  selector: 'app-saved-search',
  templateUrl: './saved-search.component.html',
  styleUrls: ['./saved-search.component.scss']
})
export class SavedSearchComponent implements OnInit {
  public savedSearchData = [];
  public selectedSavedSearch: any;
  public searchCriteria: any;
  public loadSavedSearchData = true;
  public isEditSavedSearch = false;
  public searchFiltersValue: any;
  public editedSavedSearchName: any;
  public isDaypActive = false;
  public selectedEmailSavedSearch = [];
  public sendEmailStatus = false;
  public isMailActive: boolean;
  public isBtbAvailable = false;

  constructor(
    private userProfileService: UserProfileService,
    private searchService: SearchService,
    private translateSvc: CustomTranslateService,
    private appStore: ApplicationStorageService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private notify: NotifyService,
    private router: Router,
    private daypSvc: DaypService) { }

  ngOnInit() {
    this.searchService.getDetailedSavedSearchList().subscribe(res => {
      this.isBtbAvailable = this.userProfileService.checkBTBVersion();
      this.loadSavedSearchData = false;
      this.savedSearchData = this.searchService.sortByDateTime(res);
      this.savedSearchData.forEach(object => {
        object.isEditable = false;
        object.isRequested = false;
        object.editedSavedSearchName = object.saved_search_name;
        object.is_active_mail = object.is_active_mail;
      });
      this.isBtbAvailable = this.userProfileService.checkBTBVersion();
    });
    this.daypSvc.checkActiveDaypStatus().subscribe(res => {
      if (!res.error_status && res.data && res.data.remainingTime && res.data.remainingTime.data) {
        const responseData = res.data.remainingTime.data;
        this.isDaypActive = responseData.isDAYPEventOn;
      }
    });
  }

  editSavedSearchData(data) {
    this.selectedSavedSearch = data;
    this.searchService.getSavedSearchFilters(data.criteria);
    this.searchCriteria = (JSON.parse(data.criteria)).filter;
    this.searchFiltersValue = this.searchService.getSelectedFiltersValue();
    this.isEditSavedSearch = true;
  }

  cancelModifySearch() {
    this.isEditSavedSearch = false;
  }

  editSavedSearch(event) {
    let editMessage = 'Do you want to save search ';
    let editHeader = 'Save Search Confirmation';
    editMessage = this.translateSvc.translateString(editMessage);
    editHeader = this.translateSvc.translateString(editHeader);
    this.confirmationService.confirm({
      message: editMessage + this.selectedSavedSearch.saved_search_name + ' ?',
      header: editHeader,
      accept: () => {
        const serviceData = this.createServiceData(event);
        this.searchService.editSavedSearch(serviceData, false).subscribe(res => {
          if (!res.error_status && MessageCodesComparator.AreEqual(res.code, MessageCodes.ELS_SSE_200)) {
            this.messageService.showSuccessGrowlMessage('SEARCH_SAVED');
            this.savedSearchData.filter((savedSearch) => {
              if (this.selectedSavedSearch._id === savedSearch._id) {
                savedSearch.criteria = JSON.stringify(event);
              }
            });
            this.isEditSavedSearch = false;
          } else if (res.error_status && MessageCodesComparator.AreEqual(res.code, MessageCodes.ELS_SS_CDN_409)) {
            this.messageService.showErrorGrowlMessage('ERR_SEARCH_NAME_EXIST');
          } else {
            this.messageService.showErrorGrowlMessage('SAVED_SEARCH_EDIT_ERROR');
          }
        }, error => {
          this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
        });
      }
    });
  }

  createServiceData(filterData) {
    return [{
      saved_search_name: this.selectedSavedSearch.saved_search_name,
      saved_search_id: this.selectedSavedSearch._id,
      created_on: this.selectedSavedSearch.created_on,
      filter: filterData.filter,
      is_active_mail: this.selectedSavedSearch.is_active_mail
    }];
  }

  getSavedStoneDetails(name, criteria, btnType, count) {
    if (count > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.searchService.getSavedStonesList(name, criteria, btnType).subscribe(res => {
        if (!res.error_status && res.data.body && res.data.body.length > 0) {
          if (btnType === 'dayp') {
            const daypSearchObject = {
              result: this.searchService.getSearchResultData(),
              searchConfig: this.searchService.getSearchConfigData(),
              selectedSearchValue: this.searchService.getSelectedFiltersValue()
            };
            this.appStore.store('DAYP-Saved-Search', daypSearchObject);
            this.router.navigate(['/web/dayp/']);
          } else if (btnType === 'b2b') {
            const btbSearchObject = {
              result: this.searchService.getSearchResultData(),
              searchConfig: this.searchService.getSearchConfigData(),
              selectedSearchValue: this.searchService.getSelectedFiltersValue()
            };
            this.appStore.store('B2B-Saved-Search', btbSearchObject);
            this.router.navigate(['/web/bid-to-buy']);
          } else {
            let count = this.appStore.getData('GENERAL_SEARCH:count');
            if (count && count > 0) {
              count++;
            } else {
              count = 1;
            }
            this.notify.notifySearch({ count: count });
            this.appStore.store('GENERAL_SEARCH:count', count);
          }
        } else {
          this.messageService.showErrorGrowlMessage('Sorry! No data found');
        }
        this.notify.hideBlockUI();
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    } else {
      this.messageService.showErrorGrowlMessage('Sorry! No data found');
    }
  }

  deleteSavedSearchData(data) {
    let deleteMessage = 'DELETE_SAVED_SEARCH';
    let deleteHeader = 'Delete Confirmation';
    deleteMessage = this.translateSvc.translateString(deleteMessage);
    deleteHeader = this.translateSvc.translateString(deleteHeader);
    this.confirmationService.confirm({
      message: deleteMessage + '"' + data.saved_search_name + '" ?',
      header: deleteHeader,
      accept: () => {
        this.searchService.deleteSavedSearch(data._id).subscribe(res => {
          if (!res.error_status && res.data.count) {
            if (res.data.count > 0) {
              this.messageService.showSuccessGrowlMessage('SAVED_SEARCH_DELETE_SUCCESS');
              this.savedSearchData.filter((savedSearch) => {
                if (data._id === savedSearch._id) {
                  const i = this.savedSearchData.indexOf(savedSearch);
                  if (i > -1) {
                    this.savedSearchData.splice(i, 1);
                  }
                }
              });
            } else {
              this.messageService.showErrorGrowlMessage('ERROR_SAVED_SEARCH_DELETE');
            }
          } else {
            this.messageService.showErrorGrowlMessage('ERROR_SAVED_SEARCH_DELETE');
          }
        });
      }
    });
  }

  editSaveSearchName(saveSearchID) {
    let targetObject: any;
    targetObject = _.findWhere(this.savedSearchData, { _id: saveSearchID });
    targetObject.editedSavedSearchName = targetObject.saved_search_name;
    targetObject.isEditable = true;
  }

  renameSaveSearchName(saveSearchID) {
    let targetObject: any;
    targetObject = _.findWhere(this.savedSearchData, { _id: saveSearchID });
    if (targetObject.editedSavedSearchName && targetObject.editedSavedSearchName !== null) {
      targetObject.editedSavedSearchName = targetObject.editedSavedSearchName.trim();
      if (targetObject.editedSavedSearchName.toLowerCase() === targetObject.saved_search_name.toLowerCase()) {
        this.messageService.showErrorGrowlMessage('ERR_SEARCH_NAME_EXIST');
      } else {
        const jsonObject = JSON.parse(targetObject.criteria);
        const config = [{
          saved_search_name: targetObject.editedSavedSearchName,
          saved_search_id: targetObject._id,
          created_on: targetObject.created_on,
          filter: jsonObject.filter,
          is_active_mail: targetObject.is_active_mail
        }];
        targetObject.isRequested = true;
        this.searchService.editSavedSearch(config, true).subscribe(response => {
          targetObject.isRequested = false;
          if (response) {
            if (!response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.ELS_SSE_200)) {
              this.messageService.showSuccessGrowlMessage('SEARCH_NAME_SAVED');
              targetObject.saved_search_name = targetObject.editedSavedSearchName;
              targetObject.isEditable = false;
            } else if (response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.ELS_SS_CDN_409)) {
              this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
            }
          } else {
            this.messageService.showErrorGrowlMessage('SAVED_SEARCH_NAME_EDIT_ERROR');
          }
        }, error => {
          targetObject.isRequested = false;
          this.messageService.showErrorGrowlMessage('SAVED_SEARCH_NAME_EDIT_ERROR');
        });
      }
    } else {
      targetObject.isEditable = false;
      this.messageService.showErrorGrowlMessage('ERR_EMPTY_SEARCH_NAME');
    }
  }

  cancelEditName(saveSearchID) {
    let targetObject: any;
    targetObject = _.findWhere(this.savedSearchData, { _id: saveSearchID });
    targetObject.isEditable = false;
  }

  sendSavedSearchMail() {
    if (this.selectedEmailSavedSearch.length > 0) {
      const emailList = [];
      const noStoneSavedList = [];
      this.savedSearchData.forEach((savedSearch) => {
        const i = this.selectedEmailSavedSearch.indexOf(savedSearch._id);
        if (i > -1) {
          if (savedSearch.count_details.count > 0) {
            const obj = {
              'saved_search_id': savedSearch._id,
              'saved_search_name': savedSearch.saved_search_name
            };
            emailList.push(obj);
          } else {
            noStoneSavedList.push(savedSearch.saved_search_name);
          }
        }
      });
      if (noStoneSavedList.length > 0) {
        const params = { noStoneSavedSearch: noStoneSavedList.toString() };
        this.messageService.showDynamicInfoGrowlMessage('NO_SAVED_STONE_LIST', params);
      }
      if (emailList.length > 0) {
        this.sendEmailStatus = true;
        this.searchService.sendSavedSearchEmail(emailList).subscribe(response => {
          this.sendEmailStatus = false;
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.EMS_SS_MAIL_200)) {
            this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.EMS_NO_SS_STONE_200)) {
            const params = { noStoneSavedSearch: emailList.toString() };
            this.messageService.showDynamicInfoGrowlMessage('NO_SAVED_STONE_LIST', params);
          } else {
            this.messageService.showErrorGrowlMessage('ERROR_SENDING_MAIL');
          }
        }, error => {
          this.sendEmailStatus = false;
          this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
        });
      }
    } else {
      this.messageService.showErrorGrowlMessage('SELECT_SAVED_SEARCH_NO');
    }
  }

  operateMail(status) {
    if (this.selectedEmailSavedSearch.length > 0) {
      const obj = {
        'is_active_mail': status,
        'saved_search_ids': this.selectedEmailSavedSearch
      };
      this.searchService.operateMail(obj).subscribe(response => {
        if (MessageCodesComparator.AreEqual(response.code, MessageCodes.ELS_SS_MAIL_200)) {
          this.selectedEmailSavedSearch.forEach(element => {
            this.savedSearchData.forEach(object => {
              if (element === object._id) {
                object.is_active_mail = status;
              }
            });
          });
          const message = status ? 'ACTIVATE_MAIL' : 'DEACTIVATE_MAIL';
          this.messageService.showSuccessGrowlMessage(message);
        } else {
          this.messageService.showErrorGrowlMessage('ERROR_SENDING_MAIL');
        }
      }, error => {
        this.sendEmailStatus = false;
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    } else {
      this.messageService.showErrorGrowlMessage('SELECT_SAVED_SEARCH_NO');
    }
  }
}
