// import { Directive, ElementRef, HostListener, Renderer, forwardRef } from '@angular/core';
// import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
//
// export const PRICE_VALUE_ACCESSOR: any = {
//   provide: NG_VALUE_ACCESSOR,
//   useExisting: forwardRef(() => PriceValueAccessor),
//   multi: true
// };
//
// @Directive({
//   selector: '[priceValue]',
//   providers: [PRICE_VALUE_ACCESSOR]
// })
// export class PriceValueAccessor implements ControlValueAccessor {
//
//   @HostListener('input', ['$event', '$event.target.value']) onChange = (ev, value) => {};
//
//   @HostListener('keydown', ['$event', '$event.target.value']) onKeydown = (ev, value) => {
//     ev = (ev) ? ev : window.event;
//     const charCode = (ev.which) ? ev.which : ev.keyCode;
//     if(charCode === 39 || charCode === 37){
//       ev.stopImmediatePropagation()
//       return;
//     }
//
//   };
//
//   @HostListener('blur', []) onTouched = () => {};
//
//   constructor(private _renderer: Renderer, private _elementRef: ElementRef) { }
//
//   writeValue(value: String): void {
//     if(!this._elementRef.nativeElement.initialValue){
//       this._elementRef.nativeElement.initialValue = value
//       this._elementRef.nativeElement.modelValue = value
//     }
//
//     if (!value) {
//       this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', '');
//       return;
//     }
//
//     let isMatched = /[^0-9\.\,]/ig.test(String(value))
//
//     if (isMatched) {
//       let priceValue = String(value).replace(/[^0-9\,\.]/ig, '')
//       this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', priceValue);
//     }
//
//   }
//
//   registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
//   registerOnTouched(fn: () => void): void { this.onTouched = fn; }
//
//   setDisabledState(isDisabled: boolean): void {
//     this._renderer.setElementProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
//   }
// }
