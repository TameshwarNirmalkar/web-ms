import { Component, OnInit, Output, Input, ViewEncapsulation} from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';

@Component({
  selector: 'app-open-inclusion',
  templateUrl: './open-inclusion.component.html',
  styleUrls: ['./open-inclusion.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OpenInclusionComponent implements OnInit {

  @Input() data: any;
  tableOptions: any[] = [];
  crownOptions: any[] = [];
  pavilionOptions: any[] = [];
  girdleOptions: any[] = [];

  selectedTableValues: any[] = [];
  selectedCrownValues: any[] = [];
  selectedPavilionValues: any[] = [];
  selectedGirdleValues: any[] = [];

  constructor(
    private service: SearchService,
    private notifyService: NotifyService) { }

  ngOnInit() {
    this.service.getSearchFilterData().subscribe(response => {
      this.tableOptions = this.service.getValueList(response.data.table_open_inclusion);
      this.crownOptions = this.service.getValueList(response.data.crown_open_inclusion);
      this.pavilionOptions = this.service.getValueList(response.data.pavillion_open_inclusion);
      this.girdleOptions = this.service.getValueList(response.data.girdle_open_inclusion);
    });
    this.setPreSelectedValues();
  }

  setPreSelectedValues() {
    if (this.data.parentRef.values !== undefined) {
      if (this.data.parentRef.values.table_open !== undefined) {
        this.data.parentRef.values.table_open.forEach((value) => {
          this.selectedTableValues.push(value);
        });
      }
      if (this.data.parentRef.values.crown_open !== undefined) {
        this.data.parentRef.values.crown_open.forEach((value) => {
          this.selectedCrownValues.push(value);
        });
      } if (this.data.parentRef.values.pav_open !== undefined) {
        this.data.parentRef.values.pav_open.forEach((value) => {
          this.selectedPavilionValues.push(value);
        });
      } if (this.data.parentRef.values.girdle_open !== undefined) {
        this.data.parentRef.values.girdle_open.forEach((value) => {
          this.selectedGirdleValues.push(value);
        });
      }
    }
  }

  saveValues(label, value) {
    const param = {};
    param['key'] = label;
    param['value'] = value;
    this.saveOpenInclusion(param);
  }

  saveOpenInclusion(object) {
    const result = [];
    result.push(object);
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'OpenInclusionComponent', parent: this.data.parentRef, filterCriteria: result });
    }
  }

}
