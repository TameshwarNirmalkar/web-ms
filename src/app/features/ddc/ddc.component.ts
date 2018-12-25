import { Component, OnInit, ViewChild, Input, AfterViewInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { DdcService } from '@srk/shared';
import { NotifyService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';
import { Subscription } from 'rxjs/Subscription';
import { ThmConfirmOverlayComponent } from '@srk/shared';
import { UtilService } from '@srk/shared';
import { MessageService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { AddNoteService } from '@srk/shared';

@Component({
  selector: 'app-ddc',
  templateUrl: './ddc.component.html',
  styleUrls: ['./ddc.component.scss']
})
export class DdcComponent implements OnInit, OnDestroy, AfterViewChecked {
  public packetSubscription: Subscription;
  public ddcStoneList: any[] = [];
  public message: string;
  public tabName: any[] = [];
  public currentTabSelected: any;
  public showPacktBtn = true;
  public visiblePacketIcon = false;
  public visiblePacketPopup = false;
  public packetCount = 0;
  public stoneForPacket: any;
  public showSelectedPacket = true;
  public lastCreatedTab: any;

  constructor(
    private utilService: UtilService,
    private ddcSvc: DdcService,
    private stoneSvc: StoneDetailsService,
    private notify: NotifyService,
    private messageService: MessageService,
    private appStore: ApplicationStorageService,
    private notesService: AddNoteService) { }

  ngOnInit() {
    this.tabName.push({
      ddcTab: 'MY DDC',
    });
    this.message = 'Loading...';
    this.currentTabSelected = 'MY DDC';
    this.fetchDDCStoneDetails();
    this.packetSubscription = this.notify.notifyShowPacketBtnOccuredObservable$.subscribe(res => {
      this.showPacktBtn = res.visible;
    });
    this.notify.notifyBasketPacketUpdatePageActionObservable$.subscribe(res => {
      this.updatePacketDetails(res);
    });
  }

  ngAfterViewChecked() {
    this.utilService.setSearchResultTabs(-2);
    this.utilService.setSearchTabWidth();
  }

  scrollTabPanelRight() {
    this.utilService.scrollTabPanelRight();
  }

  scrollTabPanelLeft() {
    this.utilService.scrollTabPanelLeft();
  }

  fetchDDCStoneDetails() {
    this.ddcSvc.getDDCstoneDetails().subscribe((response) => {
      if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DDC_GS_200)) {
        this.ddcStoneList = response.data;
        this.ddcStoneList = this.utilService.updateStonesForDecimal(this.ddcStoneList);
        this.ddcStoneList = this.notesService.fetchStonesComment(this.ddcStoneList);
        this.ddcStoneList = this.stoneSvc.fetchStoneAdditionalInfo(this.ddcStoneList);
        this.message = undefined;
      } else if (MessageCodesComparator.AreEqual(response.code, MessageCodes.SMS_DDC_ND_200)) {
        this.message = 'DDC_DATA_NOT_AVAILABLE';
        this.ddcStoneList = [];
      }
    }, error => {
      this.message = 'SERVER_ERROR_OCCURRED';
    });
  }

  updatePacketDetails(event) {
    if (this.ddcStoneList) {
      this.ddcStoneList = this.stoneSvc.setStonePacketCount(this.ddcStoneList);
      this.ddcStoneList = this.stoneSvc.updateStonePacketCount(event, this.ddcStoneList);
    }
  }

  addTwinStoneInfoTab(pairId, tabs) {
    const windowTopScroll: any = jQuery(window).scrollTop();
    this.appStore.store('ddcPageScroll', windowTopScroll);
    this.stoneSvc.getStoneDetailsByPairId(pairId).subscribe(resPairStones => {
      if (resPairStones && resPairStones.length === 2) {
        this.stoneSvc.addTwinStoneInfoTab(resPairStones, tabs || this.tabName);
        this.lastCreatedTab = pairId;
      }
    });
  }

  addStoneDetailTab(data) {
    const windowTopScroll: any = jQuery(window).scrollTop();
    this.appStore.store('ddcPageScroll', windowTopScroll);
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
  }

  addTab(res) {
    if (res.data && res.type === 'stoneDtl') {
      this.addStoneDetailTab(res.data);
    } else if (res.data && res.type === 'twinStoneDtl') {
      this.addTwinStoneInfoTab(res.data, this.tabName);
    }
  }

  removeDetailedPacketTab(tabName) {
    this.tabName.forEach((element, index) => {
      if (element.stoneName === tabName) {
        const i = this.tabName.indexOf(element);
        this.tabName.splice(i, 1);
      } else if (element.pairId === tabName) {
        const i = this.tabName.indexOf(element);
        this.tabName.splice(i, 1);
      }
      if (this.tabName[index - 1] && this.tabName[index - 1].hasOwnProperty('ddcTab')) {
        //this.currentTabSelected = this.tabName[index - 1].ddcTab;
        this.currentTabSelected = 'MY DDC';
      } else if (this.tabName[index - 1] && this.tabName[index - 1].hasOwnProperty('stoneName')) {
        //this.currentTabSelected = this.tabName[index - 1].stoneName;
        this.currentTabSelected = 'MY DDC';
      } else if (this.tabName[index - 1] && this.tabName[index - 1].hasOwnProperty('pairId')) {
       // this.currentTabSelected = this.tabName[index - 1].pairId;
       this.currentTabSelected = 'MY DDC';
      } else {
       // this.currentTabSelected = this.tabName[0].ddcTab;
       this.currentTabSelected = 'MY DDC';
      }
    });
  }

  togglePacketIcon(e) {
    this.visiblePacketIcon = e.visible;
  }

  stoneToOperateInPacket(event) {
    this.stoneForPacket = [event.stone_id];
    this.visiblePacketPopup = event.visible;
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

  getSelectedTabName(param) {
    if (param.hasOwnProperty('ddcTab')) {
      this.currentTabSelected = param.ddcTab;
      jQuery('html, body').animate({ scrollTop: this.appStore.getData('ddcPageScroll') }, 'slow');
      this.ddcStoneList = this.stoneSvc.fetchStoneAdditionalInfo(this.ddcStoneList);
    } else if (param.hasOwnProperty('stoneName')) {
      this.currentTabSelected = param.stoneName;
    } else if (param.hasOwnProperty('pairId')) {
      this.currentTabSelected = param.pairId;
    }
  }

  updateDDCStone(event) {
    this.message = 'DDC_DATA_NOT_AVAILABLE';
    this.ddcStoneList = [];
  }

  ngOnDestroy() {
    this.packetSubscription.unsubscribe();
    this.appStore.remove('pageRef');
    this.appStore.remove('ddcPageScroll');
  }
}
