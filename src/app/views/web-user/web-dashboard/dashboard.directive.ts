import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[dirDashboard]'
})
export class DashboardDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
