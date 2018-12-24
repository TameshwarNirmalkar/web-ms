import { Injectable } from '@angular/core';

@Injectable()
export class ValidatorService {

  constructor() { }

  validateRangeValues(valueFrom, valueTo) {
    if (valueFrom === '' || valueTo === '' || valueFrom === null || valueTo === null || valueFrom > valueTo) {
      return true;
    } else if (valueFrom < 0 || valueTo < 0.1) {
      return true;
    } else {
      return false;
    }
  }

  validateNumber(event: any, inputValue: any, allowedDecimalUpto: number) {
    event = (event) ? event : window.event;
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode !== 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    } else if ((allowedDecimalUpto !== null || allowedDecimalUpto !== undefined) && inputValue) {
      const reg = new RegExp("^[0-9]+(\\.[0-9]{1," + allowedDecimalUpto + "})?$");
      //If the input is 2. then it appends 0 to make it 2.0 for sake of
      //matching regex this value is not used anywhere as param to API
      const isMatched = reg.test(inputValue + '0');
      return isMatched;
    }
    return true;
  }
}
