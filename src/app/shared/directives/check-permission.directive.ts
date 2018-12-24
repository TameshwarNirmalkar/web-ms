import { Directive, TemplateRef, ViewContainerRef, Input, OnInit } from '@angular/core';
import { AuthService } from '@srk/core';

@Directive({
  selector: '[dirCheckPermission]'
})
export class CheckPermissionDirective {

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private authService: AuthService) { }

  @Input() set dirCheckPermission(permissionName: string) {
    const hasPermission = this.authService.hasElementPermission(permissionName);
    if (permissionName && hasPermission) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}
