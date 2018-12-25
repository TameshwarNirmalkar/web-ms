import { Component, OnInit, Output, Input, ViewEncapsulation } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';

@Component({
  selector: 'app-extra-facet',
  templateUrl: './extra-facet.component.html',
  styleUrls: ['./extra-facet.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExtraFacetComponent implements OnInit {

  @Input() data: any;
  tableOptions: any[] = [];
  crownOptions: any[] = [];
  pavilionOptions: any[] = [];

  selectedTableValues: any[] = [];
  selectedCrownValues: any[] = [];
  selectedPavilionValues: any[] = [];

  constructor(
    private service: SearchService,
    private notifyService: NotifyService) { }

  ngOnInit() {

    this.service.getSearchFilterData().subscribe(response => {
      this.tableOptions = this.service.getValueList(response.data.table_extra_facets);
      this.crownOptions = this.service.getValueList(response.data.crown_extra_facets);
      this.pavilionOptions = this.service.getValueList(response.data.pavilion_extra_facets);
    });

    this.setPreSelectedValues();
  }

  setPreSelectedValues() {
    if (this.data.parentRef.values !== undefined) {
      if (this.data.parentRef.values.table_extra_facet !== undefined) {
        this.data.parentRef.values.table_extra_facet.forEach((value) => {
          this.selectedTableValues.push(value);
        });
      }
      if (this.data.parentRef.values.crown_extra_facet !== undefined) {
        this.data.parentRef.values.crown_extra_facet.forEach((value) => {
          this.selectedCrownValues.push(value);
        });
      } if (this.data.parentRef.values.pav_extra_facet !== undefined) {
        this.data.parentRef.values.pav_extra_facet.forEach((value) => {
          this.selectedPavilionValues.push(value);
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
        { searchComponent: 'ExtraFacetComponent', parent: this.data.parentRef, filterCriteria: result });
    }
  }


}
