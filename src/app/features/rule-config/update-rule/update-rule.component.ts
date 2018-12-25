import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChange } from '@angular/core';

@Component({
  selector: 'app-update-rule',
  templateUrl: './update-rule.component.html',
  styleUrls: ['./update-rule.component.scss']
})
export class UpdateRuleComponent implements OnInit, OnChanges {

  @Input() inputRuleData: any;
  @Output() onUpdateRule = new EventEmitter();

  ruleConfigValues: any;
  inputType: string;
  valueType: string;
  valueOptions: any[] = [];
  valueSelectionType: string;
  selectedValue: string[] = [];
  singleValue: string;
  rangeFrom: any;
  rangeTo: any;

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.checkUpdateValues(this.inputRuleData);
    this.initializeUpdateView(this.ruleConfigValues);
  }

  checkUpdateValues(data: any) {
    if (!data) {
      return;
    }
    this.ruleConfigValues = data.config_values[0];
    return this.ruleConfigValues;
  }

  initializeUpdateView(data: any) {
    if (data !== null && data !== undefined) {
      this.inputType = data['display_attributes'].input_type;
      this.valueType = data['display_attributes'].entity_type;
      this.setValues(this.valueType);
    }
  }

  setValues(value) {
    if (this.inputType === 'Date') {
      const array: any[] = [];
      this.ruleConfigValues['entity_value'].forEach((element) => {
        array.push(new Date(element));
      });
      this.ruleConfigValues['entity_value'] = array;
    }
    if (value === 'Value Set') {
      this.valueSelectionType = this.ruleConfigValues['display_attributes'].option_selection;
      for (let i = 0; i < this.ruleConfigValues['display_attributes'].options.length; i++) {
        this.valueOptions.push({
          label: this.ruleConfigValues['display_attributes'].options[i].key,
          value: this.ruleConfigValues['display_attributes'].options[i].value
        });
      }
      this.ruleConfigValues['entity_value'].forEach((element) => {
        this.selectedValue.push(element);
      });
    } else if (value === 'Range') {
      this.rangeFrom = this.ruleConfigValues['entity_value'][0];
      this.rangeTo = this.ruleConfigValues['entity_value'][1];
    } else {
      this.singleValue = this.ruleConfigValues['entity_value'][0];
    }
  }

  updateRuleClick() {
    this.ruleConfigValues['entity_value'] = [];
    if (this.valueType === 'Range') {
      this.ruleConfigValues['entity_value'][0] = this.rangeFrom;
      this.ruleConfigValues['entity_value'][1] = this.rangeTo;
    } else if (this.valueType === 'Single Value') {
      this.ruleConfigValues['entity_value'][0] = this.singleValue;
    } else {
      if (typeof this.selectedValue !== 'object') {
        this.ruleConfigValues['entity_value'].push(this.selectedValue);
      } else {
        this.ruleConfigValues['entity_value'] = this.selectedValue;
      }
    }
    this.onUpdateRule.emit(this.ruleConfigValues);
  }

}
