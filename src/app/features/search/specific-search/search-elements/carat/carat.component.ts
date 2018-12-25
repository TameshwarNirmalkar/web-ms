import { Component, OnInit, EventEmitter, Output, Input, ViewEncapsulation } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { MessageService } from '@srk/core';
import { ValidatorService } from '@srk/shared';
import { StoneDetailsService } from '@srk/shared';

@Component({
  selector: 'app-search-carat',
  templateUrl: './carat.component.html',
  styleUrls: ['./carat.component.scss', '../../dynamic-search-component/dynamic-search-component.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CaratComponent implements OnInit {

  @Input() data: any;
  @Input() filterConfig: any;
  @Output() filter = new EventEmitter();
  preSelectedValues: any;
  fromValue: any;
  toValue: any;
  caratValueSet: any[] = [];
  startSelectedValue = 0.0;
  endSelectedValue = 0.0;
  result: any[] = [];
  customCaratValue = [0, 0.3, 0.4, 0.5, 0.7, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 25, 30, 40, 50];

  constructor(
    private service: SearchService,
    private notifyService: NotifyService,
    private messageService: MessageService,
    public validator: ValidatorService,
    private stoneSvc: StoneDetailsService) { }

  ngOnInit() {
    if (this.data !== undefined) {
      this.setParentData(this.data);
    }
  }

  // customizeText(value) {
  //   const tickValue = value.value;
  //   if (tickValue !== 0.3 && tickValue !== 0.4 && tickValue !== 0.5
  //     && tickValue !== 0.7 && tickValue !== 1.25 && tickValue !== 1.5 && tickValue !== 2.5) {
  //     return value.valueText;
  //   }
  // }

  customizeText(value) {
    return value.valueText + ' ct.';
  }

  setParentData(object) {
    if (object.parentRef.range !== undefined) {
      if (object.parentRef.range.carat !== undefined) {
        this.caratValueSet = object.parentRef.range.carat;
        if (this.caratValueSet.length > 0) {
          let [from = 0, to = 0] = this.caratValueSet[this.caratValueSet.length - 1].split('-');
          this.startSelectedValue = +from;
          this.endSelectedValue = +to;
        }
      }
    }
  }

  onRangeValueChanged(e) {
    this.fromValue = e.value[0];
    this.toValue = e.value[1];
    this.createCaratValuesAndDispatch();
  }

  setFromValueOnSlider() {
    if (this.fromValue !== undefined && +this.fromValue >= 0.1 && +this.fromValue <= 99 && Number(this.fromValue) <= Number(this.toValue)) {
      // this.startSelectedValue = +JSON.parse(JSON.stringify(this.fromValue));
      // this.endSelectedValue = +JSON.parse(JSON.stringify(this.toValue));
      this.createCaratValuesAndDispatch();
    }
  }

  setToValueOnSlider() {
    if (this.toValue !== undefined && +this.toValue >= 0.1  && Number(this.toValue) >= Number(this.fromValue)) {
      // this.endSelectedValue = +JSON.parse(JSON.stringify(this.toValue));
      // this.startSelectedValue = +JSON.parse(JSON.stringify(this.fromValue));
      this.createCaratValuesAndDispatch();
    }
  }

  addCarats(e) {
    if (e.keyCode === 13) {
      this.addCaratValueSet();
    }
  }

  addCaratValueSet() {
    if (this.fromValue && this.toValue && this.fromValue !== null && this.toValue !== null) {
      this.fromValue = +this.fromValue;
      this.toValue = + this.toValue;
      const validCarat = this.validator.validateRangeValues(this.fromValue, this.toValue);
      if (validCarat === true) {
        this.messageService.showErrorGrowlMessage('ERR_VALID_RANGE');
        this.fromValue = this.toValue = null;
      } else if (this.fromValue > 999.999 || this.toValue > 999.999) {
        this.messageService.showErrorGrowlMessage('ERR_MAX_RANGE');
        this.fromValue = this.toValue = null;
      } else {
        this.caratValueSet.push((Math.round(this.fromValue * 100) / 100) + '-' + (Math.round(this.toValue * 100) / 100
        ));
        this.caratValueSet = this.stoneSvc.removeDuplicateItemFromArray(this.caratValueSet);
        this.saveCaratValues(this.caratValueSet);
        this.fromValue = this.toValue = null;
      }
    } else {
      this.messageService.showErrorGrowlMessage('ERR_VALID_RANGE');
    }
  }

  removeTag(value) {
    const i = this.caratValueSet.indexOf(value);
    if (i !== -1) {
      this.caratValueSet.splice(i, 1);
    }
    this.createCaratValuesAndDispatch();
  }

  createCaratValuesAndDispatch() {
    if (Number(this.fromValue) > Number(this.toValue)) {
      const value = JSON.parse(JSON.stringify(this.fromValue));
      this.fromValue = this.toValue;
      this.toValue = value;
      // this.startSelectedValue = +JSON.parse(JSON.stringify(this.fromValue));
      // this.endSelectedValue = +JSON.parse(JSON.stringify(this.toValue));
    }
    let tempCaratValues: any[] = [];
    tempCaratValues = JSON.parse(JSON.stringify(this.caratValueSet));
    if (Number(this.fromValue) > 0 || Number(this.toValue) > 0) {
      tempCaratValues.push((Math.round(this.fromValue * 100) / 100) + '-' + (Math.round(this.toValue * 100) / 100));
    }
    tempCaratValues = this.stoneSvc.removeDuplicateItemFromArray(tempCaratValues);
    this.saveCaratValues(tempCaratValues);
    this.createCaratEntry();
  }

  saveCaratValues(array: any) {
    this.result = [{
      'key': '#carat',
      'value': JSON.parse(JSON.stringify(array))
    }];
    if (this.data && this.data.isObserved) {
      this.createCaratEntry();
    }
  }

  createCaratEntry() {
    this.notifyService.notifySearchElementTouched(
      {
        searchComponent: 'CaratComponent',
        parent: JSON.parse(JSON.stringify(this.data.parentRef)),
        filterCriteria: JSON.parse(JSON.stringify(this.result))
      }
    );
  }
}
