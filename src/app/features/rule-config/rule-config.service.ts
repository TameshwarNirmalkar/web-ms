import { Injectable } from '@angular/core';

@Injectable()
export class RuleConfigService {


  constructor() { }

  getInputOptions(inputOptions: any) {
    return this.createOptions(inputOptions);
  }

  getEntityOptions(valueOptions: any) {
    return this.createOptions(valueOptions);
  }

  getMarginOptions(marginOptions: any) {
    return this.createOptions(marginOptions);
  }

  getvalueSelectionTypeOptions(typeOptions: any) {
    return this.createOptions(typeOptions);
  }

  createOptions(optionValue: any) {
    let i: number;
    const splitArray: any[] = optionValue.split('/');
    const option: any[] = [];
    option.push({ label: 'Select', value: null });
    for (i = 0; i < splitArray.length; i++) {
      option.push({
        label: splitArray[i],
        value: splitArray[i]
      });
    }
    return option;
  }

}
