import { Component, OnInit, Output, Input, ViewEncapsulation } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { ValidatorService } from '@srk/shared';
import { MessageService } from '@srk/core';
import { CustomTranslateService } from '@srk/core';
import { SearchCriteriaType } from '@srk/core';

@Component({
  selector: 'app-search-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ParametersComponent implements OnInit {

  @Input() data: any;
  preSelectedValues: any;
  parameterValues: any;
  savedParameterValues = [];
  girdleOptions: any[] = [];
  toSelectedGirdleValue: any[] = [];
  fromSelectedGirdleValue: any[] = [];
  culetOptions: any[] = [];
  selectedCuletValue: any[] = [];

  constructor(
    private service: SearchService,
    private notifyService: NotifyService,
    private messageService: MessageService,
    private customTranslate: CustomTranslateService,
    private validator: ValidatorService) { }

  ngOnInit() {
    this.service.getSearchElement().subscribe(response => {
      this.parameterValues = response.data.parameters;
      this.parameterValues.forEach(element => {
        element.fromValue = '';
        element.toValue = '';
      });
      this.initPreSelectedData();
    });
    this.service.getSearchFilterData().subscribe(response => {
      this.girdleOptions = this.service.getValueList(response.data.girdle);
      this.culetOptions = this.service.getValueList(response.data.culet);
      this.initGirdleAndCuletData();
    });

  }

  initPreSelectedData() {
    if (this.data !== undefined && this.data.parentRef.range !== undefined) {
      let selectedElements = this.data.parentRef.range;
      this.parameterValues.forEach(element => {
        for (var key in selectedElements) {
          if (selectedElements.hasOwnProperty(key)) {
            if (key === element.key.replace('#', '')) {
              let value = selectedElements[key][0] ? selectedElements[key][0] : '';
              if (value.indexOf('-') > 0) {
                let values = value.split('-');
                element.fromValue = values[0];
                element.toValue = values[1];
                const val = element.fromValue + '-' + element.toValue;
                let preValues = [];
                preValues.push(val);
                const param = this.createCriteria(element.key, preValues, SearchCriteriaType.RANGE);
                this.savedParameterValues.push(param);
              }
            }
          }
        }
      });
    }
  }

  initGirdleAndCuletData() {
    if (this.data !== undefined && this.data.parentRef.values !== undefined) {
      this.fromSelectedGirdleValue = this.data.parentRef.values.girdle;
      this.toSelectedGirdleValue = this.data.parentRef.values.tgirdle;
      this.selectedCuletValue = this.data.parentRef.values.culet;
    }
  }

  saveRange(key, fromVal, toVal, index) {
    if (fromVal && toVal) {
      fromVal = +fromVal;
      if (fromVal < 0) {
        this.messageService.showErrorGrowlMessage('ERR_VALID_VALUE');
        this.saveParameterRangeValuesWithErrorMessage(key, 'ERR_VALID_VALUE');
      } else {
        toVal = +toVal;
        const isInvalidRange = this.validator
          .validateRangeValues(fromVal, toVal);
        if (isInvalidRange) {
          this.messageService.showErrorGrowlMessage('ERR_VALID_RANGE');
          this.saveParameterRangeValuesWithErrorMessage(key, 'ERR_VALID_VALUE');
        } else if (fromVal > 999.999 || toVal > 999.999) {
          this.messageService.showErrorGrowlMessage('ERR_MAX_RANGE');
          this.saveParameterRangeValuesWithErrorMessage(key, 'ERR_MAX_RANGE');
        } else {
          let values = [];
          values.push((Math.round(fromVal * 100) / 100) + '-' + (Math.round(toVal * 100) / 100));
          this.saveRangeValues(key, values);
        }
      }
    } else if ((toVal && !fromVal) || (fromVal && !toVal)) {
      this.saveParameterRangeValuesWithErrorMessage(key, 'ERR_VALID_RANGE');
    } else {
      this.saveRangeValues(key, []);
    }
  }

  saveParameterRangeValuesWithErrorMessage(key: string, errorMessageKey: string) {
    const param = {};
    param['key'] = key;
    param['value'] = [];
    param['criteriaType'] = SearchCriteriaType.RANGE;
    param['valid'] = false;
    param['errorMessage'] = this.customTranslate.translateString('Parameters')
      + ' : ' + this.customTranslate.translateString(errorMessageKey);
    this.saveParameterValues(param);
  }

  saveRangeValues(key, value) {
    const param = this.createCriteria(key, value, SearchCriteriaType.RANGE);
    this.saveParameterValues(param);
  }

  saveValues(key, value) {
    const param = this.createCriteria(key, value, SearchCriteriaType.VALUES);
    this.saveParameterValues(param);
  }

  createCriteria(key, value, criteriaType): any {
    const param = {};
    param['key'] = key;
    param['value'] = value;
    param['criteriaType'] = criteriaType;
    param['valid'] = true;
    param['errorMessage'] = '';
    return param;
  }

  removeEntryIfAlreadyPresent(key) {
    this.savedParameterValues = this.savedParameterValues.filter(element => {
      return key !== element.key;
    })
  }

  saveParameterValues(object) {
    this.removeEntryIfAlreadyPresent(object.key);
    this.savedParameterValues.push(object);
    this.broadcastCriteria();
  }

  broadcastCriteria() {
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'ParametersComponent', parent: this.data.parentRef, filterCriteria: this.savedParameterValues });
    }
  }
}
