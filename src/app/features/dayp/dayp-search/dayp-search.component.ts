import {
  Component, OnInit, Input, Output, EventEmitter, OnChanges,
  ViewChild, OnDestroy, AfterViewInit, HostListener
} from '@angular/core';
import { UserProfileService } from '@srk/core';
import { AddNoteService, StoneDetailsService, ThmTwinStoneDetailComponent } from '@srk/shared';
import { UtilService } from '@srk/shared';
import { DaypService } from '@srk/shared';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { MessageService } from '@srk/core';
import { SearchService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';
import { NotifyService } from '@srk/core';
import { DownloadStonesService } from '@srk/shared';
import { ValidatorService } from '@srk/shared';
import { DecimalPipe } from '@angular/common';
import { ApplicationStorageService } from '@srk/core';
import { ApplicationAuditService } from '@srk/core';
import { AuthService } from '@srk/core';
import * as _ from 'underscore';

@Component({
  selector: 'app-dayp-search',
  templateUrl: './dayp-search.component.html',
  styleUrls: ['./dayp-search.component.scss']
})
export class DaypSearchComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('daypSearchResultContainer') daypSearchResultContainer;
  @ViewChild('selectedDaypStonesPanel') selectedDaypStonesPanel;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @ViewChild('daypGrid') daypGrid: any;
  @Input() visiblePacketIcon = false;
  @Input() packetStoneArray: any;
  @Input() daypSearchStones: any;
  @Input() daypStatus: boolean;
  @Input() isPageSearch: boolean;
  @Output() modifyResult = new EventEmitter();

  private packetSubscription: Subscription;
  private noteAddSubscription: Subscription;
  private stonePriceUpdateSubscription: Subscription;
  private addNoteSubscription: Subscription;
  private tabChangeSubscription: Subscription;
  private daypSearchSubscription: Subscription;

  public daypSearchData: any;
  public indexvalue = 5;
  public selectedColumnList: any;
  public offerColumnList: any[];
  public message: string;
  public focusedElement: any;
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
  public caratHeaderFilter = [];
  public amountHeaderFilter = [];
  public priceHeaderFilter = [];
  public diffHeaderFilter = [];
  public daypamountHeaderFilter = [];
  public offperHeaderFilter = [];
  public pricesrkHeaderFilter = [];
  public downloadPopOverVisible = false;
  public downloadOptions: any[];
  public selectedDownloadType: any;
  public columnWidth = 130;
  public isIconVisible = false;
  public menuDistanceFromTop: any;
  public currentScroll: any;
  public daypHeight = window.innerHeight - 285;
  public isFilterAllSelected = false;
  public filterDataSource = [];
  public daypColumnWidth: any;
  public filterOptions = [];
  public filterFlag: any;
  public selectedFilterOption: any;
  public allColumnWidth: any;
  public colWidth: any;
  public filterPopOverVisible = false;
  public filterId = 'filterOnDAYPSearch';
  public isColumnExpanded = false;
  public initAutoPriceSubscripation: any;

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
    private appStore: ApplicationStorageService,
    private auditService: ApplicationAuditService,
    private authService: AuthService,
    private notesService: AddNoteService) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.daypColumnWidth = this.userProfileService.getDAYPColumnWidth();
    this.colWidth = this.allColumnWidth;
    this.message = 'Loading...';
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.offerColumnList = this.userProfileService.getSelectedDaypValues();
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.stonePriceUpdateSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      this.updateStoneStateDetails(res);
    });
    this.tabChangeSubscription = this.notify.notifyTabChangeActionObservable$.subscribe(res => {
      if (res.index === 1 && this.daypSearchStones) {
        if (this.daypSearchSubscription) {
          this.daypSearchSubscription.unsubscribe();
        }
        this.getDaypSearchList();
      }
    });
    this.daypSvc.handlekeyupEvent('daypSearchResultContainer');
    this.addNoteSubscription = this.notify.addNewNotesForIggridObservable$.subscribe(res => {
      if (res.isDeleteFlow) {
        this.deleteCommentsFromStones(res);
      } else {
        this.updateNotesForStones(res);
      }
    });
  }


  ngOnChanges() {
    this.tabChangeSubscription = this.notify.notifyTabChangeActionObservable$.subscribe(res => {
      if (res.index === 1 && this.daypSearchStones) {
        if (this.daypSearchSubscription) {
          this.daypSearchSubscription.unsubscribe();
        }
        this.getDaypSearchList();
      }
    });

    this.message = 'Loading...';
    if (this.daypSearchStones) {
      this.getDaypSearchList();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.appStore.getData('daypSearchPageRef')) {
        const scrollable = this.daypSearchResultContainer.instance.getScrollable();
        scrollable.scrollTo({ left: 0, top: this.appStore.getData('daypSearchPageRef') });
      }
      this.daypSvc.setSortedColumnIndex(this.daypSearchResultContainer, this.daypSearchStones);
    }, 2000);
  }

  getDaypSearchList() {
    const stoneIDs = this.stoneSvc.createStoneIdList(this.daypSearchStones);
    this.daypSearchSubscription = this.daypSvc.getDaypSearchStones(stoneIDs).subscribe(response => {
      if (response && !response.error_status && response.data) {
        this.daypSearchStones = this.daypSvc.setDaypSearchData(this.daypSearchStones, response.data);
        this.updateExtraInfo();
        this.adjustTableSize();
      } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MSG_DAYP_GET_OFFER_STONES_NO_DATA_200)) {
        this.daypSearchStones.forEach((stone, index) => {
          stone['dayp_rate'] = stone['dayp_per'] = stone['difference'] = null;
          stone['final_submit'] = null;
          if (index === this.daypSearchStones.length - 1) {

            this.updateExtraInfo();
            this.adjustTableSize();

          }

        });
      }
    }, error => {
      this.appStore.remove('daypSearchDetails');
      this.updateExtraInfo();
    });
  }

  updateExtraInfo() {
    this.daypSearchStones = this.daypSvc.updateSortedObject(this.daypSearchStones, this.appStore.getData('daypSearchDetails'));
    this.daypSearchStones = this.utilService.updateStonesForDecimal(this.daypSearchStones);
    this.daypSearchData = this.daypSvc.initializeStoneListObject(this.daypSearchStones);
    this.updateExtraStoneDetails();
    if (this.isDataFetched) {
      this.daypSearchData = this.daypSvc.checkSelectedStones(this.daypSearchData, this.appStore.getData('daypSearchDetails'));
    }
    this.isDataFetched = true;
    this.appStore.store('daypSearchDetails', this.daypSearchData);
  }


  updateExtraStoneDetails() {
    if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
      if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
        this.daypSearchData.selectedStoneTable.forEach(selectedStone => {
          this.daypSearchData.diamondTable.forEach(stone => {
            if (selectedStone.stone_id === stone.stone_id) {
              selectedStone = JSON.parse(JSON.stringify(stone));
            }
          });
        });
      }
    }
    this.updatePacketDetails(this.packetStoneArray);
  }

  selectAllStones(allSelected) {

    // this.daypSearchData.isAllResultSelected = allSelected;

    if (this.daypSearchData.isAllResultSelected) {
      this.daypSearchData.selectedStoneButton = this.stoneSvc.createStoneIdList(this.daypSearchData.diamondTable);
      this.daypSearchData.filteredStone = this.stoneSvc.createStoneIdList(this.daypSearchData.diamondTable);
      this.daypSearchData.selectedStoneTable = JSON.parse(JSON.stringify(this.daypSearchData.diamondTable));
    } else {
      this.daypSearchData.selectedStoneButton = [];
      this.daypSearchData.selectedStoneTable = [];
      this.daypSearchData.filteredStone = [];
    }
    this.daypSearchData.isAllSelected = this.searchSvc.isArrayMatch(this.daypSearchData.selectedStoneButton,
      this.daypSearchData.filteredStone);
    this.updateDaypStoneDetails(this.daypSearchData);
    this.updateRowColor();
  }

  selectMultipleStone(data) {

    if (Array.isArray(data)) {

      this.daypSearchData.selectedStoneButton = [];
      this.daypSearchData.filteredStone = [];
      this.daypSearchData.selectedStoneTable = [];

      if (data.length > 0) {

        data.forEach((elm, index) => {

          this.daypSearchData.selectedStoneButton.push(elm._id);
          this.daypSearchData.filteredStone.push(elm._id);
          this.daypSearchData.selectedStoneTable.push(

            this.daypSearchData.diamondTable.find(elem => { return elm._id === elem._id; })

          );

          if (index === data.length - 1) {

            this.isAllFilterStoneSelected();
            this.updateDaypStoneDetails(this.daypSearchData);
            this.updateRowColor();

          }

        });

      } else {

        this.updateDaypStoneDetails(this.daypSearchData);

      }


    } else {

      if (data.added === true) {

        this.daypSearchData.selectedStoneButton.push(data.stoneId);

      } else {

        this.daypSearchData.selectedStoneButton = this.daypSearchData.selectedStoneButton.filter(elm => { return elm !== data.stoneId; });

      }

      this.daypSearchData = this.searchSvc.fetchSelectedStones(this.daypSearchData, data.stoneId);
      if (this.filterDataSource.length > 0) {
        this.isAllFilterStoneSelected();
      }
      this.updateDaypStoneDetails(this.daypSearchData);
      this.updateRowColor();

    }

  }

  addOfferPriceForStone(data, offerPrice) {
    if (offerPrice !== '' && Number(data.dayp_rate) !== Number(offerPrice)) {
      const response = this.daypSvc.addOfferPriceForStone(data, offerPrice);
      if (response.status) {
        const newPrice = this.daypSvc.setOffPrice(response.data, offerPrice);
        if (newPrice.data.dayp_rate) {
          newPrice.data.dayp_rate = parseFloat(newPrice.data.dayp_rate).toFixed(2);
        }
        if (newPrice.data.dayp_per) {
          newPrice.data.dayp_per = parseFloat(newPrice.data.dayp_per).toFixed(2);
        }
        this.daypSearchData.diamondTable = this.daypSvc.updateDAYPStonePriceValue(this.daypSearchData.diamondTable, [newPrice.data], false);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: newPrice.data };
        if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
          this.daypSearchData.selectedStoneTable = this.daypSvc.updateDAYPStonePriceValue(this.daypSearchData.selectedStoneTable, [newPrice.data], false);
        }
        this.initiateAutoSavePrice(newPrice.data, newPrice.data.dayp_rate, newPrice.data.dayp_per);
      } else {
        this.daypSearchData.diamondTable = this.daypSvc.resetDaypOffers(this.daypSearchData.diamondTable, [data]);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
        if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
          this.daypSearchData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypSearchData.selectedStoneTable, [data]);
        }
      }
    } else if (offerPrice === '' && data.dayp_rate) {
      this.daypSearchData.diamondTable = this.daypSvc.resetDaypOffers(this.daypSearchData.diamondTable, [data]);
      this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
      if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
        this.daypSearchData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypSearchData.selectedStoneTable, [data]);
      }
    }
  }

  addOfferPercentageForStone(data, offerPercentage, sign) {
    if (offerPercentage !== '' && data.dayp_per !== Number(offerPercentage)) {
      const response = this.daypSvc.addOfferPercentageForStone(data, offerPercentage, sign);
      if (response.status) {
        this.daypSearchData.diamondTable = this.daypSvc.updateDAYPStonePriceValue(this.daypSearchData.diamondTable, [response.data], false);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: response.data };
        if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
          this.daypSearchData.selectedStoneTable = this.daypSvc.updateDAYPStonePriceValue(this.daypSearchData.selectedStoneTable, [response.data], false);
        }
        this.initiateAutoSavePrice(response.data, response.data.dayp_rate, response.offerPer);
      } else {
        this.daypSearchData.diamondTable = this.daypSvc.resetDaypOffers(this.daypSearchData.diamondTable, [data]);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
        if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
          this.daypSearchData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypSearchData.selectedStoneTable, [data]);
        }
      }
    } else if (offerPercentage === '' && data.dayp_per) {
      this.daypSearchData.diamondTable = this.daypSvc.resetDaypOffers(this.daypSearchData.diamondTable, [data]);
      this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
      if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
        this.daypSearchData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypSearchData.selectedStoneTable, [data]);
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
    if (this.initAutoPriceSubscripation) {
      this.initAutoPriceSubscripation.unsubscribe();
    }
    this.initAutoPriceSubscripation = this.daypSvc.autoSavePriceChange(stoneList).subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_DAYP_ASDB_200)) {
        this.notify.notifyStoneStateUpdated({ daypAction: 'daypPriceInserted', stoneList: [data.stone_id], stoneObj: [data], status: 'search' });
        this.messageService.showSuccessGrowlMessage(MessageCodes.SMS_DAYP_ASDB_200);
        $('body').css('overflow-y', 'auto');
        if (this.daypGrid) {
          if (this.focusedElement && this.focusedElement.element) {
            this.daypGrid.focusTextBox(this.focusedElement.element, this.focusedElement.mouseClick);
          }
        }
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_DEE_200) && res.error_status) {
        this.daypSearchData.diamondTable = this.daypSvc.resetDaypOffers(this.daypSearchData.diamondTable, [data]);
        if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
          this.daypSearchData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypSearchData.selectedStoneTable, [data]);
        }
        this.messageService.showErrorGrowlMessage('DAYP__OVER');
      } else {
        this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_DAYP_BASKET');
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_DAYP_BASKET');
      this.daypSearchData.diamondTable = this.daypSvc.resetDaypOffers(this.daypSearchData.diamondTable, [data]);
      if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
        this.daypSearchData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypSearchData.selectedStoneTable, [data]);
      }
    });
  }

  onPriceInput(data, priceRef: any) {
    const reg = /[^0-9\.\,]/ig;
    if (priceRef.value && reg.test(priceRef.value)) {
      const start = priceRef.selectionStart, end = priceRef.selectionEnd;
      const value = String(priceRef.value).replace(reg, '');
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
    this.daypSearchData.diamondTable.forEach(stone => {
      if (stone.stone_id === stone_id) {
        stone.offerSign = sign;
        stone = this.daypSvc.resetDaypValue(stone, {});
      }
    });
  }

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    if (stoneList && this.daypSearchData) {
      if (res.hasOwnProperty('daypAction')) {
        if (res.daypAction === 'daypPriceInserted' && res.status !== 'search') {
          this.daypSearchData.diamondTable = this.updateDAYPStoneInfo(this.daypSearchData.diamondTable, stoneList, res);
          if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
            this.daypSearchData.selectedStoneTable = this.updateDAYPStoneInfo(this.daypSearchData.selectedStoneTable, stoneList, res);
          }
          const newResponse = { ...res };
          this.stonesActedOn = newResponse;
          if (res.status === '') {
            newResponse['source'] = 'offerOnSelectedStonesUpdated';
          }
          this.stonesActedOn = newResponse;
        } else if (res.daypAction === 'daypSubmitted') {
          this.daypSearchData.diamondTable = this.updateDAYPStoneInfo(this.daypSearchData.diamondTable, stoneList, res);
          if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
            this.daypSearchData.selectedStoneTable = this.updateDAYPStoneInfo(this.daypSearchData.selectedStoneTable, stoneList, res);
          }
          const newResponse = { ...res };
          // Here status is deleted as it appear in case of excel submission
          if (newResponse.hasOwnProperty('status')) {
            delete newResponse.status;
            newResponse['source'] = 'offerOnSelectedStonesUpdated';
          }
          this.stonesActedOn = newResponse;
        } else if (res.daypAction === 'offerOnSelectedStonesUpdated') {
          this.daypSearchData.diamondTable = this.updateDAYPStoneInfo(this.daypSearchData.diamondTable, stoneList, res);
          if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
            this.daypSearchData.selectedStoneTable = this.updateDAYPStoneInfo(this.daypSearchData.selectedStoneTable, stoneList, res);
          }
          this.stonesActedOn = res;
        } else if (res.daypAction === 'removeStoneFromSubmission') {
          this.daypSearchData.diamondTable = this.daypSvc.updateRemovedDaypStoneState(
            this.daypSearchData.diamondTable, res.stoneList);
          this.daypSearchData.selectedStoneTable = this.daypSvc.updateRemovedDaypStoneState(
            this.daypSearchData.selectedStoneTable, res.stoneList);
          this.stonesActedOn = res;
        } else if (res.daypAction === 'removeStoneFromBasket') {
          this.daypSearchData.diamondTable = this.daypSvc.updateRemovedDaypStoneState(
            this.daypSearchData.diamondTable, res.stoneList);
          this.daypSearchData.selectedStoneTable = this.daypSvc.updateRemovedDaypStoneState(
            this.daypSearchData.selectedStoneTable, res.stoneList);
          this.stonesActedOn = res;
        }
      } else {
        this.daypSearchData.diamondTable = this.daypSvc.updateTableStoneDetails(this.daypSearchData.diamondTable, stoneList, res);
        if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
          this.daypSearchData.selectedStoneTable =
            this.daypSvc.updateTableStoneDetails(this.daypSearchData.selectedStoneTable, stoneList, res);
        }
        this.stonesActedOn = res;
      }
      if (this.daypSearchData.diamondTable && this.daypSearchData.selectedStoneTable &&
        this.daypSearchData.diamondTable.length === this.daypSearchData.selectedStoneTable.length) {
        this.daypSearchData.isAllResultSelected = true;
      }
      this.updateDaypStoneDetails(this.daypSearchData);
      this.appStore.store('daypSearchDetails', this.daypSearchData);
    }
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
    if (this.daypSearchResultContainer) {
      this.daypSearchResultContainer.instance.refresh();
      if (this.selectedDaypStonesPanel && this.selectedDaypStonesPanel.hasOwnProperty('selectedDaypStoneContainer')
        && this.selectedDaypStonesPanel.selectedDaypStoneContainer) {
        this.selectedDaypStonesPanel.selectedDaypStoneContainer.instance.refresh();
      }
    }
  }

  modifySearch() {
    this.modifyResult.emit({ modify: false });
    this.appStore.store('resetScrollOnModify', 'true');
  }

  toggleSelectedDaypPanel(event) {
    this.updateDaypStoneDetails(event.array);
  }

  updateDaypStones(event) {
    if (this.filterDataSource.length > 0) {
      this.isAllFilterStoneSelected();
    }
    this.updateDaypStoneDetails(event.array);
    this.updateRowColor();
  }

  updateDaypStoneDetails(array) {
    if (array) {
      this.daypSearchData.selectedStoneTable = array.selectedStoneTable;
      this.daypSearchData.selectedStoneButton = array.selectedStoneButton;
      this.daypSearchData.filteredStone = array.filteredStone;
      this.daypSearchData.toggleTableDisplay = array.toggleTableDisplay;
      if (!array.isAllSelected) {
        this.daypSearchData.isAllSelected = false;
        this.daypSearchData.isAllResultSelected = false;
        this.daypSearchData.toggleTableDisplay = false;
        this.daypSearchData.selectedStoneButton = [];
        this.daypSearchData.filteredStone = [];
        this.daypSearchData.selectedStoneTable = [];
      }
    }
    this.getSelectedStoneCarat();
    this.adjustTableSize();
    this.appStore.store('daypSearchDetails', this.daypSearchData);
  }

  getSelectedStoneCarat() {
    this.daypSearchData.selectedStonesCarat = 0;
    this.daypSearchData.totalOfferAmount = 0;
    if (this.daypSearchData.selectedStoneTable.length > 0) { }
    this.daypSearchData.selectedStoneTable.forEach(stone => {
      this.daypSearchData.selectedStonesCarat += Number(stone.carat);
      this.daypSearchData.totalOfferAmount += Number(stone.dayp_amount);
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
    }
  }

  addStoneInfoTab(data) {
    // this.getPageRef();

    data = this.daypSearchData.diamondTable.find(elm => { return elm._id === data; });

    data['CurrentSelectedTab'] = 'daypSearch';
    this.notify.notifyDaypPageForStoneClickedForDetail({ type: 'stoneDtl', 'data': data });
  }

  addTwinStoneInfoTab(pairId) {
    // this.getPageRef();
    this.notify.notifyDaypPageForStoneClickedForDetail({ type: 'twinStoneDtl', 'data': pairId });
  }

  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp();
    this.stoneMultimediaInfo = stoneInfo;
    this.toggleMultimediaPopup = true;
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
      this.downloadSvc.mailDAYPStoneExcel(array.diamondTable, stoneList, 'DAYP RESULT');
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  stoneToOperateInPacket(data) {
    this.notify.notifyDaypForPacketUpdate({ visible: true, object: [data] });
  }

  updatePacketDetails(event) {

    // For Packet icon update.
    if (event && event.array && event.array.length > 0) {
      this.packetIconDataForGrid = event.array.map(elm => { return elm.stones.toString(); }).toString();
    }

    if (this.daypSearchData && this.daypSearchData.diamondTable) {
      this.daypSearchData.diamondTable = this.stoneSvc.setStonePacketCount(this.daypSearchData.diamondTable);
      this.daypSearchData.diamondTable = this.stoneSvc.updateStonePacketCount(event, this.daypSearchData.diamondTable);
    }
    if (this.daypSearchData && this.daypSearchData.selectedStoneTable) {
      this.daypSearchData.selectedStoneTable = this.stoneSvc.setStonePacketCount(this.daypSearchData.selectedStoneTable);
      this.daypSearchData.selectedStoneTable = this.stoneSvc.updateStonePacketCount(event, this.daypSearchData.selectedStoneTable);
    }
  }

  getNotesForAllStones() {
    if (this.daypSearchData && this.daypSearchData.diamondTable) {
      // this.daypSearchData.diamondTable = this.daypSvc.fetchStonesComment(this.daypSearchData.diamondTable);
      // this.stonesActedOn = { 'source': 'noteAdded' };

      if (this.noteAddSubscription) {
        this.noteAddSubscription.unsubscribe();
      }
      this.noteAddSubscription = this.notesService.getCommentListforStoneIds(this.daypSearchData.diamondTable).subscribe((res) => {
        this.daypSearchData.diamondTable = res;
        this.stonesActedOn = { 'source': 'noteAdded', data: this.daypSearchData.diamondTable };
      }, error => {
        this.stonesActedOn = { 'source': 'noteAdded' };
      });
      if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
        this.daypSearchData.selectedStoneTable = this.daypSvc.fetchStonesComment(this.daypSearchData.selectedStoneTable);
      }
    }
  }

  getPageRef() {
    const scrollable = this.daypSearchResultContainer.instance.getScrollable('#daypSearchResultContainer');
    this.appStore.store('daypSearchPageRef', scrollable.scrollTop());
  }

  newSearch() {
    this.modifyResult.emit({ modify: false });
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneSvc.scrollLeft(this.daypSearchResultContainer, '#daypSearchResultContainer');
    } else if (params === 'right') {
      this.stoneSvc.scrollRight(this.daypSearchResultContainer, '#daypSearchResultContainer');
    }
  }

  scrollTableInInterval(params) {
    this.timer = setInterval(() => {
      this.scrollTable(params);
    }, 1);
  }

  stopScrolling() {
    clearInterval(this.timer);
  }

  scrollColumn() {
    this.isColumnExpanded = !this.isColumnExpanded;
    this.isIconVisible = !this.isIconVisible;
    this.stoneSvc.handleSortingOrder(this.daypSearchResultContainer);
    const columns = JSON.parse(JSON.stringify(this.daypSearchResultContainer.columns));
    if (this.isColumnExpanded) {
      columns[1].width = 275;
    } else {
      columns[1].width = 130;
    }
    this.daypSearchResultContainer.columns = columns;
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
    if (this.initAutoPriceSubscripation) {
      this.initAutoPriceSubscripation.unsubscribe();
    }
    if (this.addNoteSubscription) {
      this.addNoteSubscription.unsubscribe();
    }
  }

  onCellPrepared(e) {
    this.daypSvc.onCellPrepared(e, this.daypSearchData.selectedStoneButton);
  }

  updateRowColor() {
    this.daypSvc.updateRowColor(this.daypSearchResultContainer, this.daypSearchData);
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
      jQuery('#daypPanel').css('height', window.innerHeight - 126);
    }
  }

  onContentLoad(event) {
    this.daypSearchStones = this.daypSvc.getSortedTable(this.daypSearchResultContainer, this.daypSearchStones);
    this.appStore.store('daypSearchDetails', this.daypSearchStones);
    const filters = this.daypSearchResultContainer.instance.getCombinedFilter();
    if (filters) {
      const filterDataSource = this.daypSearchResultContainer.instance.getDataSource();
      this.filterDataSource = JSON.parse(JSON.stringify(filterDataSource['_items']));
      this.isAllFilterStoneSelected();
    } else {
      this.filterDataSource = [];
      this.isFilterAllSelected = false;
    }
  }

  selectFilterStones() {
    this.daypSearchData = this.daypSvc.selectFilterStones(this.filterDataSource, this.isFilterAllSelected, this.daypSearchData);
    this.updateDaypStoneDetails(this.daypSearchData);
    this.updateRowColor();
  }

  isAllFilterStoneSelected() {
    this.isFilterAllSelected = this.daypSvc.isAllFilterStoneSelected(this.filterDataSource, this.daypSearchData.selectedStoneButton);
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

  // Display menu for icons
  stoneMediaIconPanel(event) {
    const data = this.stoneSvc.returnPositionOfOverlay(event);
    this.iconOverlayXPosition = data.left;
    this.iconOverlayYPosition = data.top;
    this.iconDisplayStoneObject = event.stoneId;
    this.displayIconOverlay = true;
  };

  closeGridIconOverlay(data) {

    this.displayIconOverlay = false;

  }

  offerOnSelectedStoneUpdated(data: any) {

    this.stonesActedOn = data;

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
    if (this.daypSearchData.diamondTable && this.daypSearchData.diamondTable.length > 0) {
      const toUpdateStoneArray = this.stoneSvc.findStoneObjUsingStoneIds(this.daypSearchData.diamondTable, res.stoneList);
      if (toUpdateStoneArray instanceof Array && toUpdateStoneArray.length > 0) {
        this.notesService.fetchStonesAsynchronously(toUpdateStoneArray)
          .then(result => {

            this.daypSearchData.diamondTable = this.stoneSvc.findAndUpdateStoneCommentFromList(this.daypSearchData.diamondTable, result);
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
    if (this.daypSearchData.diamondTable && this.daypSearchData.diamondTable.length > 0) {
      const commentsId = res.commentList;
      this.daypSearchData.diamondTable.forEach(stone => {
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
    if (this.daypSearchData.selectedStoneTable && this.daypSearchData.selectedStoneTable.length > 0) {
      this.daypSearchData.selectedStoneTable =
        this.stoneSvc.updateNotesForSelectedPanel(this.daypSearchData.selectedStoneTable, this.daypSearchData.diamondTable);
    }
    this.appStore.store('daypSearchDetails', this.daypSearchData);
  }

}
