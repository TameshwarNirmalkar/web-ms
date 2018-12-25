import { Component, OnInit, Output, EventEmitter, NgModule } from '@angular/core';
import { UserProfileService } from '@srk/core';
import { BrowserModule } from '@angular/platform-browser';
import { UserDeviceService } from '@srk/core';
import { DragulaService } from 'ng2-dragula';
import { MessageService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import { AuthService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { SearchType } from '@srk/core';
import 'jquery';
import { ThmRequestOverlayComponent } from '@srk/shared';

declare var jQuery: any;
declare var Waypoint: any;

@Component({
  selector: 'app-profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.scss']
})

export class ProfileSettingComponent implements OnInit {
  @Output() notificationMessage = new EventEmitter();
  public menuList = [
    { name: 'Language', id: 'manageLangId' },
    { name: 'Dashboard', id: 'manageDashboardId' },
    { name: 'Search Setting', id: 'manageSearchId' },
    { name: 'Search Result', id: 'manageColumnId' },
    { name: 'My Confirmation', id: 'manageConfirmationColumnId' },
    { name: 'Alert', id: 'manageAlertId' },
    { name: 'DAYP Preference', id: 'manageDaypPrefId' },
    { name: 'Search Result Preference', id: 'manageSavedSearchPopupId' },
    { name: 'Confirmation History Days', id: 'manageConfirmationDayId' },
    { name: 'Stone Details Exapanded', id: 'exapandedDetails' }
  ];
  public cardList: any[];
  public filterList: any[];
  public selectedFilter: any[];
  public columnList: any[];
  public selectedOrderColumn: any[];
  public allcolumnList: any[];
  public DefaultcolumnList: any[];
  public basketColumnList: any[];
  public b2bColumnList: any[];
  public VrColumnList: any[];
  public selectedColumn: any[];
  public selectedCardValues: any[];
  public selectedLang: any[];
  public alertList: any[];
  public selectedAlert: any[];
  public langList: any[];
  public daypPreferenceList: any[];
  public daypColumnList: any[];
  public profileSavedStatus: any[];
  public isAllowScrollEvent = true;
  public selectedDaypPreference: any[];
  public allDaypPreferenceList: any[];
  public isDaypActive = false;
  public confirmationColumnList: any[] = [];
  public selectedConfirmationColumn: any[];
  public allSaveSearchResultPreference: any[];
  public selectedSaveSearchResultPreference: any[];
  public searchType: any = SearchType.GENERAL_SEARCH;
  public confirmedDays: any;
  public confirmationDaysOptions: any[] = [];
  public globleSearch: any;

  constructor(
    private userProfileService: UserProfileService,
    private dragulaService: DragulaService,
    private customTranslateService: CustomTranslateService,
    private authService: AuthService,
    private userDeviceService: UserDeviceService,
    private notify: NotifyService,
    private messageService: MessageService,
    private appStore: ApplicationStorageService) { }


  ngOnInit() {
    this.profileSavedStatus = [];
    // const sticky = new Waypoint.Sticky({
    //   element: jQuery('#profileMenuBarId')
    // });
    this.initializeUserSetting();
  }

  initializeSrkColumnOrder() {
    const srkColumnOrder = this.userProfileService.getSrkColumnsOrder();
    srkColumnOrder.forEach(element => {
      this.allcolumnList.forEach(list => {
        if (element.value === list.value) {
          list.order = element.order;
        }
      });
    });
    this.allcolumnList.sort(function (a, b) {
      return parseFloat(a.order) - parseFloat(b.order);
    });
  }

  initializeUserSetting() {
    this.initializeCardList();
    this.initializeAlertList();
    this.initializeDaypColumnList();
    this.initializeDefaultColumnList();
    this.initializeColumnList();
    this.initializeFilterList();
    this.initializeLanguageList();
    this.initializeDaypPreference();
    this.initializeB2BColumnList();
    this.initializeBasketColumnList();
    this.initializeViewRequestColumnList();
    this.initializeConfirmationColumnList();
    this.initializeSaveSearchResultPreference();
    this.initializeConfirmHistoryDay();
  }

  initializeConfirmHistoryDay() {
    this.confirmationDaysOptions = this.userProfileService.getConfirmationHistoryDayOptions();
    const confirmHistoryObject = this.userProfileService.getConfirmationHistoryWeeks();
    if (confirmHistoryObject && confirmHistoryObject.entity_value) {
      this.confirmedDays = Number(confirmHistoryObject.entity_value);
    }
  }

  initializeSaveSearchResultPreference() {
    this.allSaveSearchResultPreference = [];
    this.selectedSaveSearchResultPreference = [];
    const allSaveSearchResultList = this.userProfileService.getSaveSearchResultPreference();
    const selectedSaveSearchResultList = this.userProfileService.getSelectedSaveSearchPreference();
    this.populateComparedList(allSaveSearchResultList, selectedSaveSearchResultList, 3);
  }

  initializeLanguageList() {
    this.langList = [];
    this.selectedLang = [];
    const allLang = this.userProfileService.getAllLanguages();
    const userSelectedLang = this.userProfileService.getSelectedLanguageList();
    this.populateComparedList(allLang, userSelectedLang, 2);
  }

  initializeColumnList() {
    this.columnList = [];
    const allColumnList = this.userProfileService.getAllColumnsList();
    const userSelectedList = this.userProfileService.getSelectedColumnList();
    this.populateComparedList(allColumnList, userSelectedList, 1);
  }

  initializeDefaultColumnList() {
    this.DefaultcolumnList = [];
    this.selectedOrderColumn = [];
    const CommanColumnList = this.userProfileService.getDefaultColumnsList();
    const userSelectedList = this.userProfileService.getSelectedColumnList();
    this.populateComparedList(CommanColumnList, userSelectedList, -2);
  }

  initializeDaypPreference() {
    this.allDaypPreferenceList = [];
    this.selectedDaypPreference = [];
    const allList = this.userProfileService.getDaypPreferences();
    const selectedList = this.userProfileService.getSelectedDaypValues();
    this.populateComparedList(allList, selectedList, 0);
  }

  initializeDaypColumnList() {
    this.selectedColumn = [];
    this.daypColumnList = [];
    this.allcolumnList = [];
    const DaypColumnList = this.userProfileService.getDaypColumnList();
    const selectedList = this.userProfileService.getSelectedColumnList();
    this.populateComparedList(DaypColumnList, selectedList, -3);
  }

  initializeB2BColumnList() {
    this.b2bColumnList = [];
    const allB2bColumnList = this.userProfileService.getB2BColumnList();
    const selectedList = this.userProfileService.getSelectedColumnList();
    this.populateComparedList(allB2bColumnList, selectedList, -4);
  }

  initializeBasketColumnList() {
    this.basketColumnList = [];
    const allBasketColumnList = this.userProfileService.getBasketColumnList();
    const selectedList = this.userProfileService.getSelectedColumnList();
    this.populateComparedList(allBasketColumnList, selectedList, -5);
  }

  initializeViewRequestColumnList() {
    this.VrColumnList = [];
    const allVrColumnList = this.userProfileService.getViewRequestColumnList();
    const selectedList = this.userProfileService.getSelectedColumnList();
    this.populateComparedList(allVrColumnList, selectedList, -6);
  }

  initializeFilterList() {
    this.filterList = [];
    this.selectedFilter = [];
    const userSelectedFilterList = this.userProfileService.getAllSearchFilterList();
    this.populateArrayList(userSelectedFilterList, 0);
  }

  initializeCardList() {
    this.cardList = [];
    this.selectedCardValues = [];
    const userSelectedCardList = this.userProfileService.getSelectedCardList();
    this.populateArrayList(userSelectedCardList, 1);
  }

  initializeAlertList() {
    this.alertList = [];
    this.selectedAlert = [];
    const userSelectedAlertList = this.userProfileService.getSelectedAlertList();
    this.populateArrayList(userSelectedAlertList, 2);
  }

  populateComparedList(allList, selectedList, flag) {
    for (const item in selectedList) {
      if (selectedList.hasOwnProperty(item)) {
        allList.forEach((element) => {
          if (item === element.value && selectedList[item].is_updatable) {
            // tslint:disable-next-line:max-line-length
            if (element.hasOwnProperty('permissionName') && !this.authService.hasElementPermission(element.permissionName)) {
            } else if (element.hasOwnProperty('isAllowToDisplay') && !element.isAllowToDisplay) {
            }
            else {
              if (flag === 0) {
                this.allDaypPreferenceList.push({ name: element.name, value: item });
              }
              if (flag === 1) {
                this.columnList.push(item);
                this.allcolumnList.push({ name: element.name, value: item, order: selectedList[item].order });
              }
              if (flag === -1) {
                this.confirmationColumnList.push({ name: element.name, value: item, order: selectedList[item].order });
              }
              if (flag === -2) {
                this.DefaultcolumnList.push(item);
                this.allcolumnList.push({ name: element.name, value: item, order: selectedList[item].order });
              }
              if (flag === -3) {
                this.daypColumnList.push(item);
                this.allcolumnList.push({ name: element.name, value: item, order: selectedList[item].order });
              }
              if (flag === -4) {
                this.b2bColumnList.push(item);
                this.allcolumnList.push({ name: element.name, value: item, order: selectedList[item].order });
              }
              if (flag === -5) {
                this.basketColumnList.push(item);
                this.allcolumnList.push({ name: element.name, value: item, order: selectedList[item].order });
              }
              if (flag === -6) {
                this.VrColumnList.push({ name: element.name, value: item, order: selectedList[item].order });
                this.allcolumnList.push({ name: element.name, value: item, order: selectedList[item].order });
              }
              if (flag === 2) {
                this.langList.push({ label: element.label, value: item });
              }

              if (flag === 3) {
                this.allSaveSearchResultPreference.push({ name: element.name, value: item });
              }
              if (selectedList[item].entity_value) {
                if (flag === -1) {
                  this.selectedConfirmationColumn.push(item);
                }
                if (flag === 2) {
                  this.selectedLang.push(item);
                }
                if (flag === 3) {
                  this.selectedSaveSearchResultPreference.push(item);
                }
                if (flag === 0) {
                  this.selectedDaypPreference.push(item);
                }
                if (flag === 1 || flag === -2 || flag === -3 || flag === -4 || flag === -5 || flag === -6) {
                  if (selectedList[item].entity_value) {
                    if ($.inArray(item, this.selectedColumn) === -1) {
                      this.selectedColumn.push(item);
                    }
                  }
                }
              }
            }
          }
        });
      }
    }
    this.allcolumnList.sort(function (a, b) {
      return parseFloat(a.order) - parseFloat(b.order);
    });
  }

  populateArrayList(userSelectedList, flag) {
    for (const item in userSelectedList) {
      if (userSelectedList.hasOwnProperty(item)) {
        if (userSelectedList[item].is_updatable) {
          (flag > 0) ? (flag === 1 ? this.cardList.push({ name: item, value: item })
            : this.alertList.push({ name: item, value: item }))
            : this.filterList.push({ name: item, value: item });
          if (userSelectedList[item].entity_value && userSelectedList[item].entity_value == true) {
            (flag > 0) ? (flag === 1 ? this.selectedCardValues.push(item)
              : this.selectedAlert.push(item))
              : this.selectedFilter.push(item);
          }
        }

      }
    }
    if (flag === 0) {
      this.filterList = this.reArrangeOrder(this.filterList);
    }
  }

  submitProfileSetting() {
    if (this.selectedFilter.length - 1 >= 7 && this.selectedConfirmationColumn.length > 6 && Number.isInteger(this.confirmedDays)) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.updateFilterList(this.selectedFilter);
      this.updateColumnList(this.selectedColumn);
      this.updateCardList(this.selectedCardValues);
      this.updateAlertList(this.selectedAlert);
      this.updateLangList(this.selectedLang);
      this.updateDaypPreferenceList(this.selectedDaypPreference);
      this.updateSaveSearchResultPreferenceList(this.selectedSaveSearchResultPreference);
      this.updateConfirmationColumnList(this.selectedConfirmationColumn);
      this.updateConfirmationHistoryDays(this.confirmedDays);
      if (this.userDeviceService.isDeviceSupportLocalStorage()) {
        window.localStorage.removeItem(this.authService.getLoginName() + '-dashboard-cards');
      }
      if (this.selectedSaveSearchResultPreference.length === 0) {
        this.appStore.remove(this.searchType + ':resultArray');
        this.appStore.remove(this.searchType + ':count');
        this.appStore.remove(this.searchType + ':currentCount');
      }
    } else {
      if (this.confirmedDays === undefined || this.confirmedDays === null) {
        this.messageService.showErrorGrowlMessage('Please enter confirmation history days');
      }
      this.checkMinimumSelection('filters', this.selectedFilter);
      this.checkMinimumSelection('columns', this.selectedColumn);
      this.checkMinimumSelection('confirmation columns', this.selectedConfirmationColumn);
    }
  }

  checkMinimumSelection(filterName, selectedList) {

    if (selectedList.length - 1 < 7) {
      const message = 'Please select minimum 7 ' + filterName;
      this.notificationMessage.emit({ status: false, message: message });
    }
  }

  updateConfirmationHistoryDays(confirmDays) {
    confirmDays = Number(confirmDays);
    this.userProfileService.updateConfirmationHistoryDays(confirmDays).subscribe(res => {
      if (!res.error_status) {
        this.userProfileService.setConfirmationHistoryWeeks(confirmDays);
        this.checkProfileSavedStatus('Confirmation History Days', true);
      } else {
        this.checkProfileSavedStatus('Confirmation History Days', false);
      }
    }, error => {
      this.checkProfileSavedStatus('Confirmation History Days', false);
    });
  }

  updateCardList(selectedList) {
    const updatedCardList = this.updateSelectedList(selectedList, this.userProfileService.getSelectedCardList());
    const jsonData = this.createJsonResponse('card_filters', updatedCardList);
    this.userProfileService.updateProfileSettingsList(jsonData).subscribe(res => {
      if (!res.error_status) {
        this.userProfileService.setSelectedCardList(updatedCardList);
        this.checkProfileSavedStatus('Dashboard', true);
      } else {
        this.checkProfileSavedStatus('Dashboard', false);
      }
    }, error => {
      this.checkProfileSavedStatus('Dashboard', false);
    });
  }

  updateFilterList(selectedList) {
    const updatedFilterList = this.updateSelectedList(selectedList, this.userProfileService.getAllSearchFilterList());
    const jsonData = this.createJsonResponse('search_filters', updatedFilterList);
    this.userProfileService.updateProfileSettingsList(jsonData).subscribe(res => {
      if (!res.error_status) {
        this.userProfileService.setSearchFilterList(updatedFilterList);
        this.checkProfileSavedStatus('Search Setting', true);
      } else {
        this.checkProfileSavedStatus('Search Setting', false);
      }
    }, error => {
      this.checkProfileSavedStatus('Search Setting', false);
    });
  }

  updateColumnList(selectedList) {
    const updatedColumnList = this.updateSelectedList(selectedList, this.userProfileService.getSelectedColumnList());
    const ordercolumnlength = this.selectedOrderColumn.length;

    for (let index = 0; index < Object.keys(updatedColumnList).length; index++) {
      updatedColumnList[Object.keys(updatedColumnList)[index]].order = 1;
    }
    for (let j = 0; j < this.allcolumnList.length; j++) {
      this.allcolumnList[j].order = j + 1;
    }
    for (let index = 0; index < this.allcolumnList.length; index++) {
      for (let i = 0; i < Object.keys(updatedColumnList).length; i++) {
        if (this.allcolumnList[index].value === Object.keys(updatedColumnList)[i]) {
          updatedColumnList[Object.keys(updatedColumnList)[i]].order = this.allcolumnList[index].order;
        }
      }
    }
    this.userProfileService.setSelectedColumnOrder(this.selectedOrderColumn);
    const jsonData = this.createJsonResponse('column_filters', updatedColumnList);
    this.userProfileService.updateProfileSettingsList(jsonData).subscribe(res => {
      if (!res.error_status) {
        this.userProfileService.setSelectedColumnList(updatedColumnList);
        this.checkProfileSavedStatus('Search Result', true);
      } else {
        this.checkProfileSavedStatus('Search Result', false);
      }
    }, error => {
      this.checkProfileSavedStatus('Search Result', false);
    });
  }

  updateAlertList(selectedList) {
    const updatedAlertList = this.updateSelectedList(selectedList, this.userProfileService.getSelectedAlertList());
    const jsonData = this.createJsonResponse('alert_filters', updatedAlertList);
    this.userProfileService.updateProfileSettingsList(jsonData).subscribe(res => {
      if (!res.error_status) {
        this.userProfileService.setSelectedAlertList(updatedAlertList);
        this.checkProfileSavedStatus('Alert/Notification', true);
      } else {
        this.checkProfileSavedStatus('Alert/Notification', false);
      }
    }, error => {
      this.checkProfileSavedStatus('Alert/Notification', false);
    });
  }

  updateLangList(selectedList) {
    const updatedLangList = this.updateSelectedList(selectedList, this.userProfileService.getSelectedLanguageList());
    const jsonData = this.createJsonResponse('language_filters', updatedLangList);
    this.userProfileService.updateProfileSettingsList(jsonData).subscribe(res => {
      if (!res.error_status) {
        this.userProfileService.setLanguage(updatedLangList);
        this.checkProfileSavedStatus('Language', true);
      } else {
        this.checkProfileSavedStatus('Language', false);
      }
    }, error => {
      this.checkProfileSavedStatus('Language', false);
    });
  }

  updateDaypPreferenceList(selectedList) {
    const updateDaypPreference = this.updateSelectedList(selectedList, this.userProfileService.getSelectedDaypValues());
    const jsonData = this.createJsonResponse('dayp_preference', updateDaypPreference);
    this.userProfileService.updateProfileSettingsList(jsonData).subscribe(res => {
      if (!res.error_status) {
        this.userProfileService.setDaypPreference(updateDaypPreference);
        this.checkProfileSavedStatus('DAYP Preference', true);
      } else {
        this.checkProfileSavedStatus('DAYP Preference', false);
      }
    }, error => {
      this.checkProfileSavedStatus('DAYP Preference', false);
    });
  }

  updateSaveSearchResultPreferenceList(selectedList) {
    const updateSaveSearchResultPreference = this.updateSelectedList(selectedList, this.userProfileService.getSelectedSaveSearchPreference());
    // this.userProfileService.resetPopupVisile();
    const jsonData = this.createJsonResponse('search_preference', updateSaveSearchResultPreference);
    this.userProfileService.updateProfileSettingsList(jsonData).subscribe(res => {
      if (!res.error_status) {
        this.userProfileService.setSaveSearchResultPreference(updateSaveSearchResultPreference);
        const isSaveSearchEntity = this.userProfileService.getSelectedSaveSearchPreference().enable_temp_save_search.entity_value;
        const oldVal = this.userProfileService.getPopUpVisible();
        if (oldVal === false && !isSaveSearchEntity) {
          this.userProfileService.resetPopupVisile();
        }
        if (!isSaveSearchEntity) {
          this.resetSearchStore();
        }
        this.checkProfileSavedStatus('Search Result Preference', true);
      } else {
        this.checkProfileSavedStatus('Search Result Preference', false);
      }
    }, error => {
      this.checkProfileSavedStatus('Search Result Preference', false);
    });
  }

  updateSelectedList(selectedList, originalObjectList) {
    for (const i in originalObjectList) {
      if (originalObjectList.hasOwnProperty(i)) {
        const index = selectedList.indexOf(i);
        if (index > -1 && originalObjectList[i].is_updatable) {
          originalObjectList[i].entity_value = true;
        } else if (originalObjectList[i].is_updatable) {
          originalObjectList[i].entity_value = false;
        }
      }
    }
    return originalObjectList;
  }

  createJsonResponse(name, array) {
    const jsonResponse = {};
    jsonResponse['login_name'] = this.authService.getLoginName();
    jsonResponse['config_name'] = name;
    jsonResponse['config_type'] = 'USER_SPECIFIC';
    jsonResponse['version'] = 1;
    jsonResponse['config_values'] = array;
    return jsonResponse;
  }

  checkProfileSavedStatus(name, boolean) {
    let flag = true;
    let profileName;
    this.profileSavedStatus.push({ name: name, status: boolean });
    if (this.profileSavedStatus.length === 6) {
      this.profileSavedStatus.forEach((element) => {
        if (!element.status) {
          profileName = element.name;
          flag = false;
          this.showErrorMessage(profileName + ' could not be saved.');
        }
      });
      this.showSuccessMessage(flag);
    }
  }

  showErrorMessage(message) {
    this.notify.hideBlockUI();
    this.notificationMessage.emit({ status: false, message: message });
  }

  showSuccessMessage(flag) {
    if (flag) {
      this.notify.hideBlockUI();
      this.notificationMessage.emit({ status: true, message: 'Profile saved successfully.' });
    }
    this.profileSavedStatus = [];
  }

  scrollToFilter(filter) {
    this.isAllowScrollEvent = false;
    jQuery('.filter-components').removeClass('active-filter');
    jQuery('#' + filter + '_Link').addClass('active-filter');
    const filterItem = jQuery('#' + filter).offset().top;
    jQuery('html, body').animate({
      scrollTop: (filterItem - 10)
    }, 800);
  }

  reArrangeOrder(list) {
    let tempArray = [];
    const orderList = this.userProfileService.fetchSearchOrderList();
    list.forEach(listObj => {
      orderList.forEach(orderObj => {
        if (listObj.name === orderObj.name) {
          listObj['order'] = orderObj.order;
          tempArray.push(listObj);
        }
      });
    });
    tempArray = tempArray.length > 0 ? tempArray : list;
    tempArray.sort(function (obj1, obj2) {
      if (obj1.order < obj2.order) {
        return -1;
      } else if (obj1.order > obj2.order) {
        return 1;
      } else {
        return 0;
      }
    });
    return tempArray;
  }

  reArrangeColumnOrder(list) {
    list.sort(function (obj1, obj2) {
      if (obj1.order < obj2.order) {
        return -1;
      } else if (obj1.order > obj2.order) {
        return 1;
      } else {
        return 0;
      }
    });
    return list;
  }
  initializeConfirmationColumnList() {
    this.confirmationColumnList = [];
    this.selectedConfirmationColumn = [];
    const allColumnList = this.userProfileService.getAllConfirmationColumnsList();
    const selectedConfirmationColumnList = this.userProfileService.getSelectedConfirmationColumnList();
    this.populateComparedList(allColumnList, selectedConfirmationColumnList, -1);
  }

  updateConfirmationColumnList(selectedColumnList) {
    const updatedColumnList = this.updateSelectedList(selectedColumnList, this.userProfileService.getSelectedConfirmationColumnList());



    const jsonData = this.createJsonResponse('confirmation_column_filters', updatedColumnList);
    this.userProfileService.updateProfileSettingsList(jsonData).subscribe(res => {
      if (!res.error_status) {
        this.userProfileService.setSelectedConfirmationColumnList(updatedColumnList);
        this.checkProfileSavedStatus('Search Result', true);
      } else {
        this.checkProfileSavedStatus('Search Result', false);
      }
    }, error => {
      this.checkProfileSavedStatus('Search Result', false);
    });
  }

  resetSearchStore() {
    this.appStore.remove('GENERAL_SEARCH:resultArray');
    this.appStore.remove('GENERAL_SEARCH:count');
    this.appStore.remove('GENERAL_SEARCH:currentCount');
    this.appStore.remove('TWIN_DIAMOND_SEARCH:resultArray');
    this.appStore.remove('TWIN_DIAMOND_SEARCH:count');
    this.appStore.remove('TWIN_DIAMOND_SEARCH:currentCount');
  }

}
