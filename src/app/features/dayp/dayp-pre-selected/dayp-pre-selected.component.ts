import { Component, OnInit, Input, ViewChild, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { UserProfileService } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';
import { UtilService } from '@srk/shared';
import { DaypService } from '@srk/shared';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { MessageService } from '@srk/core';
import { SearchService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';
import { NotifyService } from '@srk/core';
import { DownloadStonesService } from '@srk/shared';
import { ValidatorService } from '@srk/shared';
import { AddNoteService } from '@srk/shared';
import { DecimalPipe } from '@angular/common';
import { ApplicationStorageService } from '@srk/core';
import { ApplicationAuditService } from '@srk/core';
import { AuthService } from '@srk/core';
import * as _ from 'underscore';

@Component({
  selector: 'app-dayp-pre-selected',
  templateUrl: './dayp-pre-selected.component.html',
  styleUrls: ['./dayp-pre-selected.component.scss']
})
export class DaypPreSelectedComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('daypPreSubmittedContainer') daypPreSubmittedContainer;
  @ViewChild('selectedDaypStonesPanel') selectedDaypStonesPanel;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @ViewChild('daypGrid') daypGrid: any;
  @Input() daypStatus: boolean;
  @Input() preDaypStatus: boolean;
  @Input() isEditableMode: boolean;
  @Input() daypTabStatus: boolean;
  @Input() visiblePacketIcon = false;
  @Input() packetStoneArray: any;

  private packetSubscription: Subscription;
  private noteAddSubscription: Subscription;
  private stonePriceUpdateSubscription: Subscription;
  private addNoteSubscription: Subscription;
  private tabChangeSubscription: Subscription;
  private daypSelectionSubscription: Subscription;

  public preSelectedData: any;
  public selectedColumnList: any;
  public offerColumnList: any[];
  public focusedElement: any;
  public message: string;
  public offerSignOptions = [
    { notation: '+', value: 'plus' },
    { notation: '-', value: 'minus' }
  ];
  public isDataFetched = false;
  public timer;
  public commentsOverlayVisible = false;
  public addnoteOverlayVisible = false;
  public allNotesForStone: any[] = [];

  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;

  public ddcOverlayVisible = false;
  public definedDDCHour: any;
  public ddcStones: any[] = [];

  public downloadPopOverVisible = false;
  public downloadOptions: any[];
  public selectedDownloadType: any;
  public columnWidth = 130;
  public isIconVisible = false;
  public menuDistanceFromTop: any;
  public currentScroll: any;
  public caratHeaderFilter = [];
  public amountHeaderFilter = [];
  public priceHeaderFilter = [];
  public diffHeaderFilter = [];
  public offperHeaderFilter = [];
  public daypamountHeaderFilter = [];
  public daypHeight = window.innerHeight - 285;
  public isFilterAllSelected = false;
  public filterDataSource = [];
  public daypColumnWidth: any;
  public filterOptions = [];
  public isColumnExpanded = false;
  public filterFlag: any;
  public selectedFilterOption: any;
  public allColumnWidth: any;
  public colWidth: any;
  public filterPopOverVisible = false;
  public filterId = 'filterOnPreSelection';
  public selectedTableToggle = false;

  // Variables for grid.
  public packetIconDataForGrid: any[];  // Used to update Packet icons in the Data Grid.
  public stonesActedOn: any;
  public iconOverlayXPosition: Number;
  public iconOverlayYPosition: Number;
  public displayIconOverlay: Boolean = false;
  public iconDisplayStoneObject: any;
  public colorLegendFilterValue: String[] = [];

  constructor(
    private userProfileService: UserProfileService,
    private stoneSvc: StoneDetailsService,
    private utilService: UtilService,
    private daypSvc: DaypService,
    private messageService: MessageService,
    private searchSvc: SearchService,
    private notify: NotifyService,
    private downloadSvc: DownloadStonesService,
    private validatorService: ValidatorService,
    private decimalPipe: DecimalPipe,
    private notesService: AddNoteService,
    private appStore: ApplicationStorageService,
    private auditService: ApplicationAuditService,
    private authService: AuthService) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.daypColumnWidth = this.userProfileService.getDAYPColumnWidth();
    this.colWidth = this.allColumnWidth;
    this.filterFlag = this.appStore.getData('filterFlag');
    this.message = 'Loading..';
    this.getStoneList();
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.offerColumnList = this.userProfileService.getSelectedDaypValues();
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
    this.stonePriceUpdateSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe(res => {
      this.updateStoneStateDetails(res);
    });
    this.tabChangeSubscription = this.notify.notifyTabChangeActionObservable$.subscribe(res => {
      if (res.index === 0) {
        if (this.daypSelectionSubscription) {
          this.daypSelectionSubscription.unsubscribe();
        }
        this.getStoneList();
      }
    });
    this.daypSvc.handlekeyupEvent('daypPreSubmittedContainer');
    this.addNoteSubscription = this.notify.addNewNotesForIggridObservable$.subscribe(res => {
      if (res.isDeleteFlow) {
        this.deleteCommentsFromStones(res);
      } else {
        this.updateNotesForStones(res);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.appStore.getData('preDaypPageRef')) {
        const scrollable = this.daypPreSubmittedContainer.instance.getScrollable('#daypPreSubmittedContainer');
        scrollable.scrollTo({ left: 0, top: this.appStore.getData('preDaypPageRef') });
      }
    }, 1000);
    this.daypSvc.setSortedColumnIndex(this.daypPreSubmittedContainer, this.preSelectedData);
  }

  getStoneList() {
    if (this.appStore.getData('daypPreSelectionDetails')) {
      this.preSelectedData = this.appStore.getData('daypPreSelectionDetails');
      this.updateRowColor();
    }
    if (this.daypStatus || this.isEditableMode) {
      this.getDaypStoneList();
    } else {
      this.getPreDaypStoneList();
    }
  }

  getPreDaypStoneList() {
    this.daypSelectionSubscription = this.daypSvc.getPreSubmittedDaypStones().subscribe((response) => {
      if (response) {
        this.getDaypStoneData(response);
      }
    }, error => {
      this.message = 'ERR_GET_DAYP_STONES';
    });
  }

  getDaypStoneList() {
    this.daypSelectionSubscription = this.daypSvc.getActiveDaypStoneList().subscribe((response) => {
      if (response) {
        this.getDaypStoneData(response);
      }
    }, error => {
      this.message = 'ERR_GET_DAYP_STONES';
    });
  }

  getDaypStoneData(response) {
    if (response && !response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MHS_SF_200)) {
      response.data = this.utilService.updateStonesForDecimal(response.data);
      this.preSelectedData = this.daypSvc.initializeStoneListObject(response.data);
      this.preSelectedData = this.daypSvc.checkSelectedStones(this.preSelectedData, this.appStore.getData('daypPreSelectionDetails'));
      this.updateExtraStoneDetails();
      this.adjustTableSize();
      this.isDataFetched = true;
    } else if (response && response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DEE_200)) {
      this.daypStatus = false;
    } else if (response && response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.DAYP_SNF_404)) {
      if (this.preDaypStatus) {
        this.message = 'NO_STONE_PRE_DAYP';
      } else {
        this.message = 'NO_STONE_DAYP_PRE_SELECTION';
      }
    } else if (response && response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_DNA_200)) {
      this.message = 'DATA_NOT_AVAILABLE_DAYP';
    } else if (response && response.error_status) {
      this.message = 'ERR_GET_DAYP_STONES';
    }
  }

  updateExtraStoneDetails() {
    this.preSelectedData = this.daypSvc.updateSortedObject(this.preSelectedData, this.appStore.getData('daypPreSelectionDetails'));
    if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
      if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
        this.preSelectedData.selectedStoneTable.forEach(selectedStone => {
          this.preSelectedData.diamondTable.forEach(stone => {
            if (selectedStone.stone_id === stone.stone_id) {
              selectedStone = JSON.parse(JSON.stringify(stone));
            }
          });
        });
      }
    }
    this.updatePacketDetails(this.packetStoneArray);
    this.appStore.store('daypPreSelectionDetails', this.preSelectedData);
  }

  selectAllStones() {
    if (this.preSelectedData.isAllResultSelected) {
      this.preSelectedData.selectedStoneButton = this.stoneSvc.createStoneIdList(this.preSelectedData.diamondTable);
      this.preSelectedData.filteredStone = this.stoneSvc.createStoneIdList(this.preSelectedData.diamondTable);
      this.preSelectedData.selectedStoneTable = JSON.parse(JSON.stringify(this.preSelectedData.diamondTable));
    } else {
      this.preSelectedData.selectedStoneButton = [];
      this.preSelectedData.selectedStoneTable = [];
      this.preSelectedData.filteredStone = [];
    }
    this.preSelectedData.isAllSelected = this.searchSvc.isArrayMatch(this.preSelectedData.selectedStoneButton,
      this.preSelectedData.filteredStone);
    this.updateDaypStoneDetails(this.preSelectedData);
  }

  /*selectMultipleStone(id) {
    this.preSelectedData = this.searchSvc.fetchSelectedStones(this.preSelectedData, id);
    if (this.filterDataSource.length > 0) {
      this.isAllFilterStoneSelected();
    }
    this.updateDaypStoneDetails(this.preSelectedData);
  }*/

  selectMultipleStone(data) {

    if (Array.isArray(data)) {

      this.preSelectedData.selectedStoneButton = [];
      this.preSelectedData.filteredStone = [];
      this.preSelectedData.selectedStoneTable = [];

      if (data.length > 0) {

        data.forEach((elm, index) => {

          this.preSelectedData.selectedStoneButton.push(elm._id);
          this.preSelectedData.filteredStone.push(elm._id);
          this.preSelectedData.selectedStoneTable.push(

            this.preSelectedData.diamondTable.find(elem => { return elm._id === elem._id; })

          );

          if (index === data.length - 1) {

            this.isAllFilterStoneSelected();
            this.updateDaypStoneDetails(this.preSelectedData);
            this.updateRowColor();

          }

        });

      } else {

        this.updateDaypStoneDetails(this.preSelectedData);

      }


    } else {

      if (data.added === true) {

        this.preSelectedData.selectedStoneButton.push(data.stoneId);

      } else {

        this.preSelectedData.selectedStoneButton = this.preSelectedData.selectedStoneButton.filter(elm => { return elm !== data.stoneId; });

      }

      this.preSelectedData = this.searchSvc.fetchSelectedStones(this.preSelectedData, data.stoneId);
      if (this.filterDataSource.length > 0) {
        this.isAllFilterStoneSelected();
      }
      this.updateDaypStoneDetails(this.preSelectedData);
      this.updateRowColor();

    }

  }

  addOfferPriceForStone(data, offerPrice) {
    if (offerPrice != '' && Number(data.dayp_rate) !== Number(offerPrice)) {
      const response = this.daypSvc.addOfferPriceForStone(data, offerPrice);
      if (response.status) {
        const newPrice = this.daypSvc.setOffPrice(response.data, offerPrice);
        if (newPrice.data.dayp_rate) {
          newPrice.data.dayp_rate = parseFloat(newPrice.data.dayp_rate).toFixed(2);
        }
        if (newPrice.data.dayp_per) {
          newPrice.data.dayp_per = parseFloat(newPrice.data.dayp_per).toFixed(2);
        }
        this.preSelectedData.diamondTable = this.daypSvc.updateDAYPStonePriceValue(this.preSelectedData.diamondTable, [newPrice.data], false);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: newPrice.data };
        if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
          this.preSelectedData.selectedStoneTable = this.daypSvc.updateDAYPStonePriceValue(this.preSelectedData.selectedStoneTable, [newPrice.data], false);
        }
        this.updateDaypStoneDetails(this.preSelectedData);
        this.initiateAutoSavePrice(newPrice.data, newPrice.data.dayp_rate, newPrice.data.dayp_per);
      } else {
        this.preSelectedData.diamondTable = this.daypSvc.resetDaypOffers(this.preSelectedData.diamondTable, [data]);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
        if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
          this.preSelectedData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.preSelectedData.selectedStoneTable, [data]);
        }
      }
    } else if (offerPrice === '' && data.dayp_rate) {
      this.preSelectedData.diamondTable = this.daypSvc.resetDaypOffers(this.preSelectedData.diamondTable, [data]);
      this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
      if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
        this.preSelectedData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.preSelectedData.selectedStoneTable, [data]);
      }
    }
  }

  addOfferPercentageForStone(data, offerPercentage, sign) {
    if (offerPercentage != '' && data.dayp_per !== Number(offerPercentage)) {
      const response = this.daypSvc.addOfferPercentageForStone(data, offerPercentage, sign);
      if (response.status) {
        this.preSelectedData.diamondTable = this.daypSvc.updateDAYPStonePriceValue(this.preSelectedData.diamondTable, [response.data], false);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: response.data };
        if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
          this.preSelectedData.selectedStoneTable = this.daypSvc.updateDAYPStonePriceValue(this.preSelectedData.selectedStoneTable, [response.data], false);
        }
        this.updateDaypStoneDetails(this.preSelectedData);
        this.initiateAutoSavePrice(response.data, response.data.dayp_rate, response.offerPer);
      } else {
        this.preSelectedData.diamondTable = this.daypSvc.resetDaypOffers(this.preSelectedData.diamondTable, [data]);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
        if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
          this.preSelectedData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.preSelectedData.selectedStoneTable, [data]);
        }
      }
    } else if (offerPercentage === '' && data.dayp_per) {
      this.preSelectedData.diamondTable = this.daypSvc.resetDaypOffers(this.preSelectedData.diamondTable, [data]);
      this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
      if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
        this.preSelectedData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.preSelectedData.selectedStoneTable, [data]);
      }
    }
  }

  initiateAutoSavePrice(data, offerPrice, offerPer) {
    this.auditService.storeActionAudit('ADD TO DAYP BASKET');
    if (Number(offerPrice) > Number(data.price_rap)) {
      offerPer = '+' + offerPer.toString();
    }
    const stoneList = [{
      'stone_id': data.stone_id,
      'offer_price': offerPrice.toString(),
      'offer_percentage': offerPer.toString(),
      'action': 'i'
    }];
    this.daypSvc.autoSavePriceChange(stoneList).subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_DAYP_ASDB_200)) {
        this.notify.notifyStoneStateUpdated({ daypAction: 'daypPriceInserted', stoneList: [data.stone_id], stoneObj: [data], status: 'selection' });
        this.messageService.showSuccessGrowlMessage(MessageCodes.SMS_DAYP_ASDB_200);
        if (this.daypGrid) {
          if (this.focusedElement && this.focusedElement.element) {
            this.daypGrid.focusTextBox(this.focusedElement.element, this.focusedElement.mouseClick);
          }
        }
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_DEE_200) && res.error_status) {
        this.preSelectedData.diamondTable = this.daypSvc.resetDaypOffers(this.preSelectedData.diamondTable, [data]);
        if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
          this.preSelectedData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.preSelectedData.selectedStoneTable, [data]);
        }
        this.messageService.showErrorGrowlMessage('DAYP__OVER');
      } else {
        this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_DAYP_BASKET');
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_DAYP_BASKET');
      this.preSelectedData.diamondTable = this.daypSvc.resetDaypOffers(this.preSelectedData.diamondTable, [data]);
      if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
        this.preSelectedData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.preSelectedData.selectedStoneTable, [data]);
      }
    });
  }

  onPriceInput(data, priceRef: any) {
    const reg = /[^0-9\.\,]/ig;
    if (priceRef.value && reg.test(priceRef.value)) {
      const start = priceRef.selectionStart, end = priceRef.selectionEnd;
      const value = String(priceRef.value).replace(reg, '')
      priceRef.value = value;
      priceRef.setSelectionRange(start, end - 1);
    }
  }

  onPriceKeyDown(ev) {
    ev = (ev) ? ev : window.event;
    const charCode = (ev.which) ? ev.which : ev.keyCode;
    if (charCode === 39 || charCode === 37) {
      ev.stopImmediatePropagation();
      return;
    }
  }

  onSingchange(sign, stone_id) {
    this.preSelectedData.diamondTable.forEach(stone => {
      if (stone.stone_id === stone_id) {
        stone.offerSign = sign;
        stone = this.daypSvc.resetDaypValue(stone, {});
      }
    });
  }

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    if (stoneList) {
      if (!this.preSelectedData) {
        this.preSelectedData = this.daypSvc.initializeStoneListObject([]);
      }
      if (res.hasOwnProperty('daypAction')) {
        if (res.daypAction === 'removeFromPreDayp') {
          this.preSelectedData.selectedStoneButton.forEach(value => {
            if (stoneList.indexOf(value) > -1) {
              this.stoneSvc.removeElement(this.preSelectedData.selectedStoneButton, value);
            }
          });
          this.preSelectedData.filteredStone.forEach(value => {
            if (stoneList.indexOf(value) > -1) {
              this.stoneSvc.removeElement(this.preSelectedData.filteredStone, value);
            }
          });
          this.preSelectedData.diamondTable = this.daypSvc.removeStoneFromTable(this.preSelectedData.diamondTable, stoneList);
          if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
            this.preSelectedData.selectedStoneTable =
              this.daypSvc.removeStoneFromTable(this.preSelectedData.selectedStoneTable, stoneList);
          }
          this.preSelectedData = this.daypSvc.updateDaypObjectData(this.preSelectedData, stoneList);
          // we use  'confirmedStones' key to remove stone on click of remove from pre-dayp 
          const newResponse = { ...res };
          newResponse['source'] = 'confirmedStones';
          this.stonesActedOn = newResponse;
          this.getSelectedStoneCarat();
        } else if (res.daypAction === 'daypPriceInserted' && res.status !== 'selection') {
          this.preSelectedData.diamondTable = this.updateDAYPStoneInfo(this.preSelectedData.diamondTable, stoneList, res);
          if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
            this.preSelectedData.selectedStoneTable = this.updateDAYPStoneInfo(this.preSelectedData.selectedStoneTable, stoneList, res);
          }
          const newResponse = { ...res };
          this.stonesActedOn = newResponse;
          if (res.status === '') {
            newResponse['source'] = 'offerOnSelectedStonesUpdated';
          }
          this.stonesActedOn = newResponse;
        } else if (res.daypAction === 'daypSubmitted') {
          this.preSelectedData.diamondTable = this.updateDAYPStoneInfo(this.preSelectedData.diamondTable, stoneList, res);
          if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
            this.preSelectedData.selectedStoneTable = this.updateDAYPStoneInfo(this.preSelectedData.selectedStoneTable, stoneList, res);
          }

          const newResponse = { ...res };
          // Here status is deleted as it appear in case of excel submission
          if (newResponse.hasOwnProperty('status')) {
            delete newResponse.status;
            newResponse['source'] = 'offerOnSelectedStonesUpdated';
          }
          this.stonesActedOn = newResponse;
        } else if (res.daypAction === 'removeStoneFromSubmission') {
          this.preSelectedData.diamondTable = this.daypSvc.updateRemovedDaypStoneState(this.preSelectedData.diamondTable,
            res.stoneList);
          this.preSelectedData.selectedStoneTable = this.daypSvc.updateRemovedDaypStoneState(this.preSelectedData.selectedStoneTable,
            res.stoneList);
          this.stonesActedOn = res;
        } else if (res.daypAction === 'removeStoneFromBasket') {
          this.preSelectedData.diamondTable = this.daypSvc.updateRemovedDaypStoneState(this.preSelectedData.diamondTable,
            res.stoneList);
          this.preSelectedData.selectedStoneTable = this.daypSvc.updateRemovedDaypStoneState(this.preSelectedData.selectedStoneTable,
            res.stoneList);
          this.stonesActedOn = res;
        }
      } else if (res.source === 'addedToPreDayp') {
        this.daypSelectionSubscription = this.daypSvc.getPreSubmittedDaypStones().subscribe((response) => {
          if (response) {
            if (response && !response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MHS_SF_200)) {
              response.data = this.utilService.updateStonesForDecimal(response.data);
              this.preSelectedData = this.daypSvc.initializeStoneListObject(response.data);
              this.preSelectedData = this.daypSvc.checkSelectedStones(this.preSelectedData, this.appStore.getData('daypPreSelectionDetails'));
              this.updateExtraStoneDetails();
              this.adjustTableSize();
              res['status'] = 'overwrite';
              res['stoneList'] = JSON.parse(JSON.stringify(res.stoneList));
              res['stoneObj'] = JSON.parse(JSON.stringify(response.data));
              this.stonesActedOn = res;
              this.isDataFetched = true;
            }
          }
        }, error => {
        });
      } else {
        this.preSelectedData.diamondTable = this.daypSvc.updateTableStoneDetails(this.preSelectedData.diamondTable, stoneList, res);
        if (res.source === 'confirmedStones') {
          this.preSelectedData.selectedStoneButton.forEach(value => {
            if (stoneList.indexOf(value) > -1) {
              this.stoneSvc.removeElement(this.preSelectedData.selectedStoneButton, value);
            }
          });
          this.preSelectedData.filteredStone.forEach(value => {
            if (stoneList.indexOf(value) > -1) {
              this.stoneSvc.removeElement(this.preSelectedData.filteredStone, value);
            }
          });
        }
        if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
          this.preSelectedData.selectedStoneTable =
            this.daypSvc.updateTableStoneDetails(this.preSelectedData.selectedStoneTable, stoneList, res);
        }
        this.getSelectedStoneCarat();
        this.stonesActedOn = res;
      }
    }
    // this.stonesActedOn = { 'source': 'daypStoneStateUpdated', 'data': res };
  }

  updateDAYPStoneInfo(table, stoneList, res) {
    let status = false;
    if (res.status && (res.status === 'overwrite' || res.status === 'update')) {
      status = true;
    }
    table = this.daypSvc.updateDAYPStonePriceValue(JSON.parse(JSON.stringify(table)), res.stoneObj, status);
    return table;
  }

  refreshDaypTable() {
    if (this.daypPreSubmittedContainer) {
      this.daypPreSubmittedContainer.instance.refresh();
      if (this.selectedDaypStonesPanel && this.selectedDaypStonesPanel.hasOwnProperty('selectedDaypStoneContainer') && this.selectedDaypStonesPanel.selectedDaypStoneContainer) {
        this.selectedDaypStonesPanel.selectedDaypStoneContainer.instance.refresh();
      }
    }
  }

  toggleSelectedDaypPanel(event) {
    this.updateDaypStoneDetails(event.array);
  }

  updateDaypStones(event) {
    if (this.filterDataSource.length > 0) {
      this.isAllFilterStoneSelected();
    }
    this.updateDaypStoneDetails(event.array);
  }

  updateDaypStoneDetails(array) {
    if (array) {
      this.preSelectedData.selectedStoneTable = array.selectedStoneTable;
      this.preSelectedData.selectedStoneButton = array.selectedStoneButton;
      this.preSelectedData.filteredStone = array.filteredStone;
      this.preSelectedData.toggleTableDisplay = array.toggleTableDisplay;
      if (!array.isAllSelected) {
        this.preSelectedData.isAllSelected = false;
        this.preSelectedData.isAllResultSelected = false;
        this.preSelectedData.toggleTableDisplay = false;
        this.preSelectedData.selectedStoneButton = [];
        this.preSelectedData.filteredStone = [];
        this.preSelectedData.selectedStoneTable = [];
      }
    }
    this.getSelectedStoneCarat();
    this.adjustTableSize();
    this.appStore.store('daypPreSelectionDetails', this.preSelectedData);
  }

  getSelectedStoneCarat() {
    this.preSelectedData.selectedStonesCarat = 0;
    this.preSelectedData.totalOfferAmount = 0;
    if (this.preSelectedData.selectedStoneTable.length > 0) { }
    this.preSelectedData.selectedStoneTable.forEach(stone => {
      this.preSelectedData.selectedStonesCarat += Number(stone.carat);
      if (stone.hasOwnProperty('dayp_amount')) {
        this.preSelectedData.totalOfferAmount += Number(stone.dayp_amount);
      }
    });
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  toggleAddNoteOverlay(e) {
    if (e.forAddNote) {
      this.addnoteOverlayVisible = e.visible;
    } else {
      this.commentsOverlayVisible = e.visible;
    }
  }

  updateStoneComments(event) {
    if (event.status) {
      this.getNotesForAllStones();
    }
  }

  addStoneInfoTab(data) {
    // this.getPageRef();

    data = this.preSelectedData.diamondTable.find(elm => { return elm._id === data; });
    data['CurrentSelectedTab'] = 'preDaypSearch';
    if (!this.isEditableMode) {
      this.notify.notifyDaypPageForStoneClickedForDetail({ type: 'stoneDtl', 'data': data });
    }
  }

  addTwinStoneInfoTab(pairId) {
    // this.getPageRef();
    if (!this.isEditableMode) {
      this.notify.notifyDaypPageForStoneClickedForDetail({ type: 'twinStoneDtl', 'data': pairId });
    }
  }

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp();
    this.stoneMultimediaInfo = stoneInfo;
    this.toggleMultimediaPopup = true;
  }

  stoneMediaIconPanel(event) {
    const data = this.stoneSvc.returnPositionOfOverlay(event);
    this.iconOverlayXPosition = data.left;
    this.iconOverlayYPosition = data.top;
    this.iconDisplayStoneObject = event.stoneId;
    this.displayIconOverlay = true;
  }

  closeGridIconOverlay(data) {

    this.displayIconOverlay = false;

  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  /******************* DDC *******************************/
  updateDDC(stoneData) {
    this.ddcStones = [];
    this.thmDdcOverlay.selectedDdcHour = 0;
    this.definedDDCHour = 0;
    this.ddcStones.push(stoneData.stone_id);
    if (stoneData.ddcHour > 0) {
      this.definedDDCHour = stoneData.ddcHour;
    }
    this.ddcOverlayVisible = true;
  }

  toggleDdcOverlay(e) {
    this.ddcOverlayVisible = e.visible;
  }

  showDowaloadOptions() {
    this.selectedDownloadType = 0;
    this.downloadOptions = this.downloadSvc.getDownloadOptions('excel_download_dayp_btn');
    this.downloadPopOverVisible = true;
  }

  downloadDaypStones(array) {
    const stoneList = JSON.parse(JSON.stringify(array.filteredStone));
    if (stoneList.length > 0) {
      if (this.selectedDownloadType === 'excel') {
        this.downloadSvc.downloadDaypStoneExcel(array.diamondTable, stoneList);
      } else {
        this.downloadSvc.downloadStoneDetails(array.diamondTable, stoneList, this.selectedDownloadType);
      }
      this.downloadPopOverVisible = false;
      this.selectedDownloadType = null;
    } else {
      this.selectedDownloadType = null;
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  sendExcelMail(array) {
    const stoneList = JSON.parse(JSON.stringify(array.filteredStone));
    if (stoneList.length > 0) {
      this.downloadSvc.mailDAYPStoneExcel(array.diamondTable, stoneList, 'DAYP PRESELECTED');
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  stoneToOperateInPacket(data) {
    this.notify.notifyDaypForPacketUpdate({ visible: true, object: [data] });
  }

  updatePacketDetails(event) {
    if (event && event.array && event.array.length > 0) {
      this.packetIconDataForGrid = event.array.map(elm => { return elm.stones.toString(); }).toString();
    }
    if (this.preSelectedData && this.preSelectedData.diamondTable) {
      this.preSelectedData.diamondTable = this.stoneSvc.setStonePacketCount(this.preSelectedData.diamondTable);
      this.preSelectedData.diamondTable = this.stoneSvc.updateStonePacketCount(event, this.preSelectedData.diamondTable);
    }
    if (this.preSelectedData && this.preSelectedData.selectedStoneTable) {
      this.preSelectedData.selectedStoneTable = this.stoneSvc.setStonePacketCount(this.preSelectedData.selectedStoneTable);
      this.preSelectedData.selectedStoneTable = this.stoneSvc.updateStonePacketCount(event, this.preSelectedData.selectedStoneTable);
    }
  }

  getNotesForAllStones() {
    if (this.preSelectedData && this.preSelectedData.diamondTable) {
      if (this.preSelectedData && this.preSelectedData.diamondTable && this.preSelectedData.diamondTable.length > 0) {
        // this.preSelectedData.diamondTable = this.daypSvc.fetchStonesComment(this.preSelectedData.diamondTable);

        if (this.noteAddSubscription) {
          this.noteAddSubscription.unsubscribe();
        }
        this.noteAddSubscription = this.notesService.getCommentListforStoneIds(this.preSelectedData.diamondTable).subscribe((res) => {
          this.preSelectedData.diamondTable = res;
          this.stonesActedOn = { 'source': 'noteAdded', data: this.preSelectedData.diamondTable };
        }, error => {
          this.stonesActedOn = { 'source': 'noteAdded' };
        });

      }
      if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
        this.preSelectedData.selectedStoneTable = this.daypSvc.fetchStonesComment(this.preSelectedData.selectedStoneTable);
      }
    }

  }

  getPageRef() {
    const scrollable = this.daypPreSubmittedContainer.instance.getScrollable('#daypPreSubmittedContainer');
    this.appStore.store('preDaypPageRef', scrollable.scrollTop());
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneSvc.scrollLeft(this.daypPreSubmittedContainer, '#daypPreSubmittedContainer');
    } else if (params === 'right') {
      this.stoneSvc.scrollRight(this.daypPreSubmittedContainer, '#daypPreSubmittedContainer');
    }
  }

  scrollTableInInterval(params) {
    this.timer = setInterval(() => {
      this.scrollTable(params);
    }, 1)
  }

  stopScrolling() {
    clearInterval(this.timer);
  }

  scrollColumn() {
    this.isColumnExpanded = !this.isColumnExpanded;
    this.isIconVisible = !this.isIconVisible;
    this.stoneSvc.handleSortingOrder(this.daypPreSubmittedContainer);
    const columns = JSON.parse(JSON.stringify(this.daypPreSubmittedContainer.columns));
    if (this.isColumnExpanded) {
      columns[1].width = 275;
    } else {
      columns[1].width = 130;
    }
    this.daypPreSubmittedContainer.columns = columns;
  }

  ngOnDestroy() {
    if (this.packetSubscription) {
      this.packetSubscription.unsubscribe();
    }
    if (this.noteAddSubscription) {
      this.noteAddSubscription.unsubscribe();
    }
    if (this.stonePriceUpdateSubscription) {
      this.stonePriceUpdateSubscription.unsubscribe();
    }
    this.tabChangeSubscription.unsubscribe();
    if (this.addNoteSubscription) {
      this.addNoteSubscription.unsubscribe();
    }
  }

  onCellPrepared(e) {
    this.daypSvc.updateRowColor(this.daypPreSubmittedContainer, this.preSelectedData);
  }

  updateRowColor() {
    this.daypSvc.updateRowColor(this.daypPreSubmittedContainer, this.preSelectedData);
  }


  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.fixedHeader();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.onWindowScroll();
    this.adjustTableSize();
  }

  fixedHeader() {
    this.currentScroll = window.scrollY;
    const containerWidth = jQuery('#fixedDaypPanel').outerWidth();
    if (jQuery('#fixedDaypPanel').offset() && jQuery('#fixedDaypPanel').offset().top) {
      this.menuDistanceFromTop = jQuery('#fixedDaypPanel').offset().top > 0 ? jQuery('#fixedDaypPanel').offset().top : 0;
      if ((this.currentScroll) > this.menuDistanceFromTop) {
        // jQuery('#daypPanel').addClass('stuck').innerWidth(containerWidth).css('padding-bottom', '10px');
        jQuery('#packetTabResultId').addClass('packet-struck');
        jQuery('#packetBox').css('display', 'none');
      } else {
        // jQuery('#daypPanel').removeClass('stuck').innerWidth(containerWidth).css('padding-bottom', '0px');
        jQuery('#packetTabResultId').removeClass('packet-struck');
        jQuery('#packetBox').css('display', 'block');
      }
      this.adjustTableSize();
    }
  }

  adjustTableSize() {
    this.daypHeight = window.innerHeight - 285;
    this.adjustTableBoxSize();
  }

  adjustTableBoxSize() {
    if (jQuery('#daypPanel')) {
      // jQuery('#daypPanel').css('height', window.innerHeight);
    }
  }

  onContentLoad(event) {
    this.preSelectedData = this.daypSvc.getSortedTable(this.daypPreSubmittedContainer, this.preSelectedData);
    this.appStore.store('daypPreSelectionDetails', this.preSelectedData);
    const filters = this.daypPreSubmittedContainer.instance.getCombinedFilter();
    if (filters) {
      const filterDataSource = this.daypPreSubmittedContainer.instance.getDataSource();
      this.filterDataSource = JSON.parse(JSON.stringify(filterDataSource['_items']));
      this.isAllFilterStoneSelected();
    } else {
      this.filterDataSource = [];
      this.isFilterAllSelected = false;
    }
  }

  selectFilterStones() {
    this.preSelectedData = this.daypSvc.selectFilterStones(this.filterDataSource, this.isFilterAllSelected, this.preSelectedData);
    this.updateDaypStoneDetails(this.preSelectedData);
    this.updateRowColor();
  }

  isAllFilterStoneSelected() {
    this.isFilterAllSelected = this.daypSvc.isAllFilterStoneSelected(this.filterDataSource, this.preSelectedData.selectedStoneButton);
  }
  showFilterOptions() {
    if (this.filterFlag) {
      this.filterOptions = [{ label: 'Disable Filter', value: 'disableFilter' }, { label: 'Reset Filter', value: 'resetFilter' }];
    } else {
      this.filterOptions = [{ label: 'Enable Filter', value: 'enableFilter' }];
    }
    this.filterPopOverVisible = true;
  }
  toggleFilterPopOverVisible(e) {
    this.filterPopOverVisible = e.visible;
  }

  toggleFilterFlag(e) {
    this.filterFlag = e.filterFlag;
  }

  toggleColWidth(e) {
    this.colWidth = e.colWidth;
  }

  showStoneMediaIconsPanel(stoneObj, event, thmMediaIcon) {
    thmMediaIcon.stoneObj = stoneObj;
    thmMediaIcon.multimediaOverlay.toggle(event);
  }

  setColorLegendFilterValue(event: any, filterValue: String): void {

    if (this.colorLegendFilterValue.includes(filterValue)) {

      this.colorLegendFilterValue = this.colorLegendFilterValue.filter(elm => { return elm !== filterValue; });

    } else {

      this.colorLegendFilterValue = [...this.colorLegendFilterValue, filterValue];

    }

  }

  storeLastFocusedElement(event) {
    this.focusedElement = event;
  }

  updateNotesForStones(res) {
    if (this.preSelectedData.diamondTable && this.preSelectedData.diamondTable.length > 0) {
      const toUpdateStoneArray = this.stoneSvc.findStoneObjUsingStoneIds(this.preSelectedData.diamondTable, res.stoneList);
      if (toUpdateStoneArray instanceof Array && toUpdateStoneArray.length > 0) {
        this.notesService.fetchStonesAsynchronously(toUpdateStoneArray)
          .then(result => {

            this.preSelectedData.diamondTable = this.stoneSvc.findAndUpdateStoneCommentFromList(this.preSelectedData.diamondTable, result);
            if (result && result instanceof Array && result.length > 0) {
              this.updateSelectedStonesNote();
              this.stonesActedOn = { 'source': 'noteAdded', stoneList: res.stoneList };
            }

          }).catch(error => {

            console.error('Failed with error ');
            console.error(error);

          });
      }
    }
  }

  deleteCommentsFromStones(res) {
    const stoneList = [];
    if (this.preSelectedData.diamondTable && this.preSelectedData.diamondTable.length > 0) {
      const commentsId = res.commentList;
      this.preSelectedData.diamondTable.forEach(stone => {
        if (stone.haveNote) {
          commentsId.forEach(comment => {
            stone.notes.forEach((note, noteIndex) => {
              if (Number(note.comment_id) === Number(comment)) {
                stone.notes.splice(noteIndex, 1);
                stoneList.push(stone.stone_id);
              }
            });
          });
          if (stone.notes.length === 0) {
            if (stone.notes) {
              delete stone.notes;
            }
            stone['haveNote'] = false;
            if (stone.displayNote) {
              stone['displayNote'] = '';
            }
            if (stone.totalNotes) {
              delete stone.totalNotes;
            }
          } else {
            stone['displayNote'] = stone.notes[0];
            stone['totalNotes'] = stone.notes.length;
          }
        }
      });
      this.updateSelectedStonesNote();
      if (_.uniq(stoneList) && _.uniq(stoneList).length > 0) {
        this.stonesActedOn = { 'source': 'noteAdded', stoneList: _.uniq(stoneList) };
      }
    }
  }

  updateSelectedStonesNote() {
    if (this.preSelectedData.selectedStoneTable && this.preSelectedData.selectedStoneTable.length > 0) {
      this.preSelectedData.selectedStoneTable =
        this.stoneSvc.updateNotesForSelectedPanel(this.preSelectedData.selectedStoneTable, this.preSelectedData.diamondTable);
    }
    this.appStore.store('daypPreSelectionDetails', this.preSelectedData);
  }

}
