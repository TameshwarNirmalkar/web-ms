import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[dirSearch]'
})

export class SearchDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
