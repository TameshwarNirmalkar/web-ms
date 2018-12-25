import { Component, OnInit, EventEmitter, Output, Input, ViewEncapsulation } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-search-fluorescence',
  styleUrls: ['./fluorescence.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `<div id="FLUORESCENCE_ID" class="ui-grid ui-grid-responsive ui-grid-pad component-cards">
  <div id="fluoroHeaderBox" class='ui-g-12 ui-g-nopad'>
    <div id="fluoroLabelBox" class="ui-g-1 custom-padding">
      <label id="fluoroLabel" class="component-cards-heading">{{'Fluorescence'|translate}}</label>
    
  </div>
  <div id="fluroSelectionBox" class='ui-g-11 ui-g-nopad' *ngIf='fluorescenceValues'>
  <p-selectButton id="fluoroMultiselect" [options]="optionsValue" [(ngModel)]="selectedValue"
  multiple="multiple" (onChange)="saveSearchValues()">
  </p-selectButton>
  </div>
  <div id="fluoroFilterBox" class='ui-g-12 ui-g-nopad' *ngIf='filterConfig' align="right">
    <button id="fluoroFilterBtn" pButton type="button" (click)="this.filter.emit(result)" label="Apply"></button>
  </div>
  </div>
  </div>
  `
})
export class FluorescenceComponent implements OnInit {

  @Input() data: any;
  @Input() filterConfig: any;
  @Output() filter = new EventEmitter();
  fluorescenceValues: any;
  optionsValue: any[] = [];
  selectedValue: string[] = [];
  result: any[] = [];

  constructor(
    private service: SearchService,
    private notifyService: NotifyService) { }

  ngOnInit() {
    this.service.getSearchFilterData().subscribe(response => {
      this.fluorescenceValues = response.data.fluorescence;
      this.fluorescenceValues.forEach((element) => {
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
      if (this.data.parentRef.values.fluor !== undefined) {
        this.selectedValue = this.data.parentRef.values.fluor;
      }
    }
  }

  setFilterConfigData(data) {
    if (data.values !== undefined) {
      if (data.values.fluor !== undefined) {
        this.selectedValue = data.values.fluor;
      }
    }
  }

  saveSearchValues() {
    this.result = [{
      'key': 'fluor',
      'value': this.selectedValue
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'FluorescenceComponent', parent: this.data.parentRef, filterCriteria: this.result });
    }
  }
}
