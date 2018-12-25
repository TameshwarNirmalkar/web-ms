import {
  Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy,
  AfterViewInit, HostListener
} from '@angular/core';
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
import { ApplicationStorageService } from '@srk/core';
import { ApplicationAuditService } from '@srk/core';
import { AuthService } from '@srk/core';
import * as _ from 'underscore';


@Component({
  selector: 'app-dayp-basket',
  templateUrl: './dayp-basket.component.html',
  styleUrls: ['./dayp-basket.component.scss']
})
export class DaypBasketComponent implements OnInit, OnDestroy, AfterViewInit {
  gridRebind: any;
  @ViewChild('daypBasketStoneContainer') daypBasketStoneContainer;
  @ViewChild('selectedDaypStonesPanel') selectedDaypStonesPanel;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @ViewChild('filterBox') filterBox;
  @ViewChild('daypGrid') daypGrid: any;
  @Input() isEditableMode: boolean;
  @Input() daypStatus: boolean;
  @Input() visiblePacketIcon = false;
  @Input() packetStoneArray: any;
  @Output() addToPacket = new EventEmitter();

  private packetSubscription: Subscription;
  private noteAddSubscription: Subscription;
  private stonePriceUpdateSubscription: Subscription;
  private addNoteSubscription: Subscription;
  private tabChangeSubscription: Subscription;
  private daypBasketSubscription: Subscription;

  public daypBasketData: any;
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
  public stoneForPacket: any;

