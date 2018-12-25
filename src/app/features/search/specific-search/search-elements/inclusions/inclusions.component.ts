import { Component, OnInit, Output, Input, ViewEncapsulation } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';

@Component({
  selector: 'app-search-inclusions',
  templateUrl: './inclusions.component.html',
  styleUrls: ['./inclusions.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InclusionsComponent implements OnInit {

  @Input() data: any;
  tableBlackOptions: any[] = [];
  tableSpotOptions: any[] = [];
  tableWhiteOptions: any[] = [];
  sideBlackOptions: any[] = [];
  sideSpotOptions: any[] = [];
  sideWhiteOptions: any[] = [];

  selectedTableBlack: any[] = [];
  selectedTableSpot: any[] = [];
  selectedTableWhite: any[] = [];
  selectedSideBlack: any[] = [];
  selectedSideSpot: any[] = [];
  selectedSideWhite: any[] = [];

  constructor(
    private service: SearchService,
    private notifyService: NotifyService) { }

  ngOnInit() {
    this.service.getSearchFilterData().subscribe(response => {
      this.tableBlackOptions = this.service.getValueList(response.data.table_black_inclusion);
      this.tableSpotOptions = this.service.getValueList(response.data.table_spot_inclusion);
      this.tableWhiteOptions = this.service.getValueList(response.data.table_white_inclusion);
      this.sideBlackOptions = this.service.getValueList(response.data.side_black_inclusion);
      this.sideSpotOptions = this.service.getValueList(response.data.side_spot_inclusion);
      this.sideWhiteOptions = this.service.getValueList(response.data.side_white_inclusion);
    });
    this.setPreSelectedValues();
  }

  setPreSelectedValues() {
    if (this.data.parentRef.values !== undefined) {
      if (this.data.parentRef.values.table_black !== undefined) {
        this.data.parentRef.values.table_black.forEach((value) => {
          this.selectedTableBlack.push(value);
        });
      }
      if (this.data.parentRef.values.table_spot !== undefined) {
        this.data.parentRef.values.table_spot.forEach((value) => {
          this.selectedTableSpot.push(value);
        });
      } if (this.data.parentRef.values.table_white !== undefined) {
        this.data.parentRef.values.table_white.forEach((value) => {
          this.selectedTableWhite.push(value);
        });
      } if (this.data.parentRef.values.side_black !== undefined) {
        this.data.parentRef.values.side_black.forEach((value) => {
          this.selectedSideBlack.push(value);
        });
      } if (this.data.parentRef.values.side_spot !== undefined) {
        this.data.parentRef.values.side_spot.forEach((value) => {
          this.selectedSideSpot.push(value);
        });
      } if (this.data.parentRef.values.side_white !== undefined) {
        this.data.parentRef.values.side_white.forEach((value) => {
          this.selectedSideWhite.push(value);
        });
      }
    }
  }

  saveTable(label, value) {
    const param = {};
    param['key'] = label;
    param['value'] = value;
    this.saveInclusion(param);
  }

  saveInclusion(object) {
    const result = [];
    result.push(object);
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'InclusionsComponent', parent: this.data.parentRef, filterCriteria: result });
    }
  }
}
