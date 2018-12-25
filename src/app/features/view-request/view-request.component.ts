import { Component, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { MessageService } from '@srk/core';
import { ViewRequestService } from '@srk/shared';
import { NotifyService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';
import { UtilService } from '@srk/shared';

@Component({
  selector: 'app-view-request',
  templateUrl: './view-request.component.html',
  styleUrls: ['./view-request.component.scss'],

})
export class ViewRequestComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('thmPacketPanel') thmPacketPanel;
  @ViewChild('viewRequestPanel') viewRequestPanel;

  public requestTabs: any[];
  public isTodayVisit = false;
  public stoneClickedForDetailViewSubscription: any;
  public isStoneDetailsTabAdded = false;
  public packetCount = 0;
  public showPacktBtn = false;
  public showCreatePacketBtn = true;
  public visiblePacketIcon = false;
  public visiblePacketPopup = false;
  public stoneForPacket: any;
  public packetSubscription: any;
  public showSelectedPacket = true;
  public currentTabSelected: any;
  public lastCreatedTab: any;

  constructor(
    private messageService: MessageService,
    private appStore: ApplicationStorageService,
    private stoneSvc: StoneDetailsService,
    private viewRequestSvc: ViewRequestService,
    private notify: NotifyService,
    private utilService: UtilService) { }

  ngOnInit() {
    this.stoneClickedForDetailViewSubscription = this.notify.notifyViewRequestPageStoneDetailTabActionObservable$.subscribe((res) => {
      if (res.data && res.type === 'stoneDtl') {
        this.addStoneDetailTab(res.data);
      } else if (res.data && res.type === 'twinStoneDtl') {
        this.addTwinStoneInfoTab(res.data, this.requestTabs);
      }
    });
    this.isTodayVisitExist();
    this.requestTabs = [
      // { tabName: 'Upcoming' },
      { tabName: 'Past' },
      // { tabName: 'Today' },
    ];
    this.currentTabSelected = 'Past';
    this.packetSubscription = this.notify.notifyShowPacketBtnOccuredObservable$.subscribe(res => {
      this.showPacktBtn = res.visible;
    });
  }

  ngAfterViewChecked() {
    jQuery('.container').css('margin-right', '10px');
    this.utilService.setSearchTabWidth();
  }

  scrollTabPanelRight() {
    this.utilService.scrollTabPanelRight();
  }

  scrollTabPanelLeft() {
    this.utilService.scrollTabPanelLeft();
  }


  isTodayVisitExist() {
    this.viewRequestSvc.hasTodayVisit().subscribe(res => {
      this.isTodayVisit = res.data;
    }, error => {
      this.isTodayVisit = false;
    });
  }

  getStatusMessage(e) {
    if (e.status) {
      this.messageService.showSuccessGrowlMessage(e.message);
    } else {
      this.messageService.showErrorGrowlMessage(e.message);
    }
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
    this.requestTabs.forEach((element) => {
      if (element.stoneName === data.stone_id) {
        const i = this.requestTabs.indexOf(element);
        this.requestTabs.splice(i, 1);
      }
    });
    this.requestTabs.push({
      stoneName: data.stone_id,
      stoneInfo: data
    });
    this.lastCreatedTab = data.stone_id;
    this.isStoneDetailsTabAdded = true;
  }

  removeDetailedPacketTab(tabName) {
    this.requestTabs.forEach((element, index) => {
      let flag = 0;
      if (element.stoneName === tabName) {
        const i = this.requestTabs.indexOf(element);
        this.requestTabs.splice(i, 1);
        flag++;
      } else if (element.pairId === tabName) {
        const i = this.requestTabs.indexOf(element);
        this.requestTabs.splice(i, 1);
        flag++;
      }
      if (flag > 0) {
        if (this.requestTabs[index - 1] && this.requestTabs[index - 1].hasOwnProperty('tabName')) {
          if (!this.isTodayVisit) {
            this.currentTabSelected = this.requestTabs[index - 2].tabName;


          } else {
            this.currentTabSelected = this.requestTabs[index - 1].tabName;

          }
        } else if (this.requestTabs[index - 1] && this.requestTabs[index - 1].hasOwnProperty('stoneName')) {
          this.currentTabSelected = this.requestTabs[index - 1].stoneName;
        } else if (this.requestTabs[index - 1] && this.requestTabs[index - 1].hasOwnProperty('pairId')) {
          this.currentTabSelected = this.requestTabs[index - 1].pairId;
        } else {
          this.currentTabSelected = this.requestTabs[0].tabName;
        }
      }
    });
  }

  changeActiveTab(e) {
    if (this.viewRequestPanel && this.isStoneDetailsTabAdded) {
      this.viewRequestPanel.selectedIndex = this.requestTabs.length - 1;
      this.isStoneDetailsTabAdded = false;
    }
  }

  getSelectedTabName(param) {
    if (param.hasOwnProperty('tabName')) {
      this.currentTabSelected = param.tabName;
      jQuery('html, body').animate({ scrollTop: this.appStore.getData('ddcPageScroll') }, 'slow');
    } else if (param.hasOwnProperty('stoneName')) {
      this.currentTabSelected = param.stoneName;
      this.isStoneDetailsTabAdded = true;
    } else if (param.hasOwnProperty('pairId')) {
      this.currentTabSelected = param.pairId;
      this.isStoneDetailsTabAdded = true;
    } else {
      jQuery('html, body').animate({ scrollTop: this.appStore.getData('pageScroll' + this.currentTabSelected.tabName) }, 'slow');
      this.isStoneDetailsTabAdded = false;
    }
  }

  ngOnDestroy() {
    this.appStore.remove('upcomingRequestArray');
    this.appStore.remove('pastRequestArray');
    this.appStore.remove('stoneViewedArray');
    this.appStore.remove('stoneOnTableArray');
    this.appStore.remove('stoneRequestedArray');
    this.appStore.remove('upcoming-selected-stone-panel');
    this.appStore.remove('past-selected-stone-panel');
    this.appStore.remove('on-table-selected-stone-panel');
    this.appStore.remove('viewed-selected-stone-panel');
    this.appStore.remove('stone-request-selected-stone-panel');
    this.appStore.remove('toggleTable');
    this.appStore.remove('pageScrollPast');
    this.appStore.remove('pageScrollUpcoming');
    this.stoneClickedForDetailViewSubscription.unsubscribe();
    this.packetSubscription.unsubscribe();
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

}
