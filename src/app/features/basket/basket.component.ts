import { Component, OnInit, ViewChildren, QueryList, ViewChild, OnDestroy, AfterViewChecked, HostListener } from '@angular/core';
import { BasketService } from './basket.service';
import { UserDeviceService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { ApiService } from '@srk/shared';
import { StoneDetailsService } from '@srk/shared';
import { AddNoteService } from '@srk/shared';
import { MessageService } from '@srk/core';
import { LoggerService } from '@srk/core';
import { AuthService } from '@srk/core';
import { ThmConfirmOverlayComponent } from '@srk/shared';
import { ApplicationStorageService } from '@srk/core';
import { UtilService } from '@srk/shared';
import { BasketTableComponent } from './basket-table/basket-table.component';
import * as _ from 'underscore';
import { CustomTranslateService } from '@srk/core';
import { ConfirmationService } from 'primeng/components/common/api';
import { DaypService } from '@srk/shared';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChildren(BasketTableComponent) dataTables: QueryList<BasketTableComponent>;
  public visibleShowPacketBtn = false;
  public stoneForPacket: any;
  public showSelectedPacket: any;
  public showTotalTable = true;
  public showNotAvailableTable = false;
  public showDaypTable = false;
  public showPriceRevisedTable = false;
  public stoneConfirmedSubscription: any;
  public tabName = [];
  public currentTabSelected: any;
  public stoneClickedForDetailViewSubscription: any;
  public isStoneDetailsTabAdded = false;
  public selectionObj: any;
  public httpSubscription: any;
  public stoneButtonList: any;
  public allBasketSelectionObject: any;
  public daypSelectionObject: any;
  public priceRevisedSelectionObject: any;
  public visiblePacketIcon = false;

  public totalBasketObj: any;
  public daypBasketObj: any;
  public notAvailableBasketObj: any;
  public priceRevisedObj: any;

  public visiblePacketPopup = false;
  public packetCount: any;
  public showPacktBtn = false;
  public addStoneToPacketSubscription: any;
  public packetSubscription: any;

  public isFailureOccured = false;
  public message: any;
  public isDaypActive = false;
  public menuDistanceFromTop: any;
  public currentScroll: any;
  public height = window.innerHeight * (80 / 100);
  public selectedTableToggle = false;
  public lastCreatedTab: any;
  public activeTab: any;
  public getBasketListObservable: Subscription;
  constructor(
    private basketService: BasketService,
    private messageService: MessageService,
    private userDeviceService: UserDeviceService,
    private apiService: ApiService,
    private notesService: AddNoteService,
    private stoneSvc: StoneDetailsService,
    private logger: LoggerService,
    private authService: AuthService,
    private notify: NotifyService,
    private appStore: ApplicationStorageService,
    private utilService: UtilService,
    private customTranslateSvc: CustomTranslateService,
    private confirmationService: ConfirmationService,
    private daypSvc: DaypService
  ) { }

  ngOnInit() {
    this.stoneConfirmedSubscription = this.notify.notifyStoneStateUpdatedObservable$.subscribe((res) => {
      if (res.source) {
        this.updateStoneStateDetails(res);
      }
    });
    this.tabName.push({
      basketTab: 'My Basket',
    });
    this.currentTabSelected = 'My Basket';
    this.fetchBasketList();
    this.stoneClickedForDetailViewSubscription = this.notify.notifyViewRequestPageStoneDetailTabActionObservable$.subscribe((res) => {
      if (this.fetchTotalStoneDetailsTab() < 4) {
        if (res.data && res.type === 'stoneDtl') {
          this.addStoneDetailTab(res.data);
        } else if (res.data && res.type === 'twinStoneDtl') {
          this.addTwinStoneInfoTab(res.data, this.tabName);
        }
      } else {
        this.messageService.showInfoGrowlMessage('DELETE_A_TAB');
      }
    });
    this.selectionObj = {
      selectedStones: [],
      selectedStoneArray: [],
      panelData: {}
    };
    this.totalBasketObj = {
      name: 'total',
      selectedStones: [],
      selectedStoneArray: [],
      isAllBasketStonesSelected: false
    };
    this.daypBasketObj = {
      name: 'dayp',
      selectedStones: [],
      selectedStoneArray: [],
      isAllBasketStonesSelected: false
    };
    this.notAvailableBasketObj = {
      name: 'notavailable',
      selectedStones: [],
      selectedStoneArray: [],
      isAllBasketStonesSelected: false
    };
    this.priceRevisedObj = {
      name: 'pricerevised',
      selectedStones: [],
      selectedStoneArray: [],
      isAllBasketStonesSelected: false
    };
    this.stoneButtonList = {
      addNote: true,
      addToEvent: true,
      requestHold: true,
      applyDDC: true,
      confirmButton: true,
      addToDayp: true,
      removeBasket: true,
      viewRequest: true
    };
    this.addStoneToPacketSubscription = this.notify.notifyViewRequestForPacketUpdateActionObservable$.subscribe((res) => {
      if (res) {
        this.stoneFromSelectedStone(res);
      }
    });
    this.packetSubscription = this.notify.notifyShowPacketBtnOccuredObservable$.subscribe(res => {
      this.showPacktBtn = res.visible;
    });
    this.daypSvc.checkActiveDaypStatus().subscribe(res => {
      if (!res.error_status && res.data && res.data.remainingTime && res.data.remainingTime.data) {
        const responseData = res.data.remainingTime.data;
        this.isDaypActive = responseData.isDAYPEventOn;
      }
    });
    this.activeTab = 'total';
  }

  ngAfterViewChecked() {
    this.utilService.setSearchResultTabs(8);
    this.utilService.setSearchTabWidth();
  }

  scrollTabPanelRight() {
    this.utilService.scrollTabPanelRight();
  }

  scrollTabPanelLeft() {
    this.utilService.scrollTabPanelLeft();
  }

  fetchBasketList() {
    this.getBasketListObservable = this.basketService.getMyBasketList().subscribe(res => {
      if (!res.error_status) {
        this.splitBasketStones(res.data);
      }
    }, error => {
      this.isFailureOccured = true;
      this.message = 'Error while getting data, please try later';
    });
  }

  splitBasketStones(array) {
    if (array.length > 0) {
      const allBasketStones = array;
      const basketDaypStones = [];
      const basketNotAvailableStones = [];
      const basketPriceRevisedStones = [];
      array.forEach(stone => {
        if (stone.stone_state === 6) {
          basketNotAvailableStones.push(stone);
        }
        if (stone.dayp_state === 1) {
          basketDaypStones.push(stone);
        }
        if (stone.diff_per <= -1 && stone.stone_state !== 6) {
          basketPriceRevisedStones.push(stone);
        }
      });
      this.totalBasketObj['diamondTable'] = JSON.parse(JSON.stringify(allBasketStones));
      this.priceRevisedObj['diamondTable'] = JSON.parse(JSON.stringify(basketPriceRevisedStones));
      this.notAvailableBasketObj['diamondTable'] = JSON.parse(JSON.stringify(basketNotAvailableStones));
      this.daypBasketObj['diamondTable'] = JSON.parse(JSON.stringify(basketDaypStones));
      this.updateDecimalValues();
    } else {
      this.isFailureOccured = true;
      this.message = 'EMPTY_BASKET';
    }
  }

  updateDecimalValues() {
    this.totalBasketObj['diamondTable'] = this.utilService.updateStonesForDecimal(this.totalBasketObj['diamondTable']);
    this.priceRevisedObj['diamondTable'] = this.utilService.updateStonesForDecimal(this.priceRevisedObj['diamondTable']);
    this.notAvailableBasketObj['diamondTable'] = this.utilService.updateStonesForDecimal(this.notAvailableBasketObj['diamondTable']);
    this.daypBasketObj['diamondTable'] = this.utilService.updateStonesForDecimal(this.daypBasketObj['diamondTable']);
    this.updateStoneExtraInfo();
  }

  showTable(total, na, pricerev, dayp) {
    this.showTotalTable = total;
    this.showNotAvailableTable = na;
    this.showPriceRevisedTable = pricerev;
    this.showDaypTable = dayp;
    const tables = this.dataTables['_results'];
    this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
    tables.forEach(element => {
      this.updateRowColorChanges();
      setTimeout(() => {
        this.notify.hideBlockUI();
      }, 2500);
      element.basketGridComponent.instance.refresh();
    });
    if (this.showTotalTable === true) {
      this.activeTab = 'total';
    } else if (this.showNotAvailableTable === true) {
      this.activeTab = 'notavailable';
    } else if (this.showPriceRevisedTable === true) {
      this.activeTab = 'pricerevised';
    } else if (this.showDaypTable === true) {
      this.activeTab = 'dayp';
    }
  }

  updateStoneExtraInfo() {
    this.basketService.updateExtraStoneInfo(this.totalBasketObj['diamondTable']);
    this.basketService.updateExtraStoneInfo(this.priceRevisedObj['diamondTable']);
    this.basketService.updateExtraStoneInfo(this.notAvailableBasketObj['diamondTable']);
    this.basketService.updateExtraStoneInfo(this.daypBasketObj['diamondTable']);
  }

  addTwinStoneInfoTab(pairId, tabs) {
    this.stoneSvc.getStoneDetailsByPairId(pairId).subscribe(resPairStones => {
      if (resPairStones && resPairStones.length === 2) {
        this.stoneSvc.addTwinStoneInfoTab(resPairStones, tabs);
        this.lastCreatedTab = pairId;
        this.isStoneDetailsTabAdded = true;
      }
    });
  }

  addStoneDetailTab(data) {
    this.tabName.forEach((element) => {
      if (element.stoneName === data.stone_id) {
        this.removeDetailedPacketTab(element.stoneName);
      }
    });
    this.tabName.push({
      stoneName: data.stone_id,
      stoneInfo: data
    });
    this.lastCreatedTab = data.stone_id;
    this.isStoneDetailsTabAdded = true;
  }

  removeDetailedPacketTab(tabName) {
    this.tabName.forEach((element, index) => {
      let flag = 0;
      if (element.stoneName === tabName) {
        const i = this.tabName.indexOf(element);
        this.tabName.splice(i, 1);
        flag++;
      } else if (element.pairId === tabName) {
        const i = this.tabName.indexOf(element);
        this.tabName.splice(i, 1);
        flag++;
      }
      if (flag > 0) {
        if (this.tabName[index - 1] && this.tabName[index - 1].hasOwnProperty('basketTab')) {
         // this.currentTabSelected = this.tabName[index - 1].basketTab;
         this.currentTabSelected = 'My Basket';
        } else if (this.tabName[index - 1] && this.tabName[index - 1].hasOwnProperty('stoneName')) {
         // this.currentTabSelected = this.tabName[index - 1].stoneName;
         this.currentTabSelected = 'My Basket';
        } else if (this.tabName[index - 1] && this.tabName[index - 1].hasOwnProperty('pairId')) {
        //  this.currentTabSelected = this.tabName[index - 1].pairId;
        this.currentTabSelected = 'My Basket';
        } else {
          //this.currentTabSelected = this.tabName[0].basketTab;
          this.currentTabSelected = 'My Basket';
        }
      }
    });

  }

  getSelectedTabName(param) {
    if (param.hasOwnProperty('basketTab')) {
      this.currentTabSelected = param.basketTab;
    } else if (param.hasOwnProperty('stoneName')) {
      this.currentTabSelected = param.stoneName;
      this.isStoneDetailsTabAdded = true;
    } else if (param.hasOwnProperty('pairId')) {
      this.currentTabSelected = param.pairId;
      this.isStoneDetailsTabAdded = true;
    } else {
      this.isStoneDetailsTabAdded = false;
    }
  }

  addAllBasketStoneObject(event) {
    this.totalBasketObj.selectedStones = event.obj.selectedStones;
    this.totalBasketObj.selectedStoneArray = event.obj.selectedStoneArray;
    this.addPriceInfo();
  }

  addDaypStoneObject(event) {
    this.daypBasketObj.selectedStones = event.obj.selectedStones;
    this.daypBasketObj.selectedStoneArray = event.obj.selectedStoneArray;
    this.addPriceInfo();
  }

  addPriceStoneObject(event) {
    this.priceRevisedObj.selectedStones = event.obj.selectedStones;
    this.priceRevisedObj.selectedStoneArray = event.obj.selectedStoneArray;
    this.addPriceInfo();
  }

  mergeAllSelectedObj() {
    this.selectionObj.selectedStones = _.union(this.totalBasketObj.selectedStones,
      this.daypBasketObj.selectedStones, this.priceRevisedObj.selectedStones);
    this.selectionObj.selectedStoneArray = JSON.parse(JSON.stringify(_.union(this.totalBasketObj.selectedStoneArray,
      this.daypBasketObj.selectedStoneArray, this.priceRevisedObj.selectedStoneArray)));
    this.selectionObj.selectedStones = _.uniq(this.selectionObj.selectedStones);
    this.selectionObj.selectedStoneArray = this.stoneSvc.removeDuplicatesFromObject(this.selectionObj.selectedStoneArray, 'stone_id');
  }

  addPriceInfo() {
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    this.mergeAllSelectedObj();
    this.adjustTableSize();
    if (this.selectionObj.selectedStoneArray.length > 0) {
      this.selectionObj.panelData = {};
      this.httpSubscription = this.stoneSvc.getDiamondPriceInfo(this.selectionObj.selectedStoneArray).subscribe(res => {
        this.selectionObj['selectedStoneArray'] = res;
        this.selectionObj['panelData'] = this.stoneSvc.calculateSelectedStoneData(this.selectionObj.selectedStoneArray);
        this.selectionObj['isAllSelectedStoneSelected'] = true;
      });
    } else {
      this.selectionObj.panelData = {};
    }
    this.selectionObj = {...this.selectionObj};
  }

  updateStoneStateDetails(res) {
    this.totalBasketObj = this.basketService.updateStoneDetails(this.totalBasketObj, res);
    this.priceRevisedObj = this.basketService.updateStoneDetails(this.priceRevisedObj, res);
    this.notAvailableBasketObj = this.basketService.updateStoneDetails(this.notAvailableBasketObj, res);
    this.daypBasketObj = this.basketService.updateStoneDetails(this.daypBasketObj, res);
    this.updateStonesinBasket();
  }

  updateBasketArray(e) {
    const arrayObj = e.array;
    this.selectionObj.selectedStones = arrayObj.selectedStones;
    if (this.selectionObj.selectedStones.length === 0) {
      this.selectedTableToggle = false;
    }
    this.selectionObj.selectedStoneArray = arrayObj.selectedStoneArray;
    this.updateStonesinBasket();
  }

  updateStonesinBasket() {
    this.totalBasketObj.selectedStones = _.intersection(this.totalBasketObj.selectedStones, this.selectionObj.selectedStones);
    this.priceRevisedObj.selectedStones = _.intersection(this.priceRevisedObj.selectedStones, this.selectionObj.selectedStones);
    this.daypBasketObj.selectedStones = _.intersection(this.daypBasketObj.selectedStones, this.selectionObj.selectedStones);
    this.fetchStoneDetails();
  }

  fetchStoneDetails() {
    this.totalBasketObj = this.basketService.fetchStoneDetails(this.totalBasketObj);
    this.priceRevisedObj = this.basketService.fetchStoneDetails(this.priceRevisedObj);
    this.daypBasketObj = this.basketService.fetchStoneDetails(this.daypBasketObj);
    this.checkIsAllSelected();
    this.addPriceInfo();
    this.updateRowColorChanges();
  }

  removeStonesFromList(stones) {
    if (stones.length > 0) {
      const removeStoneMessage = this.customTranslateSvc.translateString('Are you sure, you want to remove this stone ?');
      const removeStoneHeader = this.customTranslateSvc.translateString('Remove stone');
      this.confirmationService.confirm({
        message: removeStoneMessage,
        header: removeStoneHeader,
        accept: () => {
          const stoneArray = '{"stone_ids":' + JSON.stringify(stones) + '}';
          const apiLink = this.authService.getApiLinkForKey('remove_basket_btn', '');
          this.notify.showBlockUI({ 'message': 'PLEASE_WAIT' });
          this.apiService.postCall('BasketDetailsComponent: removeBasket', apiLink, stoneArray).subscribe((response) => {
            this.notify.hideBlockUI();
            if (!response.error_status) {
              this.messageService.showSuccessGrowlMessage(MessageCodes[response.code]);
              this.notify.notifyStoneStateUpdated({ source: 'stoneRemovedBasket', stoneList: stones });
              const difference = _.difference(this.selectionObj.selectedStones, stones);
              this.selectionObj.selectedStones = difference;
              this.updateStonesinBasket();
            } else {
              this.messageService.showErrorGrowlMessage('Error While Removing Stones from My Basket ');
            }
          });
        }
      });
    } else {
      this.messageService.showErrorGrowlMessage('NO_SELECTED_STONE');
    }
  }

  checkIsAllSelected() {
    this.totalBasketObj = this.basketService.isAllStoneSelected(this.totalBasketObj);
    this.priceRevisedObj = this.basketService.isAllStoneSelected(this.priceRevisedObj);
    this.daypBasketObj = this.basketService.isAllStoneSelected(this.daypBasketObj);
  }

  /********************************* Packets **********************************/

  togglePacketIcon(e) {
    this.visiblePacketIcon = e.visible;
  }

  togglePacketOverlay(event) {
    this.showSelectedPacket = true;
    this.visiblePacketPopup = event.visible;
  }

  updatePacketIcon(event) {
    this.notify.notifyBasketPacketUpdate(event);
  }

  createPacket() {
    this.packetCount++;
    this.notify.notifyPacketCount({ packetCount: this.packetCount });
  }

  showPacket() {
    this.notify.notifyShowPacketEvent({ showPackets: true });
  }

  stoneFromSelectedStone(event) {
    this.showSelectedPacket = event.visible;
    this.stoneForPacket = event.object;
    this.visiblePacketPopup = true;
  }

  addTab(e) {
    if (e.data && e.type === 'stoneDtl') {
      this.addStoneDetailTab(e.data)
    } else if (e.data && e.type === 'twinStoneDtl') {
      this.addTwinStoneInfoTab(e.data, this.tabName);
    }
  }

  updateRowColorChanges() {
    const tables = this.dataTables['_results'];
    tables.forEach(element => {
      element.updateRowColor();
    });
  }

  fetchTotalStoneDetailsTab() {
    let count = 0;
    this.tabName.forEach((element) => {
      if (element.pairId || element.stoneName) {
        count++;
      }
    });
    return count;
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
    const containerWidth = jQuery('#fixedBasketPanel').outerWidth();
    if (jQuery('#fixedBasketPanel').offset() && jQuery('#fixedBasketPanel').offset().top) {
      this.menuDistanceFromTop = jQuery('#fixedBasketPanel').offset().top > 0 ? jQuery('#fixedBasketPanel').offset().top : 0;
      if ((this.currentScroll + 10) > this.menuDistanceFromTop) {
        // jQuery('#fixedBasketId').addClass('stuck').innerWidth(containerWidth).css('padding-bottom', '10px');
        jQuery('#packetTabResultId').addClass('stuck').addClass('packet-struck');
        jQuery('#packetBox').css('display', 'none');
      } else {
        // jQuery('#fixedBasketId').removeClass('stuck').innerWidth(containerWidth).css('padding-bottom', '0px');
        jQuery('#packetTabResultId').removeClass('stuck').removeClass('packet-struck');
        jQuery('#packetBox').css('display', 'block');
      }
      this.adjustTableSize();
    }
  }

  adjustTableSize() {
    this.height = this.selectionObj && this.selectionObj.selectedStoneArray && this.selectionObj.selectedStoneArray.length > 0
      ? window.innerHeight * (65 / 100) : window.innerHeight * (80 / 100);
    if (this.selectedTableToggle) {
      this.height = window.innerHeight * (33 / 100);
    }
    this.adjustTableBoxSize();
  }

  adjustTableBoxSize() {
    if (jQuery('#fixedBasketId')) {
      jQuery('#fixedBasketId').css('height', window.innerHeight - 90);
    }
  }

  fetchMenuDistanceFromTop() {
    if (jQuery('#fixedBasketPanel').offset() && jQuery('#fixedBasketPanel').offset().top) {
      this.menuDistanceFromTop = jQuery('#fixedBasketPanel').offset().top > 0 ? jQuery('#fixedBasketPanel').offset().top : 0;
    }
  }

  toggleSelectedTable(e) {
    this.selectedTableToggle = e.status;
    this.adjustTableSize();
  }


  ngOnDestroy() {
    if (this.stoneConfirmedSubscription) {
      this.stoneConfirmedSubscription.unsubscribe();
    }
    if (this.addStoneToPacketSubscription) {
      this.addStoneToPacketSubscription.unsubscribe();
    }
    if (this.stoneClickedForDetailViewSubscription) {
      this.stoneClickedForDetailViewSubscription.unsubscribe();
    }
    if (this.packetSubscription) {
      this.packetSubscription.unsubscribe();
    }
    if (this.getBasketListObservable) {
      this.getBasketListObservable.unsubscribe();
    }
    this.appStore.remove('totalpageScrollUpcoming');
    this.appStore.remove('dayppageScrollUpcoming');
    this.appStore.remove('notavailablepageScrollUpcoming');
    this.appStore.remove('pagerevisedpageScrollUpcoming');
    const tables = this.dataTables['_results'];
    tables.forEach(element => {
      if (element.addNoteSubscription) {
        element.addNoteSubscription.unsubscribe();
      }
      if (element.packetSubscription) {
        element.packetSubscription.unsubscribe();
      }
      if (element.stoneConfirmedSubscription) {
        element.stoneConfirmedSubscription.unsubscribe();
      }
    });
    jQuery('#fixedBasketId').removeClass('stuck');
    jQuery('#packetTabResultId').removeClass('stuck').removeClass('packet-struck');
    jQuery('#packetBox').css('display', 'block');
  }

}