  public ddcOverlayVisible = false;
  public definedDDCHour: any;
  public ddcStones: any[] = [];
  public saleAmountHeaderFilter: any;
  public downloadPopOverVisible = false;
  public downloadOptions: any[];
  public selectedDownloadType: any;
  public isIconVisible = false;
  public newFocusStoneId: any;
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
  public isColumnExpanded = false;
  public filterOptions = [];
  public filterFlag: any;
  public selectedFilterOption: any;
  public allColumnWidth: any;
  public colWidth: any;
  public filterPopOverVisible = false;
  public filterId = 'filterOnDAYPBasket';
  public selectedTableToggle = false;
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
    private notesService: AddNoteService,
    private appStore: ApplicationStorageService,
    private auditService: ApplicationAuditService,
    private authService: AuthService) { }

  ngOnInit() {
    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.daypColumnWidth = this.userProfileService.getDAYPColumnWidth();
    this.colWidth = this.allColumnWidth;
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.offerColumnList = this.userProfileService.getSelectedDaypValues();
    this.message = 'Loading...';
    this.getStoneList();
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
    this.stonePriceUpdateSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      this.updateStoneStateDetails(res);
      // this.stonesActedOn = {'source' : 'daypStoneStateUpdated', 'data' : res};
    });
    this.tabChangeSubscription = this.notify.notifyTabChangeActionObservable$.subscribe(res => {
      if (res.index === 2) {
        if (this.daypBasketSubscription) {
          this.daypBasketSubscription.unsubscribe();
        }
        this.getStoneList();
      }
    });
    this.daypSvc.handlekeyupEvent('daypBasketStoneContainer');
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
      if (this.appStore.getData('daypBasketPageRef')) {
        const scrollable = this.daypBasketStoneContainer.instance.getScrollable();
        scrollable.scrollTo({ left: 0, top: this.appStore.getData('daypBasketPageRef') });
      }
    }, 2000);
    this.daypSvc.setSortedColumnIndex(this.daypBasketStoneContainer, this.daypBasketData);
  }

  getStoneList() {
    if (this.daypStatus || this.isEditableMode) {
      if (this.appStore.getData('daypBasketDetails')) {
        this.daypBasketData = this.appStore.getData('daypBasketDetails');
      }
      this.getDaypBasketList();
    }
  }

  gridRefresh(eve) {
    if (eve && eve.stoneArray && eve.stoneArray.length > 0) {
      eve.stoneArray.forEach(element => {
        if (!element.dayp_per || !element.dayp_rate) {
          eve.gridRebind = eve.gridRebind.filter(id => id !== element._id);
        }
      });
    }
    this.gridRebind = eve.gridRebind;
  }

  offerOnSelectedStoneUpdated(data: any) {

    this.stonesActedOn = data;

  }

  getDaypBasketList() {
    this.daypBasketSubscription = this.daypSvc.getDaypBasketStones().subscribe((response) => {
      if (response && !response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MHS_SF_200)) {
        response.data = this.utilService.updateStonesForDecimal(response.data);
        this.daypBasketData = this.daypSvc.initializeStoneListObject(response.data);
        this.daypBasketData = this.daypSvc.checkSelectedStones(this.daypBasketData, this.appStore.getData('daypBasketDetails'));
        this.updateExtraStoneDetails();
        this.isDataFetched = true;
        this.adjustTableSize();
      } else if (response && response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DEE_200)) {
        this.daypStatus = false;
      } else if (response && response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.DAYP_SNF_404)) {
        this.daypBasketData = {};
        this.message = 'NO_STONE_FOUND_DAYP_BASKET';
      } else if (response && response.error_status && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_DNA_200)) {
        this.daypBasketData = {};
        this.message = 'DATA_NOT_AVAILABLE_DAYP';
      } else if (response && response.error_status) {
        this.daypBasketData = {};
        this.message = 'ERR_GET_DAYP_BASKET';
      }
    }, error => {
      this.message = 'ERR_GET_DAYP_BASKET';
    });
  }

  updateExtraStoneDetails() {
    this.daypBasketData = this.daypSvc.updateSortedObject(this.daypBasketData, this.appStore.getData('daypBasketDetails'));
    if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
      this.daypBasketData.selectedStoneTable = this.daypSvc.fetchStoneAdditionalInfo(this.daypBasketData.selectedStoneTable);
      this.daypBasketData.selectedStoneTable = this.daypSvc.fetchStonesComment(this.daypBasketData.selectedStoneTable);
    }
    this.updatePacketDetails(this.packetStoneArray);
    this.appStore.store('daypBasketDetails', this.daypBasketData);
  }

  selectAllStones() {
    if (this.daypBasketData.isAllResultSelected) {
      this.daypBasketData.selectedStoneButton = this.stoneSvc.createStoneIdList(this.daypBasketData.diamondTable);
      this.daypBasketData.filteredStone = this.stoneSvc.createStoneIdList(this.daypBasketData.diamondTable);
      this.daypBasketData.selectedStoneTable = JSON.parse(JSON.stringify(this.daypBasketData.diamondTable));
    } else {
      this.daypBasketData.selectedStoneButton = [];
      this.daypBasketData.selectedStoneTable = [];
      this.daypBasketData.filteredStone = [];
    }
    this.daypBasketData.isAllSelected = this.searchSvc.isArrayMatch(this.daypBasketData.selectedStoneButton,
      this.daypBasketData.filteredStone);
    this.updateDaypStoneDetails(this.daypBasketData);
    this.updateRowColor();
  }

  selectMultipleStone(data) {

    if (Array.isArray(data)) {

      this.daypBasketData.selectedStoneButton = [];
      this.daypBasketData.filteredStone = [];
      this.daypBasketData.selectedStoneTable = [];

      if (data.length > 0) {

        data.forEach((elm, index) => {

          this.daypBasketData.selectedStoneButton.push(elm._id);
          this.daypBasketData.filteredStone.push(elm._id);
          this.daypBasketData.selectedStoneTable.push(

            this.daypBasketData.diamondTable.find(elem => { return elm._id === elem._id; })

          );

          if (index === data.length - 1) {

            this.isAllFilterStoneSelected();
            this.updateDaypStoneDetails(this.daypBasketData);
            this.updateRowColor();

          }

        });

      } else {

        this.updateDaypStoneDetails(this.daypBasketData);

      }


    } else {

      if (data.added === true) {

        this.daypBasketData.selectedStoneButton.push(data.stoneId);

      } else {

        this.daypBasketData.selectedStoneButton = this.daypBasketData.selectedStoneButton.filter(elm => { return elm !== data.stoneId; });

      }

      this.daypBasketData = this.searchSvc.fetchSelectedStones(this.daypBasketData, data.stoneId);
      if (this.filterDataSource.length > 0) {
        this.isAllFilterStoneSelected();
      }
      this.updateDaypStoneDetails(this.daypBasketData);
      this.updateRowColor();

    }

  }

  /*  selectMultipleStone(id) {
      this.daypBasketData = this.searchSvc.fetchSelectedStones(this.daypBasketData, id);
      if (this.filterDataSource.length > 0) {
        this.isAllFilterStoneSelected();
      }
      this.updateDaypStoneDetails(this.daypBasketData);
      this.updateRowColor();
    }*/

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
        this.daypBasketData.diamondTable = this.daypSvc.updateDAYPStonePriceValue(this.daypBasketData.diamondTable, [newPrice.data], false);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: newPrice.data };
        if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
          this.daypBasketData.selectedStoneTable = this.daypSvc.updateDAYPStonePriceValue(this.daypBasketData.selectedStoneTable, [newPrice.data], false);
        }
        this.initiateAutoSavePrice(newPrice.data, newPrice.data.dayp_rate, newPrice.data.dayp_per);
      } else {
        this.daypBasketData.diamondTable = this.daypSvc.resetDaypOffers(this.daypBasketData.diamondTable, [data]);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
        if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
          this.daypBasketData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypBasketData.selectedStoneTable, [data]);
        }
      }
    } else if (offerPrice === '' && data.dayp_rate) {
      this.daypBasketData.diamondTable = this.daypSvc.resetDaypOffers(this.daypBasketData.diamondTable, [data]);
      this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
      if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
        this.daypBasketData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypBasketData.selectedStoneTable, [data]);
      }
    }
  }

  addOfferPercentageForStone(data, offerPercentage, sign) {
    if (offerPercentage != '' && data.dayp_per !== Number(offerPercentage)) {
      const response = this.daypSvc.addOfferPercentageForStone(data, offerPercentage, sign);
      if (response.status) {
        if (response.data.dayp_rate) {
          response.data.dayp_rate = parseFloat(response.data.dayp_rate).toFixed(2);
        }
        if (response.data.dayp_per) {
          response.data.dayp_per = parseFloat(response.data.dayp_per).toFixed(2);
        }
        this.daypBasketData.diamondTable = this.daypSvc.updateDAYPStonePriceValue(this.daypBasketData.diamondTable, [response.data], false);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: response.data };
        if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
          this.daypBasketData.selectedStoneTable = this.daypSvc.updateDAYPStonePriceValue(this.daypBasketData.selectedStoneTable, [response.data], false);
        }
        this.initiateAutoSavePrice(response.data, response.data.dayp_rate, response.offerPer);
      } else {
        this.daypBasketData.diamondTable = this.daypSvc.resetDaypOffers(this.daypBasketData.diamondTable, [data]);
        this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
        if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
          this.daypBasketData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypBasketData.selectedStoneTable, [data]);
        }
      }
    } else if (offerPercentage === '' && data.dayp_per) {
      this.daypBasketData.diamondTable = this.daypSvc.resetDaypOffers(this.daypBasketData.diamondTable, [data]);
      this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
      if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
        this.daypBasketData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypBasketData.selectedStoneTable, [data]);
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
      'action': 'u'
    }];
    if (this.initAutoPriceSubscripation) {
      this.initAutoPriceSubscripation.unsubscribe();
    }
    this.initAutoPriceSubscripation = this.daypSvc.autoSavePriceChange(stoneList).subscribe(res => {
      if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_DAYP_ASDB_200)) {
        this.notify.notifyStoneStateUpdated({ daypAction: 'daypPriceInserted', stoneList: [data.stone_id], stoneObj: [data], status: 'basket' });
        this.updateDaypStoneDetails(this.daypBasketData);
        this.messageService.showSuccessGrowlMessage('DAYP_RATE_UPDATED');
        $('body').css('overflow-y', 'auto');
        if (this.daypGrid) {
          if (this.focusedElement && this.focusedElement.element) {
            this.daypGrid.focusTextBox(this.focusedElement.element, this.focusedElement.mouseClick);
          }
        }
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_DEE_200) && res.error_status) {
        this.daypBasketData.diamondTable = this.daypSvc.resetDaypOffers(this.daypBasketData.diamondTable, [data]);
        if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
          this.daypBasketData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypBasketData.selectedStoneTable, [data]);
        }
        this.messageService.showErrorGrowlMessage('DAYP__OVER');
      } else {
        this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_DAYP_BASKET');
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_DAYP_BASKET');
      this.daypBasketData.diamondTable = this.daypSvc.resetDaypOffers(this.daypBasketData.diamondTable, [data]);
      if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
        this.daypBasketData.selectedStoneTable = this.daypSvc.resetDaypOffers(this.daypBasketData.selectedStoneTable, [data]);
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
    this.daypBasketData.diamondTable.forEach(stone => {
      if (stone.stone_id === stone_id) {
        stone.offerSign = sign;
        stone = this.daypSvc.resetDaypValue(stone, {});
      }
    });
  }

  updateStoneStateDetails(res) {
    const stoneList = res.stoneList;
    console.log("res", res)

    if (stoneList) {
      if (!this.daypBasketData || this.daypBasketData === {}) {
        this.daypBasketData = this.daypSvc.initializeStoneListObject([]);
      }
      if (!_.isEmpty(this.daypBasketData)) {
        if (res.hasOwnProperty('daypAction')) {
          if (res.daypAction === 'removeStoneFromBasket' || res.daypAction === 'daypSubmitted') {
            res = this.validateStoneStateDetailsRemoveEntry(res);
            const newStoneList = res.stoneList;
            this.daypBasketData.selectedStoneButton.forEach(value => {
              if (newStoneList.indexOf(value) > -1) {
                this.stoneSvc.removeElement(this.daypBasketData.selectedStoneButton, value);
              }
            });
            this.daypBasketData.filteredStone.forEach(value => {
              if (newStoneList.indexOf(value) > -1) {
                this.stoneSvc.removeElement(this.daypBasketData.filteredStone, value);
              }
            });
            this.daypBasketData.diamondTable = this.daypSvc.removeStoneFromTable(this.daypBasketData.diamondTable, newStoneList);
            // this.stonesActedOn = {source : 'removeStoneFromBasket', data: stoneList};
            if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
              this.daypBasketData.selectedStoneTable =
                this.daypSvc.removeStoneFromTable(this.daypBasketData.selectedStoneTable, newStoneList);
            }
            this.daypBasketData = this.daypSvc.updateDaypObjectData(this.daypBasketData, newStoneList);
            // we use  'confirmedStones' key to remove stone on click of remove from dayp- basket
            if (res.stoneList.length > 0) {
              const newResponse = { ...res };
              newResponse['source'] = 'confirmedStones';
              this.stonesActedOn = newResponse;
            }
          } else if (res.daypAction === 'daypPriceInserted' && res.status !== 'basket') {
            this.daypBasketData.diamondTable = this.updateDAYPStoneInfo(this.daypBasketData.diamondTable, stoneList, res);
            if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
              this.daypBasketData.selectedStoneTable = this.updateDAYPSelectedStoneInfo(this.daypBasketData.selectedStoneTable, stoneList, res);
            }
            const newResponse = { ...res };
            if (res.status === '') {
              newResponse['source'] = 'offerOnSelectedStonesUpdated';
            }
            this.stonesActedOn = newResponse;
          }
        } else {
          this.daypBasketData.diamondTable = this.daypSvc.updateTableStoneDetails(this.daypBasketData.diamondTable, stoneList, res);
          if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
            this.daypBasketData.selectedStoneTable =
              this.daypSvc.updateTableStoneDetails(this.daypBasketData.selectedStoneTable, stoneList, res);
          }
          this.stonesActedOn = res;
        }
        if (this.daypBasketData.diamondTable && this.daypBasketData.selectedStoneTable &&
          this.daypBasketData.diamondTable.length === this.daypBasketData.selectedStoneTable.length) {
          this.daypBasketData.isAllResultSelected = true;
        }
        this.updateDaypStoneDetails(this.daypBasketData);
        this.appStore.store('daypBasketDetails', this.daypBasketData);
        // this.stonesActedOn = res;
      } else {
        this.getStoneList();
      }
    }
  }

  updateDAYPStoneInfo(table, stoneList, res) {
    if (table) {
      table = this.daypSvc.updateDAYPStonePriceValue(JSON.parse(JSON.stringify(table)), res.stoneObj, true);
    }
    return table;
  }

  updateDAYPSelectedStoneInfo(table, stoneList, res) {
    if (table) {
      table = this.daypSvc.updateDAYPStonePriceValue(JSON.parse(JSON.stringify(table)), res.stoneObj, false);
    }
    return table;
  }

  refreshDaypTable() {
    if (this.daypBasketStoneContainer) {
      this.daypBasketStoneContainer.instance.refresh();
      if (this.selectedDaypStonesPanel && this.selectedDaypStonesPanel.hasOwnProperty('selectedDaypStoneContainer')
        && this.selectedDaypStonesPanel.selectedDaypStoneContainer) {
        this.selectedDaypStonesPanel.selectedDaypStoneContainer.instance.refresh();
      }
    }
  }

  toggleSelectedDaypPanel(event) {
    this.updateDaypStoneDetails(event.array);
    this.selectedTableToggle = event.status;
  }

  updateDaypStones(event) {
    this.updateRowColor();
    if (this.filterDataSource.length > 0) {
      this.isAllFilterStoneSelected();
    }
    this.updateDaypStoneDetails(event.array);
  }

  updateDaypStoneDetails(array) {
    if (array) {
      this.daypBasketData.selectedStoneTable = array.selectedStoneTable;
      this.daypBasketData.selectedStoneButton = array.selectedStoneButton;
      this.daypBasketData.filteredStone = array.filteredStone;
      this.daypBasketData.toggleTableDisplay = array.toggleTableDisplay;
      if (!array.isAllSelected) {
        this.daypBasketData.isAllSelected = false;
        this.daypBasketData.isAllResultSelected = false;
        this.daypBasketData.toggleTableDisplay = false;
        this.daypBasketData.selectedStoneButton = [];
        this.daypBasketData.filteredStone = [];
        this.daypBasketData.selectedStoneTable = [];
      }
    }
    this.getSelectedStoneCarat();
    this.adjustTableSize();
    this.appStore.store('daypBasketDetails', this.daypBasketData);
  }

  getSelectedStoneCarat() {
    this.daypBasketData.selectedStonesCarat = 0;
    this.daypBasketData.totalOfferAmount = 0;
    if (this.daypBasketData.selectedStoneTable.length > 0) { }
    this.daypBasketData.selectedStoneTable.forEach(stone => {
      this.daypBasketData.selectedStonesCarat += Number(stone.carat);
      this.daypBasketData.totalOfferAmount += Number(stone.dayp_amount ? stone.dayp_amount : 0);
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

  addTwinStoneInfoTab(pairId) {
    // this.getPageRef();
    if (!this.isEditableMode) {
      this.notify.notifyDaypPageForStoneClickedForDetail({ type: 'twinStoneDtl', 'data': pairId });
    }
  }

  addStoneInfoTab(data) {
    // this.getPageRef();

    data = this.daypBasketData.diamondTable.find(elm => { return elm._id === data; });

    data['CurrentSelectedTab'] = 'daypBasket';
    if (!this.isEditableMode) {
      this.notify.notifyDaypPageForStoneClickedForDetail({ type: 'stoneDtl', 'data': data });
    }

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

  showFilterOptions() {
    if (this.filterFlag) {
      this.filterOptions = [{ label: 'Disable Filter', value: 'disableFilter' }, { label: 'Reset Filter', value: 'resetFilter' }];
    } else {
      this.filterOptions = [{ label: 'Enable Filter', value: 'enableFilter' }];
    }
    this.filterPopOverVisible = true;
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
      this.downloadSvc.mailDAYPStoneExcel(array.diamondTable, stoneList, 'DAYP BASKET');
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
    if (this.daypBasketData && this.daypBasketData.diamondTable) {
      this.daypBasketData.diamondTable = this.stoneSvc.setStonePacketCount(this.daypBasketData.diamondTable);
      this.daypBasketData.diamondTable = this.stoneSvc.updateStonePacketCount(event, this.daypBasketData.diamondTable);
    }
    if (this.daypBasketData && this.daypBasketData.selectedStoneTable) {
      this.daypBasketData.selectedStoneTable = this.stoneSvc.setStonePacketCount(this.daypBasketData.selectedStoneTable);
      this.daypBasketData.selectedStoneTable = this.stoneSvc.updateStonePacketCount(event, this.daypBasketData.selectedStoneTable);
    }
  }

  getNotesForAllStones() {
    if (this.daypBasketData && this.daypBasketData.diamondTable && this.daypBasketData.diamondTable.length > 0) {
      // this.daypBasketData.diamondTable = this.daypSvc.fetchStonesComment(this.daypBasketData.diamondTable);

      if (this.noteAddSubscription) {
        this.noteAddSubscription.unsubscribe();
      }
      this.noteAddSubscription = this.notesService.getCommentListforStoneIds(this.daypBasketData.diamondTable).subscribe((res) => {
        this.daypBasketData.diamondTable = res;
        this.stonesActedOn = { 'source': 'noteAdded', data: this.daypBasketData.diamondTable };
      }, error => {
        this.stonesActedOn = { 'source': 'noteAdded' };
      });
    }
    if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
      this.daypBasketData.selectedStoneTable = this.daypSvc.fetchStonesComment(this.daypBasketData.selectedStoneTable);
    }
  }

  getPageRef() {
    const scrollable = this.daypBasketStoneContainer.instance.getScrollable('#daypBasketStoneContainer');
    this.appStore.store('daypBasketPageRef', scrollable.scrollTop());
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneSvc.scrollLeft(this.daypBasketStoneContainer, '#daypBasketStoneContainer');
    } else if (params === 'right') {
      this.stoneSvc.scrollRight(this.daypBasketStoneContainer, '#daypBasketStoneContainer');
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
    this.stoneSvc.handleSortingOrder(this.daypBasketStoneContainer);
    const columns = JSON.parse(JSON.stringify(this.daypBasketStoneContainer.columns));
    if (this.isColumnExpanded) {
      columns[1].width = 275;
    } else {
      columns[1].width = 130;
    }
    this.daypBasketStoneContainer.columns = columns;
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
    this.tabChangeSubscription.unsubscribe();
    if (this.addNoteSubscription) {
      this.addNoteSubscription.unsubscribe();
    }
  }

  onCellPrepared(e) {
    this.daypSvc.onCellPrepared(e, this.daypBasketData.selectedStoneButton);
  }

  updateRowColor() {
    this.daypSvc.updateRowColor(this.daypBasketStoneContainer, this.daypBasketData);
  }

  focusStoneId(id) {
    this.newFocusStoneId = '#' + id + 'PriceInputID';
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
    this.daypHeight = window.innerHeight - 385;
    this.adjustTableBoxSize();
  }

  adjustTableBoxSize() {
    if (jQuery('#daypPanel')) {
      // jQuery('#daypPanel').css('height', window.innerHeight);
    }
  }

  onContentLoad(event) {
    this.daypBasketData = this.daypSvc.getSortedTable(this.daypBasketStoneContainer, this.daypBasketData);
    this.appStore.store('daypBasketDetails', this.daypBasketData);
    const filters = this.daypBasketStoneContainer.instance.getCombinedFilter();
    if (filters) {
      const filterDataSource = this.daypBasketStoneContainer.instance.getDataSource();
      this.filterDataSource = JSON.parse(JSON.stringify(filterDataSource['_items']));
      this.isAllFilterStoneSelected();
    } else {
      this.filterDataSource = [];
      this.isFilterAllSelected = false;
    }
    this.updateRowColor();
  }

  selectFilterStones() {
    this.daypBasketData = this.daypSvc.selectFilterStones(this.filterDataSource, this.isFilterAllSelected, this.daypBasketData);
    this.updateDaypStoneDetails(this.daypBasketData);
    this.updateRowColor();
  }

  isAllFilterStoneSelected() {
    this.isFilterAllSelected = this.daypSvc.isAllFilterStoneSelected(this.filterDataSource, this.daypBasketData.selectedStoneButton);
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


  validateStoneStateDetailsRemoveEntry(res) {
    const allStones = this.stoneSvc.createStoneIdList(this.daypBasketData.diamondTable);
    const commonStones = _.intersection(allStones, res.stoneList);
    if (res.hasOwnProperty('stoneObj') && _.isArray(res.stoneObj)) {
      const stoneObj = [];
      res.stoneObj.map(entry => {
        if (commonStones.indexOf(entry.stone_id) > -1) {
          stoneObj.push(entry);
        }
      });
      res['stoneObj'] = stoneObj;
    }
    res['stoneList'] = commonStones;
    return res;
  }

  updateNotesForStones(res) {
    if (this.daypBasketData.diamondTable && this.daypBasketData.diamondTable.length > 0) {
      const toUpdateStoneArray = this.stoneSvc.findStoneObjUsingStoneIds(this.daypBasketData.diamondTable, res.stoneList);
      if (toUpdateStoneArray instanceof Array && toUpdateStoneArray.length > 0) {
        this.notesService.fetchStonesAsynchronously(toUpdateStoneArray)
          .then(result => {

            this.daypBasketData.diamondTable = this.stoneSvc.findAndUpdateStoneCommentFromList(this.daypBasketData.diamondTable, result);

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
    if (this.daypBasketData.diamondTable && this.daypBasketData.diamondTable.length > 0) {
      const commentsId = res.commentList;
      this.daypBasketData.diamondTable.forEach(stone => {
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
    if (this.daypBasketData.selectedStoneTable && this.daypBasketData.selectedStoneTable.length > 0) {
      this.daypBasketData.selectedStoneTable =
        this.stoneSvc.updateNotesForSelectedPanel(this.daypBasketData.selectedStoneTable, this.daypBasketData.diamondTable);
    }
    this.appStore.store('daypBasketDetails', this.daypBasketData);
  }

}
