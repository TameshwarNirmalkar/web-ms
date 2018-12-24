import { Component, OnInit, Input, Renderer } from '@angular/core';
import { CustomTranslateService } from '@srk/core';

@Component({
  selector: 'app-thm-tooltip',
  templateUrl: './thm-tooltip.component.html',
  styleUrls: ['./thm-tooltip.component.scss']
})
export class ThmTooltipComponent implements OnInit {

  @Input() targetID: string;
  @Input() tooltipMessage: string;
  @Input() tooltipHeading: string;
  showTooltip = false;
  targetElement: any;

  constructor(private renderer: Renderer) { }

  ngOnInit() {
    this.targetElement = document.getElementById(this.targetID);
    this.renderer.listen(this.targetElement, 'mouseenter', (evt) => {
      this.showTooltip = !this.showTooltip;
    });
    this.renderer.listen(this.targetElement, 'mouseleave', (evt) => {
      this.showTooltip = !this.showTooltip;
    });
  }

}
