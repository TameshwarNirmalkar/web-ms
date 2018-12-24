import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';
import { BidToBuyDetailService } from '../../services/bid-to-buy-detail.service';
import { BidToBuyService } from '../../services/bid-to-buy.service';
import { ValidatorService } from '../../services/validator.service';
import { MessageService } from '@srk/core';
import { ConfirmationService } from 'primeng/components/common/api';
import { NotifyService } from '@srk/core';
import { MessageCodes, MessageCodesComparator } from '@srk/core';
@Component({
  selector: 'thm-bid-to-buy-overlay',
  templateUrl: './thm-bid-to-buy-overlay.component.html',
  styleUrls: ['./thm-bid-to-buy-overlay.component.scss'],
})
export class ThmBidToBuyOverlayComponent implements OnInit, OnChanges {

  @Input() visibleBTBOverlay: any;
  @Input() stoneList: any;
  @Output() toggleBTBOverlay = new EventEmitter();
  @Input() BTBdataLoaded: any;
  @Input() BTBClosed: any;
  @ViewChild('price') priceInfo: any;
  @ViewChild('btbPopup') btbPopupComponent: any;

  public maxPrice_Srk: any;
  public offerPer: any;
  public rap_off: any;
  public offerPerDiff: any;
  public priceDiff: any;
  public isB2bRequested = false;
  public offerRate: any;
  public priceChangeStatus = false;

  constructor(
    private btobService: BidToBuyService,
    private notify: NotifyService,
    private BidToBuyDetailService: BidToBuyDetailService,
    private messageService: MessageService,
    public validator: ValidatorService,
    public confirmationService: ConfirmationService
  ) { }

  ngOnInit() { }

  ngOnChanges() {
    if (this.stoneList && this.stoneList.hasOwnProperty('bid_rate')) {
      this.priceChangeStatus = false;
    }
  }

  priceEntry(stoneList, offerprice) {
    const response = this.btobService.priceEntry(stoneList, offerprice);
    this.priceChangeStatus = response.status;
    if (this.priceChangeStatus) {
      const newPrice = this.btobService.setOffPrice(response.data, offerprice);
      this.stoneList = newPrice.data;
    }
  }

  closeBtbOverlay() {
    this.clearBtbPriceInfo();
    this.toggleBTBOverlay.emit({ visible: false });
  }

  clearBtbPriceInfo() {
    delete this.stoneList['bid_rate'];
    delete this.stoneList['bid_percentage'];
    delete this.stoneList['difference'];
    delete this.stoneList['price'];
    this.stoneList['offer_per_disc_diff'] = null;
    this.stoneList['offer_per_disc'] = null;
    if (this.priceInfo && this.priceInfo.hasOwnProperty('nativeElement')) {
      this.priceInfo.nativeElement.value = null;
    }
  }

  DeleteSavedOffer() {
    this.confirmationService.confirm({
      message: 'Do you want to delete selected stone?',
      header: 'Remove stone',
      accept: () => {
        this.deleteStone(this.stoneList.stone_id);
      }
    });
  }

  deleteStone(stoneId) {
    this.btobService.deleteBTBFinalSubmitted([stoneId]).subscribe((response) => {
      this.notify.notifyStoneStateUpdated({
        source: 'b2bRequested',
        stoneList: [this.stoneList.stone_id],
        stoneObj: [this.stoneList],
        status: 0
      });
      this.messageService.showSuccessGrowlMessage('B2B_OFFER_DELETE_SUCCESS');
      this.closeBtbOverlay();
      this.stoneList.final_submit = null;
    });
  }

  saveBtbPrice(status) {
    if (this.priceInfo.nativeElement.value) {
      this.priceEntry(this.stoneList, this.priceInfo.nativeElement.value);
      if (this.priceChangeStatus) {
        this.isB2bRequested = true;
        this.btobService.autoSavePriceChange(
          this.stoneList.stone_id,
          this.priceInfo.nativeElement.value,
          this.stoneList.offer_per_disc, 'i'
          )
          .subscribe(res => {
            this.handleAutoSaveOfferSuccess(res, status);
          }, error => {
            this.isB2bRequested = false;
            this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
          });
      } else {
        this.checkBtbFailure(this.stoneList.price_srk, this.priceInfo.nativeElement.value);
      }
    } else {
      this.clearBtbPriceInfo();
      this.messageService.showErrorGrowlMessage('ERR_BTB_POPUP_INPUTS');
    }
  }

  isNumber(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode !== 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      return false;
    } else {
      return true;
    }
  }

  onPriceInput(data, priceRef: any) {
    const reg = /[^0-9\.\,]/ig;
    if (priceRef.value && reg.test(priceRef.value)) {
      let start = priceRef.selectionStart, end = priceRef.selectionEnd;
      let value = String(priceRef.value).replace(reg, '')
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

  handleAutoSaveOfferSuccess(res, status) {
    if (MessageCodesComparator.AreEqual(res.code, MessageCodes.B2B_BSS_200)) {
      if (!status) {
        this.notify.notifyStoneStateUpdated({ source: 'b2bRequested', stoneList: [this.stoneList.stone_id], stoneObj: [this.stoneList], status: 1 });
        this.isB2bRequested = false;
        this.closeBtbOverlay();
        this.messageService.showSuccessGrowlMessage(MessageCodes.B2B_BSS_200);
      } else {
        this.submitFinalValue();
      }
    } else {
      this.isB2bRequested = false;
      this.messageService.showErrorGrowlMessage('FAILURE_ADDING_BID');
    }
  }

  checkBtbFailure(stonePriceSrk, price) {
    if (stonePriceSrk > price) {
      // this.messageService.showErrorGrowlMessage('BTB_OFFER_ISLOWER');
    } else if (Number(price) - Number(stonePriceSrk) < 1) {
      this.messageService.showErrorGrowlMessage('BTB_OFFER_GREATERTHAN_ONEDOLLER');
    } else {
      this.messageService.showErrorGrowlMessage('ERR_BTB_POPUP_INPUTS');
    }
  }

  submitFinalValue() {
    this.btobService.finalSavePriceChange([this.stoneList.stone_id]).subscribe((response) => {
      if (MessageCodesComparator.AreEqual(response.code, MessageCodes.B2B_BSS_200)) {
        this.notify.notifyStoneStateUpdated({ source: 'b2bRequested', stoneList: [this.stoneList.stone_id], stoneObj: [this.stoneList], status: 2 });
        this.isB2bRequested = false;
        this.closeBtbOverlay();
        this.messageService.showSuccessGrowlMessage('B2B_BID_SUBMIT_SUCCESS');
      } else {
        this.messageService.showErrorGrowlMessage('BTB_SUBMIT_ERROR');
      }
    }, error => {
      this.isB2bRequested = false;
      this.messageService.showErrorGrowlMessage('SERVER_ERROR_OCCURRED');
    });
  }
}
