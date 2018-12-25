import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SearchService } from '@srk/core';
import { NotifyService } from '@srk/core';

@Component({
  selector: 'app-search-shape',
  template: `<div  id="SHAPE_ID" class="ui-grid ui-grid-responsive ui-grid-pad component-cards">
  <div id="shapeHeaderBox" class='ui-g-12 ui-g-nopad'>
    <div id="shapeLabelBox" class="ui-g-11 custom-padding">
      <label id="shapeLabel" class="component-cards-heading">{{'Shape' | translate}}</label>
    </div>
    <div id="shapeTooltipBox" class="ui-g-1" align="right">

      <span  id="shapeTooltip" class="info-icon icon-info display-none"></span>
      <app-thm-tooltip [targetID]="'shapeTooltip'" [tooltipHeading]="'Shape'"
      [tooltipMessage]="'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'">
      </app-thm-tooltip>
    </div>
  </div>
  <div id="shapeComponentBox" class='ui-g-12 ui-g-nopad' *ngIf='shapeValues'>
    <app-search-checkbox-select [searchData]='shapeValues' [titleCaseLable]="true"
    [preSelectedSearchData]='preSelectedValues' (save)='saveSearchValues($event)'></app-search-checkbox-select>
  </div>
  <div id="shapeFilterBox" class='ui-g-12 ui-g-nopad' *ngIf='filterConfig' align="right">
    <button id="shapeFilterBtn" pButton type="button" (click)="applyFilter()" label="Apply"></button>
    <button id="shapeFilterBtn" pButton type="button" (click)="cancelFilter()" label="cancel"></button>
  </div>
</div>
`,
  styleUrls: ['../../dynamic-search-component/dynamic-search-component.component.scss']
})
export class ShapeComponent implements OnInit {

  @Input() data: any;
  @Input() filterConfig: any;
  @Output() filter = new EventEmitter();
  @Output() toggleFilter = new EventEmitter();
  shapeValues: any[] = [];
  preSelectedValues: any;
  result: any[];

  constructor(
    private service: SearchService,
    private notifyService: NotifyService) { }

  ngOnInit() {
    this.service.getSearchFilterData().subscribe(response => {
      if (response.data.shape) {
        response.data.shape.forEach(element => {
          this.shapeValues.push(element);
        });
        this.getShapeIcons();
      }
    });

    if (this.data !== undefined) {
      this.setParentData(this.data);
    } else if (this.filterConfig !== undefined) {
      this.setFilterConfigData(this.filterConfig);
    }
  }

  getShapeIcons() {
    this.service.getSearchElement().subscribe(response => {
      this.shapeValues.forEach(item => {
        response.data.shape.forEach(object => {
          if (item.value === object.value) {
            item.class = object.class;
          }
        });
      });
    });
  }

  setParentData(object) {
    if (object.parentRef.values !== undefined) {
      if (object.parentRef.values.shape !== undefined) {
        const shapeArray = [];
        object.parentRef.values.shape.forEach(entry => {
          shapeArray.push(entry.toString());
        });
        this.preSelectedValues = shapeArray;
      }
    }
  }

  setFilterConfigData(data) {
    if (data.values !== undefined) {
      if (data.values.shape !== undefined) {
        this.preSelectedValues = data.values.shape;
      }
    }
  }

  saveSearchValues(array) {
    this.result = [{
      'key': 'shape',
      'value': array
    }];
    if (this.data && this.data.isObserved) {
      this.notifyService.notifySearchElementTouched(
        { searchComponent: 'ShapeComponent', parent: this.data.parentRef, filterCriteria: this.result }
      );
    }
  }

  applyFilter() {
    this.filter.emit(this.result);
  }

  cancelFilter() {
    this.toggleFilter.emit({ visible: false });
  }
}
