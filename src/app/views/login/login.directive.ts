import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[dirLogin]'
})
export class LoginDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
