import { Component, OnInit, EventEmitter, Output, Input, ViewEncapsulation } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';

@Component({
  selector: 'app-search-certificate',
  encapsulation: ViewEncapsulation.None,
  template: `
  <div id="CERTIFICATE_ID" class="ui-grid ui-grid-responsive ui-grid-pad component-cards">
  <div id="certificateHeaderBox"  class='ui-g-12 ui-g-nopad'>
    <div id="certificateLabelBox" class="ui-g-1 custom-padding">
      <label id="certificateLabel" class="component-cards-heading">{{'Certificate' | translate}}</label>
    </div>
  <div id="certificateComponentContainer" class='ui-g-11 ui-g-nopad' *ngIf='certificateValues'>
    <p-selectButton id="certificateSelect" [options]="certificateValues" [(ngModel)]="selectedValue"
    multiple="multiple" (onChange)="saveSearchValues()">
    </p-selectButton>
  </div>
  <div id="certificateFilterBox" class='ui-g-12 ui-g-nopad' *ngIf='filterConfig' align="right">
    <button id="certificateFilterBtn" pButton type="button" (click)="this.filter.emit(result)" label="Apply"></button>
  </div>
  </div>
  </div>
  `,
  styleUrls: ['./certificate.component.scss'],
})
export class CertificateComponent implements OnInit {

  @Input() data: any;
  @Input() filterConfig: any;
  @Output() filter = new EventEmitter();
  certificateValues: any[] = [];
  result: any[] = [];
  selectedValue: string[] = [];

  constructor(
    private service: SearchService,
    private notifyService: NotifyService) { }

  ngOnInit() {
    this.service.getSearchFilterData().subscribe(response => {
      if (response.data.certificate) {
        response.data.certificate.forEach(element => {
          this.certificateValues.push({ label: element.label, value: element.value });
        });
      }
    });
    if (this.data !== undefined) {
      this.setParentData(this.data);
    } else if (this.filterConfig !== undefined) {
      this.setFilterConfigData(this.filterConfig);
    }
  }

  setFilterConfigData(data) {
    if (data.values !== undefined) {
      if (data.values.certificate !== undefined) {
        this.selectedValue = data.values.certificate;
      }
    }
  }

  setParentData(object) {
    if (object.parentRef.values !== undefined) {
      if (object.parentRef.values.certificate !== undefined) {
        this.selectedValue = object.parentRef.values.certificate;
      }
    }
  }

  saveSearchValues(array) {
    this.result = [{
      'key': 'certificate',
      'value': this.selectedValue
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'CertificateComponent', parent: this.data.parentRef, filterCriteria: this.result });
    }
  }
}
