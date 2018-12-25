import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { ValidatorService } from '@srk/shared';
import { MessageService } from '@srk/core';

@Component({
  selector: 'app-search-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PriceComponent implements OnInit {

  @Input() data: any;
  preSelectedValues: any;
  discountFrom: any;
  discountTo: any;
  usdFrom: any;
  usdTo: any;

  priceValues = {
    discount: [],
    usd: []
  };

  constructor(
    private service: SearchService,
    private notifyService: NotifyService,
    private messageService: MessageService,
    public validator: ValidatorService) { }

  ngOnInit() {
    this.discountFrom = '';
    this.discountTo = '';
    this.initPreSelectedData();
  }

  initPreSelectedData() {
    if (this.data !== undefined && this.data.parentRef.range !== undefined) {
      if (this.data.parentRef.range.rap_off && this.data.parentRef.range.rap_off.length > 0) {
        const rap_off = this.data.parentRef.range.rap_off[0];
        const rap_off_values = rap_off.split('-');
        this.discountFrom = rap_off_values[0];
        this.discountTo = rap_off_values[1];
      }
      if (this.data.parentRef.range.price_srk && this.data.parentRef.range.price_srk.length > 0) {
        const price_srk = this.data.parentRef.range.price_srk[0];
        const price_srk_values = price_srk.split('-');
        this.usdFrom = price_srk_values[0];
        this.usdTo = price_srk_values[1];
      }
    }
  }

  saveDiscount() {

    this.priceValues.discount = [];

    // Temporarily cast to number as the value comes as a string.
    this.discountFrom = isNaN(this.discountFrom) ? '' : parseFloat(this.discountFrom);
    this.discountTo = isNaN(this.discountTo) ? '' : parseFloat(this.discountTo);
    if (!isNaN(this.discountFrom) && !isNaN(this.discountTo)) {
      const validDiscount = this.validator.validateRangeValues(this.discountFrom, this.discountTo);
      if (validDiscount === true) {
        this.messageService.showErrorGrowlMessage('ERR_VALID_RANGE');
        this.discountFrom = '';
        this.discountTo = '';
      } else {
        this.priceValues.discount.push((Math.round(this.discountFrom * 100) / 100) + '-' + (Math.round(this.discountTo * 100) / 100));
        this.saveValues('#rap_off', this.priceValues.discount);
      }
    } else {
      if (this.discountFrom && !this.discountTo) {
        this.discountTo = '';
      } else if (!this.discountFrom && this.discountTo) {
        this.discountFrom = '';
      } else if (this.discountFrom === 0 && isNaN(this.discountTo)) {
        this.discountFrom = '';
        this.discountTo = '';
        this.messageService.showErrorGrowlMessage('ERR_VALID_VALUE');
      } else if (!this.discountFrom && !this.discountTo) {
        this.discountFrom = '';
        this.discountTo = '';
        this.messageService.showErrorGrowlMessage('ERR_VALID_RANGE');
      } else {
        this.discountFrom = '';
        this.discountTo = '';
      }
    }
  }

  saveUsd() {
    this.priceValues.usd = [];
    if (this.usdFrom !== undefined && this.usdFrom < 0.1) {
      this.messageService.showErrorGrowlMessage('ERR_VALID_VALUE');
      this.usdFrom = undefined;
    } else {
      if (this.usdTo !== undefined) {
        this.usdFrom = +this.usdFrom;
        this.usdTo = +this.usdTo;
        const validUsd = this.validator
          .validateRangeValues(this.usdFrom, this.usdTo);
        if (validUsd === true) {
          this.messageService.showErrorGrowlMessage('ERR_VALID_RANGE');
          this.usdFrom = this.usdTo = undefined;
        } else {
          this.priceValues.usd.push((Math.round(this.usdFrom * 100) / 100) + '-' + (Math.round(this.usdTo * 100) / 100));
        }
      }
    }
    this.saveValues('#price_srk', this.priceValues.usd);
  }

  saveValues(label, value) {
    const param = {};
    param['key'] = label;
    param['value'] = value;
    this.savePriceValues(param);
  }

  savePriceValues(object) {
    const result = [];
    result.push(object);
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'PriceComponent', parent: this.data.parentRef, filterCriteria: result }
      );
    }
  }
}
