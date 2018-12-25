import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';

@Component({
  selector: 'app-search-color',
  template: `<div id="COLOUR_ID" class="ui-grid ui-grid-responsive ui-grid-pad component-cards">
  <div id="colorHeadingContainer" class='ui-g-12 ui-g-nopad'>
    <div id="colorLabelBox" class="ui-g-1 custom-padding">
      <label id="colorLabel" class="component-cards-heading">{{'Colour' | translate}}</label>
    </div>

  <div id="colorComponentContainer" class='ui-g-11 ui-g-nopad' *ngIf='colourValues'>
    <app-search-range-select [searchData]='colourValues'
    [preSelectedSearchData]='preSelectedValues' (save)='saveSearchValues($event)'></app-search-range-select>
  </div>
  <div id="colorFilterBox" class='ui-g-12 ui-g-nopad' *ngIf='filterConfig' align="right">
    <button id="colorFilterBtn" pButton type="button" (click)="this.filter.emit(result)" label="Apply"></button>
  </div>
  </div>
  </div>
`
})
export class ColorComponent implements OnInit {

  @Input() data: any;
  @Input() filterConfig: any;
  @Output() filter = new EventEmitter();
  colourValues: any;
  preSelectedValues: any;
  result: any[] = [];

  constructor(private service: SearchService, private notifyService: NotifyService) { }

  ngOnInit() {
    this.service.getSearchFilterData().subscribe(response => {
      this.colourValues = response.data.color;
    });
    if (this.data !== undefined) {
      this.setParentData(this.data);
    } else if (this.filterConfig !== undefined) {
      this.setFilterConfigData(this.filterConfig);
    }
  }

  setFilterConfigData(data) {
    if (data.values !== undefined
      && data.values.color !== undefined
      && data.values.color.white_color) {
      this.preSelectedValues = data.values.color.white_color;
    }
  }

  setParentData(object) {
    if (object.parentRef.values !== undefined
      && object.parentRef.values.color !== undefined
      && object.parentRef.values.color.white_color) {
      this.preSelectedValues = object.parentRef.values.color.white_color;
    }
  }

  saveSearchValues(array) {
    this.result = [{
      'key': 'COLOR-white_color',
      'value': array
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'ColorComponent', parent: this.data.parentRef, filterCriteria: this.result }
      );
    }
  }
}
