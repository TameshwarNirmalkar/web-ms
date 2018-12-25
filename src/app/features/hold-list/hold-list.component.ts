import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { NotifyService } from '@srk/core';
import { ApplicationStorageService } from '@srk/core';
import { StoneDetailsService } from '@srk/shared';

@Component({
  selector: 'app-hold-list',
  templateUrl: './hold-list.component.html',
  styleUrls: ['./hold-list.component.scss']
})
export class HoldListComponent implements OnInit, OnDestroy {
  @ViewChild('holdPanel') holdPanel;


  public tabName: any[] = [];
  public currentTabSelected: any;
  public stoneClickedForDetailViewSubscription: Subscription;
  public isColumnExpanded = false;
  public columnWidth = 130;
  public isIconVisible: boolean = false;

  constructor(
    private notify: NotifyService,
    private stoneSvc: StoneDetailsService,
    private appStore: ApplicationStorageService) { }

  ngOnInit() {
    this.stoneClickedForDetailViewSubscription = this.notify.notifyHoldListPageStoneDetailTabActionObservable$.subscribe((res) => {
      if (res.data && res.type === 'stoneDtl') {
        this.addStoneDetailTab(res.data);
      } else if (res.data && res.type === 'twinStoneDtl') {
        this.addTwinStoneInfoTab(res.data, this.tabName)
      }
    });
    this.stoneSvc.getConfirmedExportMemo().subscribe(res => { }, error => { });
    this.tabName.push({
      basketTab: 'MY_HOLD',
    });
  }

  addTwinStoneInfoTab(pairId, tabs) {
    this.stoneSvc.getStoneDetailsByPairId(pairId).subscribe(resPairStones => {
      if (resPairStones && resPairStones.length === 2) {
        this.stoneSvc.addTwinStoneInfoTab(resPairStones, tabs);
      }
    })
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
  }

  removeDetailedPacketTab(tabName) {
    this.tabName.forEach((element) => {
      if (element.stoneName === tabName) {
        const i = this.tabName.indexOf(element);
        this.tabName.splice(i, 1);
      } else if (element.pairId === tabName) {
        const i = this.tabName.indexOf(element);
        this.tabName.splice(i, 1);
      }
    });
  }

  changeActiveTab(e) {
    if (this.holdPanel) {
      this.holdPanel.selectedIndex = this.tabName.length - 1;
    }
  }

  ngOnDestroy() {
    this.appStore.remove('hold-selected-stone-panel');
    this.appStore.remove('hold-list');
    this.appStore.remove('toggleTable');
  }

  scrollColumn() {
    this.isColumnExpanded = !this.isColumnExpanded;
    this.isIconVisible = !this.isIconVisible;
    this.stoneSvc.handleSortingOrder(this.holdPanel);
    if (this.isColumnExpanded) {
      const columns = JSON.parse(JSON.stringify(this.holdPanel.columns));
      columns[1].width = 290;
      this.holdPanel.columns = columns;
    } else {
      const columns = JSON.parse(JSON.stringify(this.holdPanel.columns));
      columns[1].width = 130;
      this.holdPanel.columns = columns;
    }
  }
}
