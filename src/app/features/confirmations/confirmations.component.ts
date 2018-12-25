import { Component, OnInit, OnDestroy, ViewChild, AfterViewChecked, HostListener } from '@angular/core';
import { CustomTranslateService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { Subscription } from 'rxjs/Subscription';
import { ApplicationStorageService } from '@srk/core';
import { UtilService } from '@srk/shared';

@Component({
  selector: 'app-confirmations',
  templateUrl: './confirmations.component.html',
  styleUrls: ['./confirmations.component.scss'],
})
export class ConfirmationsComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('confirmationPanel') confirmationPanel;

  public myConfirmationsTab: any[] = [];
  private stoneForInvoiceGenerationSubscription: Subscription;
  private stoneClickedForDetailViewSubscription: Subscription;
  public currentTabSelected: any;
  public confirmationsTab: any[] = [
    { text: 'MY_CONFIRMATION', myConfirmations: true },
    { text: 'MY_INVOICES', myInvoices: true }
  ];
  public screenName = 'confirmationScreen';
  public lastCreatedTab: any;
  public currentScroll: any;
  public menuDistanceFromTop: any;

  constructor(
    private customTranslateSvc: CustomTranslateService,
    private notify: NotifyService,
    private appStore: ApplicationStorageService,
    private utilService: UtilService) { }

  ngOnInit() {
    this.stoneForInvoiceGenerationSubscription = this.notify.notifyStoneSelectedForInvoiceGenerationObservable$.subscribe((res) => {
      if (res.source) {
        this.updateStoneStateDetails(res);
      }
    });
    this.stoneClickedForDetailViewSubscription = this.notify.notifyMyConfirmationPageStoneDetailTabActionObservable$.subscribe((res) => {
      if (res.data) {
        this.addStoneDetailTab(res.data);
      }
    });
    this.currentTabSelected = 'MY_CONFIRMATION';
    this.fixedHeader();
  }

  ngAfterViewChecked() {
    this.utilService.setSearchTabWidth();
  }

  scrollTabPanelRight() {
    this.utilService.scrollTabPanelRight();
  }

  scrollTabPanelLeft() {
    this.utilService.scrollTabPanelLeft();
  }

  ngOnDestroy() {
    this.stoneForInvoiceGenerationSubscription.unsubscribe();
    this.stoneClickedForDetailViewSubscription.unsubscribe();
  }

  updateStoneStateDetails(res) {
    if (this.appStore.getData('stoneListToGenerateEnvoice') !== undefined) {
      const inviceGeneartionData = this.appStore.getData('stoneListToGenerateEnvoice');
      this.confirmationsTab.push({ text: 'Generate Invoice', visible: true, stoneListForInvoiceGeneration: inviceGeneartionData });
    }
  }

  addStoneDetailTab(data) {
    this.confirmationsTab.forEach((element) => {
      if (element.stoneName === data.stone_id) {
        this.handleClose(this.confirmationsTab.indexOf(element));
      }
    });
    this.confirmationsTab.push({
      stoneName: data.stone_id,
      stoneInfo: data
    });
    this.lastCreatedTab = data.stone_id;
  }

  handleClose(index) {
    if (index > -1) {
      this.confirmationsTab.splice(index, 1);
    }
  }

  handleConfirmationTabSelect(param) {
    if (param.hasOwnProperty('text')) {
      this.currentTabSelected = param.text;
    } else if (param.hasOwnProperty('stoneName')) {
      this.currentTabSelected = param.stoneName;
    }
  }

  removeDetailedPacketTab(tabName) {
    this.confirmationsTab.forEach((element, index) => {
      if (element.stoneName === tabName) {
        const i = this.confirmationsTab.indexOf(element);
        this.confirmationsTab.splice(i, 1);
        if (this.confirmationsTab[index - 1] && this.confirmationsTab[index - 1].hasOwnProperty('text')) {
          //this.currentTabSelected = this.confirmationsTab[index - 1].text;
          this.currentTabSelected = 'MY_CONFIRMATION';
        } else if (this.confirmationsTab[index - 1] && this.confirmationsTab[index - 1].hasOwnProperty('stoneName')) {
         // this.currentTabSelected = this.confirmationsTab[index - 1].stoneName;
         this.currentTabSelected = 'MY_CONFIRMATION';
        } else {
         // this.currentTabSelected = this.confirmationsTab[0].text;
         this.currentTabSelected = 'MY_CONFIRMATION';
        }
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.fixedHeader();
  }

  fixedHeader() {
    this.currentScroll = window.scrollY;
    const containerWidth = jQuery('#fixedConfirmationPanel').outerWidth();
    jQuery('#myConfirmationDetailsPanel').css('max-height', (window.innerHeight * 85) / 100);
  }

}
