import {
  Component, OnInit, OnChanges, Input, Output, EventEmitter,
  ViewChild, ViewChildren, QueryList, OnDestroy, HostListener
} from '@angular/core';
import { DaypService, UtilService } from '@srk/shared';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { MessageService } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';
import { SearchService } from '@srk/core';
import { AuthService } from '@srk/core';
import { ApiService } from '@srk/shared';
import { NotifyService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { ConfirmationService } from 'primeng/components/common/api';
import { CustomTranslateService } from '@srk/core';
import { ThmConfirmOverlayComponent } from '@srk/shared';
import { ValidatorService } from '@srk/shared';
import { UserProfileService } from '@srk/core';
import { AddNoteService } from '@srk/shared';
import { EventDetailsService } from '@srk/core';
import { ApplicationAuditService } from '@srk/core';
import * as _ from 'underscore';
import { Subscription } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-selected-dayp-stone-panel',
  templateUrl: './selected-dayp-stone-panel.component.html',
  styleUrls: ['./selected-dayp-stone-panel.component.scss']
})
export class SelectedDaypStonePanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() visiblePacketIcon = false;
  @ViewChild('selectedDaypStoneContainer') selectedDaypStoneContainer;
  @ViewChild('themeMultimediaPopUp') themeMultimediaPopUp;
  @ViewChild('thmDdcOverlay') thmDdcOverlay;
  @ViewChild(ThmConfirmOverlayComponent) thmConfirmOverlayComponent;
  @ViewChild('daypGrid') daypGrid: any;
  @ViewChildren('price') price: QueryList<any>;

  @Input() selectedStoneArray: any;
  @Input() daypStatus: boolean;
  @Input() preDaypStatus: boolean;
  @Input() daypTabStatus: boolean;
  @Input() enableEdit: boolean;
  @Input() selectedTab: any;
  @Input() isDaypBasket: boolean;

  @Output() toggleTableDisplay = new EventEmitter();
  @Output() updateStones = new EventEmitter();
  @Output() stoneMultimedia = new EventEmitter();
  @Output() editSubmittedStones = new EventEmitter();
  @Output() updateComments = new EventEmitter();
  @Output() gridRefresh = new EventEmitter();


  @Output() offerOnStoneUpdated: EventEmitter<any> = new EventEmitter<any>();

  public focusedElement: any;
  public displayStoneTable = false;
  public discountColumnVisible: any[] = [];
  public selectedStones: any[];
  public popupVisible = false;
  public viewRequestResponseMessage: any;
  public apiLink: any;
  public selectedPanelconfirmOverlayVisible = false;
  public selectedDdcOverlayVisible = false;
  public definedDDCHour: any;
  public ddcStones: any[] = [];
  public toggleMultimediaPopup = false;
  public stoneMultimediaInfo: any;
  public commentsOverlayVisible = false;
  public addnoteOverlayVisible = false;
  public allNotesForStone: any[] = [];
  public gridHeight: any;
  public PRRate: any;
  public offerDifferent: any;
  public offerPer: any;
  public submitStone: any[] = [];
  public isPreDaypActive: boolean;
  public selectedColumnList: any;
  public offerColumnList: any[];
  public isColumnExpanded = false;
  public colorLegendFilterValue: String[] = [];

  public selectedStonesObject = [];
  public toggleComparePopup = false;
  public offerSignOptions = [
    { notation: '+', value: 'plus' },
    { notation: '-', value: 'minus' }
  ];
  public timer;

  public isDaypRemovePermissible = false;
  public packetSubscription: any;
  public addNoteSubscription: any;
  public eventDetails: any;
  public isPreSelectEventPermissible = false;
  public iscalculate = false;
  public calculatePopup = false;
  public clickupdateoffer = '';
  public columnWidth = 130;
  public isIconVisible = false;
  public conversionRate: any;
  public newFocusStoneID: any;
  public currentStoneArray: any[];
  public newFocusStoneId: any;
  public isBasketRemoved = false;
  public isSubmitRemoved = false;
  public isOfferUpdated = false;
  public caratHeaderFilter = [];
  public amountHeaderFilter = [];
  public priceHeaderFilter = [];
  public diffHeaderFilter = [];
  public offperHeaderFilter = [];
  public daypamountHeaderFilter = [];
  public isBtnClicked = false;
  public diffValue: any;
  public calculateStatus: any = false;
  public calculatePermission: any = false;
  public daypColumnWidth: any;
  public filterOptions = [];
  public filterFlag: any;
  public selectedFilterOption: any;
  public allColumnWidth: any;
  public colWidth: any;
  public filterPopOverVisible = false;
  public filterId = 'filterInSelectedStonePanel';
  public stoneConfirmedSubscription: any;

  // Variables for grid.
  public packetIconDataForGrid: any[];  // Used to update Packet icons in the Data Grid.
  @Input() stonesActedOn: any;
  public iconOverlayXPosition: Number;
  public iconOverlayYPosition: Number;
  public displayIconOverlay: Boolean = false;
  public iconDisplayStoneObject: any;
  public initAutoPriceSubscripation: any;
  private noteAddSubscription: Subscription;

  constructor(
    private userProfileService: UserProfileService,
    private stoneSvc: StoneDetailsService,
    private daypSvc: DaypService,
    private messageService: MessageService,
    private searchSvc: SearchService,
    private authService: AuthService,
    private apiService: ApiService,
    private notify: NotifyService,
    private appStore: ApplicationStorageService,
    private confirmationService: ConfirmationService,
    private customTranslateSvc: CustomTranslateService,
    private validatorService: ValidatorService,
    private notesService: AddNoteService,
    private eventDetailsService: EventDetailsService,
    private auditService: ApplicationAuditService,
    private utilService: UtilService
  ) { }

  ngOnInit() {
    const priceSubscription = this.stoneSvc.getPriceInfoObservable().subscribe(res => {
      this.conversionRate = res.conversion_rate;
      if (priceSubscription) {
        priceSubscription.unsubscribe()
      }
    });

    this.allColumnWidth = this.userProfileService.getColumnWidth();
    this.gridHeight = window.innerHeight - 275;
    this.daypColumnWidth = this.userProfileService.getDAYPColumnWidth();
    this.colWidth = this.allColumnWidth;
    [this.isColumnExpanded, this.isIconVisible] = this.utilService.getExpandedColumnValue();
    this.filterFlag = this.appStore.getData('filterFlag');
    this.selectedColumnList = this.userProfileService.getSelectedColumnList();
    this.offerColumnList = this.userProfileService.getSelectedDaypValues();
    this.packetSubscription = this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
    this.getPreEventSelectionSatus();
    this.daypSvc.handlekeyupEvent('selectedDaypStoneContainer');
    this.addNoteSubscription = this.notify.addNewNotesForIggridObservable$.subscribe(res => {
      if (res.isDeleteFlow) {
        this.deleteCommentsFromStones(res);
      } else {
        this.updateNotesForStones(res);
      }
    });
  }

  ngOnChanges() {
    if (this.selectedStoneArray) {
      if (this.selectedTab === 4) {
        this.selectedStoneArray.selectedStoneTable.forEach(stone => {
          stone.final_submit = true;
          stone.isEditable = false;
        });
      }
      if (this.selectedStoneArray.hasOwnProperty('selectedStoneTable')) {
        this.selectedStoneArray['totalOfferAmount'] = 0;
        this.selectedStoneArray.selectedStoneTable.forEach(element => {
          if (element.hasOwnProperty('dayp_amount')) {
            this.selectedStoneArray['totalOfferAmount'] += Number(element.dayp_amount);
          }
        });
      }
      this.displayStoneTable = this.selectedStoneArray['toggleTableDisplay'];
    }
    this.checkPermissionForCalculate();
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      this.updateStoneStateDetails(res);
    });
  }

  getPreEventSelectionSatus() {
    this.eventDetailsService.checkPreEventSelectionPermission().subscribe(res => {
      let flag = false;
      if (!res.error_status) {
        if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_SEL_PFS_200)) {
          flag = true;
          if (res.hasOwnProperty('data')) {
            this.eventDetails = this.eventDetailsService.reorderEventDetails(res.data, 'button_order');
          }
        } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_NEF_200)) {
          flag = false;
        }
      }
      this.isPreSelectEventPermissible = flag;
    }, error => {
      this.isPreSelectEventPermissible = false;
    });
  }

  updateStoneStateDetails(res) {
    // const stoneList = res.stoneList;
    if (res.daypAction !== 'daypPriceInserted') {
      // this.stonesActedOn = res;
    }
    if (this.selectedStoneArray.selectedStoneButton.length === 0) {
      this.displayStoneTable = false;
      this.selectedStoneArray.toggleTableDisplay = this.displayStoneTable;
    }
  }

  checkPermissionForCalculate() {
    this.calculatePermission = this.authService.hasElementPermission('dayp_diff_perc_offer_btn');
    if (this.daypStatus && this.calculatePermission) {
      if (this.selectedTab === 4 && this.enableEdit) {
        this.calculateStatus = true;
      } else if (this.selectedTab === 1 || this.selectedTab === 2 || this.selectedTab === 3) {
        this.calculateStatus = true;
      } else {
        this.calculateStatus = false;
      }
    }
    return this.calculateStatus;
  }

  calculateDAYPOffer() {
    if (this.diffValue && Number(this.diffValue) >= 0 && Number(this.diffValue) < 100) {
      if (this.selectedTab === 4) {
        this.iscalculate = true;
      }
      this.selectedStoneArray.selectedStoneTable =
        this.daypSvc.calculateDAYPOfferAndOfferPer(this.selectedStoneArray.selectedStoneTable, this.diffValue, this.selectedTab);
      // Emit event to Grid for updating stones on UI.
      // Emit event to the current selected stones Grid for updating stones on UI.
      // this.stonesActedOn = { 'source': 'offerOnSelectedStonesUpdated' };
      this.addToDaypBasket(this.selectedStoneArray);
      if (this.selectedStoneArray.selectedStoneTable.length > 0) {
        if (this.selectedTab === 3) {
          // this.messageService.showSuccessGrowlMessage('DAYP_RATE_UPDATED');
        } else if (this.selectedTab === 4) {
          // this.offerOnStoneUpdated.emit({ 'source': 'offerOnSelectedStonesUpdated' });
          this.notify.notifyStoneStateUpdated({
            daypAction: 'offerOnSelectedStonesUpdated',
            stoneList: this.stoneSvc.createStoneIdList(this.selectedStoneArray.selectedStoneTable),
            stoneObj: this.selectedStoneArray.selectedStoneTable
          });

        }
      }
    } else {
      this.messageService.showInfoGrowlMessage('PLEASE_ENTER_DIFF_PER');
    }
  }

  stoneMediaIconPanel(event) {
    const data = this.stoneSvc.returnPositionOfOverlay(event);
    this.iconOverlayXPosition = data.left;
    this.iconOverlayYPosition = data.top;
    this.iconDisplayStoneObject = event.stoneId;
    this.displayIconOverlay = true;
  };

  viewSelectedStoneTable(array) {
    if (array.selectedStoneTable && array.selectedStoneTable.length > 0) {
      this.displayStoneTable = !this.displayStoneTable;
      this.selectedStoneArray.toggleTableDisplay = this.displayStoneTable;
      this.discountColumnVisible = this.stoneSvc.getColumnsVisibleFlag();
      this.daypSvc.setSortedColumnIndex(this.selectedDaypStoneContainer, this.selectedStoneArray);
      this.toggleTableDisplay.emit({ array: this.selectedStoneArray });
      const amountarr = [], pricesrk = [], daypamountarr = [], offperprimium = [], offper = [], caratarr = [];
      for (let index = 0; index < (this.selectedStoneArray.selectedStoneTable).length; index++) {
        amountarr.push(parseFloat(this.selectedStoneArray.selectedStoneTable[index].amount));
        pricesrk.push(parseFloat(this.selectedStoneArray.selectedStoneTable[index].price_srk));
        daypamountarr.push(parseFloat(this.selectedStoneArray.selectedStoneTable[index].dayp_amount));
        offper.push(parseFloat(this.selectedStoneArray.selectedStoneTable[index].rap_off));
        caratarr.push(parseFloat(this.selectedStoneArray.selectedStoneTable[index].carat));
      }
      const maxcarat = _.max(caratarr);
      const min = _.min(caratarr);
      const mincarat = (Number.isInteger(min / 0.5)) ? min : (((Math.ceil(min) - min) < 0.5) ? Math.ceil(min) - 0.5 : Math.floor(min));
      const maxamount = Math.ceil(_.max(amountarr));
      const minamount = Math.floor(_.min(amountarr));
      const maxprice = Math.ceil(_.max(pricesrk));
      const minprice = Math.floor(_.min(pricesrk));
      const maxdaypamount = Math.ceil(_.max(daypamountarr));
      const mindaypamount = Math.floor(_.min(daypamountarr));
      const maxdiff = Math.ceil(_.max(this.selectedStoneArray.selectedStoneTable, 'difference')['difference']);
      const mindiff = Math.floor(_.min(this.selectedStoneArray.selectedStoneTable, 'difference')['difference']);
      const minoffper = Math.floor(_.min(offper));
      const maxoffper = Math.ceil(_.max(offper));
      this.offperHeaderFilter = this.daypSvc.setFilters(minoffper, maxoffper, 'rap_off', 5);
      this.caratHeaderFilter = this.daypSvc.setFilters(mincarat, maxcarat, 'carat', 0.50);
      this.amountHeaderFilter = this.daypSvc.setFilters(minamount, maxamount, 'amount', 500);
      this.priceHeaderFilter = this.daypSvc.setFilters(minprice, maxprice, 'price_srk', 100);
      this.daypamountHeaderFilter = this.daypSvc.setFilters(mindaypamount, maxdaypamount, 'dayp_amount', 500);
      this.diffHeaderFilter = this.daypSvc.setdiffFilters(mindiff, maxdiff, 'difference', 1);
    }
  }

  isAllCheckboxSelected() {
    if (!this.selectedStoneArray.isAllSelected) {
      this.selectedStoneArray.selectedStoneButton = [];
      this.selectedStoneArray.selectedStoneArray = [];
      this.selectedStoneArray.filteredStone = [];
      this.selectedStoneArray.selectedStoneTable = [];
      this.selectedStoneArray.selectedStonesCarat = 0;
      this.selectedStoneArray.totalOfferAmount = 0;
      this.selectedStoneArray.isAllResultSelected = false;
    }
    this.selectedStones = this.selectedStoneArray.filteredStone;
    this.updateStones.emit({ array: this.selectedStoneArray });
  }

  filterSelectedStones(data, gridName) {

    if (Array.isArray(data)) {

      if (data.length === 0) {

        this.selectedStoneArray.isAllSelected = false;
        this.isAllCheckboxSelected();

      }

    } else {

      this.selectedStoneArray.filteredStone = this.selectedStoneArray.filteredStone.filter(elm => { return elm !== data.stoneId; });

      // Hacky Way Maybe but did not want to create a whole another component for just one line of code.
      $('#grid' + gridName).igGridUpdating('deleteRow', data.stoneId);

      this.selectedStoneArray.selectedStoneButton = this.selectedStoneArray.filteredStone;
      this.selectedStoneArray = this.searchSvc.fetchSelectedStones(this.selectedStoneArray, data.stoneId);
      this.updateStones.emit({ array: this.selectedStoneArray });

    }

    if (this.selectedStoneArray.selectedStoneTable && this.selectedStoneArray.selectedStoneTable.length === 0) {
      this.displayStoneTable = false;
      this.selectedStoneArray.toggleTableDisplay = false;
      this.discountColumnVisible = this.stoneSvc.getColumnsVisibleFlag();
      this.toggleTableDisplay.emit({ array: this.selectedStoneArray });
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
        if (this.selectedTab === 4) {
          this.notify.notifyStoneStateUpdated({ daypAction: 'daypPriceMidUpdated', stoneList: [data.stone_id], stoneObj: [response.data] });
        } else {
          this.selectedStoneArray.diamondTable = this.daypSvc.updateDAYPStonePriceValue(this.selectedStoneArray.diamondTable, [newPrice.data], false);
          // this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: newPrice.data };
          this.offerOnStoneUpdated.emit({ source: 'DAYPStoneOfferUpdated', data: newPrice.data });
          if (this.selectedStoneArray.selectedStoneTable && this.selectedStoneArray.selectedStoneTable.length > 0) {
            this.selectedStoneArray.selectedStoneTable = this.daypSvc.updateDAYPStonePriceValue(this.selectedStoneArray.selectedStoneTable,
              [newPrice.data], false);
          }
          this.initiateAutoSavePrice(newPrice.data, newPrice.data.dayp_rate, newPrice.data.dayp_per);
        }
      } else {
        this.selectedStoneArray.diamondTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.diamondTable, [data]);
        // this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
        this.offerOnStoneUpdated.emit({ source: 'DAYPStoneOfferUpdated', data: data });
        if (this.selectedStoneArray.selectedStoneTable && this.selectedStoneArray.selectedStoneTable.length > 0) {
          this.selectedStoneArray.selectedStoneTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.selectedStoneTable, [data]);
        }
      }
    } else if (offerPrice === '' && data.dayp_rate) {
      this.selectedStoneArray.diamondTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.diamondTable, [data]);
      // this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
      this.offerOnStoneUpdated.emit({ source: 'DAYPStoneOfferUpdated', data: data });
      if (this.selectedStoneArray.selectedStoneTable && this.selectedStoneArray.selectedStoneTable.length > 0) {
        this.selectedStoneArray.selectedStoneTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.selectedStoneTable, [data]);
      }
    }
  }

  addOfferPercentageForStone(data, offerPercentage, sign) {
    if (offerPercentage !== '' && data.dayp_per !== Number(offerPercentage)) {
      const response = this.daypSvc.addOfferPercentageForStone(data, offerPercentage, sign);
      if (response.status) {
        if (this.selectedTab === 4) {
          this.notify.notifyStoneStateUpdated({ daypAction: 'daypPriceMidUpdated', stoneList: [data.stone_id], stoneObj: [response.data] });
        } else {
          this.selectedStoneArray.diamondTable = this.daypSvc.updateDAYPStonePriceValue(this.selectedStoneArray.diamondTable, [response.data], false);
          // this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: response.data };
          // this.offerOnStoneUpdated.emit({source: 'DAYPStoneOfferUpdated', data: response.data});
          if (this.selectedStoneArray.selectedStoneTable && this.selectedStoneArray.selectedStoneTable.length > 0) {
            this.selectedStoneArray.selectedStoneTable = this.daypSvc.updateDAYPStonePriceValue(this.selectedStoneArray.selectedStoneTable,
              [response.data], false);
          }
          this.initiateAutoSavePrice(response.data, response.data.dayp_rate, response.offerPer);
        }
      } else {
        this.selectedStoneArray.diamondTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.diamondTable, [data]);
        // this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
        this.offerOnStoneUpdated.emit({ source: 'DAYPStoneOfferUpdated', data: data });
        if (this.selectedStoneArray.selectedStoneTable && this.selectedStoneArray.selectedStoneTable.length > 0) {
          this.selectedStoneArray.selectedStoneTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.selectedStoneTable, [data]);
        }
      }
    } else if (offerPercentage === '' && data.dayp_per) {
      this.selectedStoneArray.diamondTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.diamondTable, [data]);
      // this.stonesActedOn = { source: 'DAYPStoneOfferUpdated', data: data };
      this.offerOnStoneUpdated.emit({ source: 'DAYPStoneOfferUpdated', data: data });
      if (this.selectedStoneArray.selectedStoneTable && this.selectedStoneArray.selectedStoneTable.length > 0) {
        this.selectedStoneArray.selectedStoneTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.selectedStoneTable, [data]);
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
        // this.offerOnStoneUpdated.emit({source: 'DAYPStoneOfferUpdated', data: data.data});
      } else if (MessageCodesComparator.AreEqual(res.code, MessageCodes.SMS_DEE_200) && res.error_status) {
        this.selectedStoneArray.diamondTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.diamondTable, [data]);
        if (this.selectedStoneArray.selectedStoneTable && this.selectedStoneArray.selectedStoneTable.length > 0) {
          this.selectedStoneArray.selectedStoneTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.selectedStoneTable, [data]);
        }
        this.messageService.showErrorGrowlMessage('DAYP__OVER');
      } else {
        this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_DAYP_BASKET');
      }
    }, error => {
      this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_DAYP_BASKET');
      this.selectedStoneArray.diamondTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.diamondTable, [data]);
      if (this.selectedStoneArray.selectedStoneTable && this.selectedStoneArray.selectedStoneTable.length > 0) {
        this.selectedStoneArray.selectedStoneTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.selectedStoneTable, [data]);
      }
    });
    // this.autoSaveDaypBasket([data], stoneList);
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
    this.selectedStoneArray.diamondTable.forEach(stone => {
      if (stone.stone_id === stone_id) {
        stone.offerSign = sign;
        stone = this.daypSvc.resetDaypValue(stone, {});
      }
    });
  }

  addToDaypBasket(array) {
    setTimeout(() => {             // Delay is added because when user trigger blur event using mouse click from input,
      const selectedObject = {    // last inputted value needed to updated in row of datasource
        selectedStones: [],
        submittedstones: [],
        stoneList: []
      };
      array.selectedStoneTable.forEach(stone => {
        if (stone.dayp_rate && stone.dayp_rate > 0) {
          if (stone.hasOwnProperty('final_submit') && stone.final_submit) {
            selectedObject.submittedstones.push(stone.stone_id);
          } else {
            let offerPer = stone.dayp_per;

            if (Number(stone.dayp_rate) > Number(stone.price_rap)) {
              offerPer = '+' + offerPer.toString();
            }
            const config = {
              'stone_id': stone.stone_id,
              'offer_price': stone.dayp_rate.toString(),
              'offer_percentage': offerPer.toString(),
              'action': 'i'
            };
            selectedObject.selectedStones.push(config);
            selectedObject.stoneList.push(stone);
          }
        } else {
          stone.dayp_rate = stone.dayp_per = 0;
          let offerPer = stone.dayp_per;

          if (Number(stone.dayp_rate) > Number(stone.price_rap)) {
            offerPer = '+' + offerPer.toString();
          }
          const config = {
            'stone_id': stone.stone_id,
            'offer_price': stone.dayp_rate.toString(),
            'offer_percentage': offerPer.toString(),
            'action': 'i'
          };
          selectedObject.selectedStones.push(config);
          selectedObject.stoneList.push(stone);
        }
      });
      if (array.selectedStoneTable.length > 0) {
        if (selectedObject.submittedstones.length !== array.selectedStoneTable.length) {
          if (selectedObject.selectedStones.length > 0) {
            this.isBtnClicked = true;
            this.autoSaveDaypBasket(selectedObject.stoneList, selectedObject.selectedStones);
          }
        }
      } else {
        this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
      }
      if (selectedObject.submittedstones.length > 0) {
        if (this.selectedTab === 4) {
          this.clickupdateoffer = this.customTranslateSvc.translateString('PLEASE_CLICK_UPDATE_OFFER');
          this.calculatePopup = true;
          this.iscalculate = false;
        } else {
          this.clickupdateoffer = selectedObject.submittedstones.toString() + this.customTranslateSvc.translateString('STONE_ALREADY_EXIST_IN_MY_SUBMISSION');
          this.calculatePopup = true;
          this.iscalculate = false;
        }
        // this.messageService.showInfoGrowlMessage(selectedObject.submittedstones.toString() +
        // this.customTranslateSvc.translateString('STONE_ALREADY_EXIST_IN_MY_SUBMISSION'));
      }
    }, 100);
  }

  closeCalculatePopup() {
    this.calculatePopup = false;
  }

  autoSaveDaypBasket(array, stoneList) {
    if (this.initAutoPriceSubscripation) {
      this.initAutoPriceSubscripation.unsubscribe();
    }
    this.initAutoPriceSubscripation = this.daypSvc.autoSavePriceChange(stoneList).subscribe(response => {
      if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_ASDB_200)) {
        if (this.selectedTab === 4) {
          const valid_stones = this.stoneSvc.createStoneIdList(stoneList);
          this.updateSubmittedStones(array, stoneList, valid_stones);
        } else {
          this.notify.notifyStoneStateUpdated({ daypAction: 'daypPriceInserted', stoneList: stoneList, stoneObj: array, status: '' });
          // this.messageService.showSuccessGrowlMessage(MessageCodes.SMS_DAYP_ASDB_200);
        }
        this.updateStones.emit({ array: this.selectedStoneArray });
        if (this.selectedTab === 3 || this.selectedTab === 4) {
          this.messageService.showSuccessGrowlMessage('DAYP_RATE_UPDATED');
        } else {
          if (this.isBtnClicked) {
            this.isBtnClicked = false;
            this.messageService.showSuccessGrowlMessage(MessageCodes.SMS_DAYP_ASDB_200);
          }
        }
      } else {
        this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_DAYP_BASKET');
      }
    }, error => {
      this.handleErrorAddToDaypBasket(array, stoneList);
      this.messageService.showErrorGrowlMessage('ERR_ADD_STONE_DAYP_BASKET');
    });
  }

  updateSubmittedStones(array, stoneList, valid_stones) {
    let submittedStoneArray =
      this.daypSvc.addDaypFinalSubmitFlag('daypSubmission', this.createDeepCopyArray(array), valid_stones);
    submittedStoneArray = this.stoneSvc.removeDuplicatesFromObject(submittedStoneArray, 'stone_id');
    const stoneIDs = this.stoneSvc.createStoneIdList(stoneList);
    setTimeout(() => {
      this.offerOnStoneUpdated.emit({ 'source': 'offerOnSelectedStonesUpdated' });
    }, 1000);
    if (submittedStoneArray.length > 0) {
      this.notify.notifyStoneStateUpdated({ daypAction: 'daypSubmitted', stoneList: stoneIDs, stoneObj: submittedStoneArray });
    }
  }

  handleErrorAddToDaypBasket(array, stoneList) {
    stoneList.forEach(object => {
      array.forEach(stone => {
        if (stone.stone_id === object.stone_id) {
          stone.dayp_rate = stone.dayp_per = stone.difference = null;
        }
      });
    });
    this.notify.notifyStoneStateUpdated({ daypAction: 'daypPriceInserted', stoneList: stoneList, stoneObj: array });
  }

  /******************* remove from dayp my submitted *******************************/
  removeFromBasket(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones.length > 0) {
      this.isBasketRemoved = true;
      this.daypSvc.deleteDaypBaketStones(this.selectedStones).subscribe((response) => {
        this.isBasketRemoved = false;
        if (response && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_RMS_200) && !response.error_status) {
          this.notify.notifyStoneStateUpdated({
            daypAction: 'removeStoneFromBasket',
            stoneList: this.selectedStones, stoneObj: this.selectedStoneArray.selectedStoneTable
          });
          this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
          // this.gridRefresh.emit({ gridRebind: this.selectedStones });
        } else {
          this.messageService.showErrorGrowlMessage('ERR_REMOVE_DAYP_STONE');
        }
      }, error => {
        this.messageService.showErrorGrowlMessage('ERR_REMOVE_DAYP_STONE');
      });
    } else {
      this.isBasketRemoved = false;
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  removeFromMySubmitted(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones.length > 0) {
      this.isSubmitRemoved = true;
      this.daypSvc.deleteDaypSubmittedStones(this.selectedStones).subscribe((response) => {
        this.isSubmitRemoved = false;
        if (response && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_RMS_200) && !response.error_status) {
          this.notify.notifyStoneStateUpdated({
            daypAction: 'removeStoneFromSubmission',
            stoneList: this.selectedStones, stoneObj: this.selectedStoneArray.selectedStoneTable
          });
          // this.gridRefresh.emit({ gridRebind: this.selectedStones  });
          this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
        } else {
          this.messageService.showErrorGrowlMessage('ERR_REMOVE_DAYP_STONE');
        }
      }, error => {
        this.isSubmitRemoved = false;
        this.messageService.showErrorGrowlMessage('ERR_REMOVE_DAYP_STONE');
      });
    } else {
      this.isSubmitRemoved = false;
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  /******************* edit stone from dayp my submitted *******************************/
  editDaypSubmittedStone(array) {
    if (array.selectedStoneTable && array.selectedStoneTable.length > 0) {
      this.currentStoneArray = this.createDeepCopyArray(array);
      this.enableEdit = true;
      this.displayStoneTable = true;
      this.editSubmittedStones.emit({ isEditable: this.enableEdit });
      this.checkPermissionForCalculate();
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  /******************* submit dayp basket *******************************/
  daypStonesOfferSubmit(array) {
    this.iscalculate = false;
    if (array.selectedStoneTable && array.selectedStoneTable.length > 0) {
      setTimeout(() => {              // Delay is added because when user trigger blur event using mouse click from input,
        if (this.selectedTab === 4) { // last inputted value needed to updated in row of datasource
          this.finalSubmitToSubmittedStone(array);
        } else {
          this.offerSubmitStone(array);
        }
      }, 500);
      if (this.isDaypBasket) {
        // this.gridRefresh.emit({ gridRebind: array.selectedStoneButton, stoneArray: array.selectedStoneTable });
      }
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  finalSubmitToSubmittedStone(array) {
    // if (array.selectedStoneTable && array.selectedStoneTable.length > 0) {
    //   array.selectedStoneTable.forEach(element => {
    //     element.final_submit = true;
    //     if (element.hasOwnProperty('lastUpdatedKey')) {
    //       if (element.lastUpdatedKey === 'increment') {
    //         if (element.difference && (element.difference < (-7))) {
    //           element.daypOfferCount = element.daypOfferCount > 0 ? element.daypOfferCount = element.daypOfferCount - 1 : 0;
    //           element['lastUpdatedKey'] = 'decrement';
    //         }
    //       } else {
    //         if (element.difference && (element.difference <= 0) && (element.difference >= (-7))) {
    //           element.daypOfferCount = element.daypOfferCount + 1;
    //           element['lastUpdatedKey'] = 'increment';
    //         }
    //       }
    //     } else {
    //       if (element.difference && (element.difference <= 0) && (element.difference >= (-7))) {
    //         if (element.oldDifferencePercentage) {
    //           if ((element.oldDifferencePercentage <= 0) && (element.oldDifferencePercentage >= (-7))) { } else {
    //             element.daypOfferCount = element.daypOfferCount + 1;
    //           }
    //         }
    //         element['lastUpdatedKey'] = 'increment';
    //       } else if (element.difference && (element.difference < (-7))) {
    //         if (element.oldDifferencePercentage) {
    //           if (element.oldDifferencePercentage < (-7)) { } else {
    //             element.daypOfferCount = element.daypOfferCount > 0 ? element.daypOfferCount = element.daypOfferCount - 1 : 0;
    //           }
    //         }
    //         element['lastUpdatedKey'] = 'decrement';
    //       }
    //     }
    //   });
    // }
    let selectedObject = this.daypSvc.getValidStonesFromSelection(array);

    selectedObject = this.compareWithMainDataTable(array, this.currentStoneArray, selectedObject);

    console.log("1---", selectedObject)
    if (selectedObject.submittedStones.length > 0) {
      selectedObject.stoneList.forEach(element => {
        selectedObject.selectedStones.forEach(stone => {
          if (stone.stone_id === element.stone_id) {
            stone['price_srk'] = element.price_srk;
          }
        });
        if (element.difference > -1 && (element.difference <= 0) && (element.difference >= (-7)) && element.daypOfferCount === 0) {
          element.daypOfferCount = element.daypOfferCount + 1;
        }
        if (element.difference && (element.difference < (-7)) && element.daypOfferCount > 0) {
          element.daypOfferCount = element.daypOfferCount > 0 ? element.daypOfferCount = element.daypOfferCount - 1 : 0;
        }
      });
      this.updateStoneOfferSubmit(selectedObject.stoneList, selectedObject.submittedStones);
    } else {
      const notValidStoneCount = { notValidStoneCount: array.selectedStoneTable.length };
      this.messageService.showDynamicInfoGrowlMessage('STONE_NV_DAYP_SUBMISSION', notValidStoneCount);
    }
  }

  compareWithMainDataTable(updatedArray, originalDataArray, object) {
    const originalDataArrayTable = originalDataArray.diamondTable;
    const updatedArrayTable = updatedArray.diamondTable;
    const noToCheckIn = object.submittedStones;
    originalDataArrayTable.forEach(table => {
      const obj = _.findWhere(updatedArrayTable, { 'stone_id': table.stone_id });
      if (obj) {
        if (obj.difference !== table.difference) {
          const stoneObj = _.findWhere(noToCheckIn, { 'stone_id': obj.stone_id });
          if (!stoneObj) {
            object.submittedStones.push({
              'offer_percentage': obj.dayp_per.toString(),
              'offer_price': obj.dayp_rate.toString(),
              'stone_id': obj.stone_id
            });
            object.stoneList.push(obj);
          }
        }
      }
    });
    return object;
  }

  offerSubmitStone(array) {
    const selectedObject = this.daypSvc.getValidStonesFromSelection(array);
    if (selectedObject.selectedStones.length > 0) {
      selectedObject.stoneList.forEach(element => {
        selectedObject.selectedStones.forEach(stone => {
          if (stone.stone_id === element.stone_id) {
            stone['price_srk'] = element.price_srk;
          }
        });
        console.log("Offer", element.difference)
        if (element.difference > -1 && (element.difference <= 0) && (element.difference >= (-7))) {
          element.daypOfferCount = element.daypOfferCount + 1;
        }
        if (element.difference && (element.difference < (-7))) {
          element.daypOfferCount = element.daypOfferCount > 0 ? element.daypOfferCount = element.daypOfferCount - 1 : 0;
        }
      });
      console.log("Selected stones", selectedObject)
      this.finalStoneOfferSubmit(selectedObject.stoneList, selectedObject.selectedStones);
      this.handleExistingStoneAction(selectedObject);
    } else {
      this.handleExistingStoneAction(selectedObject);
    }
  }

  handleExistingStoneAction(selectedObject) {
    const submittedStoneIDs = this.stoneSvc.createStoneIdList(selectedObject.submittedStones);
    if (selectedObject.notValidStones && selectedObject.notValidStones.length > 0) {
      const notValidStoneCount = { notValidStoneCount: selectedObject.notValidStones.toString() };
      this.messageService.showDynamicInfoGrowlMessage('STONE_NV_DAYP_SUBMISSION', notValidStoneCount);
    }
    if (submittedStoneIDs.length > 0) {
      const submittedStoneCount = { submittedStoneCount: submittedStoneIDs.toString() };
      this.messageService.showDynamicInfoGrowlMessage('STONE_EXIST_DAYP_SUBMISSION', submittedStoneCount);
    }
  }

  finalStoneOfferSubmit(array, stoneList) {
    this.isOfferUpdated = true;
    const selectedStones = this.createDeepCopyArray(stoneList);
    console.log("4----", array, stoneList)
    this.daypSvc.finalDaypOfferSubmit(stoneList).subscribe(response => {
      this.isOfferUpdated = false;
      if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_FS_200)) {
        if (response.data.invalid_stones && response.data.invalid_stones.length > 0) {
          const notValidStoneCount = { notValidStoneCount: response.data.invalid_stones.length };
          // this.gridRefresh.emit({ gridRebind: selectedStones });
          this.messageService.showDynamicInfoGrowlMessage('STONE_NV_DAYP_SUBMISSION', notValidStoneCount);
        }
        if (response.data.valid_stones && response.data.valid_stones.length > 0) {
          this.updateSubmittedStones(array, stoneList, response.data.valid_stones);
          this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
        }
      } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DEE_200) && response.error_status) {
        this.selectedStoneArray.diamondTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.diamondTable, stoneList);
        if (this.selectedStoneArray.selectedStoneTable && this.selectedStoneArray.selectedStoneTable.length > 0) {
          this.selectedStoneArray.selectedStoneTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.selectedStoneTable, stoneList);
        }
        this.messageService.showErrorGrowlMessage('DAYP__OVER');
      } else {
        this.messageService.showErrorGrowlMessage('ERR_DAYP_SUBMIT_STONE');
      }
    }, error => {
      this.isOfferUpdated = false;
      this.messageService.showErrorGrowlMessage('ERR_DAYP_SUBMIT_STONE');
    });
  }

  updateStoneOfferSubmit(array, stoneList) {
    const stoneConfig = {
      'stones': {
        'submit_stones': stoneList,
        'save_stones': []
      },
      'is_update': true,
      'is_over_write': false,
      'data': {
        'audit': {
          'action_id': 14,
          'activity_id': 14
        }
      }
    };
    this.isOfferUpdated = true;
    this.daypSvc.saveDaypExcelStones(stoneConfig).subscribe(response => {
      this.isOfferUpdated = false;
      if (response && response.data && response.data.submit_response) {
        const submitResponse = response.data.submit_response;
        if (submitResponse && MessageCodesComparator.AreEqual(submitResponse.code, MessageCodes.SMS_DAYP_FS_200)) {
          const valid_stones = this.stoneSvc.createStoneIdList(stoneList);
          this.updateSubmittedStones(array, stoneList, valid_stones);
          this.messageService.showSuccessGrowlMessage('DAYP_RATE_UPDATED');
          this.enableEdit = false;
          this.editSubmittedStones.emit({ isEditable: this.enableEdit });
        } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DEE_200) && response.error_status) {
          this.selectedStoneArray.diamondTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.diamondTable, stoneList);
          if (this.selectedStoneArray.selectedStoneTable && this.selectedStoneArray.selectedStoneTable.length > 0) {
            this.selectedStoneArray.selectedStoneTable = this.daypSvc.resetDaypOffers(this.selectedStoneArray.selectedStoneTable, stoneList);
          }
          this.messageService.showErrorGrowlMessage('DAYP__OVER');
        } else {
          this.messageService.showErrorGrowlMessage('ERR_UPDATE_PRICE_DAYP');
        }
      } else {
        this.messageService.showErrorGrowlMessage('ERR_UPDATE_PRICE_DAYP');
      }
    }, error => {
      this.isOfferUpdated = false;
      this.messageService.showErrorGrowlMessage('ERR_UPDATE_PRICE_DAYP');
    });
  }

  /******************* View Request *******************************/
  toggleViewRequestOverlay(array) {
    this.apiLink = this.authService.getApiLinkForKey('view_request_btn', '');
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones.length > 0) {
      this.popupVisible = !this.popupVisible;
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleOverlay(e) {
    this.popupVisible = e.visible;
  }

  /******************* DDC *******************************/
  applyDDC(array) {
    let countOfInvalideStone = 0;
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    this.ddcStones = [];
    this.definedDDCHour = 0;
    this.selectedStones.forEach((value) => {
      array.selectedStoneTable.forEach(stone => {
        if (stone.stone_id === value && stone.business_process) {
          this.ddcStones.push(stone.stone_id);
        }
        if (stone.business_process !== true) {
          countOfInvalideStone++;
        }
      });
    });
    if (this.ddcStones.length > 0 && countOfInvalideStone !== this.ddcStones.length) {
      this.selectedDdcOverlayVisible = true;
    } else {
      if (countOfInvalideStone > 0) {
        this.messageService.showErrorGrowlMessage('SELECTED_STONE_NV_DDC');
      } else {
        this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
      }
    }
  }

  toggleSelectedDdcOverlay(e) {
    this.selectedDdcOverlayVisible = e.visible;
  }

  updateDDC(stoneData) {
    this.ddcStones = [];
    this.thmDdcOverlay.selectedDdcHour = 0;
    this.definedDDCHour = 0;
    this.ddcStones.push(stoneData.stone_id);
    if (stoneData.ddcHour > 0) {
      this.definedDDCHour = stoneData.ddcHour;
    }
    this.selectedDdcOverlayVisible = true;
  }

  /*********** Basket ***************/
  addToMyBasket(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    this.apiLink = this.authService.getApiLinkForKey('add_basket_btn', '');
    const servicedata = '{"stone_ids":' + JSON.stringify(this.selectedStones) + '}';
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.apiService.postCall('SelectedDaypStonePanelComponent:addToMyBasket', this.apiLink, servicedata).subscribe((response) => {
        this.notify.hideBlockUI();
        if (response !== undefined) {
          if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_NSF_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SS_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'basketRequested', stoneList: this.selectedStones });
            this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
          } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_MB_SNE_200)) {
            this.messageService.showErrorGrowlMessage(MessageCodes[response.code]);
          }
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('ERR_SAVE_STONE_BASKET');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  /*********** Mmultimedia ***************/
  toggleMultimediaOverlay(stoneInfo) {
    this.themeMultimediaPopUp.initializePopUp();
    this.toggleMultimediaPopup = true;
    this.stoneMultimediaInfo = stoneInfo;
  }

  toggleCloseMultimediaPopUp(e) {
    this.toggleMultimediaPopup = e.status;
  }

  /*********** add notes ***************/
  addNoteForStone(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones) {
      if (this.selectedStones.length > 0) {
        this.addnoteOverlayVisible = true;
      } else {
        this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
      }
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleAddNoteOverlay(e) {
    if (e.forAddNote) {
      this.addnoteOverlayVisible = e.visible;
    } else {
      this.commentsOverlayVisible = e.visible;
    }
    // if (e.noteDetil) {
    //   this.updateStoneComments({ status: true });
    // }
  }

  updateStoneComments(event) {
    if (event.status) {
      // this.getNotesForAllStones();
    }
  }
  /*********** confirmation ***************/

  confirmSelectedDiamonds(array) {
    this.selectedStones = [];
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones.length > 0) {
      this.thmConfirmOverlayComponent.checkOrderDetails();
      this.thmConfirmOverlayComponent.verifyDiamondConfirmation(this.selectedStones);
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  toggleSelectedPanelConfirmOverlay(e) {
    this.selectedPanelconfirmOverlayVisible = e.visible;
  }

  createDeepCopyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  addStoneInfoTab(data) {

    data = this.selectedStoneArray.diamondTable.find(elm => { return elm._id === data });

    this.notify.notifyDaypPageForStoneClickedForDetail({ type: 'stoneDtl', 'data': data });
  }

  addTwinStoneInfoTab(pairId) {
    this.notify.notifyDaypPageForStoneClickedForDetail({ type: 'twinStoneDtl', 'data': pairId });
  }

  compareStone(array) {
    this.selectedStonesObject = [];
    this.toggleComparePopup = true;
    this.selectedStonesObject = JSON.parse(JSON.stringify(array.selectedStoneTable));
  }

  closeCompareStoneOverlay() {
    this.selectedStonesObject = [];
    this.toggleComparePopup = false;
  }

  refreshNotes() {
    this.notify.notifyAddNewComment();
  }

  showAllCommentsForStone(notes) {
    this.commentsOverlayVisible = true;
    this.allNotesForStone = notes;
  }

  refreshDaypTable() {
    if (this.selectedDaypStoneContainer) {
      this.selectedDaypStoneContainer.instance.refresh();
    }
  }

  removeFromPreDaypSelection(array) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones.length > 0) {
      this.daypSvc.removeFromPreDAYPSelection(this.selectedStones).subscribe((response) => {
        if (response && MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DAYP_RMS_200) && !response.error_status) {
          this.notify.notifyStoneStateUpdated({ daypAction: 'removeFromPreDayp', stoneList: this.selectedStones, stoneObj: this.selectedStoneArray });
          this.messageService.showSuccessGrowlMessage(MessageCodes.SMS_PRE_DAYP_RMS_200);
        } else if (response && response.error_status) {
          this.messageService.showErrorGrowlMessage('ERR_STONE_REMOVE_PRE_DAYP');
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('ERR_STONE_REMOVE_PRE_DAYP');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  updatePacketDetails(event) {
    if (event && event.array && event.array.length > 0) {
      this.packetIconDataForGrid = event.array.map(elm => { return elm.stones.toString(); }).toString();
    }
    if (this.selectedStoneArray && this.selectedStoneArray.selectedStoneArray) {
      this.selectedStoneArray.selectedStoneArray = this.stoneSvc.setStonePacketCount(this.selectedStoneArray.selectedStoneArray);
      this.selectedStoneArray.selectedStoneArray = this.stoneSvc.updateStonePacketCount(event, this.selectedStoneArray.selectedStoneArray);
    }
  }

  getNotesForAllStones() {
    if (this.selectedStoneArray && this.selectedStoneArray.selectedStoneTable) {
      if (this.selectedStoneArray && this.selectedStoneArray.selectedStoneTable && this.selectedStoneArray.selectedStoneTable.length > 0) {
        this.selectedStoneArray.selectedStoneTable = this.daypSvc.fetchStonesComment(this.selectedStoneArray.selectedStoneTable);
      }
    }
  }

  addStonesToEvent(array, event) {
    this.selectedStones = this.createDeepCopyArray(array.filteredStone);
    if (this.selectedStones && this.selectedStones.length > 0) {
      this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
      this.eventDetailsService.addStoneToEvent(this.selectedStones, event.event_id).subscribe(res => {
        this.notify.hideBlockUI();
        if (!res.error_status) {
          if (MessageCodesComparator.AreEqual(res.code, MessageCodes.EVENT_INS_200)) {
            this.notify.notifyStoneStateUpdated({ source: 'eventAdded', stoneList: this.selectedStones });
            this.messageService.showSuccessGrowlMessage(res.message);
          } else {
            this.messageService.showErrorGrowlMessage('STONE_NOT_ADDED_EVENT');
          }
        }
      }, error => {
        this.notify.hideBlockUI();
        this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  addToPacket(array) {
    if (array.selectedStoneTable && array.selectedStoneTable.length > 0) {
      this.notify.notifyDaypForPacketUpdate({ visible: false, object: array.selectedStoneTable });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  stoneToOperateInPacket(data) {
    this.notify.notifyDaypForPacketUpdate({ visible: true, object: [data] });
  }

  ngOnDestroy() {
    if (this.packetSubscription) {
      this.packetSubscription.unsubscribe();
    }
    if (this.noteAddSubscription) {
      this.noteAddSubscription.unsubscribe();
    }
    if (this.initAutoPriceSubscripation) {
      this.initAutoPriceSubscripation.unsubscribe();
    }
    if (this.addNoteSubscription) {
      this.addNoteSubscription.unsubscribe();
    }
  }

  scrollTable(params) {
    if (params === 'left') {
      this.stoneSvc.scrollLeft(this.selectedDaypStoneContainer, '#selectedDaypStoneContainer');
    } else if (params === 'right') {
      this.stoneSvc.scrollRight(this.selectedDaypStoneContainer, '#selectedDaypStoneContainer');
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
    this.stoneSvc.handleSortingOrder(this.selectedDaypStoneContainer);
    if (this.isColumnExpanded) {
      const columns = JSON.parse(JSON.stringify(this.selectedDaypStoneContainer.columns));
      columns[1].width = 275;
      this.selectedDaypStoneContainer.columns = columns;
    } else {
      const columns = JSON.parse(JSON.stringify(this.selectedDaypStoneContainer.columns));
      columns[1].width = 130;
      this.selectedDaypStoneContainer.columns = columns;
    }
  }

  cancelEdit() {
    this.enableEdit = false;
    this.currentStoneArray['toggleTableDisplay'] = this.displayStoneTable;
    this.selectedStoneArray = this.createDeepCopyArray(this.currentStoneArray);
    this.notify.notifyStoneStateUpdated({
      daypAction: 'offerOnSelectedStonesUpdated',
      stoneList: this.selectedStoneArray.filteredStone, stoneObj: this.selectedStoneArray.selectedStoneTable, isCancelled: true
    });
    this.editSubmittedStones.emit({ isEditable: this.enableEdit });
  }

  onCellPrepared(e, array) {
    this.stoneSvc.onCellPrepared(e, array.filteredStone);
  }

  focusStoneId(id) {
    this.newFocusStoneId = '#' + id + 'PriceInputID';
  }

  onContentLoad(event) {
    this.selectedStoneArray = this.daypSvc.getSortedTable(this.selectedDaypStoneContainer, this.selectedStoneArray);
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

  @HostListener('window:resize')
  onWindowResize() {
    if (this.selectedStoneArray.selectedStoneTable.length > 0) {
      this.gridHeight = window.innerHeight - 275;
    }
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

  closeGridIconOverlay(data) {

    this.displayIconOverlay = false;

  }

  storeLastFocusedElement(event) {
    this.focusedElement = event;
  }

  updateNotesForStones(res) {
    if (this.selectedStoneArray.selectedStoneTable && this.selectedStoneArray.selectedStoneTable.length > 0) {
      const toUpdateStoneArray = this.stoneSvc.findStoneObjUsingStoneIds(this.selectedStoneArray.selectedStoneTable, res.stoneList);
      if (toUpdateStoneArray instanceof Array && toUpdateStoneArray.length > 0) {
        this.notesService.fetchStonesAsynchronously(toUpdateStoneArray)
          .then(result => {

            this.selectedStoneArray.selectedStoneTable = this.stoneSvc.findAndUpdateStoneCommentFromList(this.selectedStoneArray.selectedStoneTable, result);
            
          }).catch(error => {

            console.error('Failed with error ');
            console.error(error);

          });
      }
    }
  }

  deleteCommentsFromStones(res) {
    const stoneList = [];
    if (this.selectedStoneArray.selectedStoneTable
      && this.selectedStoneArray.selectedStoneTable.length > 0) {
      const commentsId = res.commentList;
      this.selectedStoneArray.selectedStoneTable.forEach(stone => {
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
    }
  }

}


