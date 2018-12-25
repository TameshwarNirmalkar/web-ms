import { Component, OnInit, Output, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-search-ha',
  styleUrls: ['./ha.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `<div id="H_A_ID" class="ui-grid ui-grid-responsive ui-grid-pad component-cards">
  <div id="hnaHeaderBox" class='ui-g-12 ui-g-nopad'>
    <div id="hnaLabelBox" class="ui-g-1 custom-padding">
    <label id="hnaLabel" class="component-cards-heading">{{'H&amp;A' | translate}}</label>
    </div>
  
  <div id="hnaSelectionBox" class='ui-g-11 ui-g-nopad' *ngIf='haValues'>
    <p-selectButton id="hnaMultiselect" [options]="optionsValue" [(ngModel)]="selectedValue"
  multiple="multiple" (onChange)="saveSearchValues()">
  </p-selectButton>
  </div>
  <div id="hnaFilterBox" class='ui-g-12 ui-g-nopad' *ngIf='filterConfig' align="right">
    <button id="hnaFilterBtn" pButton type="button" (click)="this.filter.emit(result)" label="Apply"></button>
  </div>
  </div>
  </div>
  `
})
export class HAComponent implements OnInit {

  @Input() data: any;
  @Input() filterConfig: any;
  @Output() filter = new EventEmitter();
  haValues: any;
  optionsValue: any[] = [];
  selectedValue: string[] = [];
  result: any[] = [];

  constructor(
    private service: SearchService,
    private notifyService: NotifyService) { }

  ngOnInit() {
    this.service.getSearchFilterData().subscribe(response => {
      this.haValues = response.data.hna;
      this.haValues.forEach((element) => {
        const labelValue = new TitleCasePipe().transform(element.label);
        this.optionsValue.push({ label: labelValue, value: element.value });
      });
    });
    if (this.data !== undefined) {
      this.setParentData();
    } else if (this.filterConfig !== undefined) {
      this.setFilterConfigData(this.filterConfig);
    }
  }

  setParentData() {
    if (this.data.parentRef.values !== undefined) {
      if (this.data.parentRef.values.hna !== undefined) {
        this.data.parentRef.values.hna.forEach((value) => {
          this.selectedValue.push(value);
        });
      }
    }
  }

  setFilterConfigData(data) {
    if (data.values !== undefined) {
      if (data.values.hna !== undefined) {
        this.selectedValue = data.values.hna;
      }
    }
  }

  saveSearchValues() {
    this.result = [{
      'key': 'hna',
      'value': this.selectedValue
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'HAComponent', parent: this.data.parentRef, filterCriteria: this.result });
    }
  }
}
