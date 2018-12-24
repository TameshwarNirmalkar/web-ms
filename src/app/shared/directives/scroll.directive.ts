import { Directive } from '@angular/core';

declare var jQuery:any;

@Directive({
  selector: '[dirScrollTop]'
})
export class ScrollToTopDirective {

  constructor() {
     jQuery('html, body').animate({ scrollTop: 0 }, 'slow');
  }

}
