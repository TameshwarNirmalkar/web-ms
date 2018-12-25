import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';

@Component({
  selector: 'app-search-clarity',
  template: `<div id="CLARITY_ID" class="ui-grid ui-grid-responsive ui-grid-pad component-cards">
  <div id="clarityHeaderContainer" class='ui-g-12 ui-g-nopad'>
    <div id="clarityLabelBox" class="ui-g-1 custom-padding">
      <label id="clarityLabel" class="component-cards-heading">{{'Clarity' | translate}}</label>
    </div>

  <div id="clarityComponentContainer" class='ui-g-11 ui-g-nopad' *ngIf='clarityValues'>
    <app-search-range-select id="clarityRangeSelectBox" [searchData]='clarityValues'
    [preSelectedSearchData]='preSelectedValues' (save)='saveSearchValues($event)'></app-search-range-select>
  </div>
  <div id="clarityFilterBox" class='ui-g-12 ui-g-nopad' *ngIf='filterConfig' align="right">
    <button id="clarityFilterBtn" pButton type="button" (click)="this.filter.emit(result)" label="Apply"></button>
  </div>
  </div>
  </div>
`,
  styleUrls: ['../../dynamic-search-component/dynamic-search-component.component.scss']
})
export class ClarityComponent implements OnInit {

  @Input() data: any;
  @Input() filterConfig: any;
  @Output() filter = new EventEmitter();
  clarityValues: any;
  preSelectedValues: any;
  result: any[] = [];

  constructor(private service: SearchService, private notifyService: NotifyService) { }

  ngOnInit() {
    this.service.getSearchFilterData().subscribe(response => {
      this.clarityValues = response.data.clarity;
    });
    if (this.data) {
      this.setParentData(this.data);
    } else if (this.filterConfig) {
      this.setFilterConfigData(this.filterConfig);
    }
  }

  setFilterConfigData(data) {
    if (data && data.values) {
      if (data.values.clarity) {
        this.preSelectedValues = data.values.clarity;
      }
    }
    if (data && data.range) {
      if (data.range.clarity) {
        this.preSelectedValues = data.range.clarity.split('-');
      }
    }
  }

  setParentData(object) {
    if (object.parentRef.values) {
      if (object.parentRef.values.clarity) {
        this.preSelectedValues = object.parentRef.values.clarity;
      }
    }
  }

  saveSearchValues(array) {
    const result = [{
      'key': 'clarity',
      'value': array
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'ClarityComponent', parent: this.data.parentRef, filterCriteria: result }
      );
    }
  }
}
