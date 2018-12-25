import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, AbstractControl} from '@angular/forms';
import { RangeFilterPipe } from './range-filter.pipe';
import { RuleConfigService } from '../rule-config.service';
import { CustomTranslateService } from '@srk/core';

@Component({
  selector: 'app-add-new-rule',
  templateUrl: './add-new-rule.component.html',
  styleUrls: ['./add-new-rule.component.scss']
})

export class AddNewRuleComponent implements OnInit {

  @Input() clientData: any;
  @Output() onAddNewRule = new EventEmitter();
  selectedInputType: string;
  selectedValueType: string;
  selectedMarginType: string;
  selectedValueSelectionType: string;
  selectedSingleValue: string;
  selectedMultipleValue: string[];

  ruleForm: FormGroup;

  finalRuleConfig: any;
  showValueSetOptions = false;
  valueOptions: any[] = [];
  inputTypeOptions: any[];
  valueTypeOptions: any[];
  marginTypeOptions: any[];
  valueSelectionTypeOptions: any[];

  constructor(private formBuilder: FormBuilder,
    private ruleService: RuleConfigService,
    private translateService: CustomTranslateService
  ) { }

  ngOnInit() {
    const ruleData = this.checkUserData(this.clientData);

    this.finalRuleConfig = ruleData.data[0].config_values[0];
    this.inputTypeOptions = this.ruleService.getInputOptions(this.finalRuleConfig.display_attributes['input_type']);
    this.inputTypeOptions = this.translateService.translateSelectItem(this.inputTypeOptions);
    this.valueTypeOptions = this.ruleService.getEntityOptions(this.finalRuleConfig.display_attributes['entity_type']);
    this.valueTypeOptions = this.translateService.translateSelectItem(this.valueTypeOptions);
    this.marginTypeOptions = this.ruleService.getMarginOptions(this.finalRuleConfig.margin_allowed['margin_type']);
    this.marginTypeOptions = this.translateService.translateSelectItem(this.marginTypeOptions);
    this.valueSelectionTypeOptions = this.ruleService.getvalueSelectionTypeOptions
      (this.finalRuleConfig.display_attributes['option_selection']);
    this.valueSelectionTypeOptions = this.translateService.translateSelectItem(this.valueSelectionTypeOptions);

    this.ruleForm = this.formBuilder.group({
      rule_name: ['', Validators.required],
      rule_description: ['', Validators.required],
      input_type: ['', Validators.required],
      value_type: ['', Validators.required],
      values: this.formBuilder.array([
        this.initSingleValue()
      ]),
      margin_allowed: this.formBuilder.group({
        margin_value: ['0'],
        margin_type: ['NA']
      }),
      options: this.formBuilder.array([
        this.initValueSet()
      ]),
      option_selection: [''],
      effective_from: ['', Validators.required],
      effective_to: ['', Validators.required],
      is_active: ['', Validators.required],
      is_updatable: ['', Validators.required],
    });
  }

  checkUserData(data: any) {
    if (!data) {
      return;
    } else {
      return data;
    }
  }

  initValueSet() {
    return this.formBuilder.group({
      label: [''],
      value: ['']
    });
  }

  initSingleValue() {
    return this.formBuilder.group({
      value: ['']
    });
  }

  initRangeValues() {
    return this.formBuilder.group({
      from: [''],
      to: ['']
    });
  }

  resetInputValues() {
    this.selectedValueType = '';
    this.selectedValueSelectionType = '';
    this.showValueSetOptions = false;
  }

  resetValueTypes() {
    if (this.selectedValueType === 'Value Set') {
      const valuecontrol = <FormArray>this.ruleForm.controls['options'];
      for (let k = valuecontrol.controls.length; k >= 0; k--) {
        this.removeValueSet(k);
      }
      valuecontrol.push(this.initValueSet());
    } else {
      const control = <FormArray>this.ruleForm.controls['values'];
      for (let k = control.controls.length; k >= 0; k--) {
        this.removeEntityValues(k);
      }

      if (this.selectedValueType === 'Range') {
        control.push(this.initRangeValues());
      } else if (this.selectedValueType === 'Single Value') {
        control.push(this.initSingleValue());
      }
    }
    this.showValueSetOptions = false;
  }

  removeEntityValues(i: number) {
    const control = <FormArray>this.ruleForm.controls['values'];
    control.removeAt(i);
  }

  addValueSet() {
    const control = <FormArray>this.ruleForm.controls['options'];
    control.push(this.initValueSet());
  }

  removeValueSet(j: number) {
    const control = <FormArray>this.ruleForm.controls['options'];
    control.removeAt(j);
  }

  addAllValues() {
    const control = <FormArray>this.ruleForm.controls['options'].value;
    this.valueOptions = [];
    for (let i = 0; i < control.length; i++) {
      this.valueOptions.push({ label: control[i]['value'], value: control[i]['value'] });
    }
    this.showValueSetOptions = true;
    this.selectedValueSelectionType = '';
    this.selectedSingleValue = '';
    this.selectedMultipleValue = [];
    this.selectedMarginType = '';
  }

  setEntityValues(entity: any) {
    if (this.selectedValueType === 'Range') {
      this.finalRuleConfig.entity_value[0] = entity[0].from;
      this.finalRuleConfig.entity_value[1] = entity[0].to;
    } else if (this.selectedValueType === 'Single Value') {
      this.finalRuleConfig.entity_value[0] = entity[0].value;
    } else {
      if (this.selectedValueSelectionType === 'Single Select') {
        this.finalRuleConfig.entity_value[0] = entity[0].value;
      } else {
        for (let x = 0; x < entity[0].value.length; x++) {
          this.finalRuleConfig.entity_value[x] = entity[0].value[x];
        }
      }
    }
  }

  showMarginOptions() {
    if ((this.selectedInputType === 'Number' || this.selectedInputType === 'Decimal Number') &&
      ((this.selectedValueType === 'Range' || this.selectedValueType === 'Single Value') || (this.selectedValueSelectionType))) {
      return true;
    } else {
      return false;
    }
  }

  setFinalConfigValues(data: any) {
    this.finalRuleConfig.entity_name = data.rule_name;
    this.finalRuleConfig.display_attributes['entity_desc'] = data.rule_description;
    this.finalRuleConfig.display_attributes['input_type'] = data.input_type;
    this.finalRuleConfig.display_attributes['option_selection'] = data.option_selection;
    for (let y = 0; y < this.valueOptions.length; y++) {
      this.finalRuleConfig.display_attributes['options'].push({ key: this.valueOptions[y].label, value: this.valueOptions[y].value });
    }
    this.setEntityValues(data.values);
    this.finalRuleConfig.display_attributes['entity_type'] = data.value_type;
    this.finalRuleConfig.margin_allowed = data.margin_allowed;
    this.finalRuleConfig.effective_from = data.effective_from;
    this.finalRuleConfig.effective_to = data.effective_to;
    this.finalRuleConfig.is_active = data.is_active;
    this.finalRuleConfig.is_updatable = data.is_updatable;
    this.clientData.data[0].config_type = 'DEFAULT';
    this.clientData.data[0].client_id = 'SRK';
  }

  onSubmit(value: any) {
    this.setFinalConfigValues(value);
    this.onAddNewRule.emit(this.clientData.data[0]);
    this.ruleForm.reset();
  }
}
