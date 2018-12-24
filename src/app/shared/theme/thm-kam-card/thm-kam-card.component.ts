import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'thm-kam-card',
  templateUrl: './thm-kam-card.component.html',
  styleUrls: ['./thm-kam-card.component.scss']
})
export class ThmKamCardComponent implements OnInit {
  @Input() kamDetailsInfo: any;
  constructor() { }

  ngOnInit() {
  }

}
