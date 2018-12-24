import { Pipe, PipeTransform } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from "@angular/platform-browser";

@Pipe({
  name: 'safeStyle'
})
export class SafeStylePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(style) {
    return this.sanitizer.bypassSecurityTrustStyle(style);
  }

}
