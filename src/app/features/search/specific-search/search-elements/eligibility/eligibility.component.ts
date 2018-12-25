import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';

@Component({
  selector: 'app-search-eligibility',
  templateUrl: './eligibility.component.html',
  styleUrls: ['./eligibility.component.scss']
})
export class EligibilityComponent implements OnInit {

  @Input() data: any;
  @Input() filterConfig: any;
  @Output() filter = new EventEmitter();
  preSelectedValues: any;
  selectedValues: string[] = [];
  result: any[] = [];

  constructor(
    private service: SearchService,
    private notifyService: NotifyService) { }

  ngOnInit() {
    if (this.data !== undefined) {
      this.setParentData();
    } else if (this.filterConfig !== undefined) {
      this.setFilterConfigData(this.filterConfig);
    }
  }

  setFilterConfigData(data) {
    if (data.values !== undefined) {
      if (data.values.eligibility !== undefined) {
        this.preSelectedValues = data.values.eligibility;
      }
    }
  }

  setParentData() {
    if (this.data.parentRef.values !== undefined) {
      if (this.data.parentRef.values.eligibility !== undefined) {
        this.data.parentRef.values.eligibility.forEach((value) => {
          this.selectedValues.push(value);
        });
      }
    }
  }

  saveEligibilityValues() {
    this.result = [{
      'key': 'eligibility',
      'value': this.selectedValues
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'EligibilityComponent', parent: this.data.parentRef, filterCriteria: this.result });
    }
  }
}
