import { Directive, HostListener, Output, EventEmitter, ElementRef, Input, OnInit } from '@angular/core';

/* This forces user to enter number with maxinum 2 digit only.
eg. 101, 101.90, 101.9, .90, 101.,  0.0, and . { All these values will be valid entries for this directive}
*/
@Directive({
  selector: '[dirValidateNumberDigit]'
})
export class ValidateNumberDigit {

  constructor(private element: ElementRef) { }

  @HostListener('keydown', ['$event', '$event.target.value']) onKeydown = (ev, value) => {
    ev = (ev) ? ev : window.event;
    const charCode = (ev.which) ? ev.which : ev.keyCode;
    if (charCode !== 39 && charCode !== 37 && charCode !== 190 && charCode !== 46 && charCode !== 110
      && charCode > 31 && (charCode < 48 || charCode > 57) &&(charCode < 96 || charCode > 105)) {
      return false;
    }
  };

  @HostListener('keyup', ['$event', '$event.target.value']) onKeyup = (ev, inputValue) => {
    if (inputValue) {
      let valueParts = inputValue.split('.');
      if (valueParts.length === 3) {
        this.element.nativeElement.value = inputValue.substr(0, inputValue.length - 1);
      } else if (valueParts.length === 2 && valueParts[1].length > 2) {
        this.element.nativeElement.value = inputValue.substr(0, inputValue.length - 1);
      }
    }
  };

  @HostListener('blur', ['$event', '$event.target.value']) onTouched = (ev, inputValue) => {
    if (inputValue) {
      let valueParts = inputValue.split('.');
      if (inputValue === '.') {
        this.element.nativeElement.value = '0.0';
      } else if (valueParts.length > 0 && valueParts[0].length === 0) {
        this.element.nativeElement.value = '0' + inputValue;
      } else if (valueParts.length === 2 && valueParts[1].length === 0) {
        this.element.nativeElement.value = inputValue + '0'
      };
    }
  }

}
