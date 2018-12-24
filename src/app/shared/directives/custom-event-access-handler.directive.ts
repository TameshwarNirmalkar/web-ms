import { Directive, HostListener, Output, EventEmitter, ElementRef, Input, OnInit } from '@angular/core';
import { AuthService } from '@srk/core';

@Directive({
  selector: '[dirCustomEventAccessHandler]'
})
export class CustomEventAccessHandler {

  private hasPermission = false;

  constructor(private element: ElementRef, private authService: AuthService) { }

  @Output() customEvent = new EventEmitter();

  @HostListener('click') onClick() {
    if (this.hasPermission) {
      this.customEvent.emit();
    }
  }

  @Input() set dirCustomEventAccessHandler(permissionName: string) {
    this.hasPermission = this.authService.hasElementPermission(permissionName);
    if (this.hasPermission) {
      this.element.nativeElement.style.cursor = 'pointer';
    } else {
      this.element.nativeElement.style.cursor = 'default';
    }
  }
}
